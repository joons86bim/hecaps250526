// wwwroot/js/sidebar/panel2-buttons.js
//import { taskData  } from "./sidebar/panel2.js";
//import { aggregateTaskFields } from "./panel2-helpers.js";

export function initTaskListButtons() {
  // "추가" 버튼
  $("#btn-add").on("click", function () {
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();

    let parentNode = sel || null;
    let no = generateNo(parentNode);
    let nodeData = {
      no: no,
      title: "새 작업",
      start: "",
      end: ""
    };

    if (parentNode) {
      // 선택된 항목 아래에 자식으로 추가
      parentNode.addChildren(nodeData);
      parentNode.setExpanded(true); // 부모 노드 펼치기(자식 보이게)
      // ===== 부모 노드에 연결된 객체가 있다면 연결 해제 =====
      if (parentNode.data.linkedObjects && parentNode.data.linkedObjects.length > 0) {
        parentNode.data.linkedObjects = [];
        parentNode.render();
      }
    } else {
      // 아무것도 선택 안했으면 루트(최상위)에 추가
      tree.getRootNode().addChildren(nodeData);
    }
    //updateAllAggregates(tree);
    tree.render(true, true);
    updateWBSHighlight();
  });

  // "삭제" 버튼
  $("#btn-delete").on("click", function(){
    let tree = $.ui.fancytree.getTree("#treegrid");
    let sel = tree.getActiveNode();
    if(sel && !sel.isRoot()) {
      sel.remove();
    }
    //updateAllAggregates(tree);
    tree.render(true, true);
    updateWBSHighlight();
  });

  // "객체 선택" 버튼
  $("#btn-select").on("click", function() {
    let taskTree = $.ui.fancytree.getTree("#treegrid");
    let selected = taskTree.getActiveNode();
    
    //window.viewer.clearSelection(); // 버튼 실행 전 선택중인 객체 해제
    
    if (!selected) return alert("Task를 선택하세요!");
    
    // 1. 해당 Task 및 모든 자식 Task들의 연결 객체 집계
    let objects = window.aggregateTaskFields(selected).objects;
    if (!objects || objects.length === 0) return alert("이 Task(및 하위 Task)에 연결된 객체가 없습니다.");
  
    // 2. modelId별로 dbId 집계
    let byModel = {};
    objects.forEach(obj => {
      if (!byModel[obj.modelId]) byModel[obj.modelId] = [];
      byModel[obj.modelId].push(obj.dbId);
    });
  
    // 3. 선택 (멀티모델 지원)
    Object.entries(byModel).forEach(([modelId, dbIds]) => {
      let model = getViewerModelById(modelId);
      if (model) {
        window.viewer.select(dbIds, model);
        // window.viewer.fitToView(dbIds, model); // 필요시 화면 줌
      }
    });
  });
  
  // 모델ID로 모델 인스턴스 찾는 함수 예시
  function getViewerModelById(modelId) {
    if (window.NOP_VIEWER_LIST) {
      // 멀티모델 환경이라면
      return window.NOP_VIEWER_LIST.find(m => m.id == modelId)?.model;
    }
    // 싱글모델 환경
    return window.viewer.model;
  }

  //데이터 연결 버튼
  $("#btn-link").on("click", function() {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedTaskNode = taskTree.getActiveNode();
    if (!selectedTaskNode) return alert("Task를 선택하세요!");
  
    // WBS 체크된 leaf 객체
    // "객체 연결" 버튼 이벤트 핸들러 내
      let checkedNodes = window.wbsTree.checked();
      // leaf만
      let checkedObjects = checkedNodes.filter(node => !node.hasChildren()).map(node => ({
        modelId: node.modelId,
        dbId: node.dbId,
        text: node.text
      }));
  
    if (checkedObjects.length === 0) return alert("WBS에서 객체를 선택하세요!");
  
    // === [Step 3] 중복 검사 ===
    // 모든 task에서 이미 연결된 객체 목록을 찾기
    let conflictObjects = [];
    let linkedTaskMap = {}; // { "modelId:dbId": 해당 task node }
  
    taskTree.visit(function(node){
      if (node.data.linkedObjects) {
        node.data.linkedObjects.forEach(obj => {
          linkedTaskMap[`${obj.modelId}:${obj.dbId}`] = node;
        });
      }
    });
  
    checkedObjects.forEach(obj => {
      const key = `${obj.modelId}:${obj.dbId}`;
      if (linkedTaskMap[key] && linkedTaskMap[key] !== selectedTaskNode) {
        conflictObjects.push({ ...obj, linkedTask: linkedTaskMap[key] });
      }
    });
  
    if (conflictObjects.length > 0) {
      const msg = [
        "이미 다른 Task에 연결된 객체가 있습니다.",
        conflictObjects.map(o =>
          `${o.text} (Task: ${o.linkedTask.data.no} - ${o.linkedTask.data.title})`
        ).join("\n"),
        "",
        "어떻게 처리할까요?",
        "1. 기존 연결을 끊고 이 Task에 연결",
        "2. 이미 연결된 객체는 제외하고 연결",
        "3. 취소"
      ].join("\n");
      const result = prompt(msg + "\n\n원하는 번호를 입력하세요 (1/2/3)", "1");
      if (result === "3" || !["1","2"].includes(result)) return;
  
      if (result === "1") {
        // 1. 기존 연결을 끊고 새로 연결
        conflictObjects.forEach(obj => {
          // 기존 연결된 task에서 해당 객체 삭제
          const tNode = obj.linkedTask;
          tNode.data.linkedObjects = (tNode.data.linkedObjects || []).filter(
            o => !(o.modelId === obj.modelId && o.dbId === obj.dbId)
          );
          
        });
        // "연결" 처리는 아래에서 항상 수행
        
      }
      if (result === "2") {
        // 2. 이미 연결된 객체는 제외하고 연결
        checkedObjects = checkedObjects.filter(obj =>
          !conflictObjects.find(o => o.modelId === obj.modelId && o.dbId === obj.dbId)
        );
        if (checkedObjects.length === 0) {
          taskTree.render(true, true);
          //updateAllAggregates(tree);
          //tree.render(true, true);
          updateWBSHighlight();
          return;
        }
      }
    }
  
    // === [Step 4] 연결 처리 ===
    // 중복 없이 추가 (uniqBy는 lodash/underscore, 아니면 직접 코드로)
    selectedTaskNode.data.linkedObjects = _.uniqBy(
      (selectedTaskNode.data.linkedObjects || []).concat(checkedObjects),
      obj => obj.modelId + ":" + obj.dbId
    );
    taskTree.render(true, true);
    //updateAllAggregates(tree); // 전체 갱신
    //tree.render(true, true);
    updateWBSHighlight();
  });

  window.updateWBSHighlight = updateWBSHighlight;


}

function generateNo(parentNode) {
  if (!parentNode || parentNode.isRoot()) {
    // 루트 레벨
    const roots = $.ui.fancytree.getTree("#treegrid").getRootNode().children || [];
    return String(roots.length + 1);
  } else {
    // 자식 레벨
    const siblings = parentNode.children || [];
    const baseNo = parentNode.data.no || parentNode.title;
    return baseNo + "." + (siblings.length + 1);
  }
}

// 특정 노드 아래 모든 leaf(최하위) 노드 재귀적으로 반환
function getAllLeavesOfNode(node) {
  let leaves = [];
  if (node.hasChildren && node.hasChildren()) {
    // children이 TreeNodes 타입일 때 forEach
    node.children.forEach(child => {
      leaves = leaves.concat(getAllLeavesOfNode(child));
    });
  } else {
    leaves.push(node);
  }
  return leaves;
}
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

// function isAllLeafChildrenConnected(node, linked) {
//   if (!node.hasChildren()) return false;
//   let leafChildren = node.children.filter(child => !child.hasChildren());
//   let branchChildren = node.children.filter(child => child.hasChildren());

//   leafChildren.forEach(leaf => {
//     let key = leaf.modelId + ":" + leaf.dbId;
//     console.log("[leaf 연결 검사]", leaf.text, "key:", key, "linked:", linked[key]);
//   });

//   let allLeafConnected = leafChildren.length === 0 || leafChildren.every(leaf => {
//     let key = leaf.modelId + ":" + leaf.dbId;
//     return linked[key];
//   });
//   let allBranchConnected = branchChildren.length === 0 || branchChildren.every(child => isAllLeafChildrenConnected(child, linked));
//   // 디버그 로그
//   console.log("[부모 검사]", node.text, "| leaf:", leafChildren.map(l=>l.text), "| allLeafConnected:", allLeafConnected, "| allBranchConnected:", allBranchConnected);
//   return allLeafConnected && allBranchConnected;
// }




// ========== WBS 트리 이벤트 바인딩 ==========
function updateWBSHighlight() {
  console.log("WBS highlight 업데이트 시작");
  $("#wbs-group-list .inspire-tree-node").removeClass("connected");

  // 연결된 객체 목록 만들기 + 로그
  let linked = {};
  window.taskTree.visit(function(node){
    if (node.data.linkedObjects && node.data.linkedObjects.length) {
      node.data.linkedObjects.forEach(obj => {
        linked[obj.modelId + ":" + obj.dbId] = true;
      });
    }
  });

  // 모든 leaf 강조
  getAllLeafNodes(window.wbsTree).forEach(function(node){
    let key = node.modelId + ":" + node.dbId;
    if (linked[key]) {
      let $li = $(`#wbs-group-list a[data-uid='${node.id}']`).closest("li");
      $li.addClass("connected");
    }
  });

  // 모든 노드(leaf, branch, root 모두 포함) 강조
  window.wbsTree.nodes().forEach(function traverse(node) {
    // 모든 node에 대해서
    if (node.hasChildren && node.hasChildren()) {
      let leaves = getAllLeavesOfNode(node);
      let allConnected = leaves.length > 0 && leaves.every(leaf => linked[leaf.modelId + ":" + leaf.dbId]);
      // 로그 추가
      //console.log("[부모 검사]", node.text, "| leaf:", leaves.map(l => l.text), "| allLeafConnected:", allConnected);
      if (allConnected) {
        let $li = $(`#wbs-group-list li[data-uid='${node.id}']`);
        $li.addClass("connected");
      }
      // 하위 폴더들도 재귀 검사
      node.children.forEach(child => traverse(child));
    }
  });
}