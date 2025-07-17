import { updateWBSHighlight, calendarSvg, aggregateTaskFields  } from './panel2-ui-helpers.js';
import { checkTaskStatusByDate } from './task-check-basedondate.js';

// 불러온 데이터를 저장해둘 변수 (전역)
window.savedTaskData = null;

/**
 * Task 트리 우측 버튼들 (추가/삭제/객체선택/연결/저장) 이벤트 바인딩
 * flatten/연결/강조 등 모든 처리 window.aggregateTaskFields 기준!
 */
export function initTaskListButtons() {
  // [추가] 버튼: 트리 노드 추가
  $("#btn-add").off("click").on("click", function () {
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();

    let parentNode = sel || null;
    let no = generateNo(parentNode);
    let nodeData = {
      no: no,
      selectOptions: ["시공", "철거", "가설"],
      selectedOption: "시공", // 기본 선택 옵션
      title: "새 작업",
      start: "",
      end: ""
    };

    if (parentNode) {
      parentNode.addChildren(nodeData);
      parentNode.setExpanded(true);
      parentNode.data.start = "";
      parentNode.data.end = "";
      parentNode.data.linkedObjects = [];
      parentNode.render();
    } else {
      tree.getRootNode().addChildren(nodeData);
    }
    tree.getRootNode().children.forEach(propagateDatesAndObjects);
    tree.render(true, true);
    setTimeout(updateWBSHighlight, 0);
  });

  // [삭제] 버튼: 현재 선택 노드 삭제
  $("#btn-delete").off("click").on("click", function(){
    let tree = $.ui.fancytree.getTree("#treegrid");
    let sel = tree.getActiveNode();
    if(sel && !sel.isRoot()) {
      let parentNode = sel.parent;
      sel.remove();
      // 무조건 전체 트리 집계
      tree.getRootNode().children.forEach(propagateDatesAndObjects);
    }
    tree.render(true, true);
    setTimeout(updateWBSHighlight, 0);
    
  });

  // [객체선택] 버튼: 트리에서 flatten 연결객체 → 3D viewer 선택
  $("#btn-select").off("click").on("click", function() {
    let taskTree = $.ui.fancytree.getTree("#treegrid");
    let selected = taskTree.getActiveNode();
    if (!selected) return alert("Task를 선택하세요!");
    let objects = aggregateTaskFields(selected).objects;
    if (!objects || objects.length === 0) return alert("이 Task(및 하위 Task)에 연결된 객체가 없습니다.");
    
    // urn별로 dbId 묶음 (Viewer 구조에 따라 아래 로직 커스텀)
    let byUrn = {};
    objects.forEach(obj => {
      if (!byUrn[obj.urn]) byUrn[obj.urn] = [];
      byUrn[obj.urn].push(obj.dbId);
    });

    // (예시) 현재 모델만 지원: window.CURRENT_MODEL_URN 사용
    Object.entries(byUrn).forEach(([urn, dbIds]) => {
      // 여러 모델 지원하려면 urn→model 매핑 필요
      if (urn === window.CURRENT_MODEL_URN && window.viewer) {
        window.viewer.select(dbIds);
      }
    });
  });
  
  // [업데이트] 버튼: Task 데이터 서버에 저장
  $("#btn-update").off("click").on("click", async function () {
    const safeUrnVal = window.CURRENT_MODEL_SAFE_URN;
    const url = `/api/tasks?urn=${safeUrnVal}`;
    const currentTaskData = getCurrentTaskDataFromTree();
    const current = JSON.stringify(currentTaskData ?? []);
    const saved = JSON.stringify(window.savedTaskData ?? []);
    // 최초 저장 조건
    if (!window.savedTaskData || (Array.isArray(window.savedTaskData) && window.savedTaskData.length === 0 && currentTaskData.length > 0)) {
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
  

  // [데이터연결] 버튼: WBS 선택노드를 Task 노드에 연결(중복체크 등)
  $("#btn-link").off("click").on("click", function() {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedTaskNode = taskTree.getActiveNode();
    if (!selectedTaskNode) return alert("Task를 선택하세요!");
    
    // 현재 모델의 URN (반드시 사용)
    const urn = window.CURRENT_MODEL_URN;

    // WBS 체크된 leaf 객체
    let checkedNodes = window.wbsTree.checked();
    let checkedObjects = checkedNodes.filter(node => !node.hasChildren()).map(node => ({
      urn: node.urn ?? urn,
      dbId: node.dbId,
      text: node.text
    }));
    if (checkedObjects.length === 0) return alert("WBS에서 객체를 선택하세요!");
  
    // 중복 검사: 이미 연결된 객체
    let conflictObjects = [];
    let linkedTaskMap = {}; 
    taskTree.visit(function(node){
      if (node.data.linkedObjects) {
        node.data.linkedObjects.forEach(obj => {
          linkedTaskMap[`${urn}:${obj.dbId}`] = node;
        });
      }
    });
    checkedObjects.forEach(obj => {
      const key = `${urn}:${obj.dbId}`;
      if (linkedTaskMap[key] && linkedTaskMap[key] !== selectedTaskNode) {
        conflictObjects.push({ ...obj, linkedTask: linkedTaskMap[key] });
      }
    });
  
    if (conflictObjects.length > 0) {
      const msg = [
        "이미 다른 Task에 연결된 객체가 있습니다.",
        conflictObjects.map(o =>
          `${o.text} (Task: ${o.linkedTask.data.no} - ${o.linkedTask.data.title})`
        ).join("\n"),
        "",
        "어떻게 처리할까요?",
        "1. 기존 연결을 끊고 이 Task에 연결",
        "2. 이미 연결된 객체는 제외하고 연결",
        "3. 취소"
      ].join("\n");
      const result = prompt(msg + "\n\n원하는 번호를 입력하세요 (1/2/3)", "1");
      if (result === "3" || !["1","2"].includes(result)) return;
  
      if (result === "1") {
        conflictObjects.forEach(obj => {
          const tNode = obj.linkedTask;
          tNode.data.linkedObjects = (tNode.data.linkedObjects || []).filter(
            o => !(o.urn === obj.urn && o.dbId === obj.dbId)
          );
        });
      }
      if (result === "2") {
        checkedObjects = checkedObjects.filter(obj =>
          !conflictObjects.find(o => o.urn === obj.urn && o.dbId === obj.dbId)
        );
        if (checkedObjects.length === 0) {
          taskTree.render(true, true);
          setTimeout(updateWBSHighlight, 0);
          return;
        }
      }
    }
  
    // 연결 처리: 중복 없이 flatten
    selectedTaskNode.data.linkedObjects = _.uniqBy(
      (selectedTaskNode.data.linkedObjects || []).concat(checkedObjects),
      obj => obj.urn + ":" + obj.dbId
    );
    taskTree.render(true, true);
    setTimeout(updateWBSHighlight, 0);
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
  function unlinkAll(node) {
    node.data.linkedObjects = [];
    if (node.hasChildren()) {
      node.children.forEach(unlinkAll);
    }
  }
  unlinkAll(selectedNode);

  // 트리 전체 집계(부모까지 최신화)
  // (최상위 루트 하위 전체 재집계)
  taskTree.getRootNode().children.forEach(child => {
    propagateDatesAndObjects(child);
  });

  taskTree.render(true, true);
  setTimeout(updateWBSHighlight, 0);
});

//공정현황 버튼
$("#btn-date").off("click").on("click", showCurrentTaskModal);

//TEST 버튼
$("#btn-test").off("click").on("click", async function() {
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
            console.log("Texture 로드됨:", texture);
            console.log("이미지 로드 성공:", texture.image && (texture.image.src || texture.image.currentSrc));
            fragIds.forEach(fragId => {
                // 1. getRenderProxy 방식
                const renderProxy = viewer.impl.getRenderProxy(viewer.model, fragId);
                if (renderProxy && renderProxy.material) {
                    let mats = renderProxy.material.materials || [renderProxy.material];
                    mats.forEach(mat => {
                        mat.map = texture;
                        mat.needsUpdate = true;
                        texture.needsUpdate = true;
                        console.log("map 교체", mat, mat.map);
                    });
                }
                // 2. getFragmentProxy + setMaterial도 병행
                const proxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
                if (proxy) {
                    proxy.getMaterial(function (oldMat) {
                        const params = {};
                        ['color', 'opacity', 'transparent', 'side', 'shininess'].forEach(k => {
                            if (oldMat[k] !== undefined) params[k] = oldMat[k];
                        });
                        params.map = texture;
                        const newMat = new THREE.MeshPhongMaterial(params);
                        newMat.needsUpdate = true;
                        proxy.setMaterial(newMat);
                        console.log("setMaterial 호출", proxy, newMat);
                    });
                }
            });
            viewer.impl.invalidate(true, true, true);
            setTimeout(() => viewer.impl.sceneUpdated && viewer.impl.sceneUpdated(true), 100);
            alert('material.map 교체, setMaterial 병행 완료! 화면 변화를 꼭 확인해주세요!');
        },
        undefined,
        function (err) {
            alert('이미지 로드 실패: ' + err.message);
        }
    );
});
//   const selection = viewer.getSelection();

//     if (selection.length !== 1) {
//         alert('객체를 하나만 선택해야 합니다.');
//         return;
//     }

//     const dbId = selection[0];
//     const fragIds = [];

//     const instanceTree = viewer.model.getData().instanceTree;
//     if (!instanceTree) {
//         alert('instanceTree를 가져올 수 없습니다. 뷰어 초기화 상태를 확인하세요.');
//         return;
//     }

//     // ✅ 교정된 fragmentId 추출 방식
//     instanceTree.enumNodeFragments(dbId, function (fragId) {
//         fragIds.push(fragId);
//     });

//     const frags = viewer.model.getFragmentList();
//     if (!frags) {
//         alert('fragmentList를 가져올 수 없습니다. 뷰어 초기화 상태를 확인하세요.');
//         return;
//     }

//     let textureFound = false;

//     fragIds.forEach(fragId => {
//         const renderProxy = viewer.impl.getRenderProxy(viewer.model, fragId);
//         if (renderProxy && renderProxy.material) {
//             const material = renderProxy.material;

//             // multiMaterial 처리
//             const materials = material.materials ? material.materials : [material];

//             materials.forEach(mat => {
//                 if (mat.map) {
//                     textureFound = true;
//                     console.log(`✅ dbId: ${dbId}, fragId: ${fragId}, texture map found:`, mat.map);
//                     console.log(`📌 Map name: ${mat.map.name}`);
//                     console.log(`📌 Map image:`, mat.map.image);
//                 } else {
//                     console.log(`dbId: ${dbId}, fragId: ${fragId}, No texture map found.`);
//                 }
//             });
//         }
//     });

//     if (textureFound) {
//         alert('콘솔(F12)에서 텍스쳐 정보가 출력되었습니다.');
//     } else {
//         alert('선택한 객체에 텍스쳐 맵핑 정보가 없습니다.');
//     }
// });
}
// 자동 No 생성
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

// [flatten 변환] 트리 → 저장용 JSON 변환 (title/children 등 누락X)
function getCurrentTaskDataFromTree() {
  const tree = $.ui.fancytree.getTree("#treegrid");

  function nodeToData(node) {
    const obj = {
      no: node.data.no,
      selectOptions: node.data.selectOptions ?? ["시공", "철거", "가설"], // 기본 옵션
      selectedOption: node.data.selectedOption ?? "시공", // 기본 선택 옵션
      title: node.data.title ?? node.title,
      start: node.data.start,
      end: node.data.end,
      // [수정] linkedObjects 내 각 객체에 urn, dbId, text 필드가 모두 있는지 확인
      linkedObjects: (node.data.linkedObjects || []).map(o => ({
        urn: o.urn ?? urn,          // 반드시 포함
        dbId: o.dbId,        // 반드시 포함
        text: o.text ?? "",  // 선택적으로 표시용
      })),
    };
    if (node.hasChildren()) {
      obj.children = node.children.map(nodeToData);
    }
    return obj;
  }

  return tree.getRootNode().children.map(nodeToData);
}

// 날짜, 객체 재집계 함수
function propagateDatesAndObjects(node) {
  if (node.hasChildren()) {
    let minStart = null;
    let maxEnd = null;
    let allObjects = [];
    node.children.forEach(child => {
      propagateDatesAndObjects(child);
      if (child.data.start && (!minStart || child.data.start < minStart)) minStart = child.data.start;
      if (child.data.end && (!maxEnd || child.data.end > maxEnd)) maxEnd = child.data.end;
      if (child.data.linkedObjects && child.data.linkedObjects.length) {
        allObjects = allObjects.concat(child.data.linkedObjects);
      }
    });

    // === 디버깅: 중복 집계 전 ===
    console.log("[디버깅] 집계 전 - 상세", {
      node: node.data.title ?? node.data.no,
      allObjects: allObjects.map(o => `${o.urn}::${o.dbId}`)
    });

    // Set을 활용한 중복 제거
    const seen = new Set();
    const uniqueObjects = allObjects.filter(obj => {
      const key = obj.urn + "::" + obj.dbId;
      if (seen.has(key)) {
        console.log("[중복제거] skip", key, obj);
        return false;
      }
      seen.add(key);
      return true;
    });
    // === 디버깅: 중복 제거 후 ===
    console.log("[디버깅] 집계 후", {
      node: node.data.title ?? node.data.no,
      uniqueObjects: uniqueObjects.map(o => `${o.urn}::${o.dbId}`),
      uniqueObjectsLength: uniqueObjects.length
    });

    node.data.start = minStart || "";
    node.data.end = maxEnd || "";
    node.data.linkedObjects = uniqueObjects;
    node.render && node.render();

    return {
      start: node.data.start,
      end: node.data.end,
      linkedObjects: uniqueObjects
    };
  } else {
    return {
      start: node.data.start,
      end: node.data.end,
      linkedObjects: (node.data.linkedObjects || [])
    };
  }
}

// === 공정현황 모달 ===
export function showCurrentTaskModal() {
  if (document.querySelector('.current-task-modal')) return;
  const today = new Date().toISOString().slice(0, 10);

  // --- DOM 생성 및 배치 ---
  const modal = document.createElement('div');
  modal.className = 'current-task-modal';
  modal.tabIndex = 0;
  modal.innerHTML = `
    <div class="current-task-modal-header">
      <span class="modal-title">공정현황 : 날짜 선택</span>
      <button class="modal-close" title="닫기">&times;</button>
    </div>
    <div class="current-task-modal-body">
      <div class="current-task-date-row">
        <input type="text" class="current-task-date-input" maxlength="10" placeholder="____-__-__" value="${today}" autocomplete="off" />
        <button type="button" class="datepicker-btn" tabindex="-1">${calendarSvg}</button>
      </div>
      <div class="modal-actions">
        <button type="button" class="modal-confirm">확인</button>
      </div>
      <div class="current-task-date-result"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // 중앙 위치 (화면 크기 기반)
  modal.style.position = 'fixed';
  modal.style.visibility = 'hidden';
  setTimeout(() => {
    const {innerWidth: winW, innerHeight: winH} = window;
    const rect = modal.getBoundingClientRect();
    modal.style.left = (winW/2 - rect.width/2) + 'px';
    modal.style.top = (winH/3 - rect.height/2) + 'px';
    modal.style.visibility = 'visible';
  }, 1);

  // --- 변수 ---
  const $input = modal.querySelector('.current-task-date-input');
  const $btn = modal.querySelector('.datepicker-btn');
  const $close = modal.querySelector('.modal-close');
  const $confirm = modal.querySelector('.modal-confirm');
  const $header = modal.querySelector('.current-task-modal-header');
  const $result = modal.querySelector('.current-task-date-result');

  // --- IMask + SmartSelection ---
  const mask = IMask($input, {mask: '0000-00-00', lazy: false, autofix: true});
  enforceSmartSelection($input);

  // --- flatpickr ---
  const fp = flatpickr($input, {
    dateFormat: 'Y-m-d',
    defaultDate: today,
    allowInput: true,
    clickOpens: false,
    onChange: (selectedDates, dateStr) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        $input.value = dateStr;
        mask.updateValue();
      }
    }
  });

  $btn.addEventListener('click', (e) => {
    e.stopPropagation();
    fp.open();
  });

  // --- 확인/닫기/ESC ---
  $confirm.onclick = function () {
    // 1. 날짜 입력값 확인
    const val = $input.value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      $result.textContent = '날짜 형식을 yyyy-mm-dd로 입력해주세요.';
      $result.style.color = '#e55';
      return;
    }
    $result.textContent = `선택한 날짜: ${val}`;
    $result.style.color = '#1976d2';
  
    // 2. 🚩 입력일 기준 Task 상태 반영 함수 호출!
    checkTaskStatusByDate(val, window.taskTree, window.viewer);
  };

  // 모달 닫기 버튼
  $close.onclick = () => {
    resetViewerObjects(); // 뷰어 상태 초기화
    modal.remove();
  };
  modal.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      resetViewerObjects(); // 뷰어 상태 초기화
      modal.remove();
    };
  });

  function resetViewerObjects() {
    if (window.viewer) {
      window.viewer.clearThemingColors();
      if (window.viewer.impl.visibilityManager.setAllOn) {
        window.viewer.impl.visibilityManager.setAllOn();
      }
      window.viewer.impl.invalidate(true);
    }
  }

  // --- blur, Enter: 유효성 검사 ---
  $input.addEventListener('blur', checkAndDisplayDate);
  $input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      checkAndDisplayDate();
      $input.blur();
    }
    if (ev.key === 'Escape') modal.remove();
  });

  // --- 드래그 이동 ---
  enableModalDrag(modal, $header);

  $input.focus();

  // --- 날짜 유효성 ---
  function checkAndDisplayDate() {
    const val = $input.value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      $result.textContent = '날짜 형식을 yyyy-mm-dd로 입력해주세요.';
      $result.style.color = '#e55';
      return false;
    }
    $result.textContent = `선택한 날짜: ${val}`;
    $result.style.color = '#1976d2';
    return true;
  }

  // --- 드래그 (최적화) ---
  function enableModalDrag(modal, header) {
    let isDragging = false, startLeft = 0, startTop = 0, mouseStartX = 0, mouseStartY = 0;
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.modal-close')) return;
      isDragging = true;
      startLeft = parseInt(modal.style.left, 10) || 0;
      startTop = parseInt(modal.style.top, 10) || 0;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
      function onMouseMove(ev) {
        if (!isDragging) return;
        modal.style.left = (startLeft + ev.clientX - mouseStartX) + 'px';
        modal.style.top = (startTop + ev.clientY - mouseStartY) + 'px';
      }
      function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }
}

//날짜 입력 프롬프트 기능 구현
export function enforceSmartSelection(input) {
  // 입력 가능한 인덱스 (숫자자리)
  const digitIdx = [0,1,2,3,5,6,8,9];
  const firstIdx = 0, lastIdx = 9;

  // 입력 중인 자리 idx 추출
  function getDigitPos(pos) {
    // pos가 숫자자리면 그대로, 아니면 가장 가까운 숫자리로 이동
    if (digitIdx.includes(pos)) return pos;
    return digitIdx.find(d => d > pos) ?? lastIdx;
  }
  function nextDigitIdx(pos) {
    const i = digitIdx.indexOf(pos);
    return (i !== -1 && i < digitIdx.length - 1) ? digitIdx[i+1] : pos;
  }
  function prevDigitIdx(pos) {
    const i = digitIdx.indexOf(pos);
    return (i > 0) ? digitIdx[i-1] : pos;
  }

  // 한자리만 selection(항상 숫자자리)
  function setSingleDigitSelection(pos) {
    if (digitIdx.includes(pos)) {
      input.setSelectionRange(pos, pos+1);
    }
  }

  // focus/click시 한자리 선택
  ['focus', 'click'].forEach(evt =>
    input.addEventListener(evt, () => {
      setTimeout(() => {
        setSingleDigitSelection(getDigitPos(input.selectionStart));
      }, 0);
    })
  );

  // ←, → 이동만 preventDefault
  input.addEventListener('keydown', function(e) {
    let pos = input.selectionStart;
    // ← 이전 숫자리 이동
    if (e.key === 'ArrowLeft' && pos !== firstIdx) {
      e.preventDefault();
      setSingleDigitSelection(prevDigitIdx(pos));
    }
    // → 다음 숫자리 이동
    if (e.key === 'ArrowRight' && pos !== lastIdx) {
      e.preventDefault();
      setSingleDigitSelection(nextDigitIdx(pos));
    }
  });

  // 숫자 입력, 백스페이스 등은 기본 동작 O, 입력 후 input에서 커서 이동
  input.addEventListener('input', function(e) {
    // 현재 selection의 위치를 기준으로, 입력한 직후라면 다음자리로 이동
    let pos = input.selectionStart;
    // (IMask 적용: 입력 즉시 값이 바뀌므로, nextDigitIdx로)
    if (digitIdx.includes(pos-1)) {
      setSingleDigitSelection(nextDigitIdx(pos-1));
    } else {
      setSingleDigitSelection(getDigitPos(pos));
    }
  });
}