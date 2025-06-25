// wwwroot/js/sidebar/panel2.js
// 전역으로 로드된 InspireTree/InspireTreeDOM 사용 << WBS
import { setupPanel2Helpers  } from "./panel2-ui-helpers.js";

// ① 원본 샘플 데이터
export let taskData = [
  {no: "1", 
   title: "Task A",
   start: "2024-06-25",
   end: "2024-07-01",
   linkedObjects: [/*연결된 객체 정보들*/
    {modelId: 1, dbId: 123, text: "구조벽 [123]" }
   ],
   children: [
    {no: "1.1", title: "Subtask A1", start: "2024-06-26", end: "2024-06-30"}
  ]},
  {no: "2", title: "Task B", start: "", end: ""}
];

export let wbsData = [
  { label: "Group 1", children: [{ label: "Subgroup 1-1" }] },
  { label: "Group 2" },
];

// ② 전역으로 쓸 트리 인스턴스
export let taskTree, wbsTree;

export function initPanel2Content() {
  // == Task List (Fancytree + Table)
  $("#treegrid").fancytree({
    extensions: ["table", "gridnav"],
    checkbox: false, 
    table: {
      indentation: 20,
      nodeColumnIdx: 1
    },
    source: taskData,
    renderColumns: function(event, data) {
      var node = data.node,
          $tdList = $(node.tr).find(">td");
      // 0: No
      $tdList.eq(0).text(node.data.no || "");
      // 1: 작업명
      $tdList.eq(1).find(".fancytree-title").text(node.data.title || node.title || "");
      // 2: 시작일
      $tdList.eq(2).text(node.data.start || "");
      // 3: 완료일
      $tdList.eq(3).text(node.data.end || "");
      // 4: 객체개수
      $tdList.eq(4).text((node.data.linkedObjects || []).length || "");
    }
  });
  taskTree = $.ui.fancytree.getTree("#treegrid");
  window.taskTree = taskTree; // 글로벌 접근

  //   // WBS 트리 기존 인스턴스 제거
  // if (window.wbsTree && typeof window.wbsTree.destroy === "function") {
  //   window.wbsTree.destroy();
  // }
  // if (document.getElementById("wbs-group-list")) {
  //   document.getElementById("wbs-group-list").innerHTML = "";
  // }

  // ─── WBS 트리 생성 ───────────────────────────────────────────────────
  const wbsContainer = document.getElementById("wbs-group-content");
  if (wbsContainer) {
    // 기존 마크업 비우고 컨테이너 준비
    wbsContainer.innerHTML = `<div id="wbs-group-list"></div>`;

    // wbsData → InspireTree 포맷 변환
    const wbsNodes = wbsData.map((item) => ({
      id: item.label,
      text: item.label,
      children: (item.children || []).map((c) => ({
        id: `${item.label}::${c.label}`,
        text: c.label,
      })),
    }));

    // WBS 트리 인스턴스 생성 (체크박스 ON)
    wbsTree = new window.InspireTree({
      data: wbsNodes,
      selection: {
        multi: true,
        mode: "simple",
        //체크박스 상위 체크시 하위 전부 체크 반대도 마찬가지
        autoSelectChildren: false,
        autoDselectChildren: false,
        require: false,
        autoSelectParents: false,
      },
    });

    window.wbsTree = wbsTree; // 전역으로 export

    // DOM 렌더러, 체크박스 보이기, 드래그는 OFF
    new window.InspireTreeDOM(wbsTree, {
      target: "#wbs-group-list",
      showCheckboxes: true,
      dragAndDrop: { enabled: false },
    });
    
  }
  //날짜 변환기
  function normalizeDateInput(input) {
    // 20250625 → 2025-06-25
    if (/^\d{8}$/.test(input)) {
      return `${input.substr(0,4)}-${input.substr(4,2)}-${input.substr(6,2)}`;
    }
    // 250625 → 2025-06-25 (20xx로 가정)
    if (/^\d{6}$/.test(input)) {
      return `20${input.substr(0,2)}-${input.substr(2,2)}-${input.substr(4,2)}`;
    }
    // 2025-06-25 or 2025/06/25 → 2025-06-25
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(input)) {
      return input.replace(/\//g, '-');
    }
    // 그 외는 null
    return null;
  }
  // 입력날짜 검토
  function isValidDate(dateStr) {
    // dateStr: "YYYY-MM-DD"
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const [year, month, day] = parts.map(Number);
  
    if (
      isNaN(year) || isNaN(month) || isNaN(day) ||
      year < 1900 || month < 1 || month > 12 || day < 1 || day > 31
    ) return false;
  
    // JS 날짜 객체로 판별
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // 셀 더블클릭시 편집 진입 트리거
  $("#treegrid").on("dblclick", "td", function(e) {
    const colIdx = this.cellIndex;
    const node = $.ui.fancytree.getNode(this);
    if (!node) return;
  
    let field, label, oldValue;
    if (colIdx === 0)      { field = "no";    label = "No.";      oldValue = node.data.no || ""; }
    else if (colIdx === 1) { field = "title"; label = "작업명";   oldValue = node.data.title || ""; }
    else if (colIdx === 2) { field = "start"; label = "시작일";   oldValue = node.data.start || ""; }
    else if (colIdx === 3) { field = "end";   label = "완료일";   oldValue = node.data.end || ""; }
    else if (colIdx === 4) {
                            // 연결된 객체 정보 팝업
                           const objs = node.data.linkedObjects || [];
                           let msg = objs.length === 0
                             ? "연결된 객체 없음"
                             : objs.map(o => o.text + " (modelId:" + o.modelId + ", dbId:" + o.dbId + ")").join("\n");
                           alert(msg); // → 추후 커스텀 팝업으로 교체 가능
                           }
    else return;
  
    function inputDateLoop() {
      const newValue = prompt(`${label} 값을 입력하세요:`, oldValue);
      if (newValue === null) return;
  
      if (field === "start" || field === "end") {
        const norm = normalizeDateInput(newValue);
        if (!norm || !isValidDate(norm)) {
          alert("실제 날짜를 입력해주세요. 예) 20250625, 250625, 2025-06-25, 2025/06/25 ... ");
          inputDateLoop();
          return;
        }
        node.data[field] = norm;
        node.render();
        node.tree.render(true, true);
      } else {
        node.data[field] = newValue;
        if (field === "title") node.setTitle(newValue);
        node.data.title = newValue;
        node.render();
        node.tree.render(true, true);
      }
    }
    inputDateLoop();
  });
  // ========== ESC/dnd 헬퍼(드롭, 선택 해제) 바인딩 ==========
  setupPanel2Helpers(taskTree, wbsTree, taskData);
}
