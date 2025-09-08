export function aggKey(o){
  if (!o || o.dbId == null) return null;
  const urn = String(o.urn || window.CURRENT_MODEL_URN || "");
  return `${urn}::${String(o.dbId)}`;
}
// 부분 재계산: 아래로
export function recomputeAggDown(n) {
  if (!n) return new Set();
  const set = new Set();
  const arr = (n.data && Array.isArray(n.data.linkedObjects)) ? n.data.linkedObjects : [];
  for (const o of arr) { const k = aggKey(o); if (k) set.add(k); }
  if (n.children && n.children.length) {
    for (const c of n.children) { const cs = recomputeAggDown(c); cs.forEach(k => set.add(k)); }
  }
  n.data._aggSet = set;
  n.data._aggObjCount = set.size;
  return set;
}
// 부분 재계산: 위로
export function recomputeAggUp(from) {
  let cur = from;
  while (cur && cur.parent) {
    cur = cur.parent;
    if (cur.isRoot && cur.isRoot()) break;
    const set = new Set();
    const arr = (cur.data && Array.isArray(cur.data.linkedObjects)) ? cur.data.linkedObjects : [];
    for (const o of arr) { const k = aggKey(o); if (k) set.add(k); }
    if (cur.children && cur.children.length) {
      for (const ch of cur.children) {
        const cs = ch.data && ch.data._aggSet;
        if (cs) cs.forEach(k => set.add(k));
      }
    }
    cur.data._aggSet = set;
    cur.data._aggObjCount = set.size;
  }
}
// 전체 재계산: 초기/대규모 변경
export function recomputeAggObjects(tree) {
  if (!tree?.getRootNode) return;
  const roots = tree.getRootNode().children || [];
  function walk(node){
    const own = new Set();
    const arr = (node.data && Array.isArray(node.data.linkedObjects)) ? node.data.linkedObjects : [];
    for (const o of arr) { const k = aggKey(o); if (k) own.add(k); }
    if (node.children && node.children.length) {
      for (const c of node.children) { const cs = walk(c); cs.forEach(k => own.add(k)); }
    }
    node.data._aggSet = own;
    node.data._aggObjCount = own.size;
    return own;
  }
  for (const n of roots) walk(n);
}
