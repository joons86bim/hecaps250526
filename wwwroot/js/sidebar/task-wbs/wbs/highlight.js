// /wwwroot/js/sidebar/task-wbs/wbs/highlight.js
import { updateWBSHighlight } from "../ui/wbs-highlight.js";

console.info("[hec] wbs/highlight.js loaded");

window.__ALLOW_WBS_UPDATE = window.__ALLOW_WBS_UPDATE ?? false;

export function requestWbsHighlightGateOn()  { window.__ALLOW_WBS_UPDATE = true; }
export function requestWbsHighlightGateOff() { window.__ALLOW_WBS_UPDATE = false; }

const _req = () => { if (window.__ALLOW_WBS_UPDATE) updateWBSHighlight(); };
const _throttled = (typeof _ !== "undefined" && _.throttle) ? _.throttle(_req, 120) : _req;

export function requestWbsHighlight() { _throttled(); }
// 대량 처리 후 마지막에 1번 강제 반영
export function requestWbsHighlightNow() { if (window.__ALLOW_WBS_UPDATE) updateWBSHighlight(); }
