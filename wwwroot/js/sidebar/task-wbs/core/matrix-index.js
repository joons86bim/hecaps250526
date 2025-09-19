//wwwroot/js/sidebar/task-wbs/core/matrix-index.js
// 행(경로) × 열(DBID) 인덱스 + 카테고리 집합 + 경로 상태/카운트 계산
import { toKey } from "./path-key.js";

const PATH_TO_IDS = new Map();        // pathKey -> Int32Array(dbIds)
const PATH_STATE = new Map();         // pathKey -> "C"|"TD"|"" (undefined = 아직 미계산)
const PATH_COUNTS = new Map();        // pathKey -> { total, c, t, d, td }
let __provider = null;

// 카테고리 집합(실시간 재생성)
let S_C = new Set(); // 시공
let S_T = new Set(); // 가설
let S_D = new Set(); // 철거

const CUR_URN = () => String(window.CURRENT_MODEL_URN || "");
const normCat = (v) => v === "시공" || v === "C" ? "C" : v === "가설" || v === "T" ? "T" : v === "철거" || v === "D" ? "D" : "";

function buildCatSetsFromTasks() {
  S_C = new Set(); S_T = new Set(); S_D = new Set();
  const tree = window.taskTree;
  if (!tree?.getRootNode) return;
  tree.getRootNode().visit((n) => {
    const cat = normCat(n.data?.selectedOption);
    if (!cat) return;
    (n.data?.linkedObjects || []).forEach(o => {
      const urn = String(o.urn || CUR_URN());
      if (urn !== CUR_URN()) return; // 현재 모델만
      const d = Number(o.dbId);
      if (!Number.isFinite(d)) return;
      if (cat === "C") S_C.add(d);
      if (cat === "T") S_T.add(d);
      if (cat === "D") S_D.add(d);
    });
  });
}

export async function initMatrix({ primaryOrder, provider }) {
  __provider = provider;
  PATH_TO_IDS.clear(); PATH_STATE.clear(); PATH_COUNTS.clear();
  buildCatSetsFromTasks();
}

export function markTasksChanged() {
  buildCatSetsFromTasks();
  // 경로 상태/카운트는 필요 시 재계산하도록 캐시는 지워두는 편이 안전
  PATH_STATE.clear(); PATH_COUNTS.clear();
}

export function getPathState(pathKey) {
  return PATH_STATE.get(pathKey);
}

export function getCounts(pathKey) {
  return PATH_COUNTS.get(pathKey);
}

function reduceStateAndCounts(ids = []) {
  const total = ids.length | 0;
  if (!total) return { state: "", counts: { total: 0, c: 0, t: 0, d: 0, td: 0 } };

  let c = 0, t = 0, d = 0, td = 0;
  for (const id of ids) {
    const inC = S_C.has(id), inT = S_T.has(id), inD = S_D.has(id);
    if (inC && !inT && !inD) c++;
    else if (!inC && inT && !inD) t++;
    else if (!inC && !inT && inD) d++;
    else if (!inC && (inT || inD)) td++; // T/D 혼합(파란계열)
    else {
      // 아무 데도 없거나 C와 T/D가 혼합된 경우 → 혼합 취급 (state="")
      // counts에는 포함 안 함
    }
  }

  // 경로 상태 규칙
  //  - 전부 C  → "C"
  //  - 전부 T/D(=t+d+td == total) → "TD"
  //  - 그 외(혼합/미완성) → ""
  let state = "";
  if (c === total) state = "C";
  else if ((t + d + td) === total) state = "TD";
  else state = "";

  return { state, counts: { total, c, t, d, td } };
}

// 특정 경로의 dbIds 확보(가능하면 동기, 아니면 provider에서 유도)
export async function ensureIdsForPath(pathKey) {
  if (PATH_TO_IDS.has(pathKey)) return PATH_TO_IDS.get(pathKey);
  if (!__provider) return undefined;

  const path = pathKey ? pathKey.split("¦") : [];
  // provider.getDbIdsForPath는 상위 groups 캐시로 동기 유도 가능(allowUnbuilt:true)
  const ids = __provider.getDbIdsForPath(path, { includeDescendants: true, allowUnbuilt: true });
  if (ids == null) return undefined; // 아직 준비안됨(렌더 유지)

  const arr = Int32Array.from(ids.map(Number).filter(Number.isFinite));
  PATH_TO_IDS.set(pathKey, arr);
  return arr;
}

// 여러 경로 한꺼번에 보충
export async function bulkEnsureForVisible(pathKeys = []) {
  for (const k of pathKeys) {
    if (!PATH_TO_IDS.has(k)) {
      await ensureIdsForPath(k);
    }
  }
}

// 상태/카운트 계산(동기 입력이 없으면 보류)
export function computePathState(pathKey) {
  const idsArr = PATH_TO_IDS.get(pathKey);
  if (!idsArr) return undefined; // 아직 unknown → 렌더 유지

  const ids = Array.from(idsArr);
  const { state, counts } = reduceStateAndCounts(ids);

  PATH_STATE.set(pathKey, state);
  PATH_COUNTS.set(pathKey, counts);
  return state;
}
