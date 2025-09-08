// Task 노드 → (자기+하위) 연결객체 집계 (중복 제거)
export function aggregateTaskFields(node) {
  let objects = (node.data.linkedObjects || []).slice();
  if (node.hasChildren && node.hasChildren()) {
    (node.children || []).forEach(child => {
      objects = objects.concat(aggregateTaskFields(child).objects);
    });
  }
  const seen = new Set();
  objects = objects.filter(obj => {
    const key = (obj.urn || "") + "::" + obj.dbId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    start: node.data.start || "",
    end: node.data.end || "",
    leadtime: node.data.leadtime || "",
    objects
  };
}
