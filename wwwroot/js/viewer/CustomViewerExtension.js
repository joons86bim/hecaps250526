// /wwwroot/js/viewer/CustomViewerExtension.js
import { enableBoxSelectionMode } from "./selection-tool.js";
import { openSelectViewer } from "./open-select-viewer.js";

export class MyCustomViewerExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._viewer = viewer;
    this._onToolbarCreated = null;
    this._customized = false; // 중복 실행 방지
  }

  load() {
    console.log("MyCustomViewerExtension이 로드되었습니다.");

    this._onToolbarCreated = () => {
      if (this._customized) return;
      const ok = this._customizeToolbar();
      if (this._viewer) {
        this._viewer.removeEventListener(
          Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
          this._onToolbarCreated
        );
      }
      this._customized = !!ok;
    };

    if (this._viewer.toolbar) {
      setTimeout(this._onToolbarCreated, 0);
    } else {
      this._viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        this._onToolbarCreated
      );
    }
    return true;
  }

  unload() {
    console.log("MyCustomViewerExtension이 언로드되었습니다.");
    if (this._onToolbarCreated) {
      this._viewer?.removeEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        this._onToolbarCreated
      );
      this._onToolbarCreated = null;
    }
    this._customized = false;
    return true;
  }

  _customizeToolbar() {
    console.log("툴바가 생성되었습니다. 사용자 정의를 시작합니다.");
    const toolbar = this._viewer && this._viewer.toolbar;
    if (!toolbar) {
      console.warn("[MyCustomViewerExtension] toolbar not ready");
      return false;
    }

    // ── 그룹 준비 (있으면 재사용, 없으면 생성)
    const hecToolsID = "hec-select-tool-group";
    let hecToolsGroup =
      safeGetGroup(toolbar, hecToolsID) ||
      new Autodesk.Viewing.UI.ControlGroup(hecToolsID);
    if (!safeGetGroup(toolbar, hecToolsID)) safeAddGroup(toolbar, hecToolsGroup);

    const hecSettingsID = "hec-setting-tool-group";
    let hecSettingsGroup =
      safeGetGroup(toolbar, hecSettingsID) ||
      new Autodesk.Viewing.UI.ControlGroup(hecSettingsID);
    if (!safeGetGroup(toolbar, hecSettingsID))
      safeAddGroup(toolbar, hecSettingsGroup);

    // ── 버튼 팩토리
    const mkBtn = (id, tooltip, iconClass, onClick) => {
      const b = new Autodesk.Viewing.UI.Button(id);
      b.setToolTip(tooltip);
      if (iconClass) b.setIcon(iconClass);
      b.onClick = onClick;
      return b;
    };

    // 🔧 측정 비활성 헬퍼 (unload 금지: 버튼이 사라짐)
    const deactivateMeasure = (v) => {
      try {
        if (v.isExtensionLoaded?.('Autodesk.Measure')) {
          const ext = v.getExtension('Autodesk.Measure');
          ext?.deactivate?.();
          ext?.clearMeasurements?.();
        }
      } catch(_) {}
    };

    // ── 버튼 생성
    const clickBtn = mkBtn("my-click-button", "단일 선택", "click-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      deactivateMeasure(v);
      v.toolController?.deactivateTool("BoxSelectionTool");
      v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
      v.container.style.cursor = "default";
    });

    const dragBtn = mkBtn("my-drag-button", "올가미 선택", "drag-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      deactivateMeasure(v);               // 이벤트 충돌 방지
      enableBoxSelectionMode(this._viewer);
    });

    const hideBtn = mkBtn("my-hide-button", "선택 숨기기", "hide-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      const sel = v.getSelection();
      if (!sel.length) return;
      v.hide(sel);
      setTimeout(() => {
        v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
        v.container.style.cursor = "default";
      }, 100);
    });

    const isolateBtn = mkBtn(
      "my-isolate-button",
      "선택 제외 숨기기",
      "isolate-button-class",
      () => {
        const v = this._viewer;
        if (!v) return;
        const sel = v.getSelection();
        if (!sel.length) return;
        v.isolate(sel);
        setTimeout(() => {
          v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
          v.container.style.cursor = "default";
        }, 100);
      }
    );

    const resetBtn = mkBtn("my-reset-button", "뷰 초기화", "reset-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      v.clearSelection();
      v.showAll();
      setTimeout(() => {
        v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
        v.container.style.cursor = "default";
      }, 100);
    });

    const viewBtn = mkBtn(
      "my-viewer-setting-button",
      "뷰 선택 모드",
      "adsk-icon-camera",
      () => {
        const urn = window.CURRENT_MODEL_URN;
        if (!urn) return alert("현재 선택된 모델의 URN이 없습니다.");
        openSelectViewer({
          urn,
          viewer: this._viewer,
          onModelLoaded: (viewer, model) => {
            console.log("새 뷰 로드 완료:", model);
          },
        });
      }
    );

    const taskBtn = mkBtn(
      "my-task-setting-button",
      "공정 옵션",
      "adsk-icon-mem-mgr",
      () => {
        // TODO: 옵션 모달 열기 등
      }
    );

    // ── 그룹에 버튼 붙이기 (중복 방지로 기존 버튼 제거 후 추가)
    clearControls(hecToolsGroup);
    hecToolsGroup.addControl(clickBtn);
    hecToolsGroup.addControl(dragBtn);
    hecToolsGroup.addControl(hideBtn);
    hecToolsGroup.addControl(isolateBtn);
    hecToolsGroup.addControl(resetBtn);

    clearControls(hecSettingsGroup);
    hecSettingsGroup.addControl(viewBtn);
    hecSettingsGroup.addControl(taskBtn);

    // ── 기본 그룹 참조
    const modelTools = safeGetGroup(toolbar, "modelTools");
    const settingsTools = safeGetGroup(toolbar, "settingsTools");

    // navTools는 제거 X, 숨기기만(레이스 방지하여 재시도)
    scheduleHideNavTools(toolbar);

    // ── 순서 재배치
    [hecToolsGroup, modelTools, settingsTools, hecSettingsGroup].forEach((g) =>
      safeRemoveGroup(toolbar, g)
    );
    [hecToolsGroup, hecSettingsGroup, modelTools, settingsTools]
      .filter(Boolean)
      .forEach((g) => safeAddGroup(toolbar, g));

    // ── 원치 않는 기본 버튼만 반복 제거
    scheduleRemoveDefaultButtons(toolbar, this._viewer);

    console.log("툴바 커스터마이징 완료.");
    return true;
  }
}

/* ────────────────────────── 안전 헬퍼 ────────────────────────── */
function safeGetGroup(toolbar, id) {
  if (!toolbar) return null;
  try { return toolbar.getControl(id) || null; } catch (_) { return null; }
}
function safeGetChild(group, childId) {
  if (!group) return null;
  try { return group.getControl(childId) || null; } catch (_) { return null; }
}
function safeRemoveChild(group, childId) {
  const c = safeGetChild(group, childId);
  if (group && c) { try { group.removeControl(c); } catch(_){} }
}
function safeRemoveGroup(toolbar, groupOrId) {
  if (!toolbar) return;
  const g = (typeof groupOrId === "string")
    ? safeGetGroup(toolbar, groupOrId)
    : groupOrId;
  if (g) { try { toolbar.removeControl(g); } catch(_){} }
}
function safeAddGroup(toolbar, group) {
  if (toolbar && group) { try { toolbar.addControl(group); } catch(_){} }
}
function clearControls(group) {
  if (!group || !group._controls) return;
  try {
    const ids = Object.keys(group._controls || {});
    ids.forEach((id) => safeRemoveChild(group, id));
  } catch (_) {
    try {
      while (group._controls && Object.keys(group._controls).length) {
        const k = Object.keys(group._controls)[0];
        safeRemoveChild(group, k);
      }
    } catch(_) {}
  }
}

/* navTools는 제거하지 말고 숨기기 */
function hideNavTools(toolbar) {
  const nav = safeGetGroup(toolbar, 'navTools');
  if (!nav) return false;
  try { nav.setVisible(false); } catch(_) {}
  // DOM 레벨에서도 한 번 더 강제
  try {
    const el = nav.container || document.getElementById('navTools');
    if (el) el.style.display = 'none';
  } catch(_) {}
  return true;
}
function scheduleHideNavTools(toolbar) {
  let tries = 0;
  const MAX = 20;
  const tick = () => {
    if (hideNavTools(toolbar) || tries++ >= MAX) return;
    setTimeout(tick, 100);
  };
  if (!hideNavTools(toolbar)) setTimeout(tick, 100);

  // 🔧 추가: 영구 옵저버(측정/다른 확장으로 DOM 바뀌어도 즉시 숨김)
  try {
    const root = toolbar.container || document.querySelector('.adsk-viewing-toolbar');
    if (root && !root.__navToolsObserver) {
      const obs = new MutationObserver(() => hideNavTools(toolbar));
      obs.observe(root, {childList:true, subtree:true, attributes:true, attributeFilter:['style','class','hidden']});
      root.__navToolsObserver = obs;
    }
  } catch(_) {}
}

/* ───────── 보수적 반복 제거: 필요 없는 3개만 ───────── */
const BUTTONS_TO_REMOVE = [
  { groupId: 'modelTools',    controlId: 'toolbar-explodeTool' },
  { groupId: 'settingsTools', controlId: 'toolbar-modelStructureTool' },
  { groupId: 'settingsTools', controlId: 'toolbar-fullscreenTool' },
];

function removeDefaultButtonsOnce(toolbar) {
  if (!toolbar) return false;
  let allGone = true;
  for (const { groupId, controlId } of BUTTONS_TO_REMOVE) {
    const g  = safeGetGroup(toolbar, groupId);
    if (safeGetChild(g, controlId)) {
      safeRemoveChild(g, controlId);
    }
    if (safeGetChild(g, controlId)) allGone = false;
  }
  return allGone;
}

function scheduleRemoveDefaultButtons(toolbar, viewer) {
  // 즉시 1회
  removeDefaultButtonsOnce(toolbar);

  // 지연 추가 대비: 10초간 폴링
  let tries = 0;
  const MAX = 100;  // 100 * 100ms = 10초
  const STEP = 100;
  const timer = setInterval(() => {
    const done = removeDefaultButtonsOnce(toolbar);
    if (done || ++tries >= MAX) clearInterval(timer);
  }, STEP);

  // 다른 확장이 로딩되며 다시 붙는 경우에도 제거
  if (viewer) {
    const onExtLoaded = () => removeDefaultButtonsOnce(toolbar);
    viewer.addEventListener(Autodesk.Viewing.EXTENSION_LOADED_EVENT, onExtLoaded);
    // 필요하면 unload에서 removeEventListener로 정리 가능
  }
}
