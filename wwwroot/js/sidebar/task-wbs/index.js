// 퍼사드: 외부에서 얘만 import 하면 됩니다.
export { initTaskPanel } from "./task-tree.js";
export { initWbsPanel } from "./wbs-tree.js";
export { initTaskListButtons, setSavedTaskData } from "./buttons.js";

// 전면 하이라이트/게이트 노출
export { updateWBSHighlight } from "./ui/wbs-highlight.js";
export { requestWbsHighlightGateOn, requestWbsHighlightGateOff } from "./wbs/highlight.js";

// 날짜/리드타임 유틸(필요 시 외부 사용)
export * as DateHelpers from "./core/date-helpers.js";

// ESC: 뷰어 상태 초기화 차단 + ESC로 Task/WBS 선택만 해제
export function disableViewerEscReset(viewer) {
  try {
    if (!viewer) return;
    // 툴컨트롤러 차단
    if (!viewer.__escToolInstalled && viewer.toolController) {
      const EscBlockerTool = {
        getNames() { return ['esc-blocker']; },
        getName()  { return 'esc-blocker'; },
        handleKeyDown(ev) {
          const k = ev?.key || ev?.code;
          if (k === 'Escape' || ev?.keyCode === 27) { ev?.stopPropagation?.(); ev?.preventDefault?.(); return true; }
          return false;
        },
        handleKeyUp(ev) {
          const k = ev?.key || ev?.code;
          if (k === 'Escape' || ev?.keyCode === 27) { ev?.stopPropagation?.(); ev?.preventDefault?.(); return true; }
          return false;
        },
      };
      viewer.toolController.registerTool(EscBlockerTool);
      viewer.toolController.activateTool('esc-blocker');
      viewer.__escToolInstalled = true;
    }

    // 캡처 레벨 방어: 입력필드 제외, 뷰어 영역에서만
    const container = viewer.container || document.querySelector('#forgeViewerMount, #viewer-host');
    const guard = (e) => {
      const t = e.target, tag = (t && t.tagName) || '';
      const isForm = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable;
      if (isForm) return;
      const inViewer = container && (container.contains(e.target) || container.contains(document.activeElement));
      if (!inViewer) return;
      if (e.key === 'Escape' || e.keyCode === 27) { e.stopImmediatePropagation(); e.preventDefault(); }
    };
    if (!viewer.__escCaptureBound) {
      window.addEventListener('keydown', guard, true);
      document.addEventListener('keydown', guard, true);
      container && container.addEventListener('keydown', guard, true);
      viewer.__escCaptureBound = true;
    }

    // ESC로 Task/WBS 선택만 해제 (뷰어 초기화는 금지)
    if (!window.__DISABLE_ESC_CLEAR) {
      document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (document.activeElement?.classList?.contains("datepicker-input")) return;
        if (window.taskTree) window.taskTree.visit(node => node.setActive(false));
        if (window.wbsTree?.selected) window.wbsTree.selected().forEach(n => n.deselect());
      });
    }
  } catch (e) { console.warn('[ESC block] failed:', e); }
}
