// wwwroot/js/sidebar/panel2.js

import {
  renderTree,
  attachSelectionHandlers,
  attachDragAndDrop,
} from "./panel2-ui-helpers.js";

// 샘플 데이터
export let taskData = [
  { label: "Task A", children: [{ label: "Subtask A1" }] },
  { label: "Task B" },
];
export let wbsData = [
  { label: "Group 1", children: [{ label: "Subgroup 1-1" }] },
  { label: "Group 2" },
];

// 렌더 + 선택 + DnD
export function renderContent() {
  renderTree("task-list", taskData, false);
  renderTree("wbs-group-list", wbsData, true);
  attachSelectionHandlers("#task-list");
  attachSelectionHandlers("#wbs-group-list");
  attachDragAndDrop("#task-list", (o, n) => {
    const item = taskData.splice(o, 1)[0];
    taskData.splice(n, 0, item);
  });
}

// 선택된 Task 레이블 반환
export function getSelectedTaskLabels() {
  return Array.from(
    document.querySelectorAll("#task-list .tree-item.selected .label")
  ).map((el) => el.textContent);
}

// 초기화 (HTML 마크업 생성 후 호출)
export function initPanel2Content() {
  const tC = document.getElementById("task-list-content");
  const wC = document.getElementById("wbs-group-content");
  if (!tC || !wC) return;

  tC.innerHTML = `<ul class="tree-list" id="task-list"></ul>`;
  wC.innerHTML = `<ul class="tree-list" id="wbs-group-list"></ul>`;

  renderContent();
}

// 추가 / 삭제 API
export function addTask(newLabel, parentLabel = null) {
  if (!parentLabel) taskData.push({ label: newLabel, children: [] });
  else {
    const recurse = (items) => {
      for (const it of items) {
        if (it.label === parentLabel) {
          it.children = it.children || [];
          it.children.push({ label: newLabel, children: [] });
          return true;
        }
        if (it.children && recurse(it.children)) return true;
      }
    };
    recurse(taskData);
  }
  console.log("▶ addTask 후:", JSON.stringify(taskData, null, 2));
  renderContent();
}

export function deleteTasks(labels) {
  const recurse = (items) =>
    items
      .filter((it) => !labels.includes(it.label))
      .map((it) => ({
        ...it,
        children: it.children ? recurse(it.children) : undefined,
      }));
  taskData = recurse(taskData);
  renderContent();
}
