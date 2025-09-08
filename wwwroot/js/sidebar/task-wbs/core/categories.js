export function normalizeTaskCategory(val) {
  const s = String(val || "").trim();
  if (s === "시공") return "C";
  if (s === "가설") return "T";
  if (s === "철거") return "D";
  return "";
}
// "이름 (123)" 꼬리 제거
export function stripCountSuffix(s) {
  if (s == null) return s;
  return String(s).replace(/\s*(?:=>\s*)?\(\s*\d+\s*\)\s*$/,'').trim();
}
// 구분 하향 전파
export function propagateCategoryDown(node, categoryLabel) {
  if (!node) return;
  node.data = node.data || {};
  node.data.selectedOption = categoryLabel;
  (node.children || []).forEach(ch => propagateCategoryDown(ch, categoryLabel));
}
// 트리 전체 상속
export function enforceCategoryInheritance(tree) {
  if (!tree?.getRootNode) return;
  const root = tree.getRootNode();
  (root.children || []).forEach(top => {
    const cat = top?.data?.selectedOption || "시공";
    propagateCategoryDown(top, cat);
  });
}
