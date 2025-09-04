// wwwroot/js/sidebar/panel2-date-modal.js
import { calendarSvg } from "./panel2-ui-helpers.js";
import { checkTaskStatusByDate } from "./task-check-basedondate.js";

// 모달 열기
export function showCurrentTaskModal() {
  if (document.querySelector(".current-task-modal")) return;

  const today = new Date().toISOString().slice(0, 10);

  const modal = document.createElement("div");
  modal.className = "current-task-modal";
  modal.tabIndex = 0;
  modal.innerHTML = `
    <div class="current-task-modal-header">
      <span class="modal-title">공정현황 : 날짜 선택</span>
      <button class="modal-close" title="닫기">&times;</button>
    </div>
    <div class="current-task-modal-body">
      <div class="current-task-date-row">
        <input type="text" class="current-task-date-input" maxlength="10" placeholder="____-__-__" value="${today}" autocomplete="off" />
        <button type="button" class="datepicker-btn" tabindex="-1">${calendarSvg}</button>
      </div>
      <div class="current-task-slider-row">
        <input type="range" class="current-task-slider" min="-15" max="15" value="0" />
      </div>
      <div class="modal-actions">
        <button type="button" class="modal-confirm">확인</button>
      </div>
      <div class="current-task-date-result"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // 중앙 배치
  modal.style.position = "fixed";
  modal.style.visibility = "hidden";
  setTimeout(() => {
    const { innerWidth: w, innerHeight: h } = window;
    const r = modal.getBoundingClientRect();
    modal.style.left = (w / 2 - r.width / 2) + "px";
    modal.style.top = (h / 3 - r.height / 2) + "px";
    modal.style.visibility = "visible";
  }, 1);

  const $input   = modal.querySelector(".current-task-date-input");
  const $btn     = modal.querySelector(".datepicker-btn");
  const $close   = modal.querySelector(".modal-close");
  const $confirm = modal.querySelector(".modal-confirm");
  const $header  = modal.querySelector(".current-task-modal-header");
  const $result  = modal.querySelector(".current-task-date-result");
  const $slider  = modal.querySelector(".current-task-slider");

  // IMask
  if (window.IMask) {
    window.IMask($input, { mask: "0000-00-00", lazy: false, autofix: true });
  }
  enforceSmartSelection($input);

  // flatpickr
  const fp = window.flatpickr($input, {
    dateFormat: "Y-m-d",
    defaultDate: today,
    allowInput: true,
    clickOpens: false,
    onChange: (_, dateStr) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        $input.value = dateStr;
        $result.textContent = `선택한 날짜: ${dateStr}`;
        $result.style.color = "#1976d2";
      }
    }
  });

  // 슬라이더 범위: task 데이터로 산출
  const tree = $.ui.fancytree.getTree("#treegrid");
  updateSliderRangeFromTaskData(tree?.getRootNode()?.children || []);

  $btn.addEventListener("click", (e) => { e.stopPropagation(); fp.open(); });

  // 슬라이더 → 날짜 입력 반영
  $slider.addEventListener("input", () => {
    const offset = parseInt($slider.value, 10);
    const base = new Date();
    base.setDate(base.getDate() + offset);
    const newDate = base.toISOString().slice(0, 10);
    $input.value = newDate;
    $result.textContent = `선택한 날짜: ${newDate}`;
    $result.style.color = "#1976d2";
  });

  $confirm.onclick = () => {
    const val = $input.value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      $result.textContent = "날짜 형식을 yyyy-mm-dd로 입력해주세요.";
      $result.style.color = "#e55";
      return;
    }
    $result.textContent = `선택한 날짜: ${val}`;
    $result.style.color = "#1976d2";
    // 상태 반영
    checkTaskStatusByDate(val, window.taskTree, window.viewer);
  };

  $close.onclick = () => { resetViewerAndClose(modal); };
  modal.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") resetViewerAndClose(modal);
  });

  // 드래그 이동
  enableModalDrag(modal, $header);

  // 유효성 검사 헬퍼
  function resetViewerAndClose(m) {
    if (window.viewer) {
      window.viewer.clearThemingColors?.();
      const vm = window.viewer.impl?.visibilityManager;
      vm?.setAllOn?.();
      window.viewer.impl?.invalidate(true);
    }
    m.remove();
  }
}

// 입력 UX 향상(한 자리 단위 이동)
function enforceSmartSelection(input) {
  const digitIdx = [0,1,2,3,5,6,8,9];
  const firstIdx = 0, lastIdx = 9;

  const getDigitPos = (pos) => digitIdx.includes(pos) ? pos : (digitIdx.find(d => d > pos) ?? lastIdx);
  const nextDigitIdx = (pos) => {
    const i = digitIdx.indexOf(pos);
    return (i !== -1 && i < digitIdx.length - 1) ? digitIdx[i+1] : pos;
  };
  const prevDigitIdx = (pos) => {
    const i = digitIdx.indexOf(pos);
    return (i > 0) ? digitIdx[i-1] : pos;
  };
  const setSingleDigitSelection = (pos) => {
    if (digitIdx.includes(pos)) input.setSelectionRange(pos, pos + 1);
  };

  ["focus", "click"].forEach(evt => input.addEventListener(evt, () => {
    setTimeout(() => setSingleDigitSelection(getDigitPos(input.selectionStart)), 0);
  }));

  input.addEventListener("keydown", (e) => {
    const pos = input.selectionStart;
    if (e.key === "ArrowLeft" && pos !== firstIdx) {
      e.preventDefault(); setSingleDigitSelection(prevDigitIdx(pos));
    }
    if (e.key === "ArrowRight" && pos !== lastIdx) {
      e.preventDefault(); setSingleDigitSelection(nextDigitIdx(pos));
    }
  });

  input.addEventListener("input", () => {
    const pos = input.selectionStart;
    if (digitIdx.includes(pos - 1)) setSingleDigitSelection(nextDigitIdx(pos - 1));
    else setSingleDigitSelection(getDigitPos(pos));
  });
}

// 슬라이더 범위 계산
function updateSliderRangeFromTaskData(nodes) {
  if (!Array.isArray(nodes)) return;
  const allDates = [];
  (function traverse(arr){
    for (const n of arr) {
      const d = n.data || n;
      if (d.start && /^\d{4}-\d{2}-\d{2}$/.test(d.start)) allDates.push(new Date(d.start));
      if (d.end && /^\d{4}-\d{2}-\d{2}$/.test(d.end))   allDates.push(new Date(d.end));
      if (n.children) traverse(n.children);
    }
  })(nodes);
  if (!allDates.length) return;
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const today   = new Date();
  const diffMin = Math.ceil((minDate - today) / 86400000);
  const diffMax = Math.ceil((maxDate - today) / 86400000);
  const $slider = document.querySelector(".current-task-slider");
  if (!$slider) return;
  $slider.min = diffMin;
  $slider.max = diffMax;
  $slider.value = 0;
}
