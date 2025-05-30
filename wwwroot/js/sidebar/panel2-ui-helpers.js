// wwwroot/js/sidebar/panel2-ui-helpers.js

// ➊ “펼쳐진(expanded)” 상태를 기억할 레이블 집합
const expandedNodes = new Set();

/**
 * 트리 렌더링 함수 (재귀 구현 + 펼침 상태 보존)
 * @param {string} containerId   — UL 요소의 id (예: "task-list")
 * @param {Array}  items         — { label: string, children?: Array } 형태의 노드 데이터
 * @param {boolean} withCheckbox — 최상위 노드에만 체크박스를 붙일지 여부
 */
export function renderTree(containerId, items, withCheckbox) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 기존 내용을 모두 지우고 새로 그리기
  container.innerHTML = "";

  // 1) UL 뼈대 생성
  const rootUl = document.createElement("ul");
  rootUl.className = "tree-list";
  container.appendChild(rootUl);

  // 2) 재귀 빌드
  buildNodes(rootUl, items, withCheckbox);
}
function buildNodes(ul, nodes, depth, withCheckbox) {
  nodes.forEach((node) => {
    // ── 1) LI 생성
    const li = document.createElement("li");
    li.className = "tree-item";

    // ── 2) 실제 화면에 보이는 영역: div.tree-node 생성
    const header = document.createElement("div");
    header.className = "tree-node";

    // ── 3) 토글(span.toggle) 또는 스페이서(span.spacer)
    const toggle = document.createElement("span");
    if (Array.isArray(node.children)) {
      toggle.className = "toggle";
      toggle.setAttribute(
        "data-icon",
        expandedNodes.has(node.label) ? "-" : "+"
      );
    } else {
      toggle.className = "spacer";
    }

    header.appendChild(toggle);

    // ── 4) 체크박스 (depth===0, withCheckbox===true일 때만)
    if (withCheckbox && depth === 0) {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "checkbox";
      header.appendChild(cb);
    }

    // ── 5) 라벨
    const lbl = document.createElement("span");
    lbl.className = "label";
    lbl.textContent = node.label;

    header.appendChild(lbl);

    // ── 6) UL에 li 붙이기
    li.appendChild(header);
    ul.appendChild(li);

    // ── 7) children이 있으면, sibling 수준으로 UL 생성 & 토글 이벤트 & 재귀
    if (Array.isArray(node.children)) {
      const childUl = document.createElement("ul");
      childUl.className = "tree-children";
      childUl.style.display = expandedNodes.has(node.label) ? "block" : "none";

      // 토글 클릭: 펼치기/접기
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        // 1) 토글 on/off
        const isOpen = childUl.style.display === "block";
        childUl.style.display = isOpen ? "none" : "block";
        toggle.setAttribute("data-icon", isOpen ? "+" : "-");
        if (isOpen) expandedNodes.delete(node.label);
        else expandedNodes.add(node.label);

        // 2) “토글 클릭 시에도 이 LI만 선택” 하고 싶다면,
        //    기존 선택 해제는 attachSelectionHandlers 에 일임하거나,
        //    아래처럼 이 UL 컨테이너 내에서만 지워야 합니다.
        Array.from(ul.querySelectorAll(".tree-item.selected")).forEach((it) =>
          it.classList.remove("selected")
        );
        li.classList.add("selected");
      });

      li.appendChild(childUl);
      buildNodes(childUl, node.children, depth + 1, withCheckbox);
    }
  });

  // 최상위부터 그리기 시작
  buildNodes(container, items, 0, withCheckbox);
}

/**
 * 선택 로직 바인딩 (Shift / Ctrl(Cmd) / 단독 / ESC)
 * @param {string} listSelector — UL 셀렉터 (예: "#task-list")
 */
export function attachSelectionHandlers(listSelector) {
  const container = document.querySelector(listSelector);
  if (!container) return;

  // header 목록과 인덱스 초기화
  const headers = Array.from(container.querySelectorAll(".tree-node"));
  let lastIndex = null;

  headers.forEach((header, idx) => {
    const li = header.parentElement;
    li.classList.remove("selected"); // 기존 선택 해제

    // 클릭 시 선택/토글/범위 선택 처리
    header.addEventListener("click", (e) => {
      e.stopPropagation();
      const items = headers.map((h) => h.parentElement);
      const isSel = li.classList.contains("selected");

      if (e.shiftKey && lastIndex !== null) {
        // Shift: 마지막 선택 인덱스 → 현재 인덱스 사이 모두 선택
        const [start, end] = [lastIndex, idx].sort((a, b) => a - b);
        items
          .slice(start, end + 1)
          .forEach((it) => it.classList.add("selected"));
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd: 개별 토글
        li.classList.toggle("selected");
        lastIndex = idx;
      } else {
        // 단독 클릭: 이미 선택된 항목은 해제, 아니면 다른 항목 해제 후 선택
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

  // ESC 키로 전체 선택 해제
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      headers.forEach((h) => h.parentElement.classList.remove("selected"));
      lastIndex = null;
    }
  });
}

/**
 * drag & drop 으로 동일 레벨 내 순서 변경
 * @param {string}   listSelector — UL 셀렉터
 * @param {function} onReorder    — 순서 변경 후 호출(oldIndex, newIndex)
 */
export function attachDragAndDrop(listSelector, onReorder) {
  const list = document.querySelector(listSelector);
  if (!list) return;

  let dragSrc = null;

  Array.from(list.children).forEach((item) => {
    item.draggable = true;

    // 드래그 시작
    item.addEventListener("dragstart", (e) => {
      dragSrc = item;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    });

    // 드래그 오버: 효과 유지 & 스타일 추가
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      item.classList.add("drag-over");
    });

    // 드래그 리브: 스타일 제거
    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });

    // 드롭: 위치 교환 & 콜백 호출
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
