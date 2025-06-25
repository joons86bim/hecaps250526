// wwwroot/js/sidebar/panel2-buttons.js
//import { taskData  } from "./sidebar/panel2.js";

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
    } else {
      // 아무것도 선택 안했으면 루트(최상위)에 추가
      tree.getRootNode().addChildren(nodeData);
    }

  });

  // "삭제" 버튼
  $("#btn-delete").on("click", function(){
    let tree = $("#treegrid").fancytree("getTree");
    let sel = tree.getActiveNode();
    if(sel && !sel.isRoot()) {
      sel.remove();
    }
  });

  //데이터 연결 버튼
  $("#btn-link").on("click", function() {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedTaskNode = taskTree.getActiveNode();
    if (!selectedTaskNode) return alert("Task를 선택하세요!");
  
    // WBS 체크된 leaf 객체
    const checkedNodes = window.wbsTree.nodes().filter(node =>
      node.itree.state.checked && !node.hasChildren());
      const checkedObjects = checkedNodes.map(node => ({
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
        // 모두 연결 진행
      }
      if (result === "2") {
        // 2. 이미 연결된 객체는 제외하고 연결
        checkedObjects = checkedObjects.filter(obj =>
          !conflictObjects.find(o => o.modelId === obj.modelId && o.dbId === obj.dbId)
        );
        if (checkedObjects.length === 0) {
          taskTree.render(true, true);
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
    taskTree.render(true, true); // 전체 갱신
  });


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
