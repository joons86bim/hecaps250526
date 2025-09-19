// /wwwroot/js/sidebar/task-wbs/ui/fancy-tree-init.js
import { toKey } from "../core/path-key.js";
import {
  initMatrix, bulkEnsureForVisible,
  computePathState, getPathState, getCounts,
  markTasksChanged
} from "../core/matrix-index.js";
import { formatObjectLabel } from "../core/element-id.js";

const HIDDEN_KEYS = new Set();
const pendingCompute = new Map();

function buildPathFromNode(node){
  const out=[]; let cur=node;
  while (cur && !cur.isRoot()) { out.unshift(cur.title); cur = cur.parent; }
  return out;
}
function stateToClass(st){ if(st==="C")return"wbs-c"; if(st==="TD")return"wbs-td"; return ""; }

const Eye = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5 0 9 4 10 7-1 3-5 7-10 7S3 15 2 12c1-3 5-7 10-7Zm0 3a4 4 0 100 8 4 4 0 000-8Z"/></svg>`;
const EyeOff = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.58 10.58A4 4 0 0012 16a4 4 0 002.83-6.83M12 5c5 0 9 4 10 7-.43 1.28-1.33 2.7-2.6 3.98M6.62 6.62C4.62 8.05 3.28 9.94 2 12c1 3 5 7 10 7 1.28 0 2.5-.22 3.62-.62"/></svg>`;

async function getAllDbIdsForPath(provider, path){
  let ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
  if (ids != null) return ids;
  try { await provider.childrenByPath(path); } catch {}
  ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
  if (ids != null) return ids;
  return provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:false }) || [];
}
function calcEyeStateForNode(node){
  const key = node.data?.pathKey; if(!key) return "none";
  let anyHidden=false, allHidden=true;
  node.visit(n=>{
    const k=n.data?.pathKey; if(!k) return;
    const hid = HIDDEN_KEYS.has(k);
    anyHidden = anyHidden || hid;
    allHidden = allHidden && hid;
  });
  if(!anyHidden) return "none";
  return allHidden ? "hidden" : "mixed";
}

export async function initWbsWithFancytree(provider, { primaryOrder } = {}) {
  await initMatrix({ primaryOrder, provider });

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

  // 🔥 잔재 청소(중복 init/UL 컨테이너 제거)
  try { $.ui.fancytree.getTree("#wbs-tree")?.destroy(); } catch {}
  $("#wbs-tree").children("ul.ui-fancytree").remove();
  $("#wbs-group-content .ui-fancytree").remove();

  $("#wbs-tree").fancytree({
    extensions: ["table", "gridnav"],     // ✅ checkbox 확장 넣지 말 것
    checkbox: true,                       // 표시는 이 옵션으로
    selectMode: 3,

    // 1) 빈 소스로 시작
    source: [],

    // 2) init 이벤트에서 루트 주입 (가장 호환성 좋음)
    init: function(event, data){
      provider.roots().then((nodes)=>{
        const rows = nodes.map(ch => ({
          title: ch.text,
          lazy: ch.children === true,
          data: {
            __path: ch.__path || [ch.text],
            pathKey: toKey(ch.__path || [ch.text]),
            leafCount: ch.leafCount || 0
          }
        }));
        data.tree.reload(rows);
      }).catch(()=> data.tree.reload([]));
    },

    // 3) lazyLoad: 반드시 data.result에 배열/Promise 대입
    lazyLoad: function(event, data){
      const node = data.node;
      const path = node.data?.__path || buildPathFromNode(node);
      data.result = provider.childrenByPath(path).then(children => {
        return children.map(ch => {
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
        });
      });
    },

    table: { indentation: 14, nodeColumnIdx: 0 },

    renderColumns: function(event, data){
      const node = data.node;
      const $tds = $(node.tr).find(">td");

      // 0) 항목 칼럼: 눈알 아이콘으로 문서아이콘 교체
      const $titleCell = $tds.eq(0);
      const $nodeSpan  = $titleCell.find("> .fancytree-node");
      const $iconSpan  = $nodeSpan.find("> .fancytree-icon");
      const eyeState   = calcEyeStateForNode(node);
      $iconSpan.replaceWith(
        $(`<span class="eye-toggle ${eyeState}" title="가시성 토글">${eyeState==="hidden"?EyeOff:Eye}</span>`)
      );

      // 1) 개수: 가운데 정렬
      const $cntCell = $tds.eq(1).removeClass("text-end").addClass("text-center");
      if (node.data?.dbId != null) {
        $cntCell.text("");
      } else {
        const cnt = node.data?.leafCount ?? "";
        $cntCell.text(cnt === undefined ? "…" : String(cnt));
      }

      // 2) 현황
      const $statusCell = $tds.eq(2);
      if (node.data?.dbId != null) {
        $statusCell.text(formatObjectLabel({ elementId: node.data.elementId, dbId: node.data.dbId }));
      } else {
        const st  = getPathState(node.data?.pathKey);
        const cls = stateToClass(st);
        $(node.tr).removeClass("wbs-c wbs-td");
        if (cls) $(node.tr).addClass(cls);

        const counts = getCounts(node.data?.pathKey);
        $statusCell.html(`
          <div class="wbs-status">
            <div class="nums">
              <span class="b c" title="시공">${counts?.c ?? 0}</span>
              <span class="b t" title="가설">${counts?.t ?? 0}</span>
              <span class="b d" title="철거">${counts?.d ?? 0}</span>
              <span class="b td" title="혼합">${counts?.td ?? 0}</span>
              <span class="b total" title="총계">${counts?.total ?? 0}</span>
            </div>
          </div>
        `);

        if (st === undefined) {
          const key = node.data.pathKey;
          if (!pendingCompute.has(key)) {
            const p = Promise.resolve(computePathState(key))
              .catch(()=>{})
              .finally(()=>{ pendingCompute.delete(key); try{ data.tree.render(true, true); }catch{} });
            pendingCompute.set(key, p);
          }
        }
      }
    },

    expand: function(event, data){
      const keys = [];
      data.node.visit(n => { if (n.data?.pathKey && n.lazy !== false) keys.push(n.data.pathKey); });
      bulkEnsureForVisible(keys).then(()=>{
        keys.forEach(k => computePathState(k));
        data.tree.render(true, true);
      });
    },

    // 더블클릭: 선택/해제 토글
    dblclick: function(event, data){
      const node = data.node; const viewer = window.viewer; if (!viewer) return;
      (async ()=>{
        let ids=[];
        if (node.data?.dbId != null) ids=[node.data.dbId];
        else {
          const path = node.data?.__path || buildPathFromNode(node);
          ids = await getAllDbIdsForPath(provider, path);
        }
        try{
          const cur = viewer.getSelection()||[];
          const same = cur.length===ids.length && cur.every((v,i)=>v===ids[i]);
          if (same) viewer.clearSelection(); else if (ids?.length) viewer.select(ids);
        }catch{}
      })();
      event.preventDefault(); return false;
    },

    // 단일 클릭: 제목은 noop (확장/체크는 기본동작)
    click: function(event, data){
      if (data.targetType === "title"){ event.preventDefault(); return false; }
      return;
    }
  });

  // 눈알 위임 핸들러(항목 칼럼)
  $("#wbs-tree").off("click.wbsEye").on("click.wbsEye", ".eye-toggle", async (e)=>{
    e.stopPropagation();
    const node = $.ui.fancytree.getNode(e.currentTarget);
    const viewer = window.viewer; if(!node || !viewer) return;
    const path = node.data?.__path || buildPathFromNode(node);
    const key  = node.data?.pathKey; if(!key) return;

    const ids = await getAllDbIdsForPath(provider, path);
    if (!ids?.length) return;

    const isHidden = HIDDEN_KEYS.has(key);
    try{
      if(isHidden){ viewer.show(ids); HIDDEN_KEYS.delete(key); }
      else{ viewer.hide(ids); HIDDEN_KEYS.add(key); }
    }finally{
      node.visit(n => n.render(true));
      node.getParentList(false, true).forEach(p => p.render(true));
      try{ $.ui.fancytree.getTree("#wbs-tree").render(true, true); }catch{}
    }
  });

  // Task 갱신 훅
  window.__WBS_MARK_TASKS_CHANGED = function(){
    markTasksChanged();
    const tree = $.ui.fancytree.getTree("#wbs-tree");
    const keys=[];
    tree.getRootNode().visit(n => { if (n.data?.pathKey) keys.push(n.data.pathKey); });
    bulkEnsureForVisible(keys).then(()=>{
      keys.forEach(k => computePathState(k));
      tree.render(true, true);
    });
  };
}
