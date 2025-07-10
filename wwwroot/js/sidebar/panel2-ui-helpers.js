// wwwroot/js/sidebar/panel2-ui-helpers.js
// panel2에서 공통으로 쓰는 ESC, dnd 동기화 기능을 이 파일에 분리

// 1. ESC 전체 선택 해제 등
export function setupPanel2Helpers(taskTree, wbsTree, taskData) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Fancytree(작업트리)
      if (window.taskTree) {
        window.taskTree.visit(function(node){
          node.setActive(false);
        });
      }
      // InspireTree(WBS)
      if (window.wbsTree && typeof window.wbsTree.selected === "function") {
        window.wbsTree.selected().forEach((node) => node.deselect());
      }
    }
  });

  // 드롭 후 데이터 동기화 (예시, 필요 없으면 제거)
  if (taskTree && taskTree.getRootNode) {
    // fancytree dnd 관련 이벤트 연결
    // taskTree.dnd5 이벤트도 지원 가능
    // 아래는 예시
    taskTree.$div.on("fancytreeDrop", function(event, data){
      // drop 후 taskData 동기화가 필요하다면 여기서 구현
      // (여기선 생략, 필요시 알려주세요)
      // 예) taskData = taskTree.toDict(true) 등...
      // console.log("▶ after drop taskData:", taskData);
    });
  }
}

// 2. 무료 Lucide 달력 SVG
export const calendarSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="calendar-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
`;

// 3. Task 테이블 날짜 셀 더블클릭시 : 직접입력(IMask)
export function showMaskedDateInput($container, oldValue, onConfirm) {
  const prevHtml = $container.html();
  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">').val(oldValue || "");
  $container.empty().append($input);

  if (window.IMask) {
    IMask($input[0], {
      mask: '0000-00-00',
      lazy: false,
      autofix: true,
    });
  }

  $input.on("keydown", function(ev) {
    if (ev.key === "Enter") $input.blur();
  });
  $input.on("blur", function() {
    const val = $input.val();
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      onConfirm(val);
    }
    setTimeout(() => $container.html(prevHtml), 100);
  });
}

// 4. 달력 아이콘 클릭시 (flatpickr)  
export function showDatePickerInput($container, oldValue, onConfirm) {
  const prevHtml = $container.html();
  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;">').val(oldValue || "");
  $container.empty().append($input);

  let defaultDate = "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(oldValue)) defaultDate = oldValue;
  let fp = flatpickr($input[0], {
    dateFormat: "Y-m-d",
    allowInput: false,
    clickOpens: true,
    defaultDate: defaultDate,
    onClose: function(selectedDates, dateStr) {
      if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        onConfirm(dateStr);
      }
      setTimeout(() => $container.html(prevHtml), 100);
    }
  });

  setTimeout(() => fp.open(), 50);
}

// 5. 날짜 입력 정규화
export function normalizeDateInput(input) {
  if (!input) return "";
  let v = input.trim().replace(/\s/g, "");
  // 6자리(YYMMDD): 250215 → 2025-02-15
  if (/^\d{6}$/.test(v)) {
    let year = "20" + v.slice(0, 2);
    let month = v.slice(2, 4);
    let day = v.slice(4, 6);
    return `${year}-${month}-${day}`;
  }
  // 8자리(YYYYMMDD): 20250215 → 2025-02-15
  if (/^\d{8}$/.test(v)) {
    let year = v.slice(0, 4);
    let month = v.slice(4, 6);
    let day = v.slice(6, 8);
    return `${year}-${month}-${day}`;
  }
  // yyyy.mm.dd, yyyy/mm/dd, yyyy-mm-dd
  v = v.replace(/[./]/g, "-");
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v;
  }
  return "";
}

// 6. 날짜 검증
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const [year, month, day] = parts.map(Number);
  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31
  ) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// 7. Task/WBS highlight 헬퍼 - WBS 트리 변경 이벤트 바인딩
export function attachWbsTreeHighlightEvents(wbsTree, highlightFn) {
  [
    'node.selected', 'node.deselected',
    'node.checked', 'node.unchecked',
    'node.expanded', 'node.collapsed'
  ].forEach(evt => {
    wbsTree.on(evt, () => {
      setTimeout(highlightFn, 0);
    });
  });
}

// 8. Task 트리 flatten 집계 (부모 집계)
export function aggregateTaskFields(node) {
  let objects = (node.data.linkedObjects || []).slice();
  if (node.hasChildren()) {
    node.children.forEach(child => {
      objects = objects.concat(aggregateTaskFields(child).objects);
    });
  }
  // 중복 제거 (urn::dbId)
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
    objects
  };
}

// 9. WBS 하이라이트
export function updateWBSHighlight() {
  $("#wbs-group-list .inspire-tree-node").removeClass("connected");
  let linked = {};
  (window.taskTree.getRootNode().children || []).forEach(rootNode => {
    let agg = aggregateTaskFields(rootNode);
    (agg.objects || []).forEach(obj => {
      let key = String(obj.urn) + "::" + String(obj.dbId);
      linked[key] = true;
    });
  });
  getAllLeafNodes(window.wbsTree).forEach(function(node){
    let key = String(node.urn) + "::" + String(node.dbId);
    if (linked[key]) {
      let $li = $(`#wbs-group-list a[data-uid='${node.id}']`).closest("li");
      $li.addClass("connected");
    }
  });
  // 폴더(브랜치) 강조
  function traverse(node) {
    if (node.hasChildren && node.hasChildren()) {
      let leaves = getAllLeavesOfNode(node);
      let allConnected = leaves.length > 0 && leaves.every(
        leaf => linked[String(leaf.urn) + "::" + String(leaf.dbId)]
      );
      let $li = $(`#wbs-group-list li[data-uid='${node.id}']`);
      if (allConnected) {
        $li.addClass("connected");
      } else {
        $li.removeClass("connected");
      }
      node.children.forEach(child => traverse(child));
    }
  }
  window.wbsTree.nodes().forEach(traverse);
}

// 10. WBS 전체 leaf 반환
export function getAllLeafNodes(tree) {
  let leaves = [];
  function traverse(nodes) {
    nodes.forEach(node => {
      if (node.hasChildren && node.hasChildren()) {
        traverse(node.children);
      } else {
        leaves.push(node);
      }
    });
  }
  traverse(tree.nodes());
  return leaves;
}

// 11. 특정 노드 아래 모든 leaf 반환
export function getAllLeavesOfNode(node) {
  let leaves = [];
  if (node.hasChildren && node.hasChildren()) {
    node.children.forEach(child => {
      leaves = leaves.concat(getAllLeavesOfNode(child));
    });
  } else {
    leaves.push(node);
  }
  return leaves;
}

// 12. 날짜 부모 집계
export function propagateDatesFromChildren(node) {
  if (!node.hasChildren()) return { start: node.data.start, end: node.data.end };
  let minStart = null, maxEnd = null;
  node.children.forEach(child => {
    const childDates = propagateDatesFromChildren(child);
    if (childDates.start && (!minStart || childDates.start < minStart)) minStart = childDates.start;
    if (childDates.end && (!maxEnd || childDates.end > maxEnd)) maxEnd = childDates.end;
  });
  node.data.start = minStart || node.data.start || "";
  node.data.end = maxEnd || node.data.end || "";
  node.render && node.render();
  return { start: node.data.start, end: node.data.end };
}