// mask-and-picker.js
export const calendarSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="calendar-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
`;

// 예전 UX처럼 한 자리 단위로 커서 이동(←/→) 보조
export function attachSmartDigitNav(inputEl) {
  const digitIdx = [0,1,2,3,5,6,8,9];
  const firstIdx = 0, lastIdx = 9;
  const isDigitPos = (p) => digitIdx.includes(p);
  const getDigitPos = (p) => isDigitPos(p) ? p : (digitIdx.find(d => d > p) ?? lastIdx);
  const nextPos = (p) => {
    const i = digitIdx.indexOf(p);
    return (i !== -1 && i < digitIdx.length - 1) ? digitIdx[i+1] : p;
  };
  const prevPos = (p) => {
    const i = digitIdx.indexOf(p);
    return (i > 0) ? digitIdx[i-1] : p;
  };
  const setSingleSel = (p) => { if (isDigitPos(p)) inputEl.setSelectionRange(p, p + 1); };

  ["focus","click"].forEach(evt =>
    inputEl.addEventListener(evt, () => { setTimeout(() => setSingleSel(getDigitPos(inputEl.selectionStart)), 0); })
  );

  inputEl.addEventListener("keydown", (e) => {
    const pos = inputEl.selectionStart;
    if (e.key === "ArrowLeft" && pos !== firstIdx) { e.preventDefault(); setSingleSel(prevPos(pos)); }
    if (e.key === "ArrowRight" && pos !== lastIdx) { e.preventDefault(); setSingleSel(nextPos(pos)); }
  });

  inputEl.addEventListener("input", () => {
    const pos = inputEl.selectionStart;
    if (isDigitPos(pos - 1)) setSingleSel(nextPos(pos - 1));
    else setSingleSel(getDigitPos(pos));
  });
}

export function attachDatePickerToInput(inputEl, opts = {}) {
  const isYmd = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || "").trim());
  const initial = isYmd(opts.initial) ? opts.initial
                : (isYmd(inputEl.value) ? inputEl.value : "");

  // ⚠️ flatpickr가 "____-__-__"를 파싱하지 않도록 값은 ''로 정리하고 먼저 붙입니다
  inputEl.value = initial || "";

  const fp = window.flatpickr(inputEl, {
    dateFormat: "Y-m-d",
    allowInput: true,
    clickOpens: true,
    defaultDate: initial || undefined,
    onClose: (_, dateStr) => {
      const picked = isYmd(dateStr) ? dateStr : (isYmd(inputEl.value) ? inputEl.value : "");
      if (picked && typeof opts?.onPicked === "function") {
        opts.onPicked(picked);
      } else if (typeof opts?.onCancel === "function") {
        opts.onCancel();
      }
    }
  });

  // ✅ 예전처럼 보이게: IMask는 lazy:false (플레이스홀더 표시)
  if (window.IMask) {
    window.IMask(inputEl, { mask: "0000-00-00", lazy: false, autofix: true });
  }
  // ✅ 스마트 커서 이동(한 자리씩)
  attachSmartDigitNav(inputEl);

  inputEl.__fp = fp;
  return fp;
}
