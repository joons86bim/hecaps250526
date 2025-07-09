// wwwroot/js/sidebar/panel2.js
// 전역으로 로드된 InspireTree/InspireTreeDOM 사용 << WBS
import { setSavedTaskData } from "./panel2-buttons.js";
import { setupPanel2Helpers  } from "./panel2-ui-helpers.js";

// 글로벌로 쓸 트리 인스턴스
export let taskTree, wbsTree;

/**
 * [핵심] Task/WBS 트리 + UI 전체 생성/초기화
 * @param {Array} taskData  // 모델별 불러온 작업 데이터
 * @param {Array} wbsData   // buildWbsTreeData(viewer) 결과
 */

export function initPanel2Content(taskData, wbsData) {
  // ① aggregateTaskFields 먼저 선언/등록
  function aggregateTaskFields(node) {
    let objects = (node.data.linkedObjects || []).slice();
    if (node.hasChildren()) {
      node.children.forEach(child => {
        const agg = aggregateTaskFields(child);
        objects = objects.concat(agg.objects);
      });
    }
    // [추가] urn::dbId 기준으로 유니크하게 집계
    const uniqMap = {};
    objects.forEach(obj => {
      if (obj.urn && obj.dbId != null) {
        uniqMap[String(obj.urn) + "::" + String(obj.dbId)] = obj;
      }
    });

    return {
      start: node.data.start || "",
      end: node.data.end || "",
      // flatten 유니크 객체 배열 반환
    objects: Object.values(uniqMap)
    };
  }

  window.aggregateTaskFields = aggregateTaskFields; // ★★★ 트리 생성 전에 반드시 등록!
  
  // --- 1. Task 트리(Fancytree + Table) 생성 ---
  $("#treegrid").fancytree({
    extensions: ["table", "gridnav"],
    checkbox: false,
    selectMode: 2, // 다중선택모드 
    table: {
      indentation: 20,
      nodeColumnIdx: 1
    },
    source: taskData,
    renderColumns: function(event, data) {
      var node = data.node, $tdList = $(node.tr).find(">td");
      let agg = window.aggregateTaskFields(node);
      // 여기 디버깅!
      console.log("[객체 카운트 디버깅]", {
        node: node.title,
        linkedObjects: node.data.linkedObjects,
        aggObjects: agg.objects,
        linkedObjectsLength: (node.data.linkedObjects||[]).length,
        aggObjectsLength: agg.objects.length
      });

      $tdList.eq(0).text(node.data.no || "");
      $tdList.eq(1).find(".fancytree-title").text(node.data.title || node.title || "");
      $tdList.eq(2).text(agg.start || "").addClass("text-center");
      $tdList.eq(3).text(agg.end || "").addClass("text-center");
      let objCount = agg.objects.length || 0;
      $tdList.eq(4)
        .text(objCount || "")
        .addClass("text-center objcount")
        .toggleClass("highlight", objCount > 0);
    }
  });
  taskTree = $.ui.fancytree.getTree("#treegrid");
  window.taskTree = taskTree;
 
  // --- 2. WBS 트리(InspireTree + InspireTreeDOM) 생성 ---
  const wbsContainer = document.getElementById("wbs-group-content");
  if (wbsContainer) {
    wbsContainer.innerHTML = `<div id="wbs-group-list"></div>`;

    // wbsData → InspireTree 포맷 변환(재귀)
    function toInspireNodes(nodeArr) {
      return (nodeArr || []).map(n => {
        // leaf: dbId가 number면 leaf로 간주
        const isLeaf = typeof n.dbId === "number" || (n.children?.length === 0);
        return {
          id: n.id, // buildWbsTreeData의 id를 그대로!
          urn: isLeaf ? window.CURRENT_MODEL_URN : undefined,
          dbId: isLeaf ? n.dbId : undefined,
          text: n.text,
          children: toInspireNodes(n.children)
        };
      });
    }
    const wbsNodes = toInspireNodes(wbsData);
    wbsTree = new window.InspireTree({
      data: wbsNodes,
      selection: {
        multi: true,
        mode: "simple",
        autoSelectChildren: false,
        autoDselectChildren: false,
        require: false,
        autoSelectParents: false,
      },
    });
    window.wbsTree = wbsTree; 
    new window.InspireTreeDOM(wbsTree, {
      target: "#wbs-group-list",
      showCheckboxes: true,
      dragAndDrop: { enabled: false },
    });

    // 노드 체크/언체크/선택 등 이벤트에서 하이라이트 동기화
    attachWbsTreeHighlightEvents()
    
  }

  // [이벤트] WBS 노드 선택/언선택 등 변경 시 하이라이트 함수 호출
  function attachWbsTreeHighlightEvents() {
    [
      'node.selected', 'node.deselected',
      'node.checked', 'node.unchecked',
      'node.expanded', 'node.collapsed'
    ].forEach(evt => {
      window.wbsTree.on(evt, () => {
        setTimeout(window.updateWBSHighlight, 0);
      });
    });
  }

  // [이벤트] Task Table 더블클릭 시 값 직접수정 (No/작업명/시작일/완료일)
  $("#treegrid").on("dblclick", "td", function(e) {
    const colIdx = this.cellIndex;
    const node = $.ui.fancytree.getNode(this);
    if (!node) return;
  
    // No, 작업명 편집
    if (colIdx === 0 || colIdx === 1) {
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
        setTimeout(window.updateWBSHighlight, 0); // ← 반드시!!
      }
      return;
    }
  
    // 시작일/완료일은 leaf만 편집 가능
    if ((colIdx === 2 || colIdx === 3) && !node.hasChildren()) {
      let field = (colIdx === 2 ? "start" : "end");
      let label = (colIdx === 2 ? "시작일" : "완료일");
      let oldValue = node.data[field] || "";
      function inputDateLoop() {
        const newValue = prompt(`${label} 값을 입력하세요:`, oldValue);
        if (newValue === null) return;
        const norm = normalizeDateInput(newValue);
        if (!norm || !isValidDate(norm)) {
          alert("실제 날짜를 입력해주세요. 예) 20250625, 250625, 2025-06-25, 2025/06/25 ... ");
          inputDateLoop();
          return;
        }
        node.data[field] = norm;
        node.render();
        propagateDatesFromChildren(node.parent || node.tree.getRootNode());
        node.tree.render(true, true);
        setTimeout(window.updateWBSHighlight, 0); // ← 반드시!!
      }
      inputDateLoop();
      return;
    }
  
    // 객체개수: 연결된 객체 리스트 팝업
    if (colIdx === 4) {
      const agg = aggregateTaskFields(node);
      const objs = agg.objects;
      let msg = objs.length === 0
        ? "연결된 객체 없음"
        : objs.map(o => `${o.text} (urn:${o.urn}, dbId:${o.dbId})`).join("\n");
      alert(msg);
      return;
    }
  });
    
  // Task/WBS 연결, 헬퍼 함수 등 추가
  setupPanel2Helpers(taskTree, wbsTree, taskData);

  // 날짜 입력 정규화
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

  function isValidDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const [year, month, day] = parts.map(Number);
    if (
      isNaN(year) || isNaN(month) || isNaN(day) ||
      year < 1900 || month < 1 || month > 12 || day < 1 || day > 31
    ) return false;
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  /**
   * [중요/공통] Task 트리에서 노드+하위노드까지 flatten 연결 객체 전부 반환
   * (객체 선택, 연결, WBS 색칠 등 모든 곳에서 flatten 기준)
   */
  function aggregateTaskFields(node) {
    // 1. 자기 객체 복사 (없으면 [])
    let objects = (node.data.linkedObjects || []).slice();
  
    // 2. 자식 flatten 합치기
    if (node.hasChildren()) {
      node.children.forEach(child => {
        const agg = aggregateTaskFields(child);
        objects = objects.concat(agg.objects);
      });
    }
  
    // 3. 중복 제거 (urn + dbId 기준)
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

  window.aggregateTaskFields = aggregateTaskFields;

  /**
   * [중요/공통] WBS 색칠: Task 전체 flatten 연결 객체 → WBS노드 매핑
   */
  // [WBS 연결 상태를 강조(색칠)하는 함수]
  function updateWBSHighlight() {
    // console.log("====[디버깅: 모든 최상위 task의 flatten 연결객체]====");
    // (window.taskTree.getRootNode().children || []).forEach(rootNode => {
    //   let agg = window.aggregateTaskFields(rootNode);
    //   console.log(`task ${rootNode.data.no}(${rootNode.data.title})`, agg.objects);
    // });
    
    // 1. 모두 초기화
    $("#wbs-group-list .inspire-tree-node").removeClass("connected");
  
    // 2. 연결 객체 flatten 수집 (모든 루트에서 집계!)
    let linked = {};
    (window.taskTree.getRootNode().children || []).forEach(rootNode => {
      let agg = window.aggregateTaskFields(rootNode); // flatten!
      (agg.objects || []).forEach(obj => {
        let key = String(obj.urn) + "::" + String(obj.dbId);
        linked[key] = true;
        //console.log(`[linked 등록] key: ${key} text: ${obj.text}`);
      });
    });
  
    // 3. leaf 강조
    getAllLeafNodes(window.wbsTree).forEach(function(node){
      let key = String(node.urn) + "::" + String(node.dbId);
      let idMatch = String(node.id) === key;
      //console.log(`[WBS leaf] id: ${node.id}, key: ${key}, id==key? ${idMatch}, text: ${node.text}`);
      if (linked[key]) {
        let $li = $(`#wbs-group-list a[data-uid='${node.id}']`).closest("li");
        $li.addClass("connected");
      }
    });
    
  
    // 4. 폴더(브랜치) 강조
    function traverse(node) {
      if (node.hasChildren && node.hasChildren()) {
        let leaves = getAllLeavesOfNode(node);
        let allConnected = leaves.length > 0 && leaves.every(
          leaf => linked[String(leaf.urn) + "::" + String(leaf.dbId)]
        );
        let $li = $(`#wbs-group-list li[data-uid='${node.id}']`);
        //console.log("[parent check]", node.id, "leaves:", leaves.map(l=>l.id), "allConnected:", allConnected, "$li length:", $li.length);
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
  
  window.updateWBSHighlight = updateWBSHighlight;
  
  // 트리 아래 모든 leaf(최하위) 노드 반환
  function getAllLeafNodes(tree) {
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
  
  // 특정 노드 아래 모든 leaf 반환 (브랜치 강조용)
  function getAllLeavesOfNode(node) {
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
}

function propagateDatesFromChildren(node) {
  if (!node.hasChildren()) return { start: node.data.start, end: node.data.end };
  let minStart = null, maxEnd = null;
  node.children.forEach(child => {
    const childDates = propagateDatesFromChildren(child);
    if (childDates.start && (!minStart || childDates.start < minStart)) minStart = childDates.start;
    if (childDates.end && (!maxEnd || childDates.end > maxEnd)) maxEnd = childDates.end;
  });
  // 부모의 날짜를 자식들 집계값으로 덮어씀 (직접 입력한 값보다 자식 집계 우선)
  node.data.start = minStart || node.data.start || "";
  node.data.end = maxEnd || node.data.end || "";
  node.render();
  return { start: node.data.start, end: node.data.end };
}