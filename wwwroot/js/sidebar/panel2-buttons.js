// panel2-buttons.js
// 위치: wwwroot/js/sidebar/panel2-buttons.js

import { getSelectedTaskLabels, addTask, deleteTasks } from "./panel2.js";

export function initTaskListButtons() {
  const btnAdd = document.getElementById("btn-add");
  const btnDelete = document.getElementById("btn-delete");

  btnAdd.addEventListener("click", () => {
    // 1) 전체 선택된 레이블
    const sel = getSelectedTaskLabels();
    console.log("▶ [Add] 전체 선택 레이블:", sel);

    // 2) #task-list > .tree-item.selected 만 골라 최상위 선택 판단
    const topEls = Array.from(
      document.querySelectorAll("#task-list > .tree-item.selected")
    );
    const parentLabel =
      topEls.length === 1
        ? topEls[0].querySelector(".label").textContent
        : null;
    console.log("▶ [Add] 최종 parentLabel:", parentLabel);

    // 3) 새 레이블 입력
    const name = window.prompt("추가할 항목 이름을 입력하세요");
    if (!name) return;

    // 4) 추가 호출
    addTask(name.trim(), parentLabel);
  });

  btnDelete.addEventListener("click", () => {
    const sel = getSelectedTaskLabels();
    if (!sel.length) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    deleteTasks(sel);
  });
}
