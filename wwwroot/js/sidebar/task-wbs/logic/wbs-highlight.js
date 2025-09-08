import { normalizeTaskCategory } from "../core/categories.js";

export function stateFromFlags(st){
  if (!st) return "";
  if (st.C && !st.T && !st.D) return "C";
  if (!st.C && st.T && !st.D) return "T";
  if (!st.C && !st.T && st.D) return "D";
  if (!st.C && st.T && st.D)  return "TD";
  return "";
}

// Task 트리로부터 urn:dbId -> {C,T,D} 맵 구성 (순수)
export function buildCatMapFromTasks() {
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  const map = new Map();
  const tree = window.taskTree;
  if (!tree?.getRootNode) return map;
  tree.getRootNode().visit(n => {
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
    }
  });
  return map;
}

// 서브트리 상태 계산: 리프 상태가 모두 동일하면 그 상태 반환, 아니면 ""
export function computeUniformStateForSubtree(node, catMap) {
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  function dfs(n){
    if (!(n.hasChildren && n.hasChildren())) {
      const key = `${String(n.urn || CUR_URN)}::${String(n.dbId)}`;
      return stateFromFlags(catMap.get(key));
    }
    let first = null;
    for (const ch of (n.children || [])) {
      const s = dfs(ch);
      if (!s) return "";
      if (first == null) first = s;
      else if (first !== s) return "";
    }
    return first || "";
  }
  return dfs(node);
}
