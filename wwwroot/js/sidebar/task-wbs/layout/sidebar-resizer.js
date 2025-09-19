// wwwroot/js/sidebar/sidebar-resizer.js

const sidebar = document.getElementById("sidebar");
const resizer = document.getElementById("sidebar-resizer");
const preview = document.getElementById("preview");
const minWidth = 220; // 최소폭
const maxWidth = 750; // 최대폭

function setSidebarWidth(px) {
  sidebar.style.width = px + "px";
  resizer.style.left = px + "px";
  if (preview) preview.style.left = px + "px";
}

resizer.addEventListener("mousedown", function (e) {
  e.preventDefault();
  document.body.style.cursor = "ew-resize";

  function onMouseMove(e2) {
    let newWidth = e2.clientX;
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

window.addEventListener("DOMContentLoaded", () => {
  const sidebarRect = sidebar.getBoundingClientRect();
  setSidebarWidth(sidebarRect.width);
});
