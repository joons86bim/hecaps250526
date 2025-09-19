// /wwwroot/js/sidebar/task-wbs/ui/wbs-fixed-paint.js
// 고정 색칠(coverage) 계산/캐시 (UI 확장과 무관하게 동작)

import { ensureElementIdIndexForDbIds } from "../core/element-id.js";

// ──────────────────────────────────────────────────────────────
// 내부 상태
// ──────────────────────────────────────────────────────────────
const PATH_STATE = new Map();     // key(path) -> "C" | "TD" | ""  (undefined = 미계산/미확정)
const PENDING = new Map();        // key -> Promise 진행 중

const SEP = "¦"; // 경로 구분자(일반 텍스트에 잘 안 쓰이는 문자)
const hostId = "wbs-group-list";

// 캐시: dbId -> elementId
window.__ELID_INDEX = window.__ELID_INDEX || new Map();

// ──────────────────────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────────────────────
function normUrn(urn){
  const s = String(urn || "");
  const i = s.indexOf("?");
  return i >= 0 ? s.slice(0, i) : s;
}
function keyOfPath(pathArr){
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");
  return `${CUR}//${(pathArr||[]).join(SEP)}`;
}
function parseUrnFromUid(uid) {
  const s = String(uid || "");
  const i = s.indexOf("::");
  return i > -1 ? s.slice(0, i) : null;
}
function applyPaintOnLi(li, state){
  // undefined: 유지, "": 지움, "C"/"TD"/"T"/"D": 세팅
  if (typeof state === "undefined") return;
  if (state) li.setAttribute("data-wbs-state", state);
  else li.removeAttribute("data-wbs-state");

  li.classList.remove("wbs-c","wbs-td","wbs-blue");
  if (state === "C")       li.classList.add("wbs-c");
  else if (state === "TD") li.classList.add("wbs-td");
  else if (state === "T" || state === "D") li.classList.add("wbs-blue");
}
function pathOfNode(node){
  if (Array.isArray(node.__path) && node.__path.length) return node.__path.slice();
  const out=[]; let cur=node;
  while (cur && cur.text && !cur.isRoot?.()){ out.unshift(cur.text); cur = cur.parent; }
  return out;
}

// ──────────────────────────────────────────────────────────────
// Task → 카테고리 맵 (즉석 생성 or 전역 캐시)
// ──────────────────────────────────────────────────────────────
function getCatMap(){
  if (window.__WBS_CATMAP instanceof Map) return window.__WBS_CATMAP;

  const map = new Map();
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");
  const taskTree = window.taskTree;
  if (!taskTree?.getRootNode) return map;

  const toCat = (v) =>
    v==="C"||v==="시공" ? "C" :
    v==="T"||v==="가설" ? "T" :
    v==="D"||v==="철거" ? "D" : "";

  taskTree.getRootNode().visit(n=>{
    const cat = toCat(n.data?.selectedOption);
    if (!cat) return;
    (n.data?.linkedObjects||[]).forEach(o=>{
      const urn = normUrn(o.urn || CUR);
      const db  = Number(o.dbId);
      if (!db) return;
      const up = (key) => {
        const cur = map.get(key) || { C:false, T:false, D:false };
        if (cat==="C") cur.C = true; else if (cat==="T") cur.T = true; else if (cat==="D") cur.D = true;
        map.set(key, cur);
      };
      up(`${urn}::${db}`);
      if (urn && CUR && urn !== CUR) up(`${CUR}::${db}`);
      up(String(db));
    });
  });
  window.__WBS_CATMAP = map;
  return map;
}

/** 카테고리 맵 조회: "C" | "T" | "D" | "TD" | "" */
function getStateFromCatMap(catMap, { urn, dbId, curUrn }){
  if (dbId == null) return "";
  const nUrn = normUrn(urn);
  const nCur = normUrn(curUrn);
  const keys = [];
  if (nUrn) keys.push(`${nUrn}::${dbId}`);
  if (urn && urn !== nUrn) keys.push(`${urn}::${dbId}`);
  if (nCur) keys.push(`${nCur}::${dbId}`);
  if (curUrn && curUrn !== nCur) keys.push(`${curUrn}::${dbId}`);
  keys.push(String(dbId));
  for (const k of keys){
    const f = catMap.get(k);
    if (!f) continue;
    const C = !!f.C, T = !!f.T, D = !!f.D;
    if (C && !T && !D) return "C";
    if (!C && T && !D) return "T";
    if (!C && !T && D) return "D";
    if (!C && T && D)  return "TD";
    if (C) return "C";
  }
  return "";
}

// ids -> "C" | "TD" | "" (혼합/미완성)
function reduceIdsState(ids){
  if (!ids?.length) return "";
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");
  const catMap = getCatMap();

  let bucket = null; // "C" | "B"(=T/D 묶음) | ""
  for (const id of ids){
    const st = getStateFromCatMap(catMap, { urn: CUR, dbId: id, curUrn: CUR });
    const b  = (st==="C" ? "C" : (st==="TD"||st==="T"||st==="D") ? "B" : "");
    if (!b){ bucket = ""; break; }
    if (bucket == null) bucket = b;
    else if (bucket !== b){ bucket = ""; break; }
  }
  if (bucket === "C") return "C";
  if (bucket === "B") return "TD";  // UI에선 파란색
  return "";
}

// ──────────────────────────────────────────────────────────────
async function computePathState(pathArr){
  const provider = window.__WBS_PROVIDER;
  if (!provider) return undefined;

  const key = keyOfPath(pathArr);
  if (PATH_STATE.has(key)) return PATH_STATE.get(key);
  if (PENDING.has(key)) return undefined;

  const p = (async ()=>{
    try{
      const total = provider.countAt(pathArr);
      if (!total){ PATH_STATE.set(key, ""); return ""; }

      const ids = await provider.getDbIdsForPath(pathArr, { includeDescendants:true, allowUnbuilt:true });
      if (ids == null){ // 아직 인덱스 미구축 → 지우지 말고 보류
        return undefined;
      }
      const st = reduceIdsState(ids);
      PATH_STATE.set(key, st);
      return st;
    } catch {
      return undefined;
    } finally {
      PENDING.delete(key);
    }
  })();

  PENDING.set(key, p);
  return p;
}

// ──────────────────────────────────────────────────────────────
function repaintVisibleDom(){
  const host = document.getElementById(hostId);
  const tree = window.wbsTree;
  if (!host || !tree) return;
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");

  // 1) 리프
  host.querySelectorAll("li[data-uid].leaf").forEach(li=>{
    try{
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      const dbId = (node && typeof node.dbId === "number") ? node.dbId : null;
      if (dbId == null) return;
      const urn = parseUrnFromUid(uid) || node?.urn || CUR;
      const st  = getStateFromCatMap(getCatMap(), { urn, dbId, curUrn: CUR });
      applyPaintOnLi(li, st);
    }catch{}
  });

  // 2) 그룹
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li=>{
    try{
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      if (!node) return;
      const path = pathOfNode(node);
      const key  = keyOfPath(path);
      const st   = PATH_STATE.get(key); // undefined면 유지
      applyPaintOnLi(li, st);
    }catch{}
  });

  // 보험: data-wbs-state ↔ class 동기화
  host.querySelectorAll('li[data-uid]').forEach(li=>{
    const st = li.getAttribute('data-wbs-state') || "";
    let need = "";
    if (st === 'C') need = 'wbs-c';
    else if (st === 'TD') need = 'wbs-td';
    else if (st === 'T' || st === 'D') need = 'wbs-blue';
    if (!need){ li.classList.remove('wbs-c','wbs-td','wbs-blue'); return; }
    if (!li.classList.contains(need)){
      li.classList.remove('wbs-c','wbs-td','wbs-blue');
      li.classList.add(need);
    }
  });
}

// ──────────────────────────────────────────────────────────────
// 외부 노출 API
// ──────────────────────────────────────────────────────────────

/** 현재 화면에 보이는 모든 그룹 경로의 커버리지 상태를 준비(비동기) */
export async function ensureCoverageReady(){
  const host = document.getElementById(hostId);
  const tree = window.wbsTree;
  if (!host || !tree) return;

  const tasks = [];
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li=>{
    try{
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      if (!node) return;
      const path = pathOfNode(node);
      tasks.push(computePathState(path));
    }catch{}
  });
  await Promise.allSettled(tasks);
}

/** 경로의 상태를 조회(미계산이면 undefined) */
export function getPathState(pathArr){
  const key = keyOfPath(pathArr||[]);
  return PATH_STATE.get(key);
}

// [교체] refreshFixedPaint: 캐시를 지우지 말고, 보이는 경로만 재계산 후 덮어쓰기
export async function refreshFixedPaint(opts = {}) {
  const { repaint = true } = opts;
  const host = document.getElementById(hostId);
  const tree = window.wbsTree;
  if (!host || !tree) return;

  const paths = [];
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li => {
    try {
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      if (!node) return;
      paths.push(pathOfNode(node));
    } catch {}
  });

  await Promise.allSettled(paths.map(p => computePathState(p)));
  if (repaint) repaintVisibleDom();
}


// [추가] 가벼운 디바운스 리페인트(노드 대량 추가 시 1회로 합침)
let __debounceTimer = 0;
export function requestDebouncedRepaint(delay=32){
  if (__debounceTimer) return;
  __debounceTimer = setTimeout(async ()=>{
    __debounceTimer = 0;
    try{
      await ensureCoverageReady();
      repaintVisibleDom();
    }catch{}
  }, delay);
}

/** 연결/해제 등 데이터 변경 후 호출 → 커버리지 갱신 + 즉시 칠 */
export async function notifyCoverageDirtyAndRepaint(){
  // 카테고리 맵 갱신
  window.__WBS_CATMAP = null;
  await refreshFixedPaint({ repaint:true });
}

/** 초기 1회: 화면 렌더 직후 커버리지 준비 + 일괄 페인트 */
export async function activateFixedPaint(){
  try{
    await ensureCoverageReady();
    repaintVisibleDom();
  } catch {}
}

// 모델 로딩 시 1회: Task에 연결된 객체의 elementId를 검증/보정하고 캐시에 미리 로딩
export async function verifyElementIdsOnce() {
  if (window.__ELID_VERIFY_DONE) return;   // 1회만 수행
  window.__ELID_VERIFY_DONE = true;

  const taskTree = window.taskTree;
  const urn = window.CURRENT_MODEL_URN;
  if (!taskTree?.getRootNode || !urn) return;

  // 1) 현재 모델(URN) 대상으로 Task에 연결된 dbId 수집
  const set = new Set();
  taskTree.getRootNode().visit(n => {
    (n.data?.linkedObjects || []).forEach(o => {
      const oUrn = String(o?.urn ?? urn);
      if (oUrn !== String(urn)) return;      // 다른 모델은 스킵
      const d = Number(o?.dbId);
      if (Number.isFinite(d)) set.add(d);
    });
  });

  const dbIds = Array.from(set);
  if (!dbIds.length) return;

  // 2) elementId 인덱스 프리페치(비동기는 여기서만 await)
  try { await ensureElementIdIndexForDbIds(dbIds); } catch {}

  // 3) Task 데이터에 저장된 elementId가 없거나 틀리면 "캐시"로만 보정
  const idx = window.__ELID_INDEX || new Map();

  taskTree.getRootNode().visit(n => {
    const arr = n.data?.linkedObjects || [];
    let changed = false;
    for (const o of arr) {
      const oUrn = String(o?.urn ?? urn);
      if (oUrn !== String(urn)) continue;
      const d = Number(o?.dbId);
      if (!Number.isFinite(d)) continue;

      const elid = idx.get?.(d);
      if (elid && o.elementId !== elid) {
        o.elementId = elid;
        changed = true;
      }
    }
    if (changed && n.render) n.render();
  });
}

/** 캐시에서 elementId 읽기(없으면 null) */
export function getElementIdFromCache(dbId) {
  const v = window.__ELID_INDEX.get(Number(dbId));
  return (v == null ? null : v);
}

// ===== 새로 추가: 방금 확장된 노드 기준으로 서브트리를 '즉시' 칠한다 =====
export function paintSubtreeNow(node) {
  try {
    const host = document.getElementById("wbs-group-list");
    const tree = window.wbsTree;
    if (!host || !tree || !node) return;

    const CUR = normUrn(window.CURRENT_MODEL_URN || "");
    const provider = window.__WBS_PROVIDER;
    if (!provider) return;

    const stack = [node];
    while (stack.length) {
      const n = stack.pop();
      const uid = n?._id ?? n?.id;
      const li  = uid ? host.querySelector(`li[data-uid="${uid}"]`) : null;

      // 1) 리프: dbId 기준 즉시 칠
      if (!n.hasChildren?.()) {
        const dbId = (typeof n.dbId === "number") ? n.dbId : null;
        if (dbId != null && li) {
          const st = getStateFromCatMap(getCatMap(), { urn: CUR, dbId, curUrn: CUR });
          applyPaintOnLi(li, st);
        }
        continue;
      }

      // 2) 그룹: 경로 기반 즉시 계산 → 캐시에 반영 → 칠
      const path = pathOfNode(n);
      const key  = keyOfPath(path);

      // 부모 groups 폴백으로 동기 ids 확보(미빌드 여도 OK)
      const ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
      if (ids && ids.length) {
        const st = reduceIdsState(ids);
        PATH_STATE.set(key, st);
        if (li) applyPaintOnLi(li, st);
      } else {
        // 아직 모르면 이전 상태 유지(덮어쓰지 않음)
        // 이후 ensureCoverageReady()/repaintVisibleDom()가 메꿔줌
      }

      // 자식 계속 진행
      (n.children || []).forEach(ch => stack.push(ch));
    }

    // 보험: data-wbs-state ↔ class 동기화
    repaintVisibleDom();
  } catch {}
}

