// /wwwroot/js/sidebar/task-wbs/panel.js
import { setSavedTaskData } from "./buttons.js"; // flush에서 참조되는 전역 메모 저장
import {
  setupPanel2Helpers,
  showDatePickerInput,
  calendarSvg,
  aggregateTaskFields,
  updateWBSHighlight,
  recalcAllLeadtime,
  recalcLeadtimeFields,
  recalcLeadtimeAncestors,
  recalcLeadtimeDescendants,
  stripCountSuffix,
  normalizeTaskCategory,
  propagateCategoryDown,
  enforceCategoryInheritance,
  buildCatMapFromTasks,
  applyHighlightForSubtree,
} from "./helpers.js";

export let taskTree, wbsTree;

// idle helper
function idleCall(cb, timeout = 60) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => cb(), { timeout });
  } else {
    setTimeout(cb, timeout);
  }
}
window.__ALLOW_WBS_UPDATE = window.__ALLOW_WBS_UPDATE ?? false;

// 간트 스로틀/배치
const lazyGantt = (typeof _ !== "undefined" && _.throttle)
  ? _.throttle(() => { try { window.gantt?.renderFromTrees(taskTree, wbsTree); } catch(_){} }, 250)
  : () => { try { window.gantt?.renderFromTrees(taskTree, wbsTree); } catch(_){} };

let __pending = false;
let __taskDataRef = null;

// 연결 객체 수 집계
function aggKey(o){
  if (!o || o.dbId == null) return null;
  const urn = String(o.urn || window.CURRENT_MODEL_URN || "");
  return `${urn}::${String(o.dbId)}`;
}
function recomputeAggDown(n) {
  if (!n) return new Set();
  const set = new Set();
  const arr = (n.data && Array.isArray(n.data.linkedObjects)) ? n.data.linkedObjects : [];
  for (const o of arr) { const k = aggKey(o); if (k) set.add(k); }
  if (n.children && n.children.length) {
    for (const c of n.children) { const cs = recomputeAggDown(c); cs.forEach(k => set.add(k)); }
  }
  n.data._aggSet = set;
  n.data._aggObjCount = set.size;
  return set;
}
function recomputeAggUp(from) {
  let cur = from;
  while (cur && cur.parent) {
    cur = cur.parent;
    if (cur.isRoot && cur.isRoot()) break;
    const set = new Set();
    const arr = (cur.data && Array.isArray(cur.data.linkedObjects)) ? cur.data.linkedObjects : [];
    for (const o of arr) { const k = aggKey(o); if (k) set.add(k); }
    if (cur.children && cur.children.length) {
      for (const ch of cur.children) {
        const cs = ch.data && ch.data._aggSet;
        if (cs) cs.forEach(k => set.add(k));
      }
    }
    cur.data._aggSet = set;
    cur.data._aggObjCount = set.size;
  }
}
function recomputeAggObjects(tree) {
  if (!tree?.getRootNode) return;
  const roots = tree.getRootNode().children || [];
  function walk(node){
    const own = new Set();
    const arr = (node.data && Array.isArray(node.data.linkedObjects)) ? node.data.linkedObjects : [];
    for (const o of arr) { const k = aggKey(o); if (k) own.add(k); }
    if (node.children && node.children.length) {
      for (const c of node.children) { const cs = walk(c); cs.forEach(k => own.add(k)); }
    }
    node.data._aggSet = own;
    node.data._aggObjCount = own.size;
    return own;
  }
  for (const n of roots) walk(n);
}

// 배치 플러시
function scheduleFlush({ full = false } = {}) {
  if (__pending) return;
  __pending = true;
  requestAnimationFrame(() => {
    try {
      if (full) recomputeAggObjects(taskTree);
      if (__taskDataRef) setSavedTaskData(__taskDataRef);
    } finally {
      __pending = false;
    }
  });
  lazyGantt();
}
window.requestTaskTreeFlush = () => scheduleFlush();
window.requestTaskRecalcAndFlush = function () {
  if (!taskTree) return;
  recalcAllLeadtime(taskTree);
  scheduleFlush({ full: true });
};

// 커밋
function commit(node, patch, changedField, adjustTarget) {
  if (!node?.data) return;
  if (typeof patch === "function") patch(node.data);
  else if (patch && typeof patch === "object") Object.assign(node.data, patch);

  recalcLeadtimeFields(node, changedField, adjustTarget);
  recalcLeadtimeDescendants(node);
  recalcLeadtimeAncestors(node);

  const isDate = (changedField === "start" || changedField === "end" || changedField === "leadtime");
  if (!isDate) { recomputeAggDown(node); recomputeAggUp(node); }

  node.render();
  scheduleFlush();
}

// DOM helpers for InspireTreeDOM
function liFor(node){
  const uid = node?._id ?? node?.id;
  return document.querySelector(`#wbs-group-list li[data-uid="${uid}"]`);
}
function rowFor(node){
  const li = liFor(node);
  return li?.querySelector(':scope > .title-wrap') || li;
}

// 아이콘
const ICONS = {
  eye: `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,
  eyeOff: `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="m3 3 18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42"></path>
    <path d="M9.88 5.11A10.94 10.94 0 0 1 12 5c6 0 10 7 10 7a17.49 17.49 0 0 1-3.64 4.9"></path>
    <path d="M6.1 6.1C3.43 7.94 2 12 2 12a17.47 17.47 0 0 0 7.5 7.5"></path>
  </svg>`
};

// 전면 하이라이트 트리거(필요시만)
const requestWbsHighlight = (typeof _ !== "undefined" && _.throttle)
  ? _.throttle(() => { if (window.__ALLOW_WBS_UPDATE) updateWBSHighlight(); }, 120)
  : () => { if (window.__ALLOW_WBS_UPDATE) updateWBSHighlight(); };
window.requestWbsHighlight = requestWbsHighlight;

// 공개 API
export function initPanel2Content(taskData, wbsData) {
  __taskDataRef = taskData;

  // Task 트리(Fancytree + Table)
  $("#treegrid").fancytree({
    extensions: ["table", "gridnav"],
    checkbox: false,
    selectMode: 2,
    table: { indentation: 20, nodeColumnIdx: 2 },
    source: taskData,
    init: function (event, data) {
      recalcAllLeadtime(data.tree);
      try { recomputeAggObjects(data.tree); } catch(e){}
      data.tree.render(true, true);
      enforceCategoryInheritance(data.tree);
      setTimeout(() => scheduleFlush(), 0);
    },
    renderColumns: function (event, data) {
      const node = data.node;
      const $tdList = $(node.tr).find(">td");
      const isTop = (typeof node.getLevel === "function") ? node.getLevel() === 1 : (node.parent?.isRoot?.() === true);

      $tdList.eq(0).text(node.data.no || "");
      $tdList.eq(1).html(
        `<select class="treegrid-dropdown" ${isTop ? "" : "disabled"} style="width:100%;box-sizing:border-box;height:28px;">
          ${node.data.selectOptions.map(opt => `<option${opt === node.data.selectedOption ? " selected" : ""}>${opt}</option>`).join("")}
        </select>`
      );
      $tdList.eq(2).find(".fancytree-title").text(node.data.title || node.title || "");
      $tdList.eq(3).text(node.data.start || "").addClass("text-center");
      $tdList.eq(4).text(node.data.leadtime || "").addClass("text-center");
      $tdList.eq(5).text(node.data.end || "").addClass("text-center");

      const objCount = Number(node.data._aggObjCount || 0);
      $tdList.eq(6)
        .text(objCount || "")
        .addClass("text-center objcount")
        .removeClass("highlight objcount--c objcount--t objcount--d")
        .each(function(){
          if (!objCount) return;
          const cat = normalizeTaskCategory(node.data?.selectedOption);
          if (cat === "C") $(this).addClass("objcount--c");
          else if (cat === "T") $(this).addClass("objcount--t");
          else if (cat === "D") $(this).addClass("objcount--d");
        });
    }
  });

  taskTree = $.ui.fancytree.getTree("#treegrid");
  window.taskTree = taskTree;

  // WBS 트리(InspireTree + DOM)
  const wbsContainer = document.getElementById("wbs-group-content");
  if (wbsContainer) {
    wbsContainer.innerHTML = `<div id="wbs-group-list"></div>`;

    function toInspireNodes(arr, parentName) {
      return (arr || []).map(n => {
        const isLeaf = (typeof n.dbId === "number");
        const parentClean = stripCountSuffix(parentName || "");
        const children = toInspireNodes(n.children, n.text);

        const leafCount = isLeaf
          ? 1
          : children.reduce((acc, ch) => acc + (ch.leafCount || 0), 0);

        return {
          id: n.id,
          urn: isLeaf ? window.CURRENT_MODEL_URN : undefined,
          dbId: isLeaf ? n.dbId : undefined,
          text: stripCountSuffix(n.text),
          objName: isLeaf
            ? ((String(n.text) === String(n.dbId)) ? (parentClean || stripCountSuffix(n.text)) : stripCountSuffix(n.text))
            : undefined,
          children,
          leafCount
        };
      });
    }

    const wbsNodes = toInspireNodes(wbsData, undefined);
    wbsTree = new window.InspireTree({
      data: wbsNodes,
      selection: { multi: true, mode: "simple", autoSelectChildren: false, autoDselectChildren: false, require: false, autoSelectParents: false }
    });
    window.wbsTree = wbsTree;

    new window.InspireTreeDOM(wbsTree, { target: "#wbs-group-list", showCheckboxes: true, dragAndDrop: { enabled: false } });

    // 👁 가시성(눈 아이콘) 모듈 — diff 토글 + RAF 청크
    const WBS_VIS = (function(){
      const hidden = new Set(); // `${urn}:${dbId}`
      const URN = window.CURRENT_MODEL_URN || "";
      const k = (id) => `${URN}:${id}`;

      // 서브트리 leaf dbId 캐시
      function getDescLeafDbIdsCached(node){
        if (Array.isArray(node._descLeafIds)) return node._descLeafIds;
        const list = [];
        (function walk(n){
          if (n.hasChildren && n.hasChildren()) n.children.forEach(walk);
          else if (typeof n.dbId === 'number') list.push(n.dbId);
        })(node);
        node._descLeafIds = list;
        return list;
      }

      // 빠른 hide/show 결정
      function decideHideFast(node){
        const ids = getDescLeafDbIdsCached(node);
        if (!ids.length) return { hide:false, ids };
        for (let i = 0; i < ids.length; i++){
          if (!hidden.has(k(ids[i]))) {
            return { hide:true, ids };
          }
        }
        return { hide:false, ids };
      }

      // 실제 변경 필요한 ID만 추림
      function diffIdsForToggle(ids, hide){
        const out = [];
        if (hide) {
          for (let i = 0; i < ids.length; i++){
            if (!hidden.has(k(ids[i]))) out.push(ids[i]);
          }
        } else {
          for (let i = 0; i < ids.length; i++){
            if (hidden.has(k(ids[i]))) out.push(ids[i]);
          }
        }
        return out;
      }

      // RAF 청크 + invalidate 1회
      function applyVisibilityChunked(dbIds, hide){
        return new Promise((resolve) => {
          const viewer = window.viewer;
          if (!viewer || !dbIds?.length) return resolve();
          const model = (viewer.getVisibleModels && viewer.getVisibleModels()[0]) || viewer.model;

          const CHUNK = 3000;
          let i = 0;

          const oldCursor = document.body.style.cursor;
          document.body.style.cursor = 'progress';

          function step(){
            const slice = dbIds.slice(i, i + CHUNK);
            i += CHUNK;
            if (slice.length) {
              if (hide) viewer.hide(slice, model);
              else      viewer.show(slice, model);
            }
            if (i < dbIds.length) {
              requestAnimationFrame(step);
            } else {
              viewer.impl.invalidate(true, true, true);
              setTimeout(() => viewer.impl.sceneUpdated && viewer.impl.sceneUpdated(true), 0);
              document.body.style.cursor = oldCursor || '';
              resolve();
            }
          }
          requestAnimationFrame(step);
        });
      }

      let busy = false;

      async function toggleNode(node){
        if (busy) return;
        busy = true;
        try {
          const d = decideHideFast(node);
          const todo = diffIdsForToggle(d.ids, d.hide);
          if (!todo.length) {
            refreshIconFor(node);
            return;
          }

          await applyVisibilityChunked(todo, d.hide);

          if (d.hide) for (let i = 0; i < todo.length; i++) hidden.add(k(todo[i]));
          else        for (let i = 0; i < todo.length; i++) hidden.delete(k(todo[i]));

          refreshIconFor(node);
          if (node.hasChildren && node.hasChildren()) {
            (node.children || []).forEach(ch => {
              const li = document.querySelector(`#wbs-group-list li[data-uid="${ch._id ?? ch.id}"]`);
              if (li) refreshIconFor(ch);
            });
          }
        } finally {
          busy = false;
        }
      }

      // 버튼 DOM 보장 + 상태 반영
      function ensureEyeButton(node){
        const row = rowFor(node);
        if (!row) return;

        let btn = row.querySelector('.eye-toggle');
        if (!btn) {
          btn = document.createElement('span');
          btn.className = 'eye-toggle';
          btn.style.display = 'inline-flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          btn.style.marginLeft = 'auto';
          btn.style.cursor = 'pointer';
          btn.style.paddingLeft = '6px';
          btn.style.userSelect = 'none';
          btn.style.flex = '0 0 auto';
          row.appendChild(btn);
        }

        const ids = getDescLeafDbIdsCached(node);
        let seenHidden = false, seenVisible = false;
        for (let i = 0; i < ids.length; i++){
          if (hidden.has(k(ids[i]))) { seenHidden = true; }
          else { seenVisible = true; }
          if (seenHidden && seenVisible) break;
        }
        const state = (seenHidden && seenVisible) ? 'mixed' : (seenHidden ? 'hidden' : 'visible');
        btn.innerHTML = (state === 'hidden') ? ICONS.eyeOff : ICONS.eye;
        btn.title = (state === 'hidden') ? '보이기' : (state === 'mixed' ? '일부 숨김 - 클릭 시 모두 숨김' : '숨기기');
        btn.style.opacity = (state === 'hidden') ? '0.5' : (state === 'mixed' ? '0.85' : '1');
      }

      function refreshIconFor(node){ ensureEyeButton(node); }
      function resetAll(){
        const viewer = window.viewer;
        if (viewer) viewer.showAll();
        hidden.clear();
      }
      return { ensureEyeButton, refreshIconFor, resetAll, toggleNode };
    })();

    // 숫자 뱃지
    function ensureWbsCountBadge(node) {
      const row = rowFor(node);
      if (!row) return;

      let badge = row.querySelector('.count-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'count-badge';
        row.appendChild(badge);
      }
      const isLeaf = !(node.hasChildren && node.hasChildren());
      const count = isLeaf ? 0 : (node.leafCount || 0);
      badge.textContent = (!isLeaf && count > 1) ? String(count) : '';
    }

    function ensureWbsDecorations(node){
      ensureWbsCountBadge(node);
      try { WBS_VIS.ensureEyeButton(node); } catch(e) {}
    }

    // 초기 1회 전체 갱신
    function refreshWbsDecorationsInitialChunked() {
      if (!window.wbsTree) return;
      const nodes = window.wbsTree.nodes();
      let i = 0;
      function chunk(deadline){
        let iter = 0;
        while (i < nodes.length && (!deadline || deadline.timeRemaining() > 3) && iter < 400) {
          ensureWbsDecorations(nodes[i++]);
          iter++;
        }
        if (i < nodes.length) idleCall(chunk, 1);
      }
      idleCall(chunk, 1);
    }
    window.requestWbsInitialBadgeRefresh = refreshWbsDecorationsInitialChunked;
    requestAnimationFrame(() => refreshWbsDecorationsInitialChunked());

    // 렌더/확장/축소 시: 데코 + 부분 칠하기만
    window.wbsTree.on("node.rendered", (n) => requestAnimationFrame(() => {
      ensureWbsDecorations(n);
      try {
        const map = window.__WBS_CATMAP || buildCatMapFromTasks();
        applyHighlightForSubtree(n, map);
      } catch(e){}
    }));
    window.wbsTree.on("node.expanded", (n) => {
      ensureWbsDecorations(n);
      const kids = [...(n.children || [])];
      const map  = window.__WBS_CATMAP || buildCatMapFromTasks();
      function step(deadline){
        let k = 0;
        while (kids.length && (!deadline || deadline.timeRemaining() > 3) && k < 400) {
          try {
            ensureWbsDecorations(kids[0]);
            applyHighlightForSubtree(kids.shift(), map);
          } catch(e){}
          k++;
        }
        if (kids.length) idleCall(step, 1);
      }
      idleCall(step, 1);
    });
    window.wbsTree.on("node.collapsed", (n) => ensureWbsDecorations(n));

    // 체크박스 전파
    function cascadeCheck(node, checked) {
      if (!(node.hasChildren && node.hasChildren())) return;
      const q = [...node.children];
      function step(deadline){
        while (q.length && (!deadline || deadline.timeRemaining() > 2)) {
          const ch = q.shift();
          checked ? ch.check() : ch.uncheck();
          if (ch.hasChildren && ch.hasChildren()) q.push(...ch.children);
        }
        if (q.length) idleCall(step, 1);
      }
      idleCall(step, 1);
    }
    window.wbsTree.on("node.checked",   (n) => cascadeCheck(n, true));
    window.wbsTree.on("node.unchecked", (n) => cascadeCheck(n, false));

    // 경로맵 1회 캐시
    function buildWbsPathMapOnce() {
      const CUR_URN = window.CURRENT_MODEL_URN || "";
      const map = new Map();
      (function walk(nodes, ancestors){
        (nodes || []).forEach(n => {
          const nameClean = stripCountSuffix(n.text || "");
          const hasKids = n.hasChildren && n.hasChildren();
          const nextAnc = hasKids ? (nameClean ? [...ancestors, nameClean] : ancestors) : ancestors;
          if (hasKids) {
            walk(n.children, nextAnc);
          } else if (typeof n.dbId === "number") {
            const urn = n.urn || CUR_URN;
            map.set(`${urn}:${n.dbId}`, ancestors.join(" - "));
          }
        });
      })(wbsTree.nodes(), []);
      return map;
    }
    window.__WBS_PATHMAP = buildWbsPathMapOnce();

    // 👁 클릭 이벤트 위임
    const wbsListEl = document.getElementById('wbs-group-list');
    wbsListEl.addEventListener('click', async (ev) => {
      const btn = ev.target.closest('.eye-toggle');
      if (!btn) return;
      ev.stopPropagation();
      ev.preventDefault();
      const li = btn.closest('li[data-uid]');
      const uid = li && li.getAttribute('data-uid');
      const node = uid ? window.wbsTree.node(uid) : null;
      if (!node) return;
      btn.classList.add('busy');
      try { await WBS_VIS.toggleNode(node); }
      finally { btn.classList.remove('busy'); }
    }, { capture:false });
  }

  // 이벤트 바인딩(중복 방지)
  $("#treegrid")
    .off("dblclick", "td")
    .on("dblclick", "td", function(){
      const colIdx = this.cellIndex;
      const node = $.ui.fancytree.getNode(this);
      if (!node) return;

      if (colIdx === 0 || colIdx === 2) {
        const field = (colIdx === 0 ? "no" : "title");
        const label = (colIdx === 0 ? "No." : "작업명");
        const oldValue = (colIdx === 0 ? node.data.no : node.data.title) || "";
        const newValue = prompt(`${label} 값을 입력하세요:`, oldValue);
        if (newValue !== null && newValue !== oldValue) {
          commit(node, { [field]: newValue });
          if (field === "title") node.setTitle(newValue);
        }
        return;
      }

      if (!node.hasChildren() && (colIdx === 3 || colIdx === 4 || colIdx === 5)) {
        const $td = $(this);
        if ($td.find("input").length) return;
        if (colIdx === 4) openLeadtimeEditor($td, node);
        else openDateEditor($td, node, (colIdx === 3 ? "start" : "end"));
        return;
      }

      if (colIdx === 6) {
        const objs = aggregateTaskFields(node).objects;
        if (objs.length === 0) return alert("연결된 객체 없음");
        const CUR_URN = window.CURRENT_MODEL_URN || "";
        const pathMap = window.__WBS_PATHMAP || new Map();
        const lines = objs.map(o => {
          const urn = o.urn || CUR_URN;
          const key = `${urn}:${o.dbId}`;
          const fallback = stripCountSuffix(o.text || "");
          const path = pathMap.get(key) || fallback || "(이름없음)";
          return `${path} - [${o.dbId}]`;
        });
        alert(lines.join("\n"));
      }
    });

  // 구분 변경 때만 전면 하이라이트 1회 트리거
  $("#treegrid").on("change", ".treegrid-dropdown", function(){
    const $tr = $(this).closest("tr");
    const node = $.ui.fancytree.getNode($tr);
    const isTop = (typeof node.getLevel === "function") ? node.getLevel() === 1 : (node.parent?.isRoot?.() === true);
    if (!isTop) { this.value = node.data.selectedOption; return; }
    const newCat = this.value;
    propagateCategoryDown(node, newCat);
    node.tree.render(true, true);
    window.requestTaskTreeFlush?.();

    window.__ALLOW_WBS_UPDATE = true;
    window.requestWbsHighlight?.();
  });

  setupPanel2Helpers(taskTree, wbsTree, taskData);
}

// 편집 보조: 소요시간
function openLeadtimeEditor($td, node) {
  const field = "leadtime";
  const oldValue = node.data.leadtime || "";
  $td.empty();

  const $input = $('<input type="number" min="1" step="1" style="width:60px;text-align:center;">').val(oldValue);
  $td.append($input);
  $input.focus();

  function restoreCell() {
    setTimeout(() => $td.text(node.data[field] ?? ""), 10);
    $(document).off("mousedown.cellEdit");
  }
  $input.on("keydown", (ev) => { if (ev.key === "Enter") $input.blur(); if (ev.key === "Escape") restoreCell(); });
  $input.on("blur", () => {
    const v = $input.val();
    if (/^\d+$/.test(v) && Number(v) > 0) {
      const val = parseInt(v, 10);
      commit(node, { leadtime: val }, "leadtime", (choose) => {
        const okMeansEnd = confirm("소요시간을 변경했습니다.\n\n확인: 시작일 고정 → 종료일 재계산\n취소: 종료일 고정 → 시작일 재계산");
        choose(okMeansEnd ? "end" : "start");
      });
    }
    restoreCell();
  });
  setTimeout(() => {
    $(document).on("mousedown.cellEdit", (e) => {
      if (!$.contains($td[0], e.target) && e.target !== $input[0]) restoreCell();
    });
  }, 0);
}

// 편집 보조: 날짜
function openDateEditor($td, node, field) {
  const oldValue = node.data[field] || "";
  $td.empty();

  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">').val(oldValue);
  const $iconBtn = $('<button type="button" class="datepicker-btn" style="margin-left:4px; padding:0; background:none; border:none; cursor:pointer;"></button>').html(calendarSvg);
  $td.append($input, $iconBtn);

  if (window.IMask) IMask($input[0], { mask: "0000-00-00", lazy: false, autofix: true });

  function restoreCell() {
    setTimeout(() => $td.text(node.data[field] || ""), 10);
    $(document).off("mousedown.cellEdit");
  }

  $input.on("keydown", (ev) => { if (ev.key === "Enter") $input.blur(); if (ev.key === "Escape") restoreCell(); });
  setTimeout(() => {
    $(document).on("mousedown.cellEdit", (e) => {
      if (!$.contains($td[0], e.target) && e.target !== $input[0] && e.target !== $iconBtn[0]) restoreCell();
    });
  }, 0);

  function commitDate(dateStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) commit(node, { [field]: dateStr }, field);
    restoreCell();
  }
  $input.on("blur", () => commitDate($input.val()));
  $iconBtn.on("click", (ev) => {
    ev.stopPropagation();
    showDatePickerInput($td, node.data[field], (dateStr) => commitDate(dateStr));
  });
}
