// wwwroot/js/sidebar/panel2-ui-helpers.js

/**
 * 트리 렌더링 함수 (재귀 구현 + depth 활용)
 * @param {string}  containerId   - UL id (예: "task-list")
 * @param {Array}   items         - { label, children? } 배열
 * @param {boolean} withCheckbox  - 최상위에만 체크박스 붙일지 여부
 */
export function renderTree(containerId, items, withCheckbox) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  function buildNodes(ul, nodes, depth = 0) {
    nodes.forEach((node) => {
      const li = document.createElement("li");
      li.className = "tree-item";

      const header = document.createElement("div");
      header.className = "tree-node";

      // 토글 또는 spacer
      const toggle = document.createElement("span");
      if (node.children && node.children.length) {
        toggle.className = "toggle";
        toggle.textContent = "+";
      } else {
        toggle.className = "spacer";
      }
      header.appendChild(toggle);

      // 체크박스 (withCheckbox && depth===0)
      if (withCheckbox && depth === 0) {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "checkbox";
        header.appendChild(cb);
      }

      // 라벨
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = node.label;
      header.appendChild(label);

      li.appendChild(header);
      ul.appendChild(li);

      // 자식이 있으면 하위 UL 생성 + 토글 이벤트 + 재귀
      if (node.children && node.children.length) {
        const childUl = document.createElement("ul");
        childUl.className = "tree-children";
        childUl.style.display = "none";
        li.appendChild(childUl);

        toggle.addEventListener("click", (e) => {
          e.stopPropagation(); // 선택 로직이랑 분리
          const open = childUl.style.display === "block";
          childUl.style.display = open ? "none" : "block";
          toggle.textContent = open ? "+" : "-";
        });

        buildNodes(childUl, node.children, depth + 1);
      }
    });
  }

  buildNodes(container, items, 0);
}

/**
 * 선택 로직 붙이기 (각 LI 클릭)
 * @param {string} listSelector - UL 셀렉터 (예: "#task-list")
 */
export function attachSelectionHandlers(listSelector) {
  const container = document.querySelector(listSelector);
  if (!container) return;

  const headers = Array.from(container.querySelectorAll(".tree-node"));
  let lastIndex = null;

  headers.forEach((header, idx) => {
    const li = header.parentElement;
    li.classList.remove("selected");

    header.addEventListener("click", (e) => {
      e.stopPropagation(); // 자식 클릭이 부모로 번지지 않게

      const items = headers.map((h) => h.parentElement);
      const isSel = li.classList.contains("selected");

      if (e.shiftKey && lastIndex !== null) {
        const [start, end] = [lastIndex, idx].sort((a, b) => a - b);
        items
          .slice(start, end + 1)
          .forEach((it) => it.classList.add("selected"));
      } else if (e.ctrlKey || e.metaKey) {
        li.classList.toggle("selected");
        lastIndex = idx;
      } else {
        if (isSel) {
          li.classList.remove("selected");
          lastIndex = null;
        } else {
          items.forEach((it) => it.classList.remove("selected"));
          li.classList.add("selected");
          lastIndex = idx;
        }
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      headers.forEach((h) => h.parentElement.classList.remove("selected"));
      lastIndex = null;
    }
  });
}

/**
 * drag & drop 으로 순서 변경
 * @param {string} listSelector
 * @param {function} onReorder(oldIndex, newIndex)
 */
export function attachDragAndDrop(listSelector, onReorder) {
  const list = document.querySelector(listSelector);
  if (!list) return;
  let dragSrc = null;

  Array.from(list.children).forEach((item) => {
    item.draggable = true;
    item.addEventListener("dragstart", (e) => {
      dragSrc = item;
      e.dataTransfer.effectAllowed = "move";
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
      if (dragSrc && dragSrc !== item) {
        const siblings = Array.from(list.children);
        const from = siblings.indexOf(dragSrc);
        const to = siblings.indexOf(item);
        if (from < to) list.insertBefore(dragSrc, item.nextSibling);
        else list.insertBefore(dragSrc, item);
        onReorder(from, to);
      }
      return false;
    });
  });
}
