// /wwwroot/js/sidebar/task-wbs/helpers.js
// task-wbs 공통 유틸(ESC, 날짜계산, 하이라이트, 등)

// 내부 유틸
function isLeaf(node) {
    return !(node.hasChildren && node.hasChildren());
  }
  function liOf(node){
    const uid = node?._id ?? node?.id;
    return document.querySelector(`#wbs-group-list li[data-uid="${uid}"]`);
  }
  function stateFromFlags(st){
    if (!st) return "";
    if (st.C && !st.T && !st.D) return "C";
    if (!st.C && st.T && !st.D) return "T";
    if (!st.C && !st.T && st.D) return "D";
    if (!st.C && st.T && st.D)  return "TD";
    return "";
  }
  
  // ESC 선택 해제 게이트 (뷰어 상태 초기화는 막고, 트리 선택만 해제)
  window.__DISABLE_ESC_CLEAR = (window.__DISABLE_ESC_CLEAR ?? false);
  
  // 날짜 유틸
  function toUTCDate(yyyy_mm_dd) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyy_mm_dd)) return new Date('Invalid');
    const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  function fromUTCDate(date) {
    return date.toISOString().slice(0, 10);
  }
  
  // 날짜/소요시간 계산
  export function calcLeadtime(start, end) {
    if (start && end) {
      const s = toUTCDate(start), e = toUTCDate(end);
      if (!isNaN(s) && !isNaN(e)) {
        const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
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
  
  // ESC: 뷰어 상태 초기화는 막고(Task/WBS 선택만 해제)
  export function disableViewerEscReset(viewer) {
    try {
      if (!viewer) return;
  
      if (!viewer.__escToolInstalled && viewer.toolController) {
        const EscBlockerTool = {
          getNames() { return ['esc-blocker']; },
          getName()  { return 'esc-blocker'; },
          handleKeyDown(ev) {
            const k = ev?.key || ev?.code;
            if (k === 'Escape' || ev?.keyCode === 27) {
              ev?.stopPropagation?.(); ev?.preventDefault?.();
              return true;
            }
            return false;
          },
          handleKeyUp(ev) {
            const k = ev?.key || ev?.code;
            if (k === 'Escape' || ev?.keyCode === 27) {
              ev?.stopPropagation?.(); ev?.preventDefault?.();
              return true;
            }
            return false;
          },
        };
        viewer.toolController.registerTool(EscBlockerTool);
        viewer.toolController.activateTool('esc-blocker');
        viewer.__escToolInstalled = true;
      }
  
      const container = viewer.container || document.querySelector('#forgeViewerMount, #viewer-host');
      const guard = (e) => {
        const t = e.target, tag = (t && t.tagName) || '';
        const isForm = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable;
        if (isForm) return;
  
        const inViewer = container && (container.contains(e.target) || container.contains(document.activeElement));
        if (!inViewer) return;
        if (e.key === 'Escape' || e.keyCode === 27) {
          e.stopImmediatePropagation(); e.preventDefault();
        }
      };
      if (!viewer.__escCaptureBound) {
        window.addEventListener('keydown', guard, true);
        document.addEventListener('keydown', guard, true);
        container && container.addEventListener('keydown', guard, true);
        viewer.__escCaptureBound = true;
      }
    } catch (e) {
      console.warn('[ESC block] failed:', e);
    }
  }
  
  // 소요/날짜 재계산
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
    if (isLeaf(node)) recalcLeadtimeFields(node);
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
  
  // ESC로 Task/WBS 선택만 해제
  let __escBound = false;
  export function setupPanel2Helpers(taskTree, wbsTree, taskData) {
    if (!__escBound && !window.__DISABLE_ESC_CLEAR) {
      __escBound = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (document.activeElement?.classList?.contains("datepicker-input")) return;
          if (window.taskTree) window.taskTree.visit(node => node.setActive(false));
          if (window.wbsTree?.selected) window.wbsTree.selected().forEach(n => n.deselect());
        }
      });
    }
  
    // dnd 이후 동기화 지점(필요 시)
    if (taskTree?.getRootNode) {
      taskTree.$div.on("fancytreeDrop", function(/*event, data*/){
        // TODO: 필요시 데이터 동기화
      });
    }
  }
  
  // 달력/입력 보조
  export const calendarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" class="calendar-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  `;
  export function showMaskedDateInput($container, oldValue, onConfirm) {
    const prevHtml = $container.html();
    const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">').val(oldValue || "");
    $container.empty().append($input);
    if (window.IMask) IMask($input[0], { mask: '0000-00-00', lazy: false, autofix: true });
    $input.on("keydown", ev => { if (ev.key === "Enter") $input.blur(); });
    $input.on("blur", () => {
      const val = $input.val();
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) onConfirm(val);
      setTimeout(() => $container.html(prevHtml), 100);
    });
  }
  export function showDatePickerInput($container, oldValue, onConfirm) {
    const prevHtml = $container.html();
    const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;">').val(oldValue || "");
    $container.empty().append($input);
  
    const defaultDate = (/^\d{4}-\d{2}-\d{2}$/.test(oldValue)) ? oldValue : "";
    const fp = flatpickr($input[0], {
      dateFormat: "Y-m-d",
      allowInput: false,
      clickOpens: true,
      defaultDate,
      onClose: function(_, dateStr) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) onConfirm(dateStr);
        setTimeout(() => $container.html(prevHtml), 100);
      }
    });
    setTimeout(() => fp.open(), 50);
  }
  
  // WBS 관련
  export function normalizeTaskCategory(val) {
    const s = String(val || "").trim();
    if (s === "시공") return "C";
    if (s === "가설") return "T";
    if (s === "철거") return "D";
    return "";
  }
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
  
  // 부분 칠하기
  export function applyHighlightForSubtree(node, catMap){
    if (!node) return "";
    const CUR_URN = window.CURRENT_MODEL_URN || "";
  
    const paint = (n, state) => {
      const li = liOf(n);
      if (!li) return;
      li.classList.remove("wbs-c","wbs-blue","wbs-td");
      if (state === "C")       li.classList.add("wbs-c");
      else if (state === "TD") li.classList.add("wbs-td");
      else if (state === "T" || state === "D") li.classList.add("wbs-blue");
    };
  
    function dfs(n){
      if (!(n.hasChildren && n.hasChildren())) {
        const key = `${String(n.urn || CUR_URN)}::${String(n.dbId)}`;
        const st = stateFromFlags(catMap.get(key));
        paint(n, st);
        return st;
      }
      let first = null;
      for (const ch of (n.children || [])) {
        const s = dfs(ch);
        if (!s) { first = ""; break; }
        if (first == null) first = s;
        else if (first !== s) { first = ""; break; }
      }
      if (first) paint(n, first); else paint(n, "");
      return first || "";
    }
  
    return dfs(node);
  }
  
  // 전면 칠하기
  export function updateWBSHighlight() {
    const catMap = buildCatMapFromTasks();
    window.__WBS_CATMAP = catMap;
  
    const tree = window.wbsTree;
    if (!tree?.nodes) return;
    const roots = tree.nodes();
    let i = 0;
  
    function chunk(deadline){
      let iter = 0;
      while (i < roots.length && (!deadline || deadline.timeRemaining() > 3) && iter < 50) {
        applyHighlightForSubtree(roots[i++], catMap);
        iter++;
      }
      if (i < roots.length) {
        if (typeof requestIdleCallback === 'function') requestIdleCallback(chunk, { timeout: 50 });
        else setTimeout(chunk, 0);
      }
    }
    if (typeof requestIdleCallback === 'function') requestIdleCallback(chunk, { timeout: 50 });
    else setTimeout(chunk, 0);
  }
  
  // 선택/체크에 반응 X, 확장/축소 때만 부분 칠하기(옵션)
  export function attachWbsTreeHighlightEvents(wbsTree, opts = {}) {
    const { includeExpand = false } = opts;
    if (!includeExpand) return;
    const safeIdle = (cb) => (typeof requestIdleCallback === 'function')
      ? requestIdleCallback(cb, { timeout: 60 })
      : setTimeout(cb, 0);
  
    wbsTree.on('node.expanded',  n => safeIdle(() => {
      const map = window.__WBS_CATMAP || buildCatMapFromTasks();
      applyHighlightForSubtree(n, map);
    }));
    wbsTree.on('node.collapsed', n => safeIdle(() => {
      const map = window.__WBS_CATMAP || buildCatMapFromTasks();
      applyHighlightForSubtree(n, map);
    }));
  }
  
  // Task 집계 (부모로 객체 합산)
  export function aggregateTaskFields(node) {
    let objects = (node.data.linkedObjects || []).slice();
    if (node.hasChildren && node.hasChildren()) {
      (node.children || []).forEach(child => { objects = objects.concat(aggregateTaskFields(child).objects); });
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
  
  // WBS leaf 조회 유틸
  export function getAllLeafNodes(tree) {
    const leaves = [];
    function walk(nodes) {
      (nodes || []).forEach(n => {
        if (n.hasChildren && n.hasChildren()) walk(n.children);
        else leaves.push(n);
      });
    }
    if (tree?.nodes) walk(tree.nodes());
    return leaves;
  }
  export function getAllLeavesOfNode(node) {
    const leaves = [];
    (function walk(n){
      if (n.hasChildren && n.hasChildren()) n.children.forEach(walk);
      else leaves.push(n);
    })(node);
    return leaves;
  }
  
  // 구분 전파/상속
  export function stripCountSuffix(s) {
    if (s == null) return s;
    return String(s).replace(/\s*(?:=>\s*)?\(\s*\d+\s*\)\s*$/,'').trim();
  }
  export function propagateCategoryDown(node, categoryLabel) {
    if (!node) return;
    node.data = node.data || {};
    node.data.selectedOption = categoryLabel;
    (node.children || []).forEach(ch => propagateCategoryDown(ch, categoryLabel));
  }
  export function enforceCategoryInheritance(tree) {
    if (!tree?.getRootNode) return;
    const root = tree.getRootNode();
    (root.children || []).forEach(top => {
      const cat = top?.data?.selectedOption || "시공";
      propagateCategoryDown(top, cat);
    });
  }
  