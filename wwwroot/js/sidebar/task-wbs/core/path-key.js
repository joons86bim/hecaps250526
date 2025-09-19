//wwwroot/js/sidebar/task-wbs/core/path-key.js

// 경로 직렬화/비교 유틸
const SEP = "¦";

export function normalizeLabel(s) {
  return String(s ?? "")
    .normalize("NFKC")
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toKey(pathArr = []) {
  return (pathArr || []).map(normalizeLabel).join(SEP);
}

export function fromKey(k = "") {
  if (!k) return [];
  return String(k).split(SEP).map(normalizeLabel);
}

export function startsWithKey(full, head) {
  if (!head) return true;
  if (full === head) return true;
  return full.startsWith(head + SEP);
}
