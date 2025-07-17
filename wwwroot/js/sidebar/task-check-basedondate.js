// wwwroot/js/sidebar/task-check-basedondate.js

/**
 * 날짜별 Task 객체 상태 갱신 함수 (APS Viewer 호환)
 * @param {string} dateStr - 기준일자 (yyyy-mm-dd)
 * @param {object} taskTree - fancytree 인스턴스 (window.taskTree)
 * @param {Autodesk.Viewing.GuiViewer3D} viewer - 전역 viewer 객체
 */
export function checkTaskStatusByDate(dateStr, taskTree, viewer) {
  if (!dateStr || !taskTree || !viewer) return;

  // 1. 색상/숨김 상태 초기화 (전체 리셋)
  viewer.clearThemingColors();
  if (viewer.impl.visibilityManager.setAllOn) {
    viewer.impl.visibilityManager.setAllOn(); // 전체 보이기
  }

  // 2. 최하위(leaf) 노드 순회
  taskTree.visit(function (node) {
    if (!node.hasChildren()) {
      const type = node.data.selectedOption || "";
      const start = node.data.start;
      const end = node.data.end;
      const objs = node.data.linkedObjects || [];

      // yyyy-mm-dd 문자열 비교 → OK (동일 포맷이면)
      const inputDate = dateStr;

      objs.forEach((o) => {
        const dbId = o.dbId;
        // 기본적으로 모두 보이게 (각 조건에서 hide 처리)
        if (type === "시공") {
          if (inputDate < start) {
            viewer.impl.visibilityManager.hide(dbId); // 숨김
          } else if (start <= inputDate && inputDate < end) {
            viewer.impl.visibilityManager.show(dbId);
            // 초록색 강조 (투명도 0.5)
            viewer.setThemingColor(dbId, new THREE.Vector4(0, 1, 0, 0.5));
          } else if (end && inputDate >= end) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, null); // 색상 제거
          }
        } else if (type === "철거") {
          if (inputDate < start) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, null); // 색상 없음
          } else if (start <= inputDate && inputDate < end) {
            viewer.impl.visibilityManager.show(dbId);
            // 빨간색 강조 (투명도 0.5)
            viewer.setThemingColor(dbId, new THREE.Vector4(1, 0, 0, 0.5));
          } else if (end && inputDate >= end) {
            viewer.impl.visibilityManager.hide(dbId); // 숨김
          }
        } else if (type === "가설") {
          // 향후 로직 구현
        }
      });
    }
  });

  viewer.impl.invalidate(true); // 화면 갱신
}
