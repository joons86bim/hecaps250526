// 날짜/리드타임 계산 (UTC 고정)
function toUTCDate(yyyy_mm_dd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyy_mm_dd)) return new Date('Invalid');
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function fromUTCDate(date) {
  return date.toISOString().slice(0, 10);
}
export function calcLeadtime(start, end) {
  if (start && end) {
    const s = toUTCDate(start), e = toUTCDate(end);
    if (!isNaN(s) && !isNaN(e)) {
      const diffDays = Math.round((e - s) / 86400000) + 1;
      return diffDays > 0 ? diffDays : "";
    }
  }
  return "";
}
export function calcEnd(start, leadtime) {
  if (start && leadtime) {
    const s = toUTCDate(start), lt = Number(leadtime);
    if (!isNaN(s) && lt > 0) {
      const e = new Date(s.getTime());
      e.setUTCDate(e.getUTCDate() + lt - 1);
      return fromUTCDate(e);
    }
  }
  return "";
}
export function calcStart(end, leadtime) {
  if (end && leadtime) {
    const e = toUTCDate(end), lt = Number(leadtime);
    if (!isNaN(e) && lt > 0) {
      const s = new Date(e.getTime());
      s.setUTCDate(s.getUTCDate() - lt + 1);
      return fromUTCDate(s);
    }
  }
  return "";
}
