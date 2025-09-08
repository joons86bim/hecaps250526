// DOM 칠하기 + 전면 하이라이트
import { buildCatMapFromTasks, stateFromFlags, computeUniformStateForSubtree } from "../logic/wbs-highlight.js";

function liOf(node){
  const uid = node?._id ?? node?.id;
  return document.querySelector(`#wbs-group-list li[data-uid="${uid}"]`);
}
function paint(node, state){
  const li = liOf(node); if (!li) return;
  li.classList.remove("wbs-c","wbs-blue","wbs-td");
  if (state === "C")       li.classList.add("wbs-c");
  else if (state === "TD") li.classList.add("wbs-td");
  else if (state === "T" || state === "D") li.classList.add("wbs-blue");
}

export function applyHighlightForSubtreeUI(node, catMap){
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  function dfs(n){
    if (!(n.hasChildren && n.hasChildren())) {
      const key = `${String(n.urn || CUR_URN)}::${String(n.dbId)}`;
      const st = stateFromFlags(catMap.get(key));
      paint(n, st);
      return st;
    }
    let first = null;
    for (const ch of (n.children || [])) {
      const s = dfs(ch);
      if (!s) { first = ""; break; }
      if (first == null) first = s;
      else if (first !== s) { first = ""; break; }
    }
    paint(n, first || "");
    return first || "";
  }
  return dfs(node);
}

export function updateWBSHighlight() {
  const catMap = buildCatMapFromTasks();
  window.__WBS_CATMAP = catMap;
  const tree = window.wbsTree;
  if (!tree?.nodes) return;
  const roots = tree.nodes();
  let i = 0;
  function chunk(deadline){
    let iter = 0;
    while (i < roots.length && (!deadline || deadline.timeRemaining() > 3) && iter < 50) {
      applyHighlightForSubtreeUI(roots[i++], catMap);
      iter++;
    }
    if (i < roots.length) {
      if (typeof requestIdleCallback === 'function') requestIdleCallback(chunk, { timeout: 50 });
      else setTimeout(chunk, 0);
    }
  }
  if (typeof requestIdleCallback === 'function') requestIdleCallback(chunk, { timeout: 50 });
  else setTimeout(chunk, 0);
}

// (선택) 확장/축소 순간에만 부분 칠하기 필요하면 사용
export function attachWbsTreeHighlightEvents(wbsTree, { includeExpand = false } = {}) {
  if (!includeExpand) return;
  const safeIdle = (cb) => (typeof requestIdleCallback === 'function')
    ? requestIdleCallback(cb, { timeout: 60 })
    : setTimeout(cb, 0);

  wbsTree.on('node.expanded',  n => safeIdle(() => {
    const map = window.__WBS_CATMAP || buildCatMapFromTasks();
    applyHighlightForSubtreeUI(n, map);
  }));
  wbsTree.on('node.collapsed', n => safeIdle(() => {
    const map = window.__WBS_CATMAP || buildCatMapFromTasks();
    applyHighlightForSubtreeUI(n, map);
  }));
}
