//wwwroot/js/sidebar/task-wbs/ui/fancy-tree-init.js
import { toKey } from "../core/path-key.js";
import {
  initMatrix, bulkEnsureForVisible,
  computePathState, getPathState, getCounts,
  markTasksChanged
} from "../core/matrix-index.js";
import { formatObjectLabel } from "../core/element-id.js";
//import e from "express";

const HIDDEN_KEYS = new Set();

// 서브트리 pathKey 전부 수집 (트리 확장 여부와 무관)
async function collectAllPathKeys(provider, startPath, cap = 20000) {
  const keys = [];
  const q = [startPath];
  const seen = new Set();
  while (q.length && cap > 0) {
    const p = q.shift();
    const k = toKey(p);
    if (seen.has(k)) continue;
    seen.add(k);
    keys.push(k);
    let children = [];
    try { children = await provider.childrenByPath(p) || []; } catch {}
    cap -= children.length;
    for (const ch of children) {
      const cp = ch.__path || [...p, ch.text];
      q.push(cp);
    }
  }
  return keys;
}

// 토글 전용: 미구축이면 서브트리를 강제 구축 후, 완전한 id 목록을 반환
async function getAllDbIdsForPathStrict(provider, node, path){
  const out = new Set();
  const q = [path];
  let guard = 0;
  while (q.length && guard < 50000) {
    const p = q.shift();
    //현재 경로의 직접 매핑 강제 확보
    let here = provider.getDbIdsForPath(p, { includeDescendants:false, allowUnbuilt:true }) || [];
    if (!here.length) {
      //그룹노드 보정: 자손 매핑이라도 즉시 반영
      here = provider.getDbIdsForPath(p, { includeDescendants:true, allowUnbuilt:true }) || [];
    }
    for (const id of here) out.add(id);
    //자식 로드 & 큐잉
    let children = [];
    try { children = await provider.childrenByPath(p) || []; } catch {}
    for (const ch of children) {
      const cp = ch.__path || [...p, ch.text];
      q.push(cp);
    }
    guard += children.length + here.length;
  }
  //마지막으로 '완전체'가 있으면 합쳐서 반환
  const all = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true }) || [];
  for (const id of all) out.add(id);
  return Array.from(out);
}

// 지정 경로의 자손들을 제한적으로 미리 로드 (BFS)
async function warmupDescendants(provider, path, maxDepth = 6, cap = 1200) {
  const q = [{ path, depth: 0 }];
  let seen = 0;
  while (q.length && seen < cap) {
    const { path: p, depth } = q.shift();
    let children = [];
    try { children = await provider.childrenByPath(p) || []; } catch {}
    seen += children.length;
    if (depth >= maxDepth) continue;
    for (const ch of children) {
      if (ch?.children === true) {
        const np = ch.__path || [...p, ch.text];
        q.push({ path: np, depth: depth + 1 });
      }
    }
  }
}

// 현재 노드의 눈알 아이콘(class/markup)만 즉시 갱신
function updateEyeDom(n) {
  if (!n?.span) return;
  const s = calcEyeStateForNode(n);
  const $nodeSpan = $(n.span);                              // .fancytree-node 자체
  let $eye = $nodeSpan.children(".eye-toggle");             // 직계의 eye-toggle
  const icon = (s === "none") ? Eye : EyeOff; // 아이콘 결정

  if ($eye.length === 0) {
    const $icon = $nodeSpan.children(".fancytree-icon");    // 기본 아이콘
    $icon.hide().addClass("eye-hidden");
    $eye = $(`<span class="eye-toggle ${s}" title="가시성 토글">${icon}</span>`);
    $icon.before($eye);                                     // 아이콘 앞에 삽입
  } else {
    $eye.removeClass("mixed none").addClass(s).html(icon);   // 상태만 갱신
  }
}

function buildPathFromNode(node){
  const out = [];
  let cur = node;
  while (cur && !cur.isRoot()) { out.unshift(cur.title); cur = cur.parent; }
  return out;
}
function stateToClass(st){
  if (st === "C") return "wbs-c";
  // if (st === "T") return "wbs-t";
  // if (st === "D") return "wbs-d";
  if (st === "TD" || st === "T" || st === "D") return "wbs-td";
  return "";
}

//값이 Promise든 배열이든/undefined든 전부 Promise로 감싸서 처리
function asPromise(v){
  return (v && typeof v.then === "function") ? v : Promise.resolve(v);
}

// 눈알 SVG
const Eye = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 5c5 0 9 4 10 7-1 3-5 7-10 7S3 15 2 12c1-3 5-7 10-7Zm0 3a4 4 0 100 8 4 4 0 000-8Z"/>
</svg>`;
const EyeOff = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M3 3l18 18M10.58 10.58A4 4 0 0012 16a4 4 0 002.83-6.83M12 5c5 0 9 4 10 7-.43 1.28-1.33 2.7-2.6 3.98M6.62 6.62C4.62 8.05 3.28 9.94 2 12c1 3 5 7 10 7 1.28 0 2.5-.22 3.62-.62"/>
</svg>`;

// 경로→dbId 수집 (click/dblclick 때만 호출: 초기 렌더에는 안 돌게)
async function getAllDbIdsForPath(provider, path){
  let ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
  if (ids != null) return ids;
  try { await warmupDescendants(provider, path, 6, 1200); } catch {}
  ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
  if (ids != null) return ids;
  return provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:false }) || [];
}

function calcEyeStateForNode(node){
  const key = node.data?.pathKey;
  if (!key) return "none";
  if (HIDDEN_KEYS.has(key)) return "mixed"; //자기자신이 숨김 상태면, 자식 로드 여부와 무관하게 'mixed'로 취급

  // 1) 부모중 하나라도 숨김이면 이 노드는 mixed으로 처리
  const ancestors = node.getParentList(false, true) || [];
  for (const p of ancestors) {
    const k = p.data?.pathKey;
    if (k && HIDDEN_KEYS.has(k)) return "mixed";
  }

  // 2) 자손 기준으로 혼합/숨김 판정
  let anyHidden = false;
  node.visit(n => {
    const k = n.data?.pathKey;
    if (!k) return;
    if (HIDDEN_KEYS.has(k)) {
      anyHidden = true;
    }
  });
  return anyHidden ? "mixed" : "none";
}

export async function initWbsWithFancytree(provider, { primaryOrder } = {}) {
  await initMatrix({ primaryOrder, provider });

  // const tree = $.ui.fancytree.getTree("#wbs-tree");
  // window.wbsTree = tree;

  // 테이블 뼈대(개수 가운데 정렬: th에 text-center)
  const host = document.getElementById("wbs-group-content");
  host.innerHTML = `
    <table id="wbs-tree" class="table table-sm wbs-table">
      <colgroup>
        <col class="col-title" />
        <col class="col-count" />
        <col class="col-status" />
      </colgroup>
      <thead>
        <tr>
          <th>항목</th>
          <th class="text-center">개수</th>
          <th>현황</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  $("#wbs-tree").fancytree({
    extensions: ["table", "gridnav"],   // ❗ checkbox 확장 넣지 마세요
    checkbox: true,                     // 체크박스는 옵션으로만
    selectMode: 3,

    // ✅ source: jQuery Deferred로 안전하게
    source: function(event, data){
      const d = new $.Deferred();
      try{
        asPromise(provider?.roots?.()).then((nodes) => {
          const arr = Array.isArray(nodes) ? nodes : [];
          d.resolve(arr.map(ch => ({
            title: ch.text,
            lazy: ch.children === true,
            data: {
              __path: ch.__path || [ch.text],
              pathKey: toKey(ch.__path || [ch.text]),
              leafCount: ch.leafCount || 0,
              dbId: ch.dbId,
              elementId: ch.elementId
            }
          })));
        }).catch(() => d.resolve([]));
      } catch {
        d.resolve([]);
      }
      return d.promise();
    },

    // ✅ lazyLoad: 역시 Deferred로
    lazyLoad: function(event, data){
      const node = data.node;
      const path = node.data?.__path || buildPathFromNode(node);
      const d = new $.Deferred();
      try {
        asPromise(provider?.childrenByPath?.(path)).then((children)=>{
          const arr = Array.isArray(children) ? children : [];
          d.resolve(arr.map(ch => {
            const __path = ch.__path || [...path, ch.text];
            return {
              title: ch.text,
              lazy: ch.children === true,
              data: {
                __path,
                pathKey: toKey(__path),
                leafCount: ch.leafCount || 0,
                dbId: ch.dbId,
                elementId: ch.elementId
              }
            };  
          }));
        }).catch(() => d.resolve([]));
      } catch {
        d.resolve([]);
      }
      data.result = d.promise();
    },

    loadChildren: function(event, data){
      try {
        const keys = [];
        data.node.visit(n => { if (n.data?.pathKey) keys.push(n.data.pathKey); });
        bulkEnsureForVisible(keys).then(() => {
          keys.forEach(k => computePathState(k));
          //해당 브랜치만 안전 재랜더
          setTimeout(() => { try { data.node.render(true); } catch {} }, 0);
        })
      } catch (e) {
        console.warn("[WBS] loadChildren compute failed:", e);
      }
    },

    table: { indentation: 14, nodeColumnIdx: 0 },

    // ❗ 초기 렌더에서는 '계산'을 유발하지 않는다 (프리즈 방지)
    renderColumns: function(event, data) {
      const node  = data.node;
      const $tds  = $(node.tr).find(">td");

      // 0) 타이틀 칼럼: 문서 아이콘 자리에 눈알
      const $titleCell = $tds.eq(0);
      const $nodeSpan  = $(node.span);
      const eyeState   = calcEyeStateForNode(node);
      const $eye       = $nodeSpan.children(".eye-toggle");
      const icon       = (eyeState === "none") ? Eye : EyeOff;

      if ($eye.length) {
        // 이미 눈알 있음 -> 상태 / 아이콘만 업데이트
        $eye
          .removeClass("mixed none")
          .addClass(eyeState)
          .attr("title", "가시성 토글")
          .html(icon);
      } else {
        // 최초 1회: 문서아이콘은 숨기고 (삭제 X), 그 앞에 눈알 삽입
        const $iconSpan  = $nodeSpan.children(".fancytree-icon");
        $iconSpan.hide().addClass("eye-hidden");
        $iconSpan.before(
          $(`<span class="eye-toggle ${eyeState}" title="가시성 토글">${
            icon}</span>`)
        );
      }

      // 1) 개수 칼럼: 항상 가운데 정렬
      const $cntCell = $tds.eq(1).removeClass("text-end").addClass("text-center");
      if (node.data?.dbId != null) {
        $cntCell.text("");
      } else {
        const cnt = node.data?.leafCount;
        $cntCell.text((typeof cnt === "number") ? String(cnt) : "…");
      }

      // 2) 현황 칼럼: 값만 표시, 계산은 expand/초기 배치에서
      const $statusCell = $tds.eq(2);
      if (node.data?.dbId != null) {
        $statusCell.text("");
          // formatObjectLabel({ elementId: node.data.elementId, dbId: node.data.dbId })
      
      } else {
        // 현재 계산된 값이 있으면 클래스/숫자 적용
        const st   = getPathState(node.data?.pathKey);
        const cls  = stateToClass(st);
        $(node.tr).removeClass("wbs-c wbs-t wbs-d wbs-td");
        if (cls) $(node.tr).addClass(cls);
        // if (cls) {
        //   $(node.tr).removeClass("wbs-c wbs-t wbs-d wbs-td").addClass(cls);
        // }

        const counts = getCounts(node.data?.pathKey);
        if (counts) {
          $statusCell
          .addClass("text-center")
          .html(`
            <div class="wbs-status" style="justify-content: center;">
              <div class="nums">
                <span class="b c" title="시공">${counts.c ?? 0}</span>
                <span class="b t" title="가설">${counts.t ?? 0}</span>
                <span class="b d" title="철거">${counts.d ?? 0}</span>
              </div>
            </div>
          `);
        } else {
          $statusCell.text("…");
        }
      }
    },

    // 확장할 때만: 보이는 경로들 계산 → 테이블 전체 1회 리렌더
    expand: async function(event, data) {
      try {
        const keys = [];
        data.node.visit(n => { if (n.data?.pathKey && n.lazy !== false) keys.push(n.data.pathKey); });
        await bulkEnsureForVisible(keys);
        keys.forEach(k => computePathState(k));
      } catch(e) {
        console.warn("[WBS] expand compute failed:", e);
      } finally {
        setTimeout(() => {
          try { data.node.render(true); } catch {}
        }, 0);
      }
    },

    // 더블클릭: 해당 경로 선택/해제 (기존 동작 유지)
    dblclick: function(event, data){
      const node = data.node;
      (async ()=>{
        const viewer = window.viewer;
        if (!viewer) return;
        let ids = [];
        if (node.data?.dbId != null) {
          ids = [node.data.dbId];
        } else {
          const path = node.data?.__path || buildPathFromNode(node);
          ids = await getAllDbIdsForPath(provider, path);
        }
        try {
          const cur = viewer.getSelection();
          const same = (cur?.length === ids.length) && cur.every((v,i)=>v===ids[i]);
          viewer.clearSelection();
          if (!same && ids?.length) viewer.select(ids);
        } catch {}
      })();
      //기본 더블클릭 동작 (확장/축소) 차단
      if (event?.preventDefault) event.preventDefault();
      if (data?.originalEvent?.preventDefault) data.originalEvent.preventDefault();
      return false;
    },

    // 클릭: 확장/체크 외엔 기본 무시 (expander로만 펼치기)
    click: function(event, data){
      const t = data.targetType; // expander | title | icon | checkbox
      if (t === "expander" || t === "checkbox") return; // 기본 동작 허용
      event.preventDefault();
      return false;
    },

    // 초기 데이터가 로드되고 DOM이 안정된 뒤, 보이는 루트만 ‘한 번’ 계산
    init: function(event, data){
      setTimeout(async () => {
        try {
          const tree = data.tree;
          const keys = [];
          tree.getRootNode().children?.forEach(n => { if (n.data?.pathKey) keys.push(n.data.pathKey); });
          if (keys.length) {
            await bulkEnsureForVisible(keys);
            keys.forEach(k => computePathState(k));
            tree.render(true, true);
          }
        } catch(e) {
          console.warn("[WBS] initial compute failed:", e);
        }
      }, 0);
    }
  });

  window.wbsTree = $.ui.fancytree.getTree("#wbs-tree");

  // 눈알 토글: 위임
  $("#wbs-tree").on("click", ".eye-toggle", async (e) => {
    e.stopPropagation();
    const el = e.currentTarget;
    const node = $.ui.fancytree.getNode(el);
    if (!node) return;
  
    const viewer = window.viewer;
    if (!viewer) return;
  
    const state   = calcEyeStateForNode(node);
    const hideAll = (state === "none");         // none → 숨기기, mixed → 보이기
  
    const path   = node.data?.__path || buildPathFromNode(node);
    const idsAll = await getAllDbIdsForPathStrict(provider, node, path);
    if (!idsAll?.length) return;
    const allKeys = await collectAllPathKeys(provider, path);
    
    console.debug("[eye] hideAll=", hideAll, "ids=", idsAll.length, idsAll.slice(0, 10));

    try {
      if (hideAll) {
        viewer.hide(idsAll);
        allKeys.forEach(k => HIDDEN_KEYS.add(k));
      } else {
        viewer.show(idsAll);
        allKeys.forEach(k => HIDDEN_KEYS.delete(k));
      }
    } finally {
      // 즉시 : 자신/자식들 아이콘 갱신 + 해당 행/부모행 재렌더 (행 단위라 안전)
      node.visit(updateEyeDom);
      node.getParentList(false, true)?.forEach(updateEyeDom);
      try { node.render(true); } catch {}
      try { node.getParentList(false, true)?.forEach(p => p.render(true)); } catch {}
    }
  });

  // Task 갱신 → 현황 반영(배치 1회)
  window.__WBS_MARK_TASKS_CHANGED = function(){
    try {
      markTasksChanged();
      const tree = $.ui.fancytree.getTree("#wbs-tree");
      if (!tree) return;
      const keys = [];
      tree.getRootNode().visit(n => { if (n.data?.pathKey) keys.push(n.data.pathKey); });
      bulkEnsureForVisible(keys).then(() => {
        keys.forEach(k => computePathState(k));
        tree.render(true, true);
      });
    } catch(e) {
      console.warn("[WBS] tasks changed failed:", e);
    }
  };
}