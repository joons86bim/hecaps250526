// /wwwroot/js/viewer/toolbar.js
import { enableBoxSelectionMode } from "./selection-tool.js";

/**
 * 뷰어 툴바 초기화
 * @param {Autodesk.Viewing.GuiViewer3D} viewer
 * @param {string} toolbarSelector
 */
export function initToolbar(viewer, toolbarSelector = "#viewer-toolbar") {
  const toolbar = document.querySelector(toolbarSelector);
  const buttons = toolbar.querySelectorAll(".tool-button");

  // 클릭 모드로 돌아가는 함수
  function activateClick() {
    buttons.forEach((b) => b.classList.remove("active"));
    const clickBtn = toolbar.querySelector('[data-tool="click"]');
    clickBtn.classList.add("active");
    viewer.toolController.deactivateTool("BoxSelectionTool");
    viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
    viewer.container.style.cursor = "default";
  }

  buttons.forEach((btn) => {
    const tool = btn.dataset.tool;
    btn.addEventListener("click", () => {
      // 모든 버튼 비활성 후 현재 버튼 활성
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      switch (tool) {
        case "click":
          activateClick();
          break;

        case "drag":
          enableBoxSelectionMode(viewer);
          break;

        case "hide-selected":
        case "isolate-selected": {
          const sel = viewer.getSelection();
          if (!sel.length) {
            activateClick();
            return;
          }
          if (tool === "hide-selected") viewer.hide(sel);
          else viewer.isolate(sel);
          // 잠시 후 클릭 모드로 복귀
          setTimeout(activateClick, 100);
          break;
        }

        case "reset": {
          const sel = viewer.getSelection();
          if (!sel.length) {
            activateClick();
            return;
          }
          viewer.clearSelection();
          viewer.showAll();
          setTimeout(activateClick, 100);
          break;
        }
      }
    });
  });

  // Shift 키 누르고 있으면 혼합 선택 모드 유지
  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
      viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
    }
  });
}
