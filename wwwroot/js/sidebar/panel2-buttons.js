// panel2-buttons.js
// 위치: wwwroot/js/sidebar/panel2-buttons.js

import { getSelectedTaskLabels, addTask, deleteTasks } from "./panel2.js";

export function initTaskListButtons() {
  const btnAdd = document.getElementById("btn-add");
  const btnDelete = document.getElementById("btn-delete");

  btnAdd.addEventListener("click", () => {
    const sel = getSelectedTaskLabels();
    const parent = sel.length === 1 ? sel[0] : null;
    const name = window.prompt("추가할 항목 이름을 입력하세요");
    if (!name) return;
    addTask(name.trim(), parent);
  });

  btnDelete.addEventListener("click", () => {
    const sel = getSelectedTaskLabels();
    if (!sel.length) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    deleteTasks(sel);
  });
}
