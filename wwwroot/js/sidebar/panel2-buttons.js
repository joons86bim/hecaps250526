import { updateWBSHighlight } from './panel2-ui-helpers.js';

// 불러온 데이터를 저장해둘 변수 (전역)
window.savedTaskData = null;

/**
 * Task 트리 우측 버튼들 (추가/삭제/객체선택/연결/저장) 이벤트 바인딩
 * flatten/연결/강조 등 모든 처리 window.aggregateTaskFields 기준!
 */
export function initTaskListButtons() {
  // [추가] 버튼: 트리 노드 추가
  $("#btn-add").off("click").on("click", function () {
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
      parentNode.addChildren(nodeData);
      parentNode.setExpanded(true);
      parentNode.data.start = "";
      parentNode.data.end = "";
      parentNode.data.linkedObjects = [];
      parentNode.render();
    } else {
      tree.getRootNode().addChildren(nodeData);
    }
    tree.getRootNode().children.forEach(propagateDatesAndObjects);
    tree.render(true, true);
    setTimeout(updateWBSHighlight, 0);
  });

  // [삭제] 버튼: 현재 선택 노드 삭제
  $("#btn-delete").off("click").on("click", function(){
    let tree = $.ui.fancytree.getTree("#treegrid");
    let sel = tree.getActiveNode();
    if(sel && !sel.isRoot()) {
      let parentNode = sel.parent;
      sel.remove();
      // 무조건 전체 트리 집계
      tree.getRootNode().children.forEach(propagateDatesAndObjects);
    }
    tree.render(true, true);
    setTimeout(updateWBSHighlight, 0);
    
  });

  // [객체선택] 버튼: 트리에서 flatten 연결객체 → 3D viewer 선택
  $("#btn-select").off("click").on("click", function() {
    let taskTree = $.ui.fancytree.getTree("#treegrid");
    let selected = taskTree.getActiveNode();
    if (!selected) return alert("Task를 선택하세요!");
    let objects = window.aggregateTaskFields(selected).objects;
    if (!objects || objects.length === 0) return alert("이 Task(및 하위 Task)에 연결된 객체가 없습니다.");
    
    // urn별로 dbId 묶음 (Viewer 구조에 따라 아래 로직 커스텀)
    let byUrn = {};
    objects.forEach(obj => {
      if (!byUrn[obj.urn]) byUrn[obj.urn] = [];
      byUrn[obj.urn].push(obj.dbId);
    });

    // (예시) 현재 모델만 지원: window.CURRENT_MODEL_URN 사용
    Object.entries(byUrn).forEach(([urn, dbIds]) => {
      // 여러 모델 지원하려면 urn→model 매핑 필요
      if (urn === window.CURRENT_MODEL_URN && window.viewer) {
        window.viewer.select(dbIds);
      }
    });
  });
  
  // [업데이트] 버튼: Task 데이터 서버에 저장
  $("#btn-update").off("click").on("click", async function () {
    const safeUrnVal = window.CURRENT_MODEL_SAFE_URN;
    const url = `/api/tasks?urn=${safeUrnVal}`;
    const currentTaskData = getCurrentTaskDataFromTree();
    const current = JSON.stringify(currentTaskData ?? []);
    const saved = JSON.stringify(window.savedTaskData ?? []);
    // 최초 저장 조건
    if (!window.savedTaskData || (Array.isArray(window.savedTaskData) && window.savedTaskData.length === 0 && currentTaskData.length > 0)) {
    } else if (current === saved) {
      alert("수정된 데이터가 없습니다.");
      return;
    }

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentTaskData),
      });
      if (resp.ok) {
        alert("Task 데이터가 저장되었습니다!");
        window.savedTaskData = JSON.parse(JSON.stringify(currentTaskData));
      } else {
        alert("Task 데이터 저장 실패!");
      }
    } catch (err) {
      alert("저장 중 오류 발생: " + err.message);
    }
  });
  

  // [데이터연결] 버튼: WBS 선택노드를 Task 노드에 연결(중복체크 등)
  $("#btn-link").off("click").on("click", function() {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedTaskNode = taskTree.getActiveNode();
    if (!selectedTaskNode) return alert("Task를 선택하세요!");
    
    // 현재 모델의 URN (반드시 사용)
    const urn = window.CURRENT_MODEL_URN;

    // WBS 체크된 leaf 객체
    let checkedNodes = window.wbsTree.checked();
    let checkedObjects = checkedNodes.filter(node => !node.hasChildren()).map(node => ({
      urn: node.urn ?? urn,
      dbId: node.dbId,
      text: node.text
    }));
    if (checkedObjects.length === 0) return alert("WBS에서 객체를 선택하세요!");
  
    // 중복 검사: 이미 연결된 객체
    let conflictObjects = [];
    let linkedTaskMap = {}; 
    taskTree.visit(function(node){
      if (node.data.linkedObjects) {
        node.data.linkedObjects.forEach(obj => {
          linkedTaskMap[`${urn}:${obj.dbId}`] = node;
        });
      }
    });
    checkedObjects.forEach(obj => {
      const key = `${urn}:${obj.dbId}`;
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
        conflictObjects.forEach(obj => {
          const tNode = obj.linkedTask;
          tNode.data.linkedObjects = (tNode.data.linkedObjects || []).filter(
            o => !(o.urn === obj.urn && o.dbId === obj.dbId)
          );
        });
      }
      if (result === "2") {
        checkedObjects = checkedObjects.filter(obj =>
          !conflictObjects.find(o => o.urn === obj.urn && o.dbId === obj.dbId)
        );
        if (checkedObjects.length === 0) {
          taskTree.render(true, true);
          setTimeout(updateWBSHighlight, 0);
          return;
        }
      }
    }
  
    // 연결 처리: 중복 없이 flatten
    selectedTaskNode.data.linkedObjects = _.uniqBy(
      (selectedTaskNode.data.linkedObjects || []).concat(checkedObjects),
      obj => obj.urn + ":" + obj.dbId
    );
    taskTree.render(true, true);
    setTimeout(updateWBSHighlight, 0);
  });

  // [연결 해제] 버튼
$("#btn-unlink").off("click").on("click", function () {
  const taskTree = $.ui.fancytree.getTree("#treegrid");
  const selectedNode = taskTree.getActiveNode();
  if (!selectedNode) {
    alert("연결을 해제할 Task를 선택하세요!");
    return;
  }

  // 재귀적으로 하위까지 모두 연결 객체 해제
  function unlinkAll(node) {
    node.data.linkedObjects = [];
    if (node.hasChildren()) {
      node.children.forEach(unlinkAll);
    }
  }
  unlinkAll(selectedNode);

  // 트리 전체 집계(부모까지 최신화)
  // (최상위 루트 하위 전체 재집계)
  taskTree.getRootNode().children.forEach(child => {
    propagateDatesAndObjects(child);
  });

  taskTree.render(true, true);
  setTimeout(updateWBSHighlight, 0);
});


}

// 자동 No 생성
function generateNo(parentNode) {
  if (!parentNode || parentNode.isRoot()) {
    const roots = $.ui.fancytree.getTree("#treegrid").getRootNode().children || [];
    return String(roots.length + 1);
  } else {
    const siblings = parentNode.children || [];
    const baseNo = parentNode.data.no || parentNode.title;
    return baseNo + "." + (siblings.length + 1);
  }
}

// 서버 데이터 등 상태 갱신용
export function setSavedTaskData(data) {
  window.savedTaskData = JSON.parse(JSON.stringify(data ?? []));
}

// [flatten 변환] 트리 → 저장용 JSON 변환 (title/children 등 누락X)
function getCurrentTaskDataFromTree() {
  const tree = $.ui.fancytree.getTree("#treegrid");

  function nodeToData(node) {
    const obj = {
      no: node.data.no,
      title: node.data.title ?? node.title,
      start: node.data.start,
      end: node.data.end,
      // [수정] linkedObjects 내 각 객체에 urn, dbId, text 필드가 모두 있는지 확인
      linkedObjects: (node.data.linkedObjects || []).map(o => ({
        urn: o.urn ?? urn,          // 반드시 포함
        dbId: o.dbId,        // 반드시 포함
        text: o.text ?? "",  // 선택적으로 표시용
      })),
    };
    if (node.hasChildren()) {
      obj.children = node.children.map(nodeToData);
    }
    return obj;
  }

  return tree.getRootNode().children.map(nodeToData);
}

// 날짜, 객체 재집계 함수
function propagateDatesAndObjects(node) {
  if (node.hasChildren()) {
    let minStart = null;
    let maxEnd = null;
    let allObjects = [];
    node.children.forEach(child => {
      propagateDatesAndObjects(child);
      if (child.data.start && (!minStart || child.data.start < minStart)) minStart = child.data.start;
      if (child.data.end && (!maxEnd || child.data.end > maxEnd)) maxEnd = child.data.end;
      if (child.data.linkedObjects && child.data.linkedObjects.length) {
        allObjects = allObjects.concat(child.data.linkedObjects);
      }
    });

    // === 디버깅: 중복 집계 전 ===
    console.log("[디버깅] 집계 전 - 상세", {
      node: node.data.title ?? node.data.no,
      allObjects: allObjects.map(o => `${o.urn}::${o.dbId}`)
    });

    // Set을 활용한 중복 제거
    const seen = new Set();
    const uniqueObjects = allObjects.filter(obj => {
      const key = obj.urn + "::" + obj.dbId;
      if (seen.has(key)) {
        console.log("[중복제거] skip", key, obj);
        return false;
      }
      seen.add(key);
      return true;
    });
    // === 디버깅: 중복 제거 후 ===
    console.log("[디버깅] 집계 후", {
      node: node.data.title ?? node.data.no,
      uniqueObjects: uniqueObjects.map(o => `${o.urn}::${o.dbId}`),
      uniqueObjectsLength: uniqueObjects.length
    });

    node.data.start = minStart || "";
    node.data.end = maxEnd || "";
    node.data.linkedObjects = uniqueObjects;
    node.render && node.render();

    return {
      start: node.data.start,
      end: node.data.end,
      linkedObjects: uniqueObjects
    };
  } else {
    return {
      start: node.data.start,
      end: node.data.end,
      linkedObjects: (node.data.linkedObjects || [])
    };
  }
}
