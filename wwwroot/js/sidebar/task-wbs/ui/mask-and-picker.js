import { calendarSvg } from "./calendar-svg.js";

export function showMaskedDateInput($container, oldValue, onConfirm) {
  const prevHtml = $container.html();
  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">').val(oldValue || "");
  $container.empty().append($input);
  if (window.IMask) IMask($input[0], { mask: '0000-00-00', lazy: false, autofix: true });

  $input.on("keydown", ev => { if (ev.key === "Enter") $input.blur(); });
  $input.on("blur", () => {
    const val = $input.val();
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) onConfirm(val);
    setTimeout(() => $container.html(prevHtml), 100);
  });
}
export function showDatePickerInput($container, oldValue, onConfirm) {
  const prevHtml = $container.html();
  const $input = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;">').val(oldValue || "");
  $container.empty().append($input);

  const defaultDate = (/^\d{4}-\d{2}-\d{2}$/.test(oldValue)) ? oldValue : "";
  const fp = flatpickr($input[0], {
    dateFormat: "Y-m-d",
    allowInput: false,
    clickOpens: true,
    defaultDate,
    onClose: function(_, dateStr) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) onConfirm(dateStr);
      setTimeout(() => $container.html(prevHtml), 100);
    }
  });
  setTimeout(() => fp.open(), 50);
}
export { calendarSvg }; // 편의 re-export
