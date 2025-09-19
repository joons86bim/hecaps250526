// /wwwroot/js/sidebar/task-wbs/ui/wbs-highlight.js
import { normalizeTaskCategory } from "../core/categories.js";
import { ensureCoverageReady, getPathState } from "./wbs-fixed-paint.js";

// ★ Fixed Paint 모드에서는 이 파일의 모든 동작을 우회(no-op)한다.
function fixedModeOn(){ return window.__WBS_FIXED_MODE === true; }

/* ──────────────────────────────────────────────────────────
   페인트 스케줄/잠금
────────────────────────────────────────────────────────── */
let __repaintRAF = 0;
window.__WBS_PAINT_LOCK = window.__WBS_PAINT_LOCK ?? false;
const paintLocked = () => window.__WBS_PAINT_LOCK === true;

export function scheduleWbsRepaint() {
  if (fixedModeOn() || paintLocked() || __repaintRAF) return;
  __repaintRAF = requestAnimationFrame(() => {
    __repaintRAF = 0;
    try { updateWBSHighlight(); } catch {}
  });
}

export function repaintWbsSync() {
  if (fixedModeOn()) return;
  const tree = window.wbsTree;
  if (!tree?.nodes) return;
  const catMap = buildCatMapFromTasks();
  window.__WBS_CATMAP = catMap;
  for (const r of tree.nodes()) applyHighlightForSubtreeUI(r, catMap);
  domSweepRepaint(catMap);
}

/* ──────────────────────────────────────────────────────────
   유틸
────────────────────────────────────────────────────────── */
function liOf(node) {
  const host = document.getElementById("wbs-group-list");
  if (!host || !node) return null;
  const uid = node._id ?? node.id;
  if (!uid) return null;
  const any = host.querySelector(`[data-uid="${String(uid)}"]`);
  return any?.closest("li[data-uid]") || null;
}
function parseUrnFromUid(uid) {
  const s = String(uid || "");
  const i = s.indexOf("::");
  return i > -1 ? s.slice(0, i) : null;
}
function normalizeUrn(urn) {
  const s = String(urn || "");
  const i = s.indexOf("?");
  return i >= 0 ? s.slice(0, i) : s;
}
const bucketOf = (s) => s === "C" ? "C" : s === "TD" ? "TD" : (s === "T" || s === "D") ? "B" : "";

/** catMap에서 상태 조회: URN 정규화 + CURRENT + dbOnly 폴백 */
function getStateFromCatMap(catMap, { urn, dbId, curUrn }) {
  if (dbId == null) return "";
  const nUrn = normalizeUrn(urn);
  const nCur = normalizeUrn(curUrn);
  const keys = [];
  if (nUrn) keys.push(`${nUrn}::${dbId}`);
  if (urn && urn !== nUrn) keys.push(`${urn}::${dbId}`);
  if (nCur) keys.push(`${nCur}::${dbId}`);
  if (curUrn && curUrn !== nCur) keys.push(`${curUrn}::${dbId}`);
  keys.push(String(dbId));
  for (const k of keys) {
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

function purgeWbsDomPaint() {
  const host = document.getElementById("wbs-group-list");
  if (!host) return;
  host.querySelectorAll("li[data-uid]").forEach(li => {
    li.removeAttribute("data-wbs-state");
    li.classList.remove("wbs-c","wbs-td","wbs-blue");
  });
}

/** li 하나에 상태 반영 — state===undefined 는 '유지' 의미 */
function applyPaintOnLi(li, state) {
  // 준비 안된 경로 → 기존 칠을 유지(덮어쓰지 않음)
  if (typeof state === 'undefined') return;

  // data-wbs-state 동기화
  if (state) li.setAttribute('data-wbs-state', state);
  else li.removeAttribute('data-wbs-state');

  // 클래스 재적용
  li.classList.remove('wbs-c', 'wbs-td', 'wbs-blue');
  if (state === 'C')       li.classList.add('wbs-c');
  else if (state === 'TD') li.classList.add('wbs-td');
  else if (state === 'T' || state === 'D') li.classList.add('wbs-blue');
}

/* ──────────────────────────────────────────────────────────
   1) Task → 객체 카테고리 맵
────────────────────────────────────────────────────────── */
export function buildCatMapFromTasks() {
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  const map = new Map();
  const tree = window.taskTree;
  if (!tree?.getRootNode) return map;

  tree.getRootNode().visit((n) => {
    const cat = normalizeTaskCategory(n.data?.selectedOption);
    if (!cat) return;
    const arr = n.data?.linkedObjects || [];
    for (const o of arr) {
      const key = `${String(o.urn || CUR_URN)}::${String(o.dbId)}`;
      const cur = map.get(key) || { C:false, T:false, D:false };
      if (cat === "C") cur.C = true;
      else if (cat === "T") cur.T = true;
      else if (cat === "D") cur.D = true;
      map.set(key, cur);

      if (o.urn && CUR_URN && String(o.urn) !== String(CUR_URN)) {
        const aliasKey = `${String(CUR_URN)}::${String(o.dbId)}`;
        const aliasVal = map.get(aliasKey) || { C:false, T:false, D:false };
        aliasVal.C ||= cur.C; aliasVal.T ||= cur.T; aliasVal.D ||= cur.D;
        map.set(aliasKey, aliasVal);
      }
      const dbOnlyKey = String(o.dbId);
      const dbOnlyVal = map.get(dbOnlyKey) || { C:false, T:false, D:false };
      if (cat === "C") dbOnlyVal.C = true;
      else if (cat === "T") dbOnlyVal.T = true;
      else if (cat === "D") dbOnlyVal.D = true;
      map.set(dbOnlyKey, dbOnlyVal);
    }
  });
  return map;
}

/* ──────────────────────────────────────────────────────────
   2) 서브트리 적용(DFS)
────────────────────────────────────────────────────────── */
// 그룹은 '경로(prefix) 단위'로 색 결정, leaf는 기존(dbId) 로직 유지
export function applyHighlightForSubtreeUI(node, catMap) {
  if (!node) return "";

  // 노드 경로 얻기 (provider 가 준 __path 우선)
  const pathOf = (n) => {
    if (Array.isArray(n.__path)) return n.__path.slice();
    const out = []; let cur = n;
    while (cur && cur.text && !cur.isRoot?.()) { out.unshift(cur.text); cur = cur.parent; }
    return out;
  };

  const CUR_URN = window.CURRENT_MODEL_URN || "";

  function liOfLocal(n) {
    const host = document.getElementById("wbs-group-list");
    if (!host || !n) return null;
    const uid = n._id ?? n.id;
    if (!uid) return null;
    const any = host.querySelector(`[data-uid="${String(uid)}"]`);
    return any?.closest("li[data-uid]") || null;
  }

  const applyPaint = (n, st) => {
    const li = liOfLocal(n);
    if (!li) return;
    applyPaintOnLi(li, st);
  };

  function leafState(n) {
    const uid  = n._id ?? n.id ?? "";
    const urn  = parseUrnFromUid(uid) || String(n.urn || CUR_URN);
    const dbId = (typeof n.dbId === "number") ? n.dbId : null;
    return getStateFromCatMap(catMap, { urn, dbId, curUrn: CUR_URN });
  }

  function dfs(n) {
    const hasKids = (n.hasChildren && n.hasChildren());
    if (!hasKids) {
      const st = leafState(n);
      applyPaint(n, st);
      return st;
    }

    // ★ 그룹 상태: 경로(prefix) 단위 비교
    const path = pathOf(n);
    const groupState = getPathState(path);
    applyPaint(n, groupState);

    // 자식은 계속 내려가며 칠함(그룹색엔 영향 없음)
    const children = n.children || [];
    for (const ch of children) dfs(ch);
    return groupState;
  }

  // 교체 대상: applyHighlightForSubtreeUI 내부 summarizeByProvider()

  function summarizeByProvider(n){
    // 0) 경로 기반 커버리지 우선 사용
    try {
      const pathFrom = (node) => {
        const arr = []; let cur = node;
        while (cur && cur.text && !cur.isRoot?.()) { arr.unshift(cur.text); cur = cur.parent; }
        return arr;
      };
      if (typeof window.__WBS_GET_PATH_STATE === "function") {
        const st = window.__WBS_GET_PATH_STATE(pathFrom(n));
        if (st !== undefined) {
          // "T" | "D" 는 UI에서 모두 파란색 "T"로 통합 표현
          if (st === "T" || st === "D") return "T";
          return st; // "C" | "TD" | "" (빈문자면 미칠)
        }
      }
    } catch {}

    // 1) 커버리지 준비 안됐으면 기존 방식 폴백
    try {
      const getDbIds = window.__WBS_GET_DBIDS_FOR_NODE;
      const res = (typeof getDbIds === 'function')
        ? getDbIds(n, { allowUnbuilt: true })
        : [];
      if (res == null) return undefined;          // 아직 준비 X → 유지
      const ids = res || [];
      if (!ids.length) return "";                 // 비어있음 → 제거

      let first = null;
      for (const id of ids) {
        const st = getStateFromCatMap(window.__WBS_CATMAP || new Map(), {
          urn: window.CURRENT_MODEL_URN, dbId: id, curUrn: window.CURRENT_MODEL_URN
        });
        const b = (st === 'C' ? 'C' : st === 'TD' ? 'TD' : (st==='T'||st==='D') ? 'B' : '');
        if (!b) { first = ""; break; }
        if (first == null) first = b;
        else if (first !== b) { first = ""; break; }
      }
      return (first === 'B') ? 'T' : (first || "");
    } catch {
      return undefined;                           // 예외시 유지
    }
  }


  return dfs(node);
}

/* ──────────────────────────────────────────────────────────
   3) DOM 강제 스윕(누락/지연 렌더 대비)
────────────────────────────────────────────────────────── */
function domSweepRepaint(catMap) {
  const host = document.getElementById("wbs-group-list");
  if (!host) return;
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  const tree = window.wbsTree;
  const bucketOf = (s) => s === "C" ? "C" : s === "TD" ? "TD" : (s === "T" || s === "D") ? "B" : "";

  // 리프 고정
  host.querySelectorAll("li[data-uid].leaf").forEach(li => {
    const uid = li.getAttribute("data-uid") || "";
    const node = tree?.node ? tree.node(uid) : null;
    const dbId = (node && typeof node.dbId === "number") ? node.dbId : null;
    if (dbId == null) return;
    const urn = parseUrnFromUid(uid) || node?.urn || CUR_URN;
    const st = getStateFromCatMap(catMap, { urn, dbId, curUrn: CUR_URN });
    applyPaintOnLi(li, st);
  });

  // 2) 그룹 노드: '경로(prefix)' 단위로 상태 결정
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li => {
    try {
      const uid = li.getAttribute('data-uid') || "";
      const node = tree?.node ? tree.node(uid) : null;
      if (!node) return;
      // node.__path가 없으면 타이틀 체인으로 경로 복원
      const path = (Array.isArray(node.__path) && node.__path.length)
        ? node.__path.slice()
        : (function build() {
            const out = []; let cur = node;
            while (cur && cur.text && !cur.isRoot?.()) { out.unshift(cur.text); cur = cur.parent; }
            return out;
          })();
      const st = getPathState(path);
      applyPaintOnLi(li, st);
    } catch { /* 유지 */ }
  });

  __resyncPaintClasses();
}

/** data-wbs-state ↔ 클래스 불일치 자동 보정(보험용) */
function __resyncPaintClasses() {
  const host = document.getElementById("wbs-group-list");
  if (!host) return;
  host.querySelectorAll('li[data-uid]').forEach(li => {
    const st = li.getAttribute('data-wbs-state') || "";
    let need = "";
    if (st === 'C') need = 'wbs-c';
    else if (st === 'TD') need = 'wbs-td';
    else if (st === 'T' || st === 'D') need = 'wbs-blue';
    if (!need) {
      li.classList.remove('wbs-c','wbs-td','wbs-blue');
      return;
    }
    if (!li.classList.contains(need)) {
      li.classList.remove('wbs-c','wbs-td','wbs-blue');
      li.classList.add(need);
    }
  });
}


/* ──────────────────────────────────────────────────────────
   4) 전면 하이라이트
────────────────────────────────────────────────────────── */
export function updateWBSHighlight() {
  if (fixedModeOn() || paintLocked()) return;

  // 경로 기반 커버리지 인덱스 준비(비동기). 준비되면 다음 프레임에서 자동 리페인트.
  try { ensureCoverageReady().then(()=>{ try{ scheduleWbsRepaint(); }catch{} }); } catch {}

  const catMap = buildCatMapFromTasks();
  window.__WBS_CATMAP = catMap;
  const tree = window.wbsTree;
  if (tree?.nodes) {
    for (const r of tree.nodes()) applyHighlightForSubtreeUI(r, catMap);
  }
  // DOM 강제 스윕(누락/지연 렌더 대비)
  domSweepRepaint(catMap);
  // ★ 보험: 상태-클래스 재동기화
  __resyncPaintClasses();
}

/* ──────────────────────────────────────────────────────────
   5) 이벤트 바인딩(선택)
────────────────────────────────────────────────────────── */
export function attachWbsTreeHighlightEvents(wbsTree, { includeExpand = false } = {}) {
  if (fixedModeOn()) return;
  if (!includeExpand || !wbsTree) return;
  const idle = (cb) => (typeof requestIdleCallback === "function" ? requestIdleCallback(cb, { timeout: 60 }) : setTimeout(cb, 0));
  wbsTree.on("node.expanded", (n) => idle(() => { const m = window.__WBS_CATMAP || buildCatMapFromTasks(); applyHighlightForSubtreeUI(n, m); domSweepRepaint(m); }));
  wbsTree.on("node.collapsed", (n) => idle(() => { const m = window.__WBS_CATMAP || buildCatMapFromTasks(); applyHighlightForSubtreeUI(n, m); domSweepRepaint(m); }));
}

/* ──────────────────────────────────────────────────────────
   6) 변화 지속성
────────────────────────────────────────────────────────── */
export function bindWbsHighlightPersistence(tree) {
  if (fixedModeOn()) return;
  if (!tree || tree.__wbsHLBound) return;
  tree.__wbsHLBound = true;
  const reapply = () => { if (!paintLocked()) scheduleWbsRepaint(); };
  ["node.selected","node.deselected","node.expanded","node.collapsed","node.rendered"].forEach(evt => tree.on(evt, reapply));
  tree.on("changes.applied", reapply);

  try {
    const host = document.getElementById("wbs-group-list");
    if (host && !host.__wbsObserver) {
      const obs = new MutationObserver(() => { if (!paintLocked()) scheduleWbsRepaint(); });
      obs.observe(host, { childList:true, subtree:true, attributes:false });
      host.__wbsObserver = obs;
    }
  } catch {}
}

/* ──────────────────────────────────────────────────────────
   (옵션) 디버깅
────────────────────────────────────────────────────────── */
export function findTasksByDbId(dbId, urn = window.CURRENT_MODEL_URN) {
  const tree = window.taskTree;
  const hits = [];
  if (!tree?.getRootNode) return hits;
  const targetUrn = normalizeUrn(urn);
  tree.getRootNode().visit((n) => {
    const cat = normalizeTaskCategory(n.data?.selectedOption) || "?";
    const arr = n.data?.linkedObjects || [];
    for (const o of arr) {
      const oUrn = normalizeUrn(o.urn || urn);
      if (oUrn === targetUrn && Number(o.dbId) === Number(dbId)) {
        hits.push({ title: n.title || n.data?.title, cat, node: n });
        break;
      }
    }
  });
  return hits;
}
