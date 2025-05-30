// wwwroot/js/sidebar/panel2-buttons.js
import { taskTree } from "./panel2.js";

export function initTaskListButtons() {
  const btnAdd = document.getElementById("btn-add");
  const btnDelete = document.getElementById("btn-delete");
  if (!btnAdd || !btnDelete) return;

  btnAdd.addEventListener("click", () => {
    const sel = taskTree.selected();
    const name = window.prompt("추가할 항목 이름을 입력하세요:", "").trim();
    if (!name || !name.trim()) return;
    const trimmed = name.trim();

    if (sel.length === 1) {
      // 자식으로 추가 (parentId 변수 제거)
      const parent = sel[0];
      parent.addChild({
        // .text() 메서드로 반드시 호출해야 합니다.
        id: `${parent.text}::${trimmed}`,
        text: trimmed,
      });
      parent.expand();
    } else {
      // 루트 레벨로 추가
      taskTree.addNode({ id: trimmed, text: trimmed });
    }
  });

  btnDelete.addEventListener("click", () => {
    const sel = taskTree.selected();
    if (!sel.length) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    sel.forEach((node) => node.remove());
  });
}
