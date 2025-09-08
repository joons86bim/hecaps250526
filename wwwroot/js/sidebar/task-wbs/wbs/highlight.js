// 하이라이트 게이트 + 스로틀
import { updateWBSHighlight as _update } from "../ui/wbs-highlight.js";

window.__ALLOW_WBS_UPDATE = window.__ALLOW_WBS_UPDATE ?? false;

export function requestWbsHighlightGateOn()  { window.__ALLOW_WBS_UPDATE = true; }
export function requestWbsHighlightGateOff() { window.__ALLOW_WBS_UPDATE = false; }

const throttled = (typeof _ !== "undefined" && _.throttle)
  ? _.throttle(() => { if (window.__ALLOW_WBS_UPDATE) _update(); }, 120)
  : () => { if (window.__ALLOW_WBS_UPDATE) _update(); };

export function requestWbsHighlight(){ throttled(); }
export const updateWBSHighlight = _update; // 퍼사드 호환
