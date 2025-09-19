// /wwwroot/js/sidebar/task-wbs/core/date-helpers.js

function toUTCDate(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd||"")) return new Date('Invalid');
  const [y,m,d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m-1, d));
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
    const s = toUTCDate(start);
    const lt = Number(leadtime);
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
    const e = toUTCDate(end);
    const lt = Number(leadtime);
    if (!isNaN(e) && lt > 0) {
      const s = new Date(e.getTime());
      s.setUTCDate(s.getUTCDate() - lt + 1);
      return fromUTCDate(s);
    }
  }
  return "";
}

export function recalcLeadtimeFields(node, changedField, popupCallback) {
  node.data = node.data || {};
  let { start, end, leadtime } = node.data;
  const has = v => v !== undefined && v !== null && v !== "";
  const cnt = (has(start)?1:0) + (has(end)?1:0) + (has(leadtime)?1:0);

  if (cnt === 2) {
    if (has(start) && has(leadtime) && !has(end)) node.data.end = calcEnd(start, leadtime);
    else if (has(start) && has(end) && !has(leadtime)) node.data.leadtime = calcLeadtime(start, end);
    else if (has(end) && has(leadtime) && !has(start)) node.data.start = calcStart(end, leadtime);
    return;
  }
  if (cnt === 3 && changedField) {
    if (changedField === "leadtime" && typeof popupCallback === "function") {
      popupCallback((updateField) => {
        start = node.data.start; end = node.data.end; leadtime = node.data.leadtime;
        if (updateField === "start") node.data.start = calcStart(end, leadtime);
        else if (updateField === "end") node.data.end = calcEnd(start, leadtime);
      });
    } else if (changedField === "start" || changedField === "end") {
      node.data.leadtime = calcLeadtime(node.data.start, node.data.end);
    }
  }
}

export function recalcLeadtimeDescendants(node) {
  if (!(node.hasChildren && node.hasChildren())) recalcLeadtimeFields(node);
  else (node.children || []).forEach(recalcLeadtimeDescendants);
}

export function recalcLeadtimeAncestors(node) {
  if (!node.parent) return;
  const p = node.parent, children = p.children || [];
  if (!children.length) return;
  let minStart = "", maxEnd = "";
  for (const c of children) {
    const cs = c.data && c.data.start || "";
    const ce = c.data && c.data.end   || "";
    if (cs) minStart = (!minStart || cs < minStart) ? cs : minStart;
    if (ce) maxEnd   = (!maxEnd   || ce > maxEnd)   ? ce : maxEnd;
  }
  p.data = p.data || {};
  p.data.start = minStart || "";
  p.data.end   = maxEnd   || "";
  p.data.leadtime = (p.data.start && p.data.end) ? calcLeadtime(p.data.start, p.data.end) : "";
  recalcLeadtimeAncestors(p);
}

export function recalcAllLeadtime(tree) {
  if (!tree?.getRootNode) return;
  const roots = tree.getRootNode().children || [];
  function dfs(node) {
    if (!node) return { start: "", end: "" };
    if (!node.hasChildren || !node.hasChildren()) {
      recalcLeadtimeFields(node);
      return { start: node.data?.start || "", end: node.data?.end || "" };
    }
    let minStart = "", maxEnd = "";
    for (const c of (node.children || [])) {
      const agg = dfs(c);
      if (agg.start) minStart = (!minStart || agg.start < minStart) ? agg.start : minStart;
      if (agg.end)   maxEnd   = (!maxEnd   || agg.end   > maxEnd)   ? agg.end   : maxEnd;
    }
    node.data = node.data || {};
    node.data.start = minStart || "";
    node.data.end   = maxEnd   || "";
    node.data.leadtime = (node.data.start && node.data.end) ? calcLeadtime(node.data.start, node.data.end) : "";
    return { start: node.data.start, end: node.data.end };
  }
  for (const n of roots) dfs(n);
}
