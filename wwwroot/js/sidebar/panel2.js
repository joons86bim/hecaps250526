// wwwroot/js/sidebar/panel2.js
// 전역으로 로드된 InspireTree/InspireTreeDOM 사용
//import { initPanel2Buttons } from "./panel2-buttons.js";

// ① 원본 샘플 데이터
export let taskData = [
  { label: "Task A", children: [{ label: "Subtask A1" }] },
  { label: "Task B" },
];

export let wbsData = [
  { label: "Group 1", children: [{ label: "Subgroup 1-1" }] },
  { label: "Group 2" },
];

// ② 전역으로 쓸 트리 인스턴스
export let taskTree;
export let wbsTree;

export function initPanel2Content() {
  const taskContainer = document.getElementById("task-list-content");
  if (!taskContainer) return;

  // 기존 UL 구조 대신 InspireTreeDOM용 컨테이너
  taskContainer.innerHTML = `<div id="task-list"></div>`;

  // ③ taskData → InspireTree 포맷으로 변환
  const data = taskData.map((item) => ({
    id: item.label, // id 는 unique 해야 합니다
    text: item.label,
    children: (item.children || []).map((c) => ({
      id: `${item.label}::${c.label}`, // 자식도 unique id
      text: c.label,
    })),
  }));

  // ④ 트리 생성
  taskTree = new window.InspireTree({
    data: data,
    selection: {
      multi: true,
      mode: "simple", // Ctrl/Shift 기반 멀티셀렉션
    },
  });

  // ─── WBS 트리 생성 ───────────────────────────────────────────────────
  const wbsContainer = document.getElementById("wbs-group-content");
  if (wbsContainer) {
    // 기존 마크업 비우고 컨테이너 준비
    wbsContainer.innerHTML = `<div id="wbs-group-list"></div>`;

    // wbsData → InspireTree 포맷 변환
    const wbsNodes = wbsData.map((item) => ({
      id: item.label,
      text: item.label,
      children: (item.children || []).map((c) => ({
        id: `${item.label}::${c.label}`,
        text: c.label,
      })),
    }));

    // WBS 트리 인스턴스 생성 (체크박스 ON)
    wbsTree = new window.InspireTree({
      data: wbsNodes,
      selection: { multi: true, mode: "simple" },
    });

    // DOM 렌더러, 체크박스 보이기, 드래그는 OFF
    new window.InspireTreeDOM(wbsTree, {
      target: "#wbs-group-list",
      showCheckboxes: true,
      dragAndDrop: { enabled: false },
    });
  }

  // ⑤ DOM 렌더러 생성 + drag&drop 활성화
  new window.InspireTreeDOM(taskTree, {
    target: "#task-list",
    showCheckboxes: false,
    dragAndDrop: {
      enabled: true,
      validateOn: "dragstart",
      // 같은 레벨 내에서만 이동 허용
      validate: (dragNode, targetNode) => dragNode.parent === targetNode.parent,
    },
  });

  // ⑥ drop 시 실제 taskData 배열도 함께 재정렬
  taskTree.on("node.drop", (_event, dragNode, _targetNode, index) => {
    const parent = dragNode.parent; // null 이면 루트
    // 현재 레벨의 node 리스트
    const siblings = parent ? parent.children : taskTree.nodes();

    // 1) 배열에서 이동 노드 제거
    const [moved] = siblings.splice(siblings.indexOf(dragNode), 1);
    // 2) 원하는 위치에 삽입
    siblings.splice(index, 0, moved);

    // 3) 원본 taskData 동기화
    if (!parent) {
      taskData = siblings.map((n) => ({
        //text 호출
        label: n.text,
        children: (n.children || []).map((c) => ({ label: c.text })),
      }));
    } else {
      const pLabel = parent.text;
      const pItem = taskData.find((i) => i.label === pLabel);
      if (pItem) {
        pItem.children = (parent.children || []).map((c) => ({
          label: c.text,
        }));
      }
    }

    console.log("▶ after drop taskData:", taskData);
  });
}
