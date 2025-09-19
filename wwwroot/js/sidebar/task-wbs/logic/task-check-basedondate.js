// /wwwroot/js/sidebar/task-wbs/logic/task-check-basedondate.js

/**
 * 날짜별 Task 객체 상태 갱신 함수 (APS Viewer 호환)
 * @param {string} dateStr - 기준일자 (yyyy-mm-dd)
 * @param {object} taskTree - fancytree 인스턴스 (window.taskTree)
 * @param {Autodesk.Viewing.GuiViewer3D} viewer - 전역 viewer 객체
 */

function themeForAll(viewer, ids, hex) {
  if (!ids?.length || !window.THREE) return;
  const color = new window.THREE.Color(hex);
  const models = (viewer.getVisibleModels && viewer.getVisibleModels().length)
    ? viewer.getVisibleModels()
    : (viewer.model ? [viewer.model] : []);
  for (const m of models) {
    for (let i=0;i<ids.length;i++) {
      try { viewer.setThemingColor(ids[i], color, m); } catch(_) {}
    }
  }
}

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

      const inputDate = dateStr;

      objs.forEach((o) => {
        const dbId = o.dbId;
        if (type === "시공") {
          if (inputDate < start) {
            viewer.impl.visibilityManager.hide(dbId);
          } else if (start <= inputDate && inputDate < end) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, new THREE.Vector4(0, 1, 0, 0.5));
          } else if (end && inputDate >= end) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, null);
          }
        } else if (type === "철거") {
          if (inputDate < start) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, null);
          } else if (start <= inputDate && inputDate < end) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, new THREE.Vector4(1, 0, 0, 0.5));
          } else if (end && inputDate >= end) {
            viewer.impl.visibilityManager.hide(dbId);
          }
        } else if (type === "가설") {
          // 향후 로직 구현
        }
      });
    }
  });

  viewer.impl.invalidate(true);
}
