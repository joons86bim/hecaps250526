// WBS(InspireTree) 초기화 + 뱃지 + 눈알 + 경로맵 + 필요시 하이라이트 부분 반응
import { stripCountSuffix } from "./core/categories.js";
import { ensureEyeButton, installWbsVisibilityDelegate } from "./ui/wbs-visibility.js";
import { applyHighlightForSubtreeUI, attachWbsTreeHighlightEvents } from "./ui/wbs-highlight.js";

export function initWbsPanel(wbsData){
  const wbsContainer = document.getElementById("wbs-group-content");
  if (!wbsContainer) return;
  wbsContainer.innerHTML = `<div id="wbs-group-list"></div>`;

  function toInspireNodes(arr, parentName) {
    return (arr || []).map(n => {
      const isLeaf = (typeof n.dbId === "number");
      const parentClean = stripCountSuffix(parentName || "");
      const children = toInspireNodes(n.children, n.text);
      const leafCount = isLeaf ? 1 : children.reduce((acc, ch) => acc + (ch.leafCount || 0), 0);
      return {
        id: n.id,
        urn: isLeaf ? window.CURRENT_MODEL_URN : undefined,
        dbId: isLeaf ? n.dbId : undefined,
        text: stripCountSuffix(n.text),
        objName: isLeaf
          ? ((String(n.text) === String(n.dbId)) ? (parentClean || stripCountSuffix(n.text)) : stripCountSuffix(n.text))
          : undefined,
        children,
        leafCount
      };
    });
  }

  const wbsNodes = toInspireNodes(wbsData, undefined);
  const wbsTree = new window.InspireTree({
    data: wbsNodes,
    selection: { multi: true, mode: "simple", autoSelectChildren: false, autoDselectChildren: false, require: false, autoSelectParents: false }
  });
  window.wbsTree = wbsTree;

  new window.InspireTreeDOM(wbsTree, { target: "#wbs-group-list", showCheckboxes: true, dragAndDrop: { enabled: false } });

  // 숫자 뱃지
  function rowFor(node){
    const uid = node?._id ?? node?.id;
    const li = document.querySelector(`#wbs-group-list li[data-uid="${uid}"]`);
    return li?.querySelector(':scope > .title-wrap') || li;
  }
  function ensureWbsCountBadge(node) {
    const row = rowFor(node); if (!row) return;
    let badge = row.querySelector('.count-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'count-badge'; row.appendChild(badge); }
    const isLeaf = !(node.hasChildren && node.hasChildren());
    const count = isLeaf ? 0 : (node.leafCount || 0);
    badge.textContent = (!isLeaf && count > 1) ? String(count) : '';
  }
  function ensureDecor(node){ ensureWbsCountBadge(node); try { ensureEyeButton(node); } catch(e) {} }

  // 초기 아이들-청크 데코
  (function refreshInitial(){
    const nodes = wbsTree.nodes(); let i = 0;
    function chunk(deadline){
      let iter = 0;
      while (i < nodes.length && (!deadline || deadline.timeRemaining() > 3) && iter < 400) {
        ensureDecor(nodes[i++]); iter++;
      }
      if (i < nodes.length) {
        if (typeof requestIdleCallback === 'function') requestIdleCallback(chunk, { timeout: 60 });
        else setTimeout(chunk, 0);
      }
    }
    if (typeof requestIdleCallback === 'function') requestIdleCallback(chunk, { timeout: 60 });
    else setTimeout(chunk, 0);
  })();

  // 렌더/확장/축소 시 데코 보정 + (필요할 때만) 부분 하이라이트
  wbsTree.on("node.rendered", (n) => requestAnimationFrame(() => {
    ensureDecor(n);
    try {
      const map = window.__WBS_CATMAP; // 이미 계산돼 있으면 사용
      if (map) applyHighlightForSubtreeUI(n, map);
    } catch(e){}
  }));
  wbsTree.on("node.expanded", (n) => {
    ensureDecor(n);
    const kids = [...(n.children || [])];
    const map  = window.__WBS_CATMAP;
    function step(deadline){
      let k = 0;
      while (kids.length && (!deadline || deadline.timeRemaining() > 3) && k < 400) {
        try {
          ensureDecor(kids[0]);
          if (map) applyHighlightForSubtreeUI(kids[0], map);
          kids.shift();
        } catch(e){}
        k++;
      }
      if (kids.length) {
        if (typeof requestIdleCallback === 'function') requestIdleCallback(step, { timeout: 60 });
        else setTimeout(step, 0);
      }
    }
    if (typeof requestIdleCallback === 'function') requestIdleCallback(step, { timeout: 60 });
    else setTimeout(step, 0);
  });
  wbsTree.on("node.collapsed", (n) => ensureDecor(n));

  // 체크박스 전파(게으른 청크)
  function cascadeCheck(node, checked) {
    if (!(node.hasChildren && node.hasChildren())) return;
    const q = [...node.children];
    function step(deadline){
      while (q.length && (!deadline || deadline.timeRemaining() > 2)) {
        const ch = q.shift();
        checked ? ch.check() : ch.uncheck();
        if (ch.hasChildren && ch.hasChildren()) q.push(...ch.children);
      }
      if (q.length) {
        if (typeof requestIdleCallback === 'function') requestIdleCallback(step, { timeout: 60 });
        else setTimeout(step, 0);
      }
    }
    if (typeof requestIdleCallback === 'function') requestIdleCallback(step, { timeout: 60 });
    else setTimeout(step, 0);
  }
  wbsTree.on("node.checked",   (n) => cascadeCheck(n, true));
  wbsTree.on("node.unchecked", (n) => cascadeCheck(n, false));

  // 경로맵 1회 캐시(객체개수 셀 팝업용)
  function buildWbsPathMapOnce() {
    const CUR_URN = window.CURRENT_MODEL_URN || "";
    const map = new Map();
    (function walk(nodes, ancestors){
      (nodes || []).forEach(n => {
        const nameClean = (n.text || "").trim();
        const hasKids = n.hasChildren && n.hasChildren();
        const nextAnc = hasKids ? (nameClean ? [...ancestors, nameClean] : ancestors) : ancestors;
        if (hasKids) walk(n.children, nextAnc);
        else if (typeof n.dbId === "number") {
          const urn = n.urn || CUR_URN;
          map.set(`${urn}:${n.dbId}`, ancestors.join(" - "));
        }
      });
    })(wbsTree.nodes(), []);
    return map;
  }
  window.__WBS_PATHMAP = buildWbsPathMapOnce();

  // 눈알 클릭 위임 1회
  installWbsVisibilityDelegate(wbsTree);

  // (옵션) 확장/축소에만 부분 하이라이트 반응하려면 켜기
  // attachWbsTreeHighlightEvents(wbsTree, { includeExpand: true });
}
