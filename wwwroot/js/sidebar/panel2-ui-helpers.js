// wwwroot/js/sidebar/panel2-ui-helpers.js
// panel2에서 공통으로 쓰는 ESC, dnd 동기화 기능을 이 파일에 분리

// ──────────────────────────────────────────────
// 내부 유틸
function isLeaf(node) {
  return !(node.hasChildren && node.hasChildren());
}

// 날짜 문자열(YYYY-MM-DD) → UTC Date
function toUTCDate(yyyy_mm_dd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyy_mm_dd)) return new Date('Invalid');
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// UTC Date → YYYY-MM-DD
function fromUTCDate(date) {
  // toISOString은 항상 UTC 기준. 'YYYY-MM-DDTHH:mm...' → 앞 10자리만 사용
  return date.toISOString().slice(0, 10);
}

// ──────────────────────────────────────────────
// 날짜/소요시간 계산 (UTC 기반)

// 날짜 → 일수 (포함일수, +1)
export function calcLeadtime(start, end) {
  if (start && end) {
    const s = toUTCDate(start), e = toUTCDate(end);
    if (!isNaN(s) && !isNaN(e)) {
      const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : "";
    }
  }
  return "";
}

// 시작+소요 → 종료(포함일수, -1)
export function calcEnd(start, leadtime) {
  if (start && leadtime) {
    const s = toUTCDate(start);
    const lt = Number(leadtime);
    if (!isNaN(s) && lt > 0) {
      const e = new Date(s.getTime());
      e.setUTCDate(e.getUTCDate() + lt - 1);
      return fromUTCDate(e);
    }
  }
  return "";
}

// 종료+소요 → 시작(포함일수, -1)
export function calcStart(end, leadtime) {
  if (end && leadtime) {
    const e = toUTCDate(end);
    const lt = Number(leadtime);
    if (!isNaN(e) && lt > 0) {
      const s = new Date(e.getTime());
      s.setUTCDate(s.getUTCDate() - lt + 1);
      return fromUTCDate(s);
    }
  }
  return "";
}

// ──────────────────────────────────────────────
// leaf 1개 자동계산 (changedField: "start"/"end"/"leadtime")
// popupCallback: (choose) => choose("start"|"end")
export function recalcLeadtimeFields(node, changedField, popupCallback) {
  node.data = node.data || {};
  let { start, end, leadtime } = node.data;
  const has = v => v !== undefined && v !== null && v !== "";

  const cnt =
    (has(start) ? 1 : 0) +
    (has(end) ? 1 : 0) +
    (has(leadtime) ? 1 : 0);

  // 2개만 입력됨 → 빈 항목 자동계산
  if (cnt === 2) {
    if (has(start) && has(leadtime) && !has(end)) {
      node.data.end = calcEnd(start, leadtime);
    } else if (has(start) && has(end) && !has(leadtime)) {
      node.data.leadtime = calcLeadtime(start, end);
    } else if (has(end) && has(leadtime) && !has(start)) {
      node.data.start = calcStart(end, leadtime);
    }
    return;
  }

  // 3개 모두 값 → 변경 필드 기준 재계산
  if (cnt === 3 && changedField) {
    if (changedField === "leadtime" && typeof popupCallback === "function") {
      // 팝업 쪽에서 "start" 또는 "end" 중 무엇을 바꿀지 결정해줌
      popupCallback((updateField) => {
        // 최신값 다시 읽기 (사용자 입력 직후 보호)
        start = node.data.start;
        end = node.data.end;
        leadtime = node.data.leadtime;

        if (updateField === "start") {
          node.data.start = calcStart(end, leadtime);
        } else if (updateField === "end") {
          node.data.end = calcEnd(start, leadtime);
        }
      });
    } else if (changedField === "start" || changedField === "end") {
      // 날짜 변경 → 소요 자동
      node.data.leadtime = calcLeadtime(node.data.start, node.data.end);
    }
  }
}

// 하위 전체 자동계산 (leaf마다 recalc)
export function recalcLeadtimeDescendants(node) {
  if (isLeaf(node)) {
    recalcLeadtimeFields(node);
  } else {
    (node.children || []).forEach(recalcLeadtimeDescendants);
  }
}

// 부모/상위 집계: 자식들의 min(start), max(end)로 산출 (정렬 없이 1패스)
export function recalcLeadtimeAncestors(node) {
  if (!node.parent) return;
  const p = node.parent;
  const children = p.children || [];
  if (!children.length) return;

  let minStart = "";
  let maxEnd = "";

  for (const c of children) {
    const cs = c.data && c.data.start || "";
    const ce = c.data && c.data.end || "";
    if (cs) minStart = (!minStart || cs < minStart) ? cs : minStart; // ISO 문자열 비교 OK
    if (ce) maxEnd   = (!maxEnd   || ce > maxEnd)   ? ce : maxEnd;
  }

  p.data = p.data || {};
  p.data.start = minStart || "";
  p.data.end   = maxEnd   || "";
  p.data.leadtime = (p.data.start && p.data.end)
    ? calcLeadtime(p.data.start, p.data.end)
    : "";

  if (p.render) p.render();
  recalcLeadtimeAncestors(p);
}

// 전체 집계 (초기화/로드 직후 호출) — 단일 DFS 1회로 상·하향 동시 처리
export function recalcAllLeadtime(tree) {
  if (!tree || !tree.getRootNode) return;
  const root = tree.getRootNode();
  const roots = root.children || [];
  if (!roots.length) return;

  function dfs(node) {
    if (!node) return { start: "", end: "" };

    if (!node.hasChildren || !node.hasChildren()) {
      // leaf: 자체 필드 정합화
      recalcLeadtimeFields(node);
      return {
        start: node.data?.start || "",
        end: node.data?.end || ""
      };
    }

    let minStart = "";
    let maxEnd = "";

    for (const c of (node.children || [])) {
      const agg = dfs(c);
      if (agg.start) minStart = (!minStart || agg.start < minStart) ? agg.start : minStart;
      if (agg.end)   maxEnd   = (!maxEnd   || agg.end   > maxEnd)   ? agg.end   : maxEnd;
    }

    node.data = node.data || {};
    node.data.start = minStart || "";
    node.data.end   = maxEnd   || "";
    node.data.leadtime = (node.data.start && node.data.end)
      ? calcLeadtime(node.data.start, node.data.end)
      : "";

    if (node.render) node.render();
    return { start: node.data.start, end: node.data.end };
  }

  for (const n of roots) dfs(n);
}

// ──────────────────────────────────────────────
// 1. ESC 전체 선택 해제 등
let __escBound = false;

export function setupPanel2Helpers(taskTree, wbsTree, taskData) {
  if (!__escBound) {
    __escBound = true;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // 날짜 인풋에 포커스가 있을 때는 무시 (셀 편집 ESC만 동작)
        if (
          document.activeElement &&
          document.activeElement.classList &&
          document.activeElement.classList.contains("datepicker-input")
        ) return;

        // Fancytree
        if (window.taskTree) {
          window.taskTree.visit(node => node.setActive(false));
        }
        // InspireTree
        if (window.wbsTree && typeof window.wbsTree.selected === "function") {
          window.wbsTree.selected().forEach(n => n.deselect());
        }
      }
    });
  }

  // (필요 시) dnd 이후 동기화 지점 – 현재는 비활성 예시
  if (taskTree && taskTree.getRootNode) {
    taskTree.$div.on("fancytreeDrop", function(event, data){
      // TODO: 필요시 데이터 동기화 구현
    });
  }
}

// 2. 달력 SVG
export const calendarSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="calendar-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
`;

// 3. 직접 타이핑 날짜 입력 (IMask)
export function showMaskedDateInput($container, oldValue, onConfirm) {
  const prevHtml = $container.html();
  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">').val(oldValue || "");
  $container.empty().append($input);

  if (window.IMask) {
    IMask($input[0], { mask: '0000-00-00', lazy: false, autofix: true });
  }

  $input.on("keydown", ev => { if (ev.key === "Enter") $input.blur(); });
  $input.on("blur", () => {
    const val = $input.val();
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) onConfirm(val);
    setTimeout(() => $container.html(prevHtml), 100);
  });
}

// 4. 달력 팝업(flatpickr)
export function showDatePickerInput($container, oldValue, onConfirm) {
  const prevHtml = $container.html();
  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;">').val(oldValue || "");
  $container.empty().append($input);

  const defaultDate = (/^\d{4}-\d{2}-\d{2}$/.test(oldValue)) ? oldValue : "";
  const fp = flatpickr($input[0], {
    dateFormat: "Y-m-d",
    allowInput: false,
    clickOpens: true,
    defaultDate,
    onClose: function(_, dateStr) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) onConfirm(dateStr);
      setTimeout(() => $container.html(prevHtml), 100);
    }
  });

  setTimeout(() => fp.open(), 50);
}

// ──────────────────────────────────────────────
// 7. WBS highlight 바인딩
export function attachWbsTreeHighlightEvents(wbsTree, highlightFn) {
  [
    'node.selected', 'node.deselected',
    'node.checked', 'node.unchecked',
    'node.expanded', 'node.collapsed'
  ].forEach(evt => {
    wbsTree.on(evt, () => setTimeout(highlightFn, 0));
  });
}

// 8. Task 집계 (부모로 객체 합산) — on-demand(팝업용)
export function aggregateTaskFields(node) {
  let objects = (node.data.linkedObjects || []).slice();
  if (node.hasChildren && node.hasChildren()) {
    (node.children || []).forEach(child => {
      objects = objects.concat(aggregateTaskFields(child).objects);
    });
  }
  const seen = new Set();
  objects = objects.filter(obj => {
    const key = (obj.urn || "") + "::" + obj.dbId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    start: node.data.start || "",
    end: node.data.end || "",
    leadtime: node.data.leadtime || "",
    objects
  };
}

// 9. WBS 하이라이트 (트리 전체 1회 순회로 링크 집합 구성)
// export function updateWBSHighlight() {
//   $("#wbs-group-list .inspire-tree-node").removeClass("connected");

//   const taskTree = window.taskTree;
//   if (!taskTree || !taskTree.getRootNode) return;

//   const root = taskTree.getRootNode();
//   const roots = root.children || [];
//   const linkedSet = new Set();
//   const makeKey = (o) => {
//     if (!o || o.dbId == null) return null;
//     const urn = String(o.urn || window.CURRENT_MODEL_URN || "");
//     return `${urn}::${String(o.dbId)}`;
//   };

//   function collect(node) {
//     const arr = node.data && Array.isArray(node.data.linkedObjects) ? node.data.linkedObjects : [];
//     for (const o of arr) {
//       const k = makeKey(o);
//       if (k) linkedSet.add(k);
//     }
//     if (node.children && node.children.length) {
//       for (const c of node.children) collect(c);
//     }
//   }
//   for (const n of roots) collect(n);

//   // leaf 매핑
//   getAllLeafNodes(window.wbsTree).forEach(node => {
//     const key = `${String(node.urn)}::${String(node.dbId)}`;
//     if (linkedSet.has(key)) {
//       const $li = $(`#wbs-group-list a[data-uid='${node.id}']`).closest("li");
//       $li.addClass("connected");
//     }
//   });

//   // 그룹 매핑 (하위 leaf가 모두 연결이면 그룹도 connected)
//   function traverse(node) {
//     if (node.hasChildren && node.hasChildren()) {
//       const leaves = getAllLeavesOfNode(node);
//       const allConnected = leaves.length > 0 && leaves.every(
//         leaf => linkedSet.has(`${String(leaf.urn)}::${String(leaf.dbId)}`)
//       );
//       const $li = $(`#wbs-group-list li[data-uid='${node.id}']`);
//       $li.toggleClass("connected", !!allConnected);
//       node.children.forEach(traverse);
//     }
//   }
//   window.wbsTree.nodes().forEach(traverse);
// }
export function updateWBSHighlight() {
  // 기존 클래스 제거
  $("#wbs-group-list li").removeClass("wbs-c wbs-blue wbs-td");

  // 1) urn:dbId → {C,T,D} 집계
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  const catMap = new Map(); // key => {C:boolean,T:boolean,D:boolean}

  if (window.taskTree) {
    window.taskTree.getRootNode().visit(n => {
      const cat = normalizeTaskCategory(n.data?.selectedOption);
      const arr = n.data?.linkedObjects || [];
      if (!cat || !Array.isArray(arr) || arr.length === 0) return;
      arr.forEach(o => {
        const key = `${String(o.urn || CUR_URN)}::${String(o.dbId)}`;
        const cur = catMap.get(key) || { C:false, T:false, D:false };
        if (cat === "C") cur.C = true;
        else if (cat === "T") cur.T = true;
        else if (cat === "D") cur.D = true;
        catMap.set(key, cur);
      });
    });
  }

  // 2) leaf에 클래스 적용
  const leaves = getAllLeafNodes(window.wbsTree);
  leaves.forEach(node => {
    const key = `${String(node.urn || CUR_URN)}::${String(node.dbId)}`;
    const st = catMap.get(key) || { C:false, T:false, D:false };
    const $li = $(`#wbs-group-list li[data-uid='${node.id}']`);
    $li.removeClass("wbs-c wbs-blue wbs-td");

    if (st.C && !st.T && !st.D) {
      $li.addClass("wbs-c");          // 시공: 초록 배경
    } else if (!st.C && st.T && st.D) {
      $li.addClass("wbs-td");         // 가설+철거: 빨강 배경 + 파란 글자
    } else if (!st.C && (st.T || st.D)) {
      $li.addClass("wbs-blue");       // 가설-only 또는 철거-only: 파란 글자
    }
  });

  // 2) 부모 노드 색칠: "모든 leaf가 연결되었고, 모두 동일한 상태일 때만" 칠함
  function getLeafState(leaf) {
    const key = `${String(leaf.urn || CUR_URN)}::${String(leaf.dbId)}`;
    const st = catMap.get(key);
    if (!st || (!st.C && !st.T && !st.D)) return ""; // 미연결
    if (st.C && !st.T && !st.D) return "C";
    if (!st.C && st.T && !st.D) return "T";
    if (!st.C && !st.T && st.D) return "D";
    if (!st.C && st.T && st.D)  return "TD";
    // (C와 T/D 동시는 정책상 금지지만, 혹시 대비해 빈 상태로 취급)
    return "";
  }

  function colorParentIfUniform(node) {
    if (!(node.hasChildren && node.hasChildren())) return;
    const leavesUnder = getAllLeavesOfNode(node);
    if (!leavesUnder.length) return;

    const states = leavesUnder.map(getLeafState);
    // 모든 leaf가 연결되어 있어야 하고
    if (states.some(s => !s)) return;
    // 모든 leaf의 상태가 동일해야 함
    const first = states[0];
    const uniform = states.every(s => s === first);
    if (!uniform) return;

    const $li = $(`#wbs-group-list li[data-uid='${node.id}']`).removeClass("wbs-c wbs-blue wbs-td");
    if (first === "C")       $li.addClass("wbs-c");   // 시공 only
    else if (first === "TD") $li.addClass("wbs-td");  // 가설+철거
    else if (first === "T" || first === "D") $li.addClass("wbs-blue"); // 가설-only 또는 철거-only
  }
  (function walk(nodes){
    (nodes || []).forEach(n => {
      if (n.hasChildren && n.hasChildren()) {
        colorParentIfUniform(n);
        walk(n.children);
      }
    });
  })(window.wbsTree?.nodes?.() || []);
}

// 10. WBS 전체 leaf 반환
export function getAllLeafNodes(tree) {
  const leaves = [];
  function walk(nodes) {
    nodes.forEach(n => {
      if (n.hasChildren && n.hasChildren()) walk(n.children);
      else leaves.push(n);
    });
  }
  if (tree && typeof tree.nodes === "function") {
    walk(tree.nodes());
  }
  return leaves;
}

// 11. 특정 노드 아래 모든 leaf 반환
export function getAllLeavesOfNode(node) {
  const leaves = [];
  (function walk(n){
    if (n.hasChildren && n.hasChildren()) n.children.forEach(walk);
    else leaves.push(n);
  })(node);
  return leaves;
}

export function normalizeTaskCategory(val) {
  const s = String(val || "").trim();
  if (s === "시공") return "C";
  if (s === "가설") return "T";
  if (s === "철거") return "D";
  return "";
}

// 표시 전용: 끝의 "=> (숫자)" 또는 "(숫자)" 꼬리 제거
export function stripCountSuffix(s) {
  if (s == null) return s;
  return String(s).replace(/\s*(?:=>\s*)?\(\s*\d+\s*\)\s*$/,'').trim();
}

// ── 구분(시공/가설/철거) 하향 전파
export function propagateCategoryDown(node, categoryLabel) {
  if (!node) return;
  node.data = node.data || {};
  node.data.selectedOption = categoryLabel;
  (node.children || []).forEach(ch => propagateCategoryDown(ch, categoryLabel));
}

// ── 트리 전체에 강제 상속 적용(초기화/로드 직후 1회)
export function enforceCategoryInheritance(tree) {
  if (!tree || !tree.getRootNode) return;
  const root = tree.getRootNode();
  (root.children || []).forEach(top => {
    const cat = top?.data?.selectedOption || "시공";
    propagateCategoryDown(top, cat);
  });
}