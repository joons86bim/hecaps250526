// wwwroot/js/sidebar/panel2.js
// 전역으로 로드된 InspireTree/InspireTreeDOM 사용
import { syncTaskDataWithTree } from "./panel2-ui-helpers.js";

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
export let taskTree, wbsTree;

export function initPanel2Content() {
  // TASK 트리 생성
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
      autoDeselect: false, //클릭해도 다른 선택이 해제되지 않음
      multi: true,
      mode: "mulit", // Ctrl/Shift 기반 멀티셀렉션
    },
  });
  window.taskTree = taskTree; // 전역으로 export

  // WBS 트리 기존 인스턴스 제거
  if (window.wbsTree && typeof window.wbsTree.destroy === "function") {
    window.wbsTree.destroy();
  }
  if (document.getElementById("wbs-group-list")) {
    document.getElementById("wbs-group-list").innerHTML = "";
  }

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
      selection: {
        multi: true,
        mode: "simple",
        //체크박스 상위 체크시 하위 전부 체크 반대도 마찬가지
        autoSelectChildren: false,
        autoDselectChildren: false,
        require: false,
        autoSelectParents: false,
      },
    });

    window.wbsTree = wbsTree; // 전역으로 export

    // DOM 렌더러, 체크박스 보이기, 드래그는 OFF
    new window.InspireTreeDOM(wbsTree, {
      target: "#wbs-group-list",
      showCheckboxes: true,
      dragAndDrop: { enabled: false },
    });
    // bindEscToTree(wbsTree, "wbs-group-list");
    // bindEscToTree(taskTree, "task-list");
  }

  // ⑤ DOM 렌더러 생성 + drag&drop 활성화
  new window.InspireTreeDOM(taskTree, {
    target: "#task-list",
    showCheckboxes: false,
    dragAndDrop: {
      enabled: true,
      // validateOn: "dragover",
      // // 같은 레벨 내에서만 이동 허용
      // validate: (dragNode, targetNode) => {
      //   if (!dragNode.parent && !targetNode.parent) return true;
      //   if (
      //     dragNode.parent &&
      //     targetNode.parent &&
      //     dragNode.parent.id === targetNode.parent.id
      //   )
      //     return true;
      //   return false;
      // },
    },
  });

  // ESC키로 선택 모두 해제 (중복 없이)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (window.taskTree && typeof window.taskTree.selected === "function") {
        window.taskTree.selected().forEach((node) => node.deselect());
      }
      if (window.wbsTree && typeof window.wbsTree.selected === "function") {
        window.wbsTree.selected().forEach((node) => node.deselect());
      }
    }
  });

  bindEscToTree(taskTree, "task-list");
  bindEscToTree(wbsTree, "wbs-group-list");

  // 드롭 후 데이터 동기화
  taskTree.on("node.drop", () => {
    syncTaskDataWithTree(taskTree, taskData);
    console.log("▶ after drop taskData:", taskData);
  });

  // ⑥ drop 시 실제 taskData 배열도 함께 재정렬
  // taskTree.on("node.drop", (_event, dragNode, _targetNode, index) => {
  //   const parent = dragNode.parent; // null 이면 루트
  //   // 현재 레벨의 node 리스트
  //   const siblings = parent ? parent.children : taskTree.nodes();

  //   // 1) 배열에서 이동 노드 제거
  //   const [moved] = siblings.splice(siblings.indexOf(dragNode), 1);
  //   // 2) 원하는 위치에 삽입
  //   siblings.splice(index, 0, moved);

  //   // 3) 원본 taskData 동기화
  //   if (!parent) {
  //     taskData = siblings.map((n) => ({
  //       //text 호출
  //       label: n.text,
  //       children: (n.children || []).map((c) => ({ label: c.text })),
  //     }));
  //   } else {
  //     const pLabel = parent.text;
  //     const pItem = taskData.find((i) => i.label === pLabel);
  //     if (pItem) {
  //       pItem.children = (parent.children || []).map((c) => ({
  //         label: c.text,
  //       }));
  //     }
  //   }

  //   console.log("▶ after drop taskData:", taskData);
  // });

  // WBS 체크박스 계층 이벤트 바인딩
  // 바인딩 시

  // ESC: 선택 해제
  function bindEscToTree(tree, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.tabIndex = 0; // 포커스 가능하게 만듦
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        tree.selected().forEach((node) => node.deselect());
      }
    });
  }
  //   // 트리 DOM 생성 후 호출
  //   bindEscToTree(taskTree, "task-list");
  //   if (wbsTree) bindEscToTree(wbsTree, "wbs-group-list");
}
