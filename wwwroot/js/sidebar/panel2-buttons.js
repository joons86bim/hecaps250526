// wwwroot/js/sidebar/panel2-buttons.js
import { updateWBSHighlight, enforceCategoryInheritance, calendarSvg, aggregateTaskFields, stripCountSuffix, normalizeTaskCategory  } from './panel2-ui-helpers.js';
import { showCurrentTaskModal} from './panel2-date-modal.js';
// import { checkTaskStatusByDate } from './task-check-basedondate.js';

// 불러온 데이터를 저장해둘 변수 (전역)
window.savedTaskData = null;

/**
 * Task 트리 우측 버튼들 (추가/삭제/객체선택/연결/저장) 이벤트 바인딩
 * flatten/연결/강조 등 모든 처리 window.aggregateTaskFields 기준!
 */
export function initTaskListButtons() {

  // 공통: 안전 플러시 헬퍼
  function flush(recalc = false) {
    if (recalc && window.requestTaskRecalcAndFlush) {
      window.requestTaskRecalcAndFlush();      // ★ 구조 변경 시 권장
    } else if (window.requestTaskTreeFlush) {
      window.requestTaskTreeFlush();           // ★ 데이터 변경만 있을 때
    } else {
      // fallback (아주 예외적인 경우)
      const tree = $.ui.fancytree.getTree("#treegrid");
      tree.render(true, true);
      setTimeout(updateWBSHighlight, 0);
    }
  }

  // [추가] 버튼: 트리 노드 추가
  $("#btn-add").off("click").on("click", function () {
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();
    const parentNode = sel || null;
  
    // ✅ 부모의 구분을 먼저 가져오고(없으면 "시공"), 그걸 자식에게 상속
    const baseCat = (parentNode && parentNode.data && parentNode.data.selectedOption) ? parentNode.data.selectedOption : "시공";
  
    const no = generateNo(parentNode);
    const nodeData = {
      no,
      selectOptions: ["시공", "가설", "철거"],
      selectedOption: baseCat,           // ← 부모 구분 상속 (baseCat을 위에서 먼저 정의!)
      title: "새 작업",
      start: "",
      end: "",
      linkedObjects: []
    };
  
    if (parentNode) {
      // ✅ 이제 parentNode는 '부모'가 되므로 직접 연결 금지: 기존 연결 자동 해제
      if (parentNode.data && Array.isArray(parentNode.data.linkedObjects) && parentNode.data.linkedObjects.length) {
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

    // ⬇️ 전체 리드타임/객체 집계 + 렌더 + HL + 저장
    flush(true); // ★ 추가는 구조 변경 → recalc 포함
    // 상속 규칙 유지(새로 추가된 서브트리에도 적용)
    enforceCategoryInheritance(tree);
    window.requestTaskTreeFlush?.();
  });

  // [삭제] 버튼: 현재 선택 노드 삭제
  $("#btn-delete").off("click").on("click", function(){
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();
    if (sel && !sel.isRoot()) {
      sel.remove();
      flush(true); // ★ 삭제도 구조 변경 → recalc 포함
    }
  });

  // [객체선택] 버튼: 트리에서 flatten 연결객체 → 3D viewer 선택
  $("#btn-select").off("click").on("click", function() {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selected = taskTree.getActiveNode();
    if (!selected) return alert("Task를 선택하세요!");

    const objects = aggregateTaskFields(selected).objects;
    if (!objects || objects.length === 0) return alert("이 Task(및 하위 Task)에 연결된 객체가 없습니다.");

    // urn별로 dbId 묶음
    const byUrn = {};
    objects.forEach(obj => {
      if (!byUrn[obj.urn]) byUrn[obj.urn] = [];
      byUrn[obj.urn].push(obj.dbId);
    });

    // (예시) 현재 모델만 지원
    Object.entries(byUrn).forEach(([urn, dbIds]) => {
      if (urn === window.CURRENT_MODEL_URN && window.viewer) {
        window.viewer.select(dbIds);
      }
    });
  });

  // [업데이트] 버튼: Task 데이터 서버에 저장
  $("#btn-update").off("click").on("click", async function () {
    const safeUrnVal = window.CURRENT_MODEL_SAFE_URN;
    const url = `/api/tasks?urn=${safeUrnVal}`;              // ★ 백틱 수정
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

    // [데이터연결] 버튼: WBS 선택노드를 Task 노드에 연결(정책 적용)
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

    // 1) 체크된 leaf → objects
    const checkedNodes = window.wbsTree.checked();
    let checkedObjects = checkedNodes
      .filter(node => !node.hasChildren())
      .map(node => ({ urn: node.urn ?? urn, dbId: node.dbId, text: node.text }));

    if (checkedObjects.length === 0) return alert("WBS에서 객체를 선택하세요!");

    // 2) 전체 점유 현황: key -> { C:node|null, T:node|null, D:node|null }
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

    // 3) 분류
    const allowed = [];
    const conflictsForC = []; // catSel === C 인데 어떤 연결이든 이미 존재
    const conflictsC = [];    // catSel ∈ {T,D} 이고 slot.C가 존재
    const conflictsSame = []; // catSel과 같은 카테고리가 이미 존재(T중복/D중복)

    checkedObjects.forEach(obj => {
      const key = `${obj.urn}:${obj.dbId}`;
      const slot = occupancy.get(key) || { C: null, T: null, D: null };

      if (catSel === "C") {
        if (!slot.C && !slot.T && !slot.D) allowed.push(obj);
        else conflictsForC.push({ obj, slot });
      } else if (catSel === "T") {
        if (slot.C) conflictsC.push({ obj, slot });
        else if (slot.T) conflictsSame.push({ obj, slot });
        else allowed.push(obj); // D만 있거나 아무것도 없음 → 허용
      } else if (catSel === "D") {
        if (slot.C) conflictsC.push({ obj, slot });
        else if (slot.D) conflictsSame.push({ obj, slot });
        else allowed.push(obj); // T만 있거나 아무것도 없음 → 허용
      }
    });

    // 유틸: 특정 Task 노드에서 해당 객체(urn+dbId) 연결 제거
    function unlinkFromNode(node, obj) {
      if (!node) return;
      node.data.linkedObjects = (node.data.linkedObjects || []).filter(
        o => !(String(o.urn || urn) === String(obj.urn) && Number(o.dbId) === Number(obj.dbId))
      );
      node.render && node.render();
    }

    // 4-A) catSel === "C" 충돌 처리
    if (catSel === "C" && conflictsForC.length) {
      const msg = [
        `선택한 객체 중 ${conflictsForC.length}개는 이미 다른 Task에 연결되어 있습니다.`,
        `규칙상 '시공'은 단독 연결만 가능합니다.`,
        ``,
        `1. 기존 연결 해제 후 이 Task(시공)로 새로 연결`,
        `2. 이미 연결된 객체만 제외하고 진행`,
        `3. 취소`,
        ``,
        `번호를 입력하세요 (1/2/3)`
      ].join("\n");
      const res = prompt(msg, "2");
      if (res === "3" || res == null) return;
      if (res === "1") {
        // 기존(C/T/D) 모두 끊고 허용 목록으로 편입
        conflictsForC.forEach(({ obj, slot }) => {
          unlinkFromNode(slot.C, obj);
          unlinkFromNode(slot.T, obj);
          unlinkFromNode(slot.D, obj);
          allowed.push(obj);
        });
      }
      // "2": 제외하고 진행(그냥 skip)
    }

    // 4-B) catSel ∈ {T,D} 에서 "시공과 충돌" 처리
    if ((catSel === "T" || catSel === "D") && conflictsC.length) {
      const msg = [
        `다음 객체는 '시공'에 이미 연결되어 있어 ${catLabel}과(와) 병행할 수 없습니다.`,
        ``,
        `1. 시공 연결 해제 후 이 Task(${catLabel})로 새로 연결`,
        `2. 이미 연결된 객체만 제외하고 진행`,
        `3. 취소`,
        ``,
        `번호를 입력하세요 (1/2/3)`
      ].join("\n");
      const res = prompt(msg, "2");
      if (res === "3" || res == null) return;
      if (res === "1") {
        conflictsC.forEach(({ obj, slot }) => {
          unlinkFromNode(slot.C, obj); // 시공만 해제
          allowed.push(obj);           // 이제 허용
        });
      }
      // "2": 제외하고 진행
    }

    // 4-C) catSel ∈ {T,D} 에서 "동일 카테고리 충돌" 처리 (T중복/D중복)
    if ((catSel === "T" || catSel === "D") && conflictsSame.length) {
      const label = catLabel; // "가설" 또는 "철거"
      const msg = [
        `다음 객체는 이미 '${label}'에 연결되어 있습니다.`,
        ``,
        `1. 기존 '${label}' 연결을 이 Task로 교체 (해당 카테고리만 교체)`,
        `2. 이미 연결된 객체만 제외하고 진행`,
        `3. 취소`,
        ``,
        `번호를 입력하세요 (1/2/3)`
      ].join("\n");
      const res = prompt(msg, "2");
      if (res === "3" || res == null) return;
      if (res === "1") {
        conflictsSame.forEach(({ obj, slot }) => {
          if (catSel === "T") unlinkFromNode(slot.T, obj); // 가설만 교체
          if (catSel === "D") unlinkFromNode(slot.D, obj); // 철거만 교체
          allowed.push(obj);
        });
      }
      // "2": 제외하고 진행
    }

    // 5) 실제 병합(중복 제거)
    if (allowed.length === 0) {
      window.requestTaskRecalcAndFlush?.();
      return;
    }
    selectedTaskNode.data.linkedObjects = _.uniqBy(
      (selectedTaskNode.data.linkedObjects || []).concat(allowed),
      o => o.urn + ":" + o.dbId
    );

    window.requestTaskRecalcAndFlush?.();
  });


  // [연결 해제] 버튼
  $("#btn-unlink").off("click").on("click", function () {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedNode = taskTree.getActiveNode();
    if (!selectedNode) {
      alert("연결을 해제할 Task를 선택하세요!");
      return;
    }

    // 재귀적으로 하위까지 모두 연결 객체 해제
    (function unlinkAll(node){
      node.data.linkedObjects = [];
      if (node.hasChildren()) node.children.forEach(unlinkAll);
    })(selectedNode);

    flush(true); // ★ 해제 후 즉시 재집계/렌더/저장
  });

  // 공정현황 버튼
  $("#btn-date").off("click").on("click", showCurrentTaskModal);

  // TEST 버튼 (viewer 전역 참조 안전화)
  $("#btn-test").off("click").on("click", async function() {
    const viewer = window.viewer;                                 // ★ 안전
    if (!viewer) return alert('뷰어가 초기화되지 않았습니다.');

    const selection = viewer.getSelection();
    if (selection.length !== 1) {
      alert('객체를 하나만 선택해야 합니다.');
      return;
    }
    const dbId = selection[0];
    const fragIds = [];
    const instanceTree = viewer.model.getData().instanceTree;
    instanceTree.enumNodeFragments(dbId, function (fragId) {
      fragIds.push(fragId);
    });

    const newTextureUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=256&h=256';
    const loader = new THREE.TextureLoader();
    loader.load(
      newTextureUrl,
      function (texture) {
        fragIds.forEach(fragId => {
          const renderProxy = viewer.impl.getRenderProxy(viewer.model, fragId);
          if (renderProxy && renderProxy.material) {
            const mats = renderProxy.material.materials || [renderProxy.material];
            mats.forEach(mat => {
              mat.map = texture;
              mat.needsUpdate = true;
              texture.needsUpdate = true;
            });
          }
          const proxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
          if (proxy) {
            proxy.getMaterial(function (oldMat) {
              const params = {};
              ['color', 'opacity', 'transparent', 'side', 'shininess'].forEach(k => {
                if (oldMat[k] !== undefined) params[k] = oldMat[k];
              });
              const newMat = new THREE.MeshPhongMaterial({ ...params, map: texture });
              newMat.needsUpdate = true;
              proxy.setMaterial(newMat);
            });
          }
        });
        viewer.impl.invalidate(true, true, true);
        setTimeout(() => viewer.impl.sceneUpdated && viewer.impl.sceneUpdated(true), 100);
        alert('material.map 교체, setMaterial 병행 완료! 화면 변화를 확인하세요!');
      },
      undefined,
      function (err) {
        alert('이미지 로드 실패: ' + err.message);
      }
    );
  });
}

/** 자동 No 생성 */
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

// 서버 데이터 등 상태 갱신용
export function setSavedTaskData(data) {
  window.savedTaskData = JSON.parse(JSON.stringify(data ?? []));
}

// [flatten 변환] 트리 → 저장용 JSON 변환
function getCurrentTaskDataFromTree() {
  const tree = $.ui.fancytree.getTree("#treegrid");
  const urn = window.CURRENT_MODEL_URN;                             // ★ 안전
  function nodeToData(node) {
    const obj = {
      no: node.data.no,
      selectOptions: node.data.selectOptions ?? ["시공", "철거", "가설"],
      selectedOption: node.data.selectedOption ?? "시공",
      title: node.data.title ?? node.title,
      start: node.data.start,
      end: node.data.end,
      linkedObjects: (node.data.linkedObjects || []).map(o => ({
        urn: o.urn ?? urn,                                          // ★ 반드시 포함
        dbId: o.dbId,                                               // ★ 반드시 포함
        text: o.text ?? "",                                         // 표시용
      })),
    };
    if (node.hasChildren()) obj.children = node.children.map(nodeToData);
    return obj;
  }
  return tree.getRootNode().children.map(nodeToData);
}
