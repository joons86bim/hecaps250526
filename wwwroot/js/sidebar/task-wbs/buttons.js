// Task 우측 버튼 핸들러(추가/삭제/선택/연결/해제/저장/현황)
import { normalizeTaskCategory, enforceCategoryInheritance } from "./core/categories.js";
import { aggregateTaskFields } from "./logic/task-aggregate.js";
import { updateWBSHighlight } from "./ui/wbs-highlight.js";
import { requestWbsHighlightGateOn } from "./wbs/highlight.js";
import { calendarSvg } from "./ui/calendar-svg.js"; // (예: 모달 등 사용 시)
import { recomputeAggObjects } from "./core/aggregate.js";

// 외부 저장 스냅샷
export function setSavedTaskData(data) {
  window.savedTaskData = JSON.parse(JSON.stringify(data ?? []));
}

// 버튼 바인딩
export function initTaskListButtons() {
  window.__ALLOW_WBS_UPDATE = window.__ALLOW_WBS_UPDATE ?? false;
  function withWbsGate(fn){
    const prev = window.__ALLOW_WBS_UPDATE;
    window.__ALLOW_WBS_UPDATE = true;
    try { return fn(); }
    finally { window.__ALLOW_WBS_UPDATE = prev; }
  }
  function flush(recalc = false) {
    if (recalc && window.requestTaskRecalcAndFlush) {
      window.requestTaskRecalcAndFlush();
    } else if (window.requestTaskTreeFlush) {
      window.requestTaskTreeFlush();
    } else {
      const tree = $.ui.fancytree.getTree("#treegrid");
      tree.render(true, true);
      setTimeout(updateWBSHighlight, 0);
    }
  }

  // [추가]
  $("#btn-add").off("click").on("click", function () {
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();
    const parentNode = sel || null;
    const baseCat = (parentNode?.data?.selectedOption) || "시공";
    const no = generateNo(parentNode);
    const nodeData = {
      no,
      selectOptions: ["시공", "가설", "철거"],
      selectedOption: baseCat,
      title: "새 작업",
      start: "",
      end: "",
      linkedObjects: []
    };
    if (parentNode) {
      if (Array.isArray(parentNode.data?.linkedObjects) && parentNode.data.linkedObjects.length) {
        parentNode.data.linkedObjects = [];
        parentNode.render && parentNode.render();
      }
      parentNode.addChildren(nodeData);
      parentNode.setExpanded(true);
      parentNode.data.start = "";
      parentNode.data.end = "";
      parentNode.render && parentNode.render();
    } else {
      tree.getRootNode().addChildren(nodeData);
    }
    enforceCategoryInheritance(tree);
    flush(true);
  });

  // [삭제]
  $("#btn-delete").off("click").on("click", function(){
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();
    if (sel && !sel.isRoot()) {
      sel.remove();
      flush(true);
    }
  });

  // [객체선택] → 3D viewer select
  $("#btn-select").off("click").on("click", function() {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selected = taskTree.getActiveNode();
    if (!selected) return alert("Task를 선택하세요!");

    const objects = aggregateTaskFields(selected).objects;
    if (!objects || objects.length === 0) return alert("이 Task(및 하위 Task)에 연결된 객체가 없습니다.");

    const byUrn = {};
    objects.forEach(obj => {
      if (!byUrn[obj.urn]) byUrn[obj.urn] = [];
      byUrn[obj.urn].push(obj.dbId);
    });
    Object.entries(byUrn).forEach(([urn, dbIds]) => {
      if (urn === window.CURRENT_MODEL_URN && window.viewer) {
        window.viewer.select(dbIds);
      }
    });
  });

  // [업데이트] 저장
  $("#btn-update").off("click").on("click", async function () {
    const safeUrnVal = window.CURRENT_MODEL_SAFE_URN;
    const url = `/api/tasks?urn=${safeUrnVal}`;
    const currentTaskData = getCurrentTaskDataFromTree();
    const current = JSON.stringify(currentTaskData ?? []);
    const saved   = JSON.stringify(window.savedTaskData ?? []);

    if (!window.savedTaskData || (Array.isArray(window.savedTaskData) && window.savedTaskData.length === 0 && currentTaskData.length > 0)) {
      // 최초 저장 허용
    } else if (current === saved) {
      alert("수정된 데이터가 없습니다.");
      return;
    }

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentTaskData),
      });
      if (resp.ok) {
        alert("Task 데이터가 저장되었습니다!");
        window.savedTaskData = JSON.parse(JSON.stringify(currentTaskData));
      } else {
        alert("Task 데이터 저장 실패!");
      }
    } catch (err) {
      alert("저장 중 오류 발생: " + err.message);
    }
  });

  // [데이터연결]
  $("#btn-link").off("click").on("click", function () {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedTaskNode = taskTree.getActiveNode();
    if (!selectedTaskNode) return alert("Task를 선택하세요!");
    if (selectedTaskNode.hasChildren && selectedTaskNode.hasChildren()) {
      alert("하위 작업이 있는 Task에는 연결할 수 없습니다.\n 최하위 Task를 선택해 주세요.");
      return;
    }

    const urn = window.CURRENT_MODEL_URN;
    const catSel = normalizeTaskCategory(selectedTaskNode.data?.selectedOption); // "C"|"T"|"D"
    const catLabel = catSel === "C" ? "시공" : (catSel === "T" ? "가설" : "철거");

    // 체크된 leaf 만 취합
    const checkedNodes = window.wbsTree.checked();
    let checkedObjects = checkedNodes
      .filter(node => !node.hasChildren())
      .map(node => ({ urn: node.urn ?? urn, dbId: node.dbId, text: node.text }));

    if (checkedObjects.length === 0) return alert("WBS에서 객체를 선택하세요!");

    // 점유 현황
    const occupancy = new Map();
    taskTree.getRootNode().visit(n => {
      const cat = normalizeTaskCategory(n.data?.selectedOption);
      if (!cat) return;
      (n.data?.linkedObjects || []).forEach(o => {
        const key = `${o.urn || urn}:${o.dbId}`;
        const slot = occupancy.get(key) || { C: null, T: null, D: null };
        if (cat === "C" && !slot.C) slot.C = n;
        if (cat === "T" && !slot.T) slot.T = n;
        if (cat === "D" && !slot.D) slot.D = n;
        occupancy.set(key, slot);
      });
    });

    const allowed = [];
    const conflictsForC = [];
    const conflictsC = [];
    const conflictsSame = [];

    checkedObjects.forEach(obj => {
      const key = `${obj.urn}:${obj.dbId}`;
      const slot = occupancy.get(key) || { C: null, T: null, D: null };

      if (catSel === "C") {
        if (!slot.C && !slot.T && !slot.D) allowed.push(obj);
        else conflictsForC.push({ obj, slot });
      } else if (catSel === "T") {
        if (slot.C) conflictsC.push({ obj, slot });
        else if (slot.T) conflictsSame.push({ obj, slot });
        else allowed.push(obj);
      } else if (catSel === "D") {
        if (slot.C) conflictsC.push({ obj, slot });
        else if (slot.D) conflictsSame.push({ obj, slot });
        else allowed.push(obj);
      }
    });

    function unlinkFromNode(node, obj) {
      if (!node) return;
      node.data.linkedObjects = (node.data.linkedObjects || []).filter(
        o => !(String(o.urn || urn) === String(obj.urn) && Number(o.dbId) === Number(obj.dbId))
      );
      node.render && node.render();
    }

    if (catSel === "C" && conflictsForC.length) {
      const res = prompt([
        `선택한 객체 중 ${conflictsForC.length}개는 이미 다른 Task에 연결되어 있습니다.`,
        `규칙상 '시공'은 단독 연결만 가능합니다.`,
        ``,
        `1. 기존 연결 해제 후 이 Task(시공)로 새로 연결`,
        `2. 이미 연결된 객체만 제외하고 진행`,
        `3. 취소`,
        ``,
        `번호를 입력하세요 (1/2/3)`
      ].join("\n"), "2");
      if (res === "3" || res == null) return;
      if (res === "1") {
        conflictsForC.forEach(({ obj, slot }) => {
          unlinkFromNode(slot.C, obj);
          unlinkFromNode(slot.T, obj);
          unlinkFromNode(slot.D, obj);
          allowed.push(obj);
        });
      }
    }

    if ((catSel === "T" || catSel === "D") && conflictsC.length) {
      const res = prompt([
        `다음 객체는 '시공'에 이미 연결되어 있어 ${catLabel}과(와) 병행할 수 없습니다.`,
        ``,
        `1. 시공 연결 해제 후 이 Task(${catLabel})로 새로 연결`,
        `2. 이미 연결된 객체만 제외하고 진행`,
        `3. 취소`,
        ``,
        `번호를 입력하세요 (1/2/3)`
      ].join("\n"), "2");
      if (res === "3" || res == null) return;
      if (res === "1") {
        conflictsC.forEach(({ obj, slot }) => { unlinkFromNode(slot.C, obj); allowed.push(obj); });
      }
    }

    if ((catSel === "T" || catSel === "D") && conflictsSame.length) {
      const label = catLabel;
      const res = prompt([
        `다음 객체는 이미 '${label}'에 연결되어 있습니다.`,
        ``,
        `1. 기존 '${label}' 연결을 이 Task로 교체 (해당 카테고리만 교체)`,
        `2. 이미 연결된 객체만 제외하고 진행`,
        `3. 취소`,
        ``,
        `번호를 입력하세요 (1/2/3)`
      ].join("\n"), "2");
      if (res === "3" || res == null) return;
      if (res === "1") {
        conflictsSame.forEach(({ obj, slot }) => {
          if (catSel === "T") unlinkFromNode(slot.T, obj);
          if (catSel === "D") unlinkFromNode(slot.D, obj);
          allowed.push(obj);
        });
      }
    }

    if (allowed.length > 0) {
      selectedTaskNode.data.linkedObjects = _.uniqBy(
        (selectedTaskNode.data.linkedObjects || []).concat(allowed),
        o => o.urn + ":" + o.dbId
      );
    }

    withWbsGate(() => {
      flush(true);
      try { window.gantt?.renderFromTrees(window.taskTree, window.wbsTree); } catch(_) {}
    });
  });

  // [연결 해제]
  $("#btn-unlink").off("click").on("click", function () {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedNode = taskTree.getActiveNode();
    if (!selectedNode) return alert("연결을 해제할 Task를 선택하세요!");

    (function unlinkAll(node){
      node.data.linkedObjects = [];
      if (node.hasChildren()) node.children.forEach(unlinkAll);
    })(selectedNode);

    withWbsGate(() => {
      flush(true);
      try { window.gantt?.renderFromTrees(window.taskTree, window.wbsTree); } catch(_) {}
    });
  });

  // 공정현황 버튼 — 필요 시 연결하세요 (지금은 placeholder)
  $("#btn-date").off("click").on("click", function(){
    alert("공정현황 모달/기능은 추후 연결 예정");
  });

  // TEST 버튼 — 안전 보호
  $("#btn-test").off("click").on("click", async function() {
    const viewer = window.viewer;
    if (!viewer) return alert('뷰어가 초기화되지 않았습니다.');
    alert('테스트 훅 자리입니다.');
  });
}

function generateNo(parentNode) {
  if (!parentNode || parentNode.isRoot()) {
    const roots = $.ui.fancytree.getTree("#treegrid").getRootNode().children || [];
    return String(roots.length + 1);
  } else {
    const siblings = parentNode.children || [];
    const baseNo = parentNode.data.no || parentNode.title;
    return baseNo + "." + (siblings.length + 1);
  }
}

function getCurrentTaskDataFromTree() {
  const tree = $.ui.fancytree.getTree("#treegrid");
  const urn = window.CURRENT_MODEL_URN;
  function nodeToData(node) {
    const obj = {
      no: node.data.no,
      selectOptions: node.data.selectOptions ?? ["시공", "가설", "철거"],
      selectedOption: node.data.selectedOption ?? "시공",
      title: node.data.title ?? node.title,
      start: node.data.start,
      end: node.data.end,
      linkedObjects: (node.data.linkedObjects || []).map(o => ({
        urn: o.urn ?? urn,
        dbId: o.dbId,
        text: o.text ?? "",
      })),
    };
    if (node.hasChildren()) obj.children = node.children.map(nodeToData);
    return obj;
  }
  return tree.getRootNode().children.map(nodeToData);
}
