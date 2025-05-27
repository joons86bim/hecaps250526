// panel2-ui-helpers.js
// 위치: wwwroot/js/sidebar/panel2-ui-helpers.js

/**
 * 트리 렌더링 함수
 * @param {string} containerId - UL 요소의 id (예: "task-list")
 * @param {Array} items - { label: string, children?: Array } 형태의 데이터 배열
 * @param {boolean} withCheckbox - 체크박스 렌더링 여부
 */
export function renderTree(containerId, items, withCheckbox) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  function buildList(parentUl, nodes) {
    nodes.forEach((node) => {
      // li 생성
      const li = document.createElement("li");
      li.className = "tree-item";

      // 하위 ul 변수 미리 선언
      let childUl;

      // 토글 or spacer
      if (node.children && node.children.length) {
        const toggle = document.createElement("span");
        toggle.className = "toggle";
        toggle.textContent = "+";

        // 자식 ul 생성 후 toggle 핸들러에 바인딩
        childUl = document.createElement("ul");
        childUl.className = "tree-children";
        childUl.style.display = "none";

        toggle.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = toggle.textContent === "-";
          toggle.textContent = isOpen ? "+" : "-";
          childUl.style.display = isOpen ? "none" : "block";
        });

        li.appendChild(toggle);
      } else {
        const spacer = document.createElement("span");
        spacer.className = "spacer";
        li.appendChild(spacer);
      }

      // 체크박스
      if (withCheckbox) {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "checkbox";
        li.appendChild(cb);
      }

      // 라벨
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = node.label;
      li.appendChild(label);

      // li를 부모 ul에 추가
      parentUl.appendChild(li);

      // 자식 리스트가 있으면 li 안에 붙이고 재귀
      if (childUl) {
        li.appendChild(childUl);
        buildList(childUl, node.children);
      }
    });
  }

  // 루트부터 렌더 시작
  buildList(container, items);
}

/**
 * 선택 로직 붙이기
 * @param {string} containerSelector - UL 요소를 가리키는 셀렉터 (예: "#task-list")
 */
export function attachSelectionHandlers(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = Array.from(container.querySelectorAll(".tree-item"));
  let lastSelectedIndex = null;

  items.forEach((item, index) => {
    // 초기 선택 상태 해제
    item.classList.remove("selected");

    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const isSel = item.classList.contains("selected");

      if (e.shiftKey && lastSelectedIndex !== null) {
        // Shift: 범위 선택
        const [start, end] = [lastSelectedIndex, index].sort((a, b) => a - b);
        items
          .slice(start, end + 1)
          .forEach((it) => it.classList.add("selected"));
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd: 토글
        isSel
          ? item.classList.remove("selected")
          : item.classList.add("selected");
        lastSelectedIndex = index;
      } else {
        // 기본 클릭: 단독 선택/해제
        if (isSel) {
          item.classList.remove("selected");
          lastSelectedIndex = null;
        } else {
          items.forEach((it) => it.classList.remove("selected"));
          item.classList.add("selected");
          lastSelectedIndex = index;
        }
      }
    });
  });

  // ESC 키로 전체 선택 해제
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      items.forEach((it) => it.classList.remove("selected"));
      lastSelectedIndex = null;
    }
  });
}

/**
 * 동일 레벨 내에서 .tree-item 을 drag & drop 으로 재배치
 * @param {string} listSelector  - UL 셀렉터 (예: "#task-list")
 * @param {function(oldIndex:number,newIndex:number)} onReorder - 순서 변경 시 호출
 */
export function attachDragAndDrop(listSelector, onReorder) {
  const list = document.querySelector(listSelector);
  if (!list) return;

  let dragSrcEl = null;

  Array.from(list.children).forEach((item) => {
    item.draggable = true;

    item.addEventListener("dragstart", (e) => {
      dragSrcEl = item;
      e.dataTransfer.effectAllowed = "move";
      // Firefox 필요
      e.dataTransfer.setData("text/plain", "");
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      item.classList.add("drag-over");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });

    item.addEventListener("drop", (e) => {
      e.stopPropagation();
      item.classList.remove("drag-over");
      if (dragSrcEl && dragSrcEl !== item) {
        const children = Array.from(list.children);
        const from = children.indexOf(dragSrcEl);
        const to = children.indexOf(item);

        // DOM 순서 변경
        if (from < to) list.insertBefore(dragSrcEl, item.nextSibling);
        else list.insertBefore(dragSrcEl, item);

        // 로직 콜백
        onReorder(from, to);
      }
      return false;
    });
  });
}
