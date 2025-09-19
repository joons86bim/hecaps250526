// /wwwroot/js/sidebar/task-wbs/wbs/loader.js
// Lazy WBS Provider v2.2
// depth: 1=HEC.WBS, 2=HEC.Level, 3=HEC.Zone, 4=Family, 5=Type, 6=Elements
export async function buildWbsProviderLazy(viewer, options = {}) {
  const urn = (window.CURRENT_MODEL_URN || "unknown_urn");
  const {
    primaryOrder = ["HEC.WBS", "HEC.Level", "HEC.Zone"],
    batchSize = 4000,
    bucketThreshold = 400,
    bucketSize = 200,
    source = "all" // "all" | "visible"
  } = options;

  const N = (s) => String(s ?? "")
    .normalize('NFKC')
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const SAFE = s => N(s).replace(/[:/\\]/g, "_");
  const koCmp = (a, b) => N(a).localeCompare(N(b), "ko");
  const numCmp = (a, b) => Number(a) - Number(b);

  const allowedPrimary = ["HEC.WBS", "HEC.Level", "HEC.Zone"];
  const prim = primaryOrder.filter(k => allowedPrimary.includes(k));
  while (prim.length < 3) for (const k of allowedPrimary) if (!prim.includes(k)) { prim.push(k); break; }

  const KEY_TYPE = ["유형 이름", "Type Name"];
  const KEY_ELEM = ["ElementId", "Element Id", "Element ID", "요소 ID"];
  const UNSET = {
    "HEC.WBS":   "WBS 미지정",
    "HEC.Level": "Level 미지정",
    "HEC.Zone":  "Zone 미지정",
    __FAMILY__:  "Family 미지정",
    __TYPE__:    "Type 미지정"
  };

  function looseGet(groups, label){
    const key = N(label);
    let box = groups.get(key);
    if (box) return box;
    for (const [k, b] of groups.entries()){
      if (N(k) === key || N(b?.label) === key) return b;
    }
    return null;
  }

  function collectAllLeafDbIds(model) {
    const it = model?.getData?.()?.instanceTree;
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
  async function waitPropertyDb(model){
    if (model.getPropertyDb && model.getPropertyDb()) return;
    await new Promise((resolve) => {
      let done = false;
      const h = () => {
        if (model.getPropertyDb && model.getPropertyDb()) {
          viewer.removeEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
          done = true; resolve();
        }
      };
      viewer.addEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
      let tries = 0;
      const iv = setInterval(() => {
        if (model.getPropertyDb && model.getPropertyDb()) {
          clearInterval(iv);
          if (!done) viewer.removeEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
          resolve();
        } else if (++tries > 600) { clearInterval(iv); resolve(); }
      }, 100);
    });
  }

  function propsToLowerMap(props){
    const map = new Map();
    for (const p of props) {
      const low = new Map(p.properties.map(q => [String(q.displayName || '').toLowerCase(), q.displayValue]));
      if (p.name) low.set('name', p.name);
      map.set(p.dbId, low);
    }
    return map;
  }
  function bulkProps(model, dbIds, names, batch = batchSize){
    return new Promise((resolve, reject) => {
      if (!dbIds.length) return resolve([]);
      const out = [];
      let i = 0;
      (function step(){
        if (i >= dbIds.length) return resolve(out);
        const slice = dbIds.slice(i, i + batch);
        i += batch;
        model.getBulkProperties(slice, names, (res) => { out.push(...res); setTimeout(step, 0); }, reject);
      })();
    });
  }

  const models = viewer.getVisibleModels ? viewer.getVisibleModels() : [viewer.model];
  if (!models || !models.length) return { provider: emptyProvider() };

  const byModelIds = new Map();
  for (const m of models) {
    await waitPropertyDb(m);
    const base = (source === "all") ? collectAllLeafDbIds(m) : collectVisibleDbIds(m);
    byModelIds.set(m, base);
  }

  const cache = new Map(); // key(path) -> { ids, groups, count }
  const pathMap = (window.__WBS_PATHMAP = window.__WBS_PATHMAP || new Map());
  const pkey = (path) => path.map(N).join("::");
  const ensure = (path) => { const k=pkey(path); let o=cache.get(k); if(!o){o={ids:null,groups:null,count:0}; cache.set(k,o);} return o; };

  function gset(groups, label, item){
    const k = N(label);
    let box = groups.get(k);
    if (!box) { box = { label: N(label) === "" ? "" : label, ids: [] }; groups.set(k, box); }
    box.ids.push(item);
  }

  async function buildRoot(){
    const root = ensure([]);
    if (root.groups) return root;
    root.ids = [];
    const groups = new Map();
    for (const [model, ids] of byModelIds.entries()) {
      root.ids.push(...ids.map(dbId => ({ model, dbId })));
      const props = await bulkProps(model, ids, [prim[0]]);
      const low = propsToLowerMap(props);
      for (const id of ids) {
        const v = low.get(id)?.get(prim[0].toLowerCase());
        const keyLabel = (v==null || v==="") ? "WBS 미지정" : String(v);
        gset(groups, keyLabel, { model, dbId: id });
      }
    }
    root.groups = groups; root.count = root.ids.length;
    return root;
  }

  async function buildNext(path){ // depth: 1->prim1, 2->prim2, 3->Family, 4->Type
    const depth = path.length;
    const cur = ensure(path);
    if (cur.groups) return cur;

    let ids = [];
    if (depth === 0) {
      const r = await buildRoot(); ids = r.ids;
    } else if (depth === 1) {
      const r = await buildRoot();
      const box = looseGet(r.groups, path[0]);
      ids = box ? box.ids.slice() : [];
    } else {
      const parentPath = path.slice(0, -1);
      const parent = ensure(parentPath);
      if (!parent.groups) await buildNext(parentPath);
      const box = looseGet(ensure(parentPath).groups, path[path.length - 1]);
      ids = box ? box.ids.slice() : [];
    }
    cur.ids = ids; cur.count = ids.length;
    if (!ids.length) { cur.groups = new Map(); return cur; }

    let propKeys = null;
    let getVal   = null;

    if      (depth === 1) { propKeys = [prim[1]]; getVal = l => l.get(prim[1].toLowerCase()) ?? "Level 미지정"; }
    else if (depth === 2) { propKeys = [prim[2]]; getVal = l => l.get(prim[2].toLowerCase()) ?? "Zone 미지정"; }
    else if (depth === 3) { // Family → name에서 [..] 제거
      const groups = new Map();
      for (const [model, dbIdList] of groupByModel(ids)) {
        const it = model?.getData?.()?.instanceTree;
        for (const dbId of dbIdList) {
          let nm = "";
          try { nm = it?.getNodeName ? it.getNodeName(dbId) : ""; } catch {}
          const fam = (nm ? String(nm).replace(/\s*\[[^\]]*\]\s*$/, '').trim() : "") || "Family 미지정";
          gset(groups, fam, { model, dbId, name: nm });
        }
      }
      cur.groups = groups;
      return cur;
    }
    else if (depth === 4) { propKeys = ["유형 이름", "Type Name"]; getVal = l => l.get('유형 이름') || l.get('type name') || "Type 미지정"; }
    else { cur.groups = new Map(); return cur; }

    const groups = new Map();
    for (const [model, dbIdList] of groupByModel(ids)) {
      const props = await bulkProps(model, dbIdList, propKeys);
      const low = propsToLowerMap(props);
      for (const dbId of dbIdList) {
        const l = low.get(dbId) || new Map();
        let label = getVal(l);
        label = (label==null || label==="") ? ((depth===4)?"Type 미지정" : (depth===1?"Level 미지정":"Zone 미지정")) : String(label);
        gset(groups, label, { model, dbId, name: l.get('name') });
      }
    }
    cur.groups = groups;
    return cur;
  }

  function* groupByModel(ids){
    const map = new Map();
    for (const x of ids) { if (!map.has(x.model)) map.set(x.model, []); map.get(x.model).push(x.dbId); }
    yield* map.entries();
  }

  async function makeLeaves(path){
    const cur = ensure(path);
    if (!cur.ids) {
      const parentPath = path.slice(0, -1);
      if (!ensure(parentPath).groups) await buildNext(parentPath);
      const box = looseGet(ensure(parentPath).groups, path[path.length - 1]);
      cur.ids = box ? box.ids.slice() : [];
      cur.count = cur.ids.length || 0;
    }
    if (!cur.ids?.length) return [];

    const results = [];
    for (const [model, dbIdList] of groupByModel(cur.ids)) {
      const props = await bulkProps(model, dbIdList, KEY_ELEM);
      const low = propsToLowerMap(props);
      for (const dbId of dbIdList) {
        const l = low.get(dbId) || new Map();
        const elemId = l.get('elementid') || l.get('element id') || dbId;
        const idBase = `${urn}::${SAFE(path.join('::'))}`;
        results.push({ id: `${idBase}::${elemId}`, text: `[${elemId}]`, urn, dbId, elementId: elemId });
        pathMap.set(`${urn}:${dbId}`, path.join(' - '));
      }
    }
    results.sort((a,b)=>numCmp(a.elementId, b.elementId));
    return results;
  }

  function makeGroupNodesFrom(groups, path, parentId, depth){
    const entries = Array.from(groups.entries())
      .map(([k,box]) => [box.label, box.ids])
      .sort(([a],[b]) => koCmp(a,b));
    const mk = (val, ids) => ({
      id: `${urn}::${SAFE([...path, val].join('::'))}`,
      text: val,
      __path: [...path, val],
      leafCount: ids.length,
      children: true
    });
    const allowBucket = (depth >= 6);
    if (allowBucket && entries.length >= bucketThreshold) {
      const out = [];
      for (let i=0;i<entries.length;i+=bucketSize) {
        const slice = entries.slice(i, i+bucketSize);
        out.push({
          id: `${parentId || urn}__bucket__${(i/bucketSize)|0}`,
          text: `그룹 ${((i/bucketSize)|0)+1} (${slice.length})`,
          _isBucket: true,
          __bucket: slice.map(([val, ids]) => mk(val, ids)),
          children: true
        });
      }
      return out;
    }
    return entries.map(([val, ids]) => mk(val, ids));
  }

  function emptyProvider(){
    return { __provider: true, async roots(){ return []; }, async childrenByPath(){ return []; }, countAt(){ return 0; }, getDbIdsForPath(){ return []; }, ensurePathMapForDbIds: async () => {} };
  }

  const provider = {
    __provider: true,

    countAt(path){
      const cur = ensure(path);
      if (cur.count) return cur.count;
      if (cur.groups) {
        let c = 0; for (const [, box] of cur.groups) c += (box?.ids?.length || 0);
        cur.count = c; return c;
      }
      return 0;
    },

    async roots(){ const root = await buildRoot(); return makeGroupNodesFrom(root.groups, [], urn, 0); },

    async childrenByPath(path){
      const d = path?.length ?? 0;
      if (d <= 4) {
        const cur = await buildNext(path);
        return makeGroupNodesFrom(cur.groups, path, undefined, d);
      }
      if (d === 5) return await makeLeaves(path);
      return [];
    },

    // ★ 펼치지 않아도 상위 요약 가능하도록 부모 groups 폴백
    getDbIdsForPath(path, opts = {}) {
      const cur = ensure(path);
    
      // 0) 이미 준비됨
      if (cur.ids && cur.ids.length) return cur.ids.map(x => x.dbId);
    
      // 1) 부모 groups 폴백(항상 허용) — allowUnbuilt와 무관
      const parentPath = path.slice(0, -1);
      const parent = ensure(parentPath);
      if (parent.groups) {
        const box = looseGet(parent.groups, path[path.length - 1]);
        if (box && box.ids) {
          cur.ids = box.ids.slice();
          cur.count = cur.ids.length;
          return cur.ids.map(x => x.dbId);
        }
      }
    
      // 2) 루트 특례(그룹 합침)
      if (path.length === 0 && cur.groups) {
        const all = [];
        for (const [, box] of cur.groups) all.push(...(box?.ids || []));
        if (all.length) {
          cur.ids = all;
          cur.count = all.length;
          return cur.ids.map(x => x.dbId);
        }
      }
    
      // 3) 여기까지 못 찾았으면, 정말 미구축 상태
      if (opts.allowUnbuilt) return null;
      return [];
    },
    

    async ensurePathMapForDbIds(dbIds){
      const need = [];
      for (const dbId of dbIds) if (!pathMap.has(`${urn}:${dbId}`)) need.push(dbId);
      if (!need.length) return;

      for (const m of models) {
        const all = byModelIds.get(m) || [];
        const set = new Set(all);
        const pick = need.filter(id => set.has(id));
        if (!pick.length) continue;

        const props = await bulkProps(m, pick, [...prim, "Name", ...KEY_TYPE]);
        const low = propsToLowerMap(props);
        for (const id of pick) {
          const l = low.get(id) || new Map();
          const k0 = l.get(prim[0].toLowerCase()) || "WBS 미지정";
          const k1 = l.get(prim[1].toLowerCase()) || "Level 미지정";
          const k2 = l.get(prim[2].toLowerCase()) || "Zone 미지정";
          const nm = l.get('name');
          const fam = (nm ? String(nm).replace(/\s*\[[^\]]*\]\s*$/, '').trim() : '') || "Family 미지정";
          const typ = l.get('유형 이름') || l.get('type name') || "Type 미지정";
          pathMap.set(`${urn}:${id}`, [k0, k1, k2, fam, typ].map(N).join(' - '));
        }
      }
    }
  };

  return { provider };
}
