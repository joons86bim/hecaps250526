// wwwroot/js/sidebar/wbsloader.js

/**
 * WBS 트리 데이터 빌더
 * - 그룹: (primaryOrder: HEC.WBS > HEC.Level > HEC.Zone) → Family → Type → [Element_ID]
 * - Family: 각 요소의 viewer 결과 obj.name (예: "기본 벽 [1791047]")에서 [..] 제거 → "기본 벽"
 * - Type:   "유형 이름" (Korean) 우선
 * - Leaf:   텍스트는 [Element_ID], 백데이터로 dbId/elementId 유지
 * - 성능:   getBulkProperties 배치 + PropertyDB 준비 대기
 */
export async function buildWbsTreeData(viewer, options = {}) {
  const urn = window.CURRENT_MODEL_URN || "unknown_urn";
  const {
    primaryOrder = ["HEC.WBS", "HEC.Level", "HEC.Zone"], // 공정옵션 UI와 연결 예정
    batchSize    = 5000,
    source       = "all", // 'all' | 'visible'
  } = options;

  const models = viewer.getVisibleModels ? viewer.getVisibleModels() : [viewer.model];
  if (!models || models.length === 0) return [];

  /* ──────────────────────────────── */
  /* 준비: Property DB 대기           */
  /* ──────────────────────────────── */
  async function waitPropertyDb(viewer, model){
    if (model.getPropertyDb && model.getPropertyDb()) return;
    await new Promise((resolve) => {
      const h = () => {
        if (model.getPropertyDb && model.getPropertyDb()) {
          viewer.removeEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
          resolve();
        }
      };
      viewer.addEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
      setTimeout(resolve, 2000); // 안전 타임아웃
    });
  }

  /* ──────────────────────────────── */
  /* leaf dbId 수집                   */
  /* ──────────────────────────────── */
  function collectAllLeafDbIds(model) {
    const data = model.getData && model.getData();
    const it = data?.instanceTree;
    if (!it) return [];
    const root = it.getRootId();
    const out = [];
    (function walk(id){
      let hasChild = false;
      it.enumNodeChildren(id, c => { hasChild = true; walk(c); });
      if (!hasChild) {
        let hasFrag = false;
        it.enumNodeFragments(id, () => { hasFrag = true; });
        if (hasFrag) out.push(id);
      }
    })(root);
    return out;
  }

  function collectVisibleDbIds(model) {
    if (typeof viewer.getVisibleDbIds === "function") return viewer.getVisibleDbIds(model) || [];
    if (typeof model.getVisibleDbIds === "function")   return model.getVisibleDbIds() || [];
    return collectAllLeafDbIds(model);
  }

  /* ──────────────────────────────── */
  /* 배치 getBulkProperties           */
  /* ──────────────────────────────── */
  function getBulkPropsInBatches(model, dbIds, propNames, batch = 5000) {
    const out = [];
    let i = 0;
    return new Promise((resolve, reject) => {
      function step(){
        if (i >= dbIds.length) return resolve(out);
        const slice = dbIds.slice(i, i + batch);
        i += batch;
        model.getBulkProperties(
          slice,
          propNames,
          (res) => {
            for (const r of res) {
              // Autodesk API가 넣어주는 최상위 name도 보존 (Family 계산에 사용)
              // r.name 예: "기본 벽 [1791047]"
              out.push(r);
            }
            setTimeout(step, 0);
          },
          reject
        );
      }
      step();
    });
  }

  /* ──────────────────────────────── */
  /* 수집: 대상 dbIds + 속성          */
  /* ──────────────────────────────── */
  const PROP_LIST = [
    // 1~3단계 그룹
    "HEC.WBS", "HEC.Level", "HEC.Zone",
    // Type 이름(한글 우선)
    "유형 이름", "Type Name",
    // Element ID 후보
    "ElementId", "Element Id", "Element ID", "요소 ID",
    // 여유 키(혹시 쓸 수도 있으니)
    "Name", "name"
  ];

  let allProps = [];
  for (const model of models) {
    const data = model.getData && model.getData();
    if (!data?.instanceTree) continue;

    await waitPropertyDb(viewer, model); // ★ 중요: 속성 DB 준비

    const dbIds = (source === "all") ? collectAllLeafDbIds(model) : collectVisibleDbIds(model);
    if (!dbIds.length) continue;

    const props = await getBulkPropsInBatches(model, dbIds, PROP_LIST, batchSize);
    for (const p of props) p.modelId = model.id || model.modelId || null;
    allProps = allProps.concat(props);
  }

  /* ──────────────────────────────── */
  /* 속성 추출/정규화                 */
  /* ──────────────────────────────── */
  const KEY_MAP = {
    "HEC.WBS":   ["HEC.WBS"],
    "HEC.Level": ["HEC.Level"],
    "HEC.Zone":  ["HEC.Zone"],
    __TYPE__:    ["유형 이름", "Type Name"],
    __ELEMID__:  ["ElementId", "Element Id", "Element ID", "요소 ID"]
  };

  function getPropVal(obj, keys) {
    if (!obj?.properties) return undefined;
    for (const k of keys) {
      const hit = obj.properties.find(p => p.displayName === k && p.displayValue != null && p.displayValue !== "");
      if (hit) return hit.displayValue;
    }
    // 소문자 보조 탐색
    const lowers = obj.properties.map(p => [String(p.displayName || "").toLowerCase(), p.displayValue]);
    for (const k of keys) {
      const kk = String(k).toLowerCase();
      const found = lowers.find(([n, v]) => n === kk && v != null && v !== "");
      if (found) return found[1];
    }
    return undefined;
  }

  const UNSET = {
    "HEC.WBS":   "WBS 미지정",
    "HEC.Level": "Level 미지정",
    "HEC.Zone":  "Zone 미지정",
    __FAMILY__:  "Family 미지정",
    __TYPE__:    "Type 미지정"
  };

  // primary 3단계 정합성 보장
  const allowedPrimary = ["HEC.WBS", "HEC.Level", "HEC.Zone"];
  const prim = primaryOrder.filter(k => allowedPrimary.includes(k));
  while (prim.length < 3) {
    for (const k of allowedPrimary) if (!prim.includes(k)) { prim.push(k); break; }
  }

  /* ──────────────────────────────── */
  /* 루트맵: prim0 → prim1 → prim2 → Family → Type → elements[] */
  /* ──────────────────────────────── */
  const rootMap = new Map();
  const seen = new Set();

  for (const obj of allProps) {
    const seenKey = `${urn}:${obj.dbId}`;
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);

    // 1~3단계 그룹
    const k0 = (getPropVal(obj, [prim[0]]) ?? UNSET[prim[0]]) + "";
    const k1 = (getPropVal(obj, [prim[1]]) ?? UNSET[prim[1]]) + "";
    const k2 = (getPropVal(obj, [prim[2]]) ?? UNSET[prim[2]]) + "";

    // Family = obj.name에서 [..] 제거 (우선), 없으면 "Name"/"name" 등 보조, 그래도 없으면 UNSET
    let familyRaw = (obj.name || getPropVal(obj, ["Name", "name"]) || "");
    let fam = familyRaw.replace(/\s*\[[^\]]*\]\s*$/, "").trim();
    if (!fam) fam = UNSET.__FAMILY__;

    // Type
    const typ = (getPropVal(obj, KEY_MAP.__TYPE__) ?? UNSET.__TYPE__) + "";

    // Element_ID
    const elemId = getPropVal(obj, KEY_MAP.__ELEMID__) ?? obj.dbId;

    // 중첩 Map 보장
    function ensure(map, key) {
      let m = map.get(key);
      if (!m) { m = new Map(); map.set(key, m); }
      return m;
    }
    const m0 = ensure(rootMap, k0);
    const m1 = ensure(m0, k1);
    const m2 = ensure(m1, k2);
    const mF = ensure(m2, fam);
    const mT = ensure(mF, typ);

    let arr = mT.get("__elements");
    if (!arr) { arr = []; mT.set("__elements", arr); }
    arr.push({ dbId: obj.dbId, elementId: elemId });
  }

  /* ──────────────────────────────── */
  /* Map → InspireTree용 배열 변환    */
  /* ──────────────────────────────── */
  const SAFE = s => String(s).replace(/[:/\\]/g, "_").trim();
  const koCmp = (a, b) => String(a).localeCompare(String(b), "ko");
  const numCmp = (a, b) => Number(a) - Number(b);

  function mapToTree(map, path = []) {
    const nodes = [];
    const entries = Array.from(map.entries()).filter(([k]) => k !== "__elements");
    entries.sort(([a], [b]) => koCmp(a, b));

    for (const [key, child] of entries) {
      const newPath = [...path, key];
      const id = `${urn}::${SAFE(newPath.join("::"))}`;

      const elems = child.get("__elements");
      let children = [];

      if (elems) {
        const sorted = [...elems].sort((a, b) => numCmp(a.elementId, b.elementId));
        children = sorted.map(({ dbId, elementId }) => ({
          id: `${id}::${elementId}`,
          text: `[${elementId}]`,
          urn,
          dbId,
          elementId,
          children: []
        }));
      }

      const deeper = mapToTree(child, newPath);
      if (deeper.length) children = deeper;

      nodes.push({ id, text: key, urn, children });
    }
    return nodes;
  }

  return mapToTree(rootMap, []);
}
