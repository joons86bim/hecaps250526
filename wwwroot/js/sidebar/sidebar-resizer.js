// wwwroot/js/sidebar/sidebar-resizer.js

const sidebar = document.getElementById("sidebar");
const resizer = document.getElementById("sidebar-resizer");
const preview = document.getElementById("preview");
const minWidth = 220; // 최소폭
const maxWidth = 600; // 최대폭

function setSidebarWidth(px) {
  sidebar.style.width = px + "px";
  resizer.style.left = px + "px"; // resizer를 sidebar 끝에 위치시킴
  // preview의 left도 sidebar width와 맞춰 이동
  if (preview) preview.style.left = px + "px";
}

resizer.addEventListener("mousedown", function (e) {
  e.preventDefault();
  document.body.style.cursor = "ew-resize";

  function onMouseMove(e2) {
    let newWidth = e2.clientX;
    // 보정: 화면 넘어가는 것 방지, 최소/최대
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    setSidebarWidth(newWidth);
  }

  function onMouseUp() {
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

// 처음 로딩 시에도 위치 초기화 (비율→px로 변환)
window.addEventListener("DOMContentLoaded", () => {
  const sidebarRect = sidebar.getBoundingClientRect();
  setSidebarWidth(sidebarRect.width);
});
