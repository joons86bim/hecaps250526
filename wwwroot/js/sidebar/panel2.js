// wwwroot/js/sidebar/panel2.js
import { setSavedTaskData } from "./panel2-buttons.js";
import {
  setupPanel2Helpers,
  showDatePickerInput,
  calendarSvg,
  attachWbsTreeHighlightEvents,
  aggregateTaskFields,
  updateWBSHighlight,
  propagateDatesFromChildren,
} from "./panel2-ui-helpers.js";

export let taskTree, wbsTree;

export function initPanel2Content(taskData, wbsData) {
  // Task 트리(Fancytree + Table)
  $("#treegrid").fancytree({
    extensions: ["table", "gridnav"],
    checkbox: false,
    selectMode: 2,
    table: { indentation: 20, nodeColumnIdx: 2 },
    source: taskData,
    renderColumns: function (event, data) {
      var node = data.node, $tdList = $(node.tr).find(">td");
      let agg = aggregateTaskFields(node);
      $tdList.eq(0).text(node.data.no || "");
      $tdList.eq(1).html(
        `<select class="treegrid-dropdown" style="width: 100%; box-sizing: border-box; height: 28px;">
          ${node.data.selectOptions.map(opt =>
            `<option${opt === node.data.selectedOption ? ' selected' : ''}>${opt}</option>`
          ).join('')}
        </select>`
      );
      $tdList.eq(2).find(".fancytree-title").text(node.data.title || node.title || "");
      $tdList.eq(3).text(agg.start || "").addClass("text-center");
      $tdList.eq(4).text(agg.end || "").addClass("text-center");
      let objCount = agg.objects.length || 0;
      $tdList.eq(5)
        .text(objCount || "")
        .addClass("text-center objcount")
        .toggleClass("highlight", objCount > 0);
    }
  });
  taskTree = $.ui.fancytree.getTree("#treegrid");
  window.taskTree = taskTree;

  // WBS 트리(InspireTree + DOM)
  const wbsContainer = document.getElementById("wbs-group-content");
  if (wbsContainer) {
    wbsContainer.innerHTML = `<div id="wbs-group-list"></div>`;
    function toInspireNodes(arr) {
      return (arr || []).map(n => ({
        id: n.id,
        urn: (typeof n.dbId === "number" || (n.children?.length === 0)) ? window.CURRENT_MODEL_URN : undefined,
        dbId: (typeof n.dbId === "number" || (n.children?.length === 0)) ? n.dbId : undefined,
        text: n.text,
        children: toInspireNodes(n.children)
      }));
    }
    const wbsNodes = toInspireNodes(wbsData);
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
  }

  // Task Table 더블클릭 이벤트
  $("#treegrid").on("dblclick", "td", function (e) {
    const colIdx = this.cellIndex;
    const node = $.ui.fancytree.getNode(this);
    if (!node) return;

    // No, 작업명 편집
    if (colIdx === 0 || colIdx === 2) {
      let field = (colIdx === 0 ? "no" : "title");
      let label = (colIdx === 0 ? "No." : "작업명");
      let oldValue = (colIdx === 0 ? node.data.no : node.data.title) || "";
      const newValue = prompt(`${label} 값을 입력하세요:`, oldValue);
      if (newValue !== null && newValue !== oldValue) {
        node.data[field] = newValue;
        if (field === "title") node.setTitle(newValue);
        node.render();
        node.tree.render(true, true);
        setSavedTaskData(taskData);
        setTimeout(updateWBSHighlight, 0);
      }
      return;
    }

    // 시작일/완료일(leaf)
    if ((colIdx === 3 || colIdx === 4) && !node.hasChildren()) {
      let field = (colIdx === 3 ? "start" : "end");
      let oldValue = node.data[field] || "";
      let $td = $(this);
      if ($td.find("input").length > 0) return;

      // 인풋 + 달력아이콘
      $td.empty();
      const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">').val(oldValue);
      const $iconBtn = $('<button type="button" class="datepicker-btn" style="margin-left:4px; padding:0; background:none; border:none; cursor:pointer;"></button>').html(calendarSvg);
      $td.append($input, $iconBtn);

      // IMask
      if (window.IMask) {
        IMask($input[0], {
          mask: '0000-00-00',
          lazy: false,
          autofix: true,
        });
      }

      // --- 셀 복원 함수 ---
      function restoreCell() {
        setTimeout(() => $td.text(node.data[field] || ""), 30);
        $(document).off("mousedown.dateInput");
      }
      
      // --- ESC, Enter, blur, 외부 클릭(셀 외) 처리 ---
      $input.on("keydown", function(ev){
        if (ev.key === "Enter") $input.blur();
        //if (ev.key === "Escape") restoreCell();
      });

      setTimeout(() => {
        $(document).on("mousedown.dateInput", function(e) {
          if (!$.contains($td[0], e.target) && e.target !== $input[0] && e.target !== $iconBtn[0]) {
            restoreCell();
          }
        });
      }, 0);

      // 엔터/blur 확정
      //$input.on("keydown", function (ev) { if (ev.key === "Enter") $input.blur(); });
      $input.on("blur", function () {
        const val = $input.val();
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          node.data[field] = val;
          mask.updateValue();
          node.render();
          propagateDatesFromChildren(node.parent || node.tree.getRootNode());
          node.tree.render(true, true);
          setTimeout(updateWBSHighlight, 0);
        }
        restoreCell();
      });

      // 달력
      $iconBtn.on("click", function (ev) {
        ev.stopPropagation();
        showDatePickerInput($td, node.data[field], function (dateStr) {
          node.data[field] = dateStr;
          mask.updateValue();
          node.render();
          propagateDatesFromChildren(node.parent || node.tree.getRootNode());
          node.tree.render(true, true);
          setTimeout(updateWBSHighlight, 0);
          restoreCell();
        });
      });
      return;
    }

    // 객체개수: 팝업
    if (colIdx === 5) {
      const objs = aggregateTaskFields(node).objects;
      let msg = objs.length === 0
        ? "연결된 객체 없음"
        : objs.map(o => `${o.text} (urn:${o.urn}, dbId:${o.dbId})`).join("\n");
      alert(msg);
      return;
    }
  });

  // 3. 드롭다운 값 변경시 node data 업데이트
  $("#treegrid").on("change", ".treegrid-dropdown", function(e){
    let $tr = $(this).closest("tr");
    let node = $.ui.fancytree.getNode($tr);
    node.data.selectedOption = this.value;
    // 필요하면 node.title 등도 업데이트!
    console.log("드롭다운 값 변경:", node.data.selectedOption);
    node.tree.render(true, true);
    setTimeout(updateWBSHighlight, 0);
  });

  setupPanel2Helpers(taskTree, wbsTree, taskData);

  // 트리 생성 후 부모날짜 집계
  if (taskTree && taskTree.getRootNode) {
    taskTree.getRootNode().children.forEach(child => {
      propagateDatesFromChildren(child);
    });
    taskTree.render(true, true);
  }
}
