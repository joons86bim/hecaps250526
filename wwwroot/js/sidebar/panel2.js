// panel2.js
import {
  renderTree,
  attachSelectionHandlers,
  attachDragAndDrop,
} from "./panel2-ui-helpers.js";

// 1) 샘플 데이터
export let taskData = [
  { label: "Task A", children: [{ label: "Subtask A1" }] },
  { label: "Task B" },
];
export let wbsData = [
  { label: "Group 1", children: [{ label: "Subgroup 1-1" }] },
  { label: "Group 2" },
];

// 2) 트리 렌더링 + 선택 핸들러 + DnD
export function renderContent() {
  renderTree("task-list", taskData, false);
  renderTree("wbs-group-list", wbsData, true);
  attachSelectionHandlers("#task-list");
  attachSelectionHandlers("#wbs-group-list");

  // ─── DnD 붙이기 ───
  attachDragAndDrop("#task-list", (oldIndex, newIndex) => {
    // taskData 배열 순서도 같이 스와핑
    const item = taskData.splice(oldIndex, 1)[0];
    taskData.splice(newIndex, 0, item);
  });
}

// 3) **추가**: panel2-buttons.js에서 필요로 하는 함수 정의
// 현재 선택된 Task 항목의 label들을 배열로 반환
export function getSelectedTaskLabels() {
  return Array.from(
    document.querySelectorAll("#task-list .tree-item.selected .label")
  ).map((el) => el.textContent);
}

// 4) 초기화 함수: 마크업 → 렌더 → 버튼 연결
export function initPanel2Content() {
  const panel2 = document.getElementById("panel2");
  if (!panel2) return;

  const taskContainer = document.getElementById("task-list-content");
  const wbsContainer = document.getElementById("wbs-group-content");
  if (!taskContainer || !wbsContainer) return;

  // ─── UL 삽입: 여기서 ID가 “task-list”/“wbs-group-list”인 UL을 만듭니다 ───
  taskContainer.innerHTML = `<ul class="tree-list" id="task-list"></ul>`;
  wbsContainer.innerHTML = `<ul class="tree-list" id="wbs-group-list"></ul>`;

  // ─── 렌더 & 버튼 기능 바인딩 ───
  renderContent();
}

// 4) Task 추가 API
//    parentLabel이 null 이면 최상위에, 아니면 그 레이블 하위에 추가
export function addTask(newLabel, parentLabel = null) {
  if (!parentLabel) {
    taskData.push({ label: newLabel });
  } else {
    const recurse = (items) => {
      for (const item of items) {
        if (item.label === parentLabel) {
          item.children = item.children || [];
          item.children.push({ label: newLabel });
          return true;
        }
        if (item.children && recurse(item.children)) return true;
      }
    };
    recurse(taskData);
  }
  renderContent();
}

// 5) Task 삭제 API
//    labelsToDelete 에 포함된 레이블을 가진 항목(하위 트리 포함) 모두 제거
export function deleteTasks(labelsToDelete) {
  const recurse = (items) =>
    items
      .filter((it) => !labelsToDelete.includes(it.label))
      .map((it) => ({
        ...it,
        children: it.children ? recurse(it.children) : undefined,
      }));
  taskData = recurse(taskData);
  renderContent();
}
