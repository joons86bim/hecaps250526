// /wwwroot/js/sidebar/index.js
// 퍼사드: 외부에서는 이 파일만 import 하세요.

// Task / WBS 패널
export { initTaskPanel } from "./task-wbs/task-tree.js";
export { initTaskListButtons, setSavedTaskData } from "./task-wbs/task-buttons.js";

// ✅ 새 WBS(Fancytree + 매트릭스)
export { initWbsPanelWithFancytree } from "./task-wbs/wbs-panel-init.js";

// (구 하이라이트 모듈 호출 제거: Fancytree 전환 중에는 불필요)

// ── 하이라이트 게이트(트래픽 조절) ──

// 날짜/리드타임 유틸(필요 시 외부 사용)
export * as DateHelpers from "./task-wbs/core/date-helpers.js";

// ESC: 뷰어 상태 초기화 차단 + ESC로 Task/WBS 선택만 해제
export { disableViewerEscReset } from "./task-wbs/helpers/viewer-esc.js";

// (선택) WBS 로더(지연 프로바이더)도 퍼사드로 노출
// ※ 당신의 실제 파일 위치에 맞춰 경로 유지하세요.
export { buildWbsProviderLazy } from "./task-wbs/wbs/loader.js";

// Box Selection (있으면 유지)
export { BoxSelectionTool, enableBoxSelectionMode } from "/js/viewer/selection-tool.js";
