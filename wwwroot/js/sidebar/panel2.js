/**
 * panel2 초기화: Task List, WBS Group List 렌더링
 * 모델 로드 후 main.js 에서 호출됩니다.
 */
export function initPanel2Content() {
  const panel2 = document.getElementById("panel2");
  if (!panel2) return;

  const taskContainer = document.getElementById("task-list-content");
  const wbsContainer = document.getElementById("wbs-group-content");
  if (!taskContainer || !wbsContainer) return;

  // 1) 콘텐츠 영역 초기화: 빈 UL 삽입
  taskContainer.innerHTML = `<ul class="tree-list" id="task-list"></ul>`;
  wbsContainer.innerHTML = `<ul class="tree-list" id="wbs-group-list"></ul>`;

  // 2) 샘플 데이터 (실제 API 호출로 대체 가능)
  const taskData = [
    { label: "Task A", children: [{ label: "Subtask A1" }] },
    { label: "Task B" },
  ];
  const wbsData = [
    { label: "Group 1", children: [{ label: "Subgroup 1-1" }] },
    { label: "Group 2" },
  ];

  // 3) 트리 렌더링 헬퍼
  function renderTree(containerId, items, withCheckbox) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "tree-item";

      // 토글 또는 스페이서
      let childUl;
      if (item.children) {
        const toggle = document.createElement("span");
        toggle.className = "toggle";
        toggle.textContent = "+";
        toggle.addEventListener("click", (e) => {
          e.stopPropagation();
          const expanded = toggle.textContent === "-";
          toggle.textContent = expanded ? "+" : "-";
          childUl.style.display = expanded ? "none" : "block";
        });
        li.appendChild(toggle);
      } else {
        const spacer = document.createElement("span");
        spacer.className = "spacer";
        li.appendChild(spacer);
      }

      // 체크박스 (WBS만)
      if (withCheckbox) {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "checkbox";
        li.appendChild(cb);
      }

      // 라벨
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = item.label;
      li.appendChild(label);

      container.appendChild(li);

      // 자식 렌더링
      if (item.children) {
        childUl = document.createElement("ul");
        childUl.className = "tree-children";
        childUl.style.display = "none";
        item.children.forEach((child) => {
          const cli = document.createElement("li");
          cli.className = "tree-item";
          // 들여쓰기 스페이서
          const indent = document.createElement("span");
          indent.className = "spacer";
          cli.appendChild(indent);
          // WBS 2단계는 체크박스 생략
          const lb2 = document.createElement("span");
          lb2.className = "label";
          lb2.textContent = child.label;
          cli.appendChild(lb2);
          childUl.appendChild(cli);
        });
        container.appendChild(childUl);
      }
    });
  }

  // 4) 렌더링 호출
  renderTree("task-list", taskData, false);
  renderTree("wbs-group-list", wbsData, true);

  // 5) 항목 클릭 시 선택 토글
  panel2.querySelectorAll(".tree-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      item.classList.toggle("selected");
    });
  });

  // 6) ESC 키로 전체 선택 해제
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      panel2
        .querySelectorAll(".tree-item.selected")
        .forEach((it) => it.classList.remove("selected"));
    }
  });
}
