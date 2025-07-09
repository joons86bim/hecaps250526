export async function buildWbsTreeData(viewer) {

  const urn = window.CURRENT_MODEL_URN || "unknown_urn";
  console.log("[buildWbsTreeData] 실행!");
  console.log("viewer.getVisibleModels:", viewer.getVisibleModels ? viewer.getVisibleModels() : viewer.model);
  console.log("getVisibleDbIds:", typeof viewer.getVisibleDbIds);

  let models = viewer.getVisibleModels
    ? viewer.getVisibleModels()
    : [viewer.model];
  if (!models || models.length === 0) return [];

  let allProps = [];
  for (const model of models) {
    const data = model.getData && model.getData();
    if (!data || !data.instanceTree) continue;
    const instanceTree = data.instanceTree;

    // 1. 화면상에 보이는 dbId만 추출
    let visibleDbIds = [];
    if (typeof viewer.getVisibleDbIds === "function") {
      visibleDbIds = viewer.getVisibleDbIds(model);
    } else if (typeof model.getVisibleDbIds === "function") {
      visibleDbIds = model.getVisibleDbIds();
    } else {
      // fallback: 전체 dbId
      const rootId = instanceTree.getRootId();
      (function collectDbIds(dbId) {
        visibleDbIds.push(dbId);
        instanceTree.enumNodeChildren(dbId, collectDbIds);
      })(rootId);
    }

    // 2. bulk properties
    const props = await new Promise((resolve, reject) => {
      model.getBulkProperties(
        visibleDbIds,
        [
          "HEC.WBS",
          "HEC.Level",
          "name",
          "Name",
          "number",
          "Number",
          "명칭",
          "번호",
        ],
        (results) => {
          // ★★★ 콘솔 구조 확인 추가 (여기부터)
          //   console.log("== getBulkProperties results ==");
          //   console.log(results);
          //   if (results.length > 0) {
          //     console.log("== 첫번째 객체 ==");
          //     console.log(results[0]);
          //     if (results[0].properties) {
          //       console.log("== 첫번째 객체 properties ==");
          //       console.log(results[0].properties);
          //     }
          //   }
          // ★★★ 콘솔 구조 확인 추가 (여기까지)
          console.log("getBulkProperties results", results);
          resolve(results);
        },
        (err) => reject(err)
      );
    });

    for (const obj of props) obj.modelId = model.id || model.modelId || null;
    allProps = allProps.concat(props);
  }

  // 3. 그룹핑/키명 처리
  const wbsMap = {};
  for (const obj of allProps) {
    // 1. WBS, Level
    let wbs = "WBS 미지정";
    let level = "Level 미지정";
    if (Array.isArray(obj.properties)) {
      for (const prop of obj.properties) {
        if (prop.displayName === "HEC.WBS" && prop.displayValue)
          wbs = prop.displayValue;
        if (prop.displayName === "HEC.Level" && prop.displayValue)
          level = prop.displayValue;
      }
    }

    // 2. 이름 파싱: 대괄호 포함부분 제거
    let name = obj.name || "";
    name = name.replace(/\s*\[[^\]]*\]/g, "").trim();

    if (!wbsMap[wbs]) wbsMap[wbs] = {};
    if (!wbsMap[wbs][level]) wbsMap[wbs][level] = [];
    wbsMap[wbs][level].push({
      dbId: obj.dbId,
      modelId: obj.modelId,
      name, // [ ] 제거된 이름
    });
  }

  // 4. 트리 변환
  const wbsTreeData = Object.entries(wbsMap)
    .sort(([a], [b]) => {
      if (a === "WBS 미지정") return 1;
      if (b === "WBS 미지정") return -1;
      return a.localeCompare(b, "ko");
    })
    .map(([wbs, levels]) => ({
      id: `${urn}::${wbs}`,
      text: wbs,
      urn,
      children: Object.entries(levels)
        .sort(([a], [b]) => {
          if (a === "Level 미지정") return 1;
          if (b === "Level 미지정") return -1;
          return a.localeCompare(b, "ko");
        })
        .map(([level, objs]) => ({
          id: `${urn}::${wbs}::${level}`,
          text: level,
          urn,
          children: objs.map((obj) => ({
            id: `${urn}::${obj.dbId}`,
            text: `${obj.name || ""} [${obj.dbId}]`, // ★ 실제 dbId만 출력
            dbId: obj.dbId,
            urn,
          })),
        })),
    }));

  //   console.log("== 최종 wbsTreeData ==", JSON.stringify(wbsTreeData, null, 2));
  return wbsTreeData;
}
