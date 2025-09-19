// viewer-esc.js
// APS Viewer에서 ESC로 도구/선택 상태만 처리하고 "객체 상태 초기화"는 막는다.

// ESC로 Task/WBS만 해제할지 제어하는 전역 플래그(기본 false)
window.__DISABLE_ESC_CLEAR = window.__DISABLE_ESC_CLEAR ?? false;

export function disableViewerEscReset(viewer) {
  try {
    if (!viewer || !viewer.toolController) return;

    // 1) Autodesk Viewer tool로 ESC 기본 리셋 차단
    if (!viewer.__escToolInstalled) {
      const EscBlockerTool = {
        getName() { return 'esc-blocker'; },
        getNames() { return ['esc-blocker']; },
        activate() { return true; },
        deactivate() { return true; },
        handleKeyDown(ev){ if ((ev?.key === 'Escape') || ev?.keyCode === 27){ ev.stopPropagation?.(); ev.preventDefault?.(); return true; } return false; },
        handleKeyUp(ev){ if ((ev?.key === 'Escape') || ev?.keyCode === 27){ ev.stopPropagation?.(); ev.preventDefault?.(); return true; } return false; },
      };
      const tc = viewer.toolController;
      tc.registerTool(EscBlockerTool);
      tc.activateTool('esc-blocker');
      viewer.__escToolInstalled = true;
    }

    // 2) 캡처 레벨 가드 (입력폼 제외, 뷰어 영역에서만)
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

    // 3) (옵션) ESC 시 뷰어 리셋 대신 Task/WBS 선택만 해제
    if (!window.__escClearBound) {
      window.__escClearBound = true;
      const isFormTarget = (t) => {
        const tag = (t && t.tagName) || '';
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable;
      };
      document.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.keyCode === 27) && !isFormTarget(e.target)) {
          try { window.taskTree?.visit?.(n => n.setActive(false)); } catch {}
          try { window.wbsTree?.selected?.()?.forEach(n => n.deselect()); } catch {}
        }
      }, true);
    }
  } catch (e) {
    console.warn('[ESC block] install failed:', e);
  }
}
