// /wwwroot/js/sidebar/task-wbs/logic/task-aggregate.js
// 연결 객체 수 집계: (자기 + 하위) linkedObjects를 모아 중복 제거하여 반환

/**
 * 특정 Task 노드 기준으로 (자신 + 하위) 연결 객체를 합산하여 반환합니다.
 * - 동일 (urn, dbId) 객체는 중복 제거됩니다.
 * - 날짜/리드타임 원본값은 그대로 전달합니다.
 * @param {FancytreeNode} node
 * @returns {{ start:string, end:string, leadtime:number|string, objects:Array<{urn:string, dbId:number, text?:string}> }}
 */

export function aggregateTaskFields(node) {
  let objects = (node?.data?.linkedObjects || []).slice();

  if (node?.hasChildren && node.hasChildren()) {
    (node.children || []).forEach(child => {
      const childAgg = aggregateTaskFields(child);
      objects = objects.concat(childAgg.objects);
    });
  }

  // urn::dbId 단위로 중복 제거
  const seen = new Set();
  objects = objects.filter(obj => {
    const key = `${obj.urn || ""}::${obj.dbId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    start: node?.data?.start || "",
    end: node?.data?.end || "",
    leadtime: node?.data?.leadtime || "",
    objects
  };
}
