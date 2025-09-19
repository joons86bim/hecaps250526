// /wwwroot/js/sidebar/task-wbs/core/element-id.js

// 전역 캐시: dbId -> elementId
const ELID = (window.__ELID_INDEX = window.__ELID_INDEX || new Map());

// 후보 Property 이름(모델별 편차 흡수)
const CANDIDATE_PROPS = [
  "Element Id", "ElementId", "Element ID", "요소 ID",
  "element id", "elementId",
  "ExternalId", "externalId"
];

// 내부: bulk로 받아 캐시 채움
async function bulkFill(dbIds) {
  const viewer = window.viewer;
  const model  = viewer?.model;
  if (!model || !dbIds?.length) return;

  const need = Array.from(new Set(dbIds.map(Number))).filter(id => !ELID.has(id));
  if (!need.length) return;

  await new Promise((resolve) => {
    try {
      model.getBulkProperties(
        need,
        { propFilter: CANDIDATE_PROPS },
        (results) => {
          try {
            results.forEach(r => {
              const dbId = Number(r.dbId);
              if (!r?.properties) return;
              let elid = null;
              for (const p of r.properties) {
                const name = String(p.displayName || p.attributeName || p.name || "");
                if (CANDIDATE_PROPS.includes(name)) {
                  elid = String(p.displayValue ?? p.value ?? "");
                  if (elid) break;
                }
              }
              if (elid) ELID.set(dbId, elid);
            });
          } finally { resolve(); }
        },
        () => resolve()
      );
    } catch { resolve(); }
  });

  // 폴백 1: externalId 매핑
  let still = need.filter(id => !ELID.has(id));
  if (still.length) {
    await new Promise((resolve) => {
      try {
        model.getExternalIdMapping((mapping) => {
          try {
            const reverse = new Map();
            Object.keys(mapping || {}).forEach(extId => {
              const d = Number(mapping[extId]);
              if (still.includes(d)) reverse.set(d, extId);
            });
            reverse.forEach((extId, d) => ELID.set(d, String(extId)));
          } finally { resolve(); }
        });
      } catch { resolve(); }
    });
  }

  // 폴백 2: 인스턴스 트리 이름의 [숫자] 추출 (예: "패밀리 [123456]")
  still = need.filter(id => !ELID.has(id));
  if (still.length) {
    try {
      const it = model.getData?.()?.instanceTree;
      if (it) {
        still.forEach(d => {
          try {
            const nm = it.getNodeName ? it.getNodeName(d) : "";
            const m = /\[(\d+)\]\s*$/.exec(String(nm || ""));
            if (m && m[1]) ELID.set(d, m[1]);
          } catch {}
        });
      }
    } catch {}
  }
}

// 외부: 여러 개 한꺼번에 준비
export async function ensureElementIdIndexForDbIds(dbIds = []) {
  await bulkFill(dbIds);
}

// 외부: 즉시 조회(캐시에 없으면 null)
export function getElementIdFor(urn, dbId) {
  return ELID.get(Number(dbId)) || null;
}

// 외부: 어디서든 표기를 통일
export function formatObjectLabel(o) {
  const id = o?.elementId ?? getElementIdFor(o?.urn, o?.dbId);
  return id ? `[${id}]` : `[${o?.dbId}]`;
}
