// wwwroot/js/sidebar/panel2-ui-helpers.js

// panel2에서 공통으로 쓰는 ESC, dnd 동기화 기능을 이 파일에 분리

export function setupPanel2Helpers(taskTree, wbsTree, taskData) {
  // ESC키로 선택 모두 해제
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