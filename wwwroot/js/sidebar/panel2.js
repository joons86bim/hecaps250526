// wwwroot/js/sidebar/panel2.js
import { setSavedTaskData } from "./panel2-buttons.js";
import {
  setupPanel2Helpers,
  showDatePickerInput,
  calendarSvg,
  attachWbsTreeHighlightEvents,
  aggregateTaskFields,
  updateWBSHighlight,
  recalcAllLeadtime,
  recalcLeadtimeFields,
  recalcLeadtimeAncestors,
  recalcLeadtimeDescendants,
  stripCountSuffix ,
  normalizeTaskCategory,
  propagateCategoryDown,
  enforceCategoryInheritance,
  getAllLeavesOfNode,
} from "./panel2-ui-helpers.js";

export let taskTree, wbsTree;

// 내부 배치·상태
let __pending = false;
let __taskDataRef = null;

/** 후위순회로 각 노드의 연결 객체 개수(중복 제거)를 계산하여 node.data._aggObjCount 저장 */
function recomputeAggObjects(tree) {
  if (!tree || !tree.getRootNode) return;
  const root = tree.getRootNode();
  const roots = root.children || [];
  const makeKey = (o) => {
    if (!o || o.dbId == null) return null;
    const urn = String(o.urn || window.CURRENT_MODEL_URN || "");
    return `${urn}::${String(o.dbId)}`;
  };
  function walk(node) {
    const own = new Set();
    const arr = (node.data && Array.isArray(node.data.linkedObjects)) ? node.data.linkedObjects : [];
    for (const o of arr) {
      const k = makeKey(o);
      if (k) own.add(k);
    }
    if (node.children && node.children.length) {
      for (const c of node.children) {
        const childSet = walk(c);
        for (const k of childSet) own.add(k);
      }
    }
    node.data._aggObjCount = own.size;
    return own;
  }
  for (const n of roots) walk(n);
}

/** 배치 플러시: 계산은 commit()에서 끝났다고 가정 → 집계/렌더/HL/저장만 수행 */
function scheduleFlush() {
  if (__pending) return;
  __pending = true;
  requestAnimationFrame(() => {
    try {
      // 1) 객체 수 집계(1회 순회)
      recomputeAggObjects(taskTree);
      // 2) 렌더 & 하이라이트 & 저장
      taskTree.render(true, true);
      updateWBSHighlight();
      if (__taskDataRef) setSavedTaskData(__taskDataRef);
    } finally {
      __pending = false;
    }
  });
  //간트차트 동기화
  try { window.gantt?.renderFromTrees(taskTree, wbsTree); } catch(_) {}
}

window.requestTaskTreeFlush = scheduleFlush;

// (권장) 구조가 바뀌는 작업(추가/삭제/대량 해제 등)엔 리드타임 재계산까지 포함
window.requestTaskRecalcAndFlush = function () {
  if (!taskTree) return; // 안전가드
  recalcAllLeadtime(taskTree);
  scheduleFlush();
};

/** 바인딩 레이어: 모든 데이터 변경은 이 경로로 모아 계산/상향/렌더를 일관 처리 */
function commit(node, patch, changedField, adjustTarget) {
  if (!node || !node.data) return;

  if (typeof patch === "function") {
    patch(node.data);
  } else if (patch && typeof patch === "object") {
    Object.assign(node.data, patch);
  }

  // 날짜/소요 계산 파이프
  recalcLeadtimeFields(node, changedField, adjustTarget);
  recalcLeadtimeDescendants(node);
  recalcLeadtimeAncestors(node);

  // 국소 렌더, 이후 배치 플러시
  node.render();
  scheduleFlush();
}

export function initPanel2Content(taskData, wbsData) {
  __taskDataRef = taskData; // 배치 저장에서 참조

  // Task 트리(Fancytree + Table)
  $("#treegrid").fancytree({
    extensions: ["table", "gridnav"],
    checkbox: false,
    selectMode: 2,
    table: { indentation: 20, nodeColumnIdx: 2 },
    source: taskData,

    // ✅ 트리 노드들이 준비된 직후
    init: function (event, data) {
      // 1) 리드타임/날짜 1회 계산
      recalcAllLeadtime(data.tree);
      // 2) 객체 수 집계 먼저
      try { recomputeAggObjects(data.tree); } catch (e) {}
      // 3) 초기 렌더
      data.tree.render(true, true);

      enforceCategoryInheritance(data.tree);   // ← 최상위 구분을 하위에 강제 상속

      // (옵션) 다음 틱에서 한 번 더 플러시(안정화)
      setTimeout(() => { scheduleFlush(); }, 0);
    },

    // 🔹 셀 렌더: 재귀 집계 제거, 계산된 값 그대로 사용
    renderColumns: function (event, data) {
      var node = data.node, $tdList = $(node.tr).find(">td");
      // const isTop = node.parent && node.parent.isRoot && node.parent.isRoot();
      const isTop = (typeof node.getLevel === "function") ? node.getLevel() === 1 : (node.parent?.isRoot?.() === true);

      $tdList.eq(0).text(node.data.no || "");
      $tdList.eq(1).html(
        `<select class="treegrid-dropdown" ${isTop ? "" : "disabled"} style="width:100%;box-sizing:border-box;height:28px;">
          ${node.data.selectOptions.map(opt =>
            `<option${opt === node.data.selectedOption ? ' selected' : ''}>${opt}</option>`
          ).join('')}
        </select>`
      );
      $tdList.eq(2).find(".fancytree-title").text(node.data.title || node.title || "");

      $tdList.eq(3).text(node.data.start || "").addClass("text-center");
      $tdList.eq(4).text(node.data.leadtime || "").addClass("text-center");
      $tdList.eq(5).text(node.data.end || "").addClass("text-center");

      const objCount = Number(node.data._aggObjCount || 0);
      $tdList.eq(6)
        .text(objCount || "")
        .addClass("text-center objcount")
        // .toggleClass("highlight", objCount > 0);
        .removeClass("highlight objcount--c objcount--t objcount--d")
        .each(function(){
          if (!objCount) return;
          const cat = normalizeTaskCategory(node.data?.selectedOption);
          if (cat === "C") $(this).addClass("objcount--c");
          else if (cat === "T") $(this).addClass("objcount--t");
          else if (cat === "D") $(this).addClass("objcount--d");
        });
    }
  });

  taskTree = $.ui.fancytree.getTree("#treegrid");
  window.taskTree = taskTree;

  // WBS 트리(InspireTree + DOM)
  const wbsContainer = document.getElementById("wbs-group-content");
  if (wbsContainer) {
    wbsContainer.innerHTML = `<div id="wbs-group-list"></div>`;
    // function toInspireNodes(arr) {
    //   return (arr || []).map(n => ({
    //     id: n.id,
    //     urn: (typeof n.dbId === "number" || (n.children?.length === 0)) ? window.CURRENT_MODEL_URN : undefined,
    //     dbId: (typeof n.dbId === "number" || (n.children?.length === 0)) ? n.dbId : undefined,
    //     text: n.text,
    //     children: toInspireNodes(n.children)
    //   }));
    // }
    function toInspireNodes(arr, parentName) {
      return (arr || []).map(n => {
        // const isLeaf = (typeof n.dbId === "number") || (n?.children?.length === 0);
        const isLeaf = (typeof n.dbId === "number");
        const parentClean = stripCountSuffix(parentName || "");
        return {
          id: n.id,
          urn: isLeaf ? window.CURRENT_MODEL_URN : undefined,
          dbId: isLeaf ? n.dbId : undefined,
          // text: n.text,
          text: stripCountSuffix(n.text),
          // leaf가 dbid면 객체이름을 부모 텍스트로 보관
          objName: isLeaf
            ? ((String(n.text) === String(n.dbId)) ? (parentClean || stripCountSuffix(n.text)) : stripCountSuffix(n.text))
            : undefined,
          children: toInspireNodes(n.children, n.text)
        };
      });
    }

    const wbsNodes = toInspireNodes(wbsData, undefined);
    wbsTree = new window.InspireTree({
      data: wbsNodes,
      selection: { multi: true, mode: "simple", autoSelectChildren: false, autoDselectChildren: false, require: false, autoSelectParents: false },
    });
    window.wbsTree = wbsTree;
    new window.InspireTreeDOM(wbsTree, {
      target: "#wbs-group-list",
      showCheckboxes: true,
      dragAndDrop: { enabled: false },
    });
    attachWbsTreeHighlightEvents(window.wbsTree, updateWBSHighlight);

    // ── (WBS 트리 만든 직후) 숫자 뱃지 보장 함수
    function ensureWbsCountBadge(node) {
      const li = document.querySelector(`#wbs-group-list li[data-uid='${node.id}']`);
      if (!li) return;
      const row = li.querySelector(':scope > .title-wrap');
      if (!row) return;

      // 없으면 생성
      let badge = row.querySelector('.count-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'count-badge';
        row.appendChild(badge);
      }

      // 최하위(leaf)이면 숫자 숨김
      const isLeaf = !(node.hasChildren && node.hasChildren());
      let count = 0;
      if (!isLeaf) {
        // 리프(dbId 숫자)만 카운트
        const leaves = getAllLeavesOfNode(node);
        count = leaves.filter(n => typeof n.dbId === 'number').length;
      }

      // // 최하위(leaf) 객체 개수 계산 (dbId가 숫자인 leaf만 카운트)
      // const leaves = getAllLeavesOfNode(node);
      // const count = leaves.filter(n => typeof n.dbId === 'number').length;

      // badge.textContent = count > 0 ? String(count) : '';
      // leaf → 무조건 숨김 / 비-leaf → 2개 이상일 때만 표시
      badge.textContent = (!isLeaf && count > 1) ? String(count) : '';

    }

    // 전체 화면에 보이는 노드들 갱신(초기 1회 보정)
    function refreshWbsCounts() {
      if (!window.wbsTree) return;
      window.wbsTree.nodes().forEach(n => ensureWbsCountBadge(n));
    }

    // 렌더/확장/축소 시 갱신
    // window.wbsTree.on('node.rendered', ensureWbsCountBadge);
    window.wbsTree.on('node.rendered', (n) => requestAnimationFrame(() => ensureWbsCountBadge(n)));
    window.wbsTree.on('node.expanded', (n) => {
      // 확장 직후 자식들도 렌더되므로 한 틱 뒤 보정
      setTimeout(() => {
        ensureWbsCountBadge(n);
        (n.children || []).forEach(ensureWbsCountBadge);
      }, 0);
    });
    window.wbsTree.on('node.collapsed', ensureWbsCountBadge);

    // 최초 1회
    setTimeout(refreshWbsCounts, 0);

    function cascadeCheck(node, checked) {
      if (!(node.hasChildren && node.hasChildren())) return;
      node.children.forEach(ch => {
        if (checked) ch.check();
        else ch.uncheck();
        cascadeCheck(ch, checked);
      });
    }
    
    window.wbsTree.on('node.checked',   (n) => cascadeCheck(n, true));
    window.wbsTree.on('node.unchecked', (n) => cascadeCheck(n, false));
  }

  // 이벤트 바인딩(중복 방지)
  $("#treegrid")
    .off("dblclick", "td")
    .on("dblclick", "td", function () {
      const colIdx = this.cellIndex;
      const node = $.ui.fancytree.getNode(this);
      if (!node) return;

      // No / 작업명
      if (colIdx === 0 || colIdx === 2) {
        const field = (colIdx === 0 ? "no" : "title");
        const label = (colIdx === 0 ? "No." : "작업명");
        const oldValue = (colIdx === 0 ? node.data.no : node.data.title) || "";
        const newValue = prompt(`${label} 값을 입력하세요:`, oldValue);
        if (newValue !== null && newValue !== oldValue) {
          commit(node, { [field]: newValue });
          if (field === "title") node.setTitle(newValue);
        }
        return;
      }

      // 시작/소요/종료 = leaf만 편집
      if (!node.hasChildren() && (colIdx === 3 || colIdx === 4 || colIdx === 5)) {
        const $td = $(this);
        if ($td.find("input").length) return;

        if (colIdx === 4) {
          // leadtime
          openLeadtimeEditor($td, node);
        } else {
          // start/end
          const field = (colIdx === 3 ? "start" : "end");
          openDateEditor($td, node, field);
        }
        return;
      }

      // 객체개수 셀: 연결 객체 목록 팝업(사용자 액션 시 1회 재귀 OK)
      if (colIdx === 6) {
        const objs = aggregateTaskFields(node).objects;
        if (objs.length === 0) {
          alert("연결된 객체 없음");
        } else {
          const CUR_URN = window.CURRENT_MODEL_URN || "";

          // WBS 전체를 1회 순회해: `${urn}:${dbId}` -> "경로 문자열" 맵 작성
          function buildWbsPathMap() {
            const pathMap = new Map();
            const roots = (window.wbsTree && typeof window.wbsTree.nodes === "function")
              ? window.wbsTree.nodes() : [];
        
            (function walk(nodes, ancestors) {
              (nodes || []).forEach(n => {
                const nameClean = stripCountSuffix(n.text || "");
                const hasKids = n.hasChildren && n.hasChildren();
                if (hasKids) {
                  // 비-리프: 경로에 현재 노드 이름 추가
                  walk(n.children, nameClean ? [...ancestors, nameClean] : ancestors);
                } else if (typeof n.dbId === "number") {
                  // 리프(dbId): 경로는 "조상들 + (부모가 객체이름)" 이므로 현 리프명은 넣지 않음
                  const urn = n.urn || CUR_URN;
                  pathMap.set(`${urn}:${n.dbId}`, ancestors.join(" - "));
                }
              });
            })(roots, []);
        
            return pathMap;
          }
        
          const pathMap = buildWbsPathMap();
          const lines = objs.map(o => {
            const urn = o.urn || CUR_URN;
            const key = `${urn}:${o.dbId}`;
            // WBS에서 찾은 경로가 최우선, 없으면 저장된 라벨을 정제해서 사용
            const fallback = stripCountSuffix(o.text || "");
            const path = pathMap.get(key) || fallback || "(이름없음)";
            return `${path} - [${o.dbId}]`;
          });
          alert(lines.join("\n"));
        
        }
      }
    });

    // 드롭다운 값 변경
    $("#treegrid").on("change", ".treegrid-dropdown", function(e){
    const $tr = $(this).closest("tr");
    const node = $.ui.fancytree.getNode($tr);
    //const isTop = node?.parent?.isRoot && node.parent.isRoot();
    const isTop = (typeof node.getLevel === "function") ? node.getLevel() === 1 : (node.parent?.isRoot?.() === true);

    if (!isTop) {
      // 수정 금지: 원래값으로 되돌림
      this.value = node.data.selectedOption;
      return;
    }

    const newCat = this.value; // "시공" | "가설" | "철거"
    // 최상위 변경 → 하위 모두 전파
    propagateCategoryDown(node, newCat);
    node.tree.render(true, true);
    window.requestTaskTreeFlush?.();
  });

  // ESC 등 공통 헬퍼
  setupPanel2Helpers(taskTree, wbsTree, taskData);
}

/* ──────────────────────────────── */
/* 편집 보조: 소요시간 에디터      */
/* ──────────────────────────────── */
function openLeadtimeEditor($td, node) {
  const field = "leadtime";
  const oldValue = node.data.leadtime || "";
  $td.empty();

  const $input = $('<input type="number" min="1" step="1" style="width:60px;text-align:center;">')
    .val(oldValue);
  $td.append($input);
  $input.focus();

  function restoreCell() {
    setTimeout(() => $td.text(node.data[field] ?? ""), 10);
    $(document).off("mousedown.cellEdit");
  }

  $input.on("keydown", (ev) => {
    if (ev.key === "Enter") $input.blur();
    if (ev.key === "Escape") { restoreCell(); }
  });

  $input.on("blur", () => {
    const v = $input.val();
    if (/^\d+$/.test(v) && Number(v) > 0) {
      const val = parseInt(v, 10);
      commit(node, { leadtime: val }, "leadtime", (choose) => {
        const okMeansEnd = confirm(
          "소요시간을 변경했습니다.\n\n확인: 시작일 고정 → 종료일 재계산\n취소: 종료일 고정 → 시작일 재계산"
        );
        choose(okMeansEnd ? "end" : "start");
      });
    }
    restoreCell();
  });

  setTimeout(() => {
    $(document).on("mousedown.cellEdit", (e) => {
      if (!$.contains($td[0], e.target) && e.target !== $input[0]) {
        restoreCell();
      }
    });
  }, 0);
}

/* ──────────────────────────────── */
/* 편집 보조: 날짜 에디터          */
/* ──────────────────────────────── */
function openDateEditor($td, node, field) {
  const oldValue = node.data[field] || "";
  $td.empty();

  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">')
    .val(oldValue);
  const $iconBtn = $('<button type="button" class="datepicker-btn" style="margin-left:4px; padding:0; background:none; border:none; cursor:pointer;"></button>')
    .html(calendarSvg);

  $td.append($input, $iconBtn);

  if (window.IMask) {
    IMask($input[0], { mask: '0000-00-00', lazy: false, autofix: true });
  }

  function restoreCell() {
    setTimeout(() => $td.text(node.data[field] || ""), 10);
    $(document).off("mousedown.cellEdit");
  }

  $input.on("keydown", (ev) => {
    if (ev.key === "Enter") $input.blur();
    if (ev.key === "Escape") { restoreCell(); }
  });

  setTimeout(() => {
    $(document).on("mousedown.cellEdit", (e) => {
      if (!$.contains($td[0], e.target) && e.target !== $input[0] && e.target !== $iconBtn[0]) {
        restoreCell();
      }
    });
  }, 0);

  function commitDate(dateStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      commit(node, { [field]: dateStr }, field);
    }
    restoreCell();
  }

  $input.on("blur", () => commitDate($input.val()));
  $iconBtn.on("click", (ev) => {
    ev.stopPropagation();
    showDatePickerInput($td, node.data[field], (dateStr) => commitDate(dateStr));
  });
}

