// /wwwroot/js/viewer/selection-tool.js
export class BoxSelectionTool {
  constructor(viewer) {
    this.viewer = viewer;
    this.name = "BoxSelectionTool";
    this.dragStart = null;
    this.isDragging = false;

    // 미리 overlay DIV 생성
    this.overlayDiv = document.createElement("div");
    Object.assign(this.overlayDiv.style, {
      position: "absolute",
      border: "2px dashed #4A90E2",
      background: "rgba(74,144,226,0.1)",
      pointerEvents: "none",
      display: "none",
      zIndex: 999,
    });
    this.viewer.container.appendChild(this.overlayDiv);
  }

  getName() {
    return this.name;
  }
  getNames() {
    return [this.name];
  }

  getPriority() {
    return 100;
  }

  getCursor() {
    return "crosshair";
  }

  activate() {
    // 박스 선택 모드
    this.viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
    this.viewer.toolController.deactivateTool("navigation");
    this.viewer.setNavigationLock(true);
    this.viewer.container.style.cursor = "crosshair";
    this.overlayDiv.style.display = "none";
    return true;
  }

  deactivate() {
    // 내비게이션 툴로 복귀
    this.viewer.setNavigationLock(false);
    this.viewer.toolController.activateTool("navigation");
    this.viewer.container.style.cursor = "default";
    this.overlayDiv.style.display = "none";
    this.dragStart = null;
    this.isDragging = false;
    return true;
  }

  handleButtonDown(event, button) {
    console.log("🔹 [BoxTool] handleButtonDown", {
      button,
      x: event.clientX,
      y: event.clientY,
    });
    if (button !== 0) return false;
    const rect = this.viewer.container.getBoundingClientRect();
    this.dragStart = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    this.isDragging = true;
    Object.assign(this.overlayDiv.style, {
      display: "block",
      left: `${this.dragStart.x}px`,
      top: `${this.dragStart.y}px`,
      width: "0px",
      height: "0px",
    });
    return true;
  }

  handleMouseMove(event) {
    if (!this.isDragging) return false;
    const rect = this.viewer.container.getBoundingClientRect();
    const cx = event.clientX - rect.left,
      cy = event.clientY - rect.top;
    const left = Math.min(this.dragStart.x, cx),
      top = Math.min(this.dragStart.y, cy),
      width = Math.abs(this.dragStart.x - cx),
      height = Math.abs(this.dragStart.y - cy);
    Object.assign(this.overlayDiv.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
    return true;
  }

  // /wwwroot/js/viewer/selection-tool.js
  // /wwwroot/js/viewer/selection-tool.js
  // /wwwroot/js/viewer/selection-tool.js
  handleButtonUp(event, button) {
    if (!this.isDragging || button !== 0) return false;

    // 1) 드래그 영역 계산
    const rect = this.viewer.container.getBoundingClientRect();
    const end = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const bounds = {
      xmin: Math.min(this.dragStart.x, end.x),
      xmax: Math.max(this.dragStart.x, end.x),
      ymin: Math.min(this.dragStart.y, end.y),
      ymax: Math.max(this.dragStart.y, end.y),
    };
    const leftToRight = end.x >= this.dragStart.x;

    // 2) FragmentList 에서 AABB 가져오기
    const fragList = this.viewer.model.getFragmentList();
    const boxes = fragList.fragments.boxes;
    const frag2db = fragList.fragments.fragId2dbId;
    const selDb = new Set();

    // 3) 각 fragment 별 8개 코너 → 화면 좌표 투영 → screenMin/screenMax 계산
    for (let i = 0; i < frag2db.length; i++) {
      const i6 = i * 6;
      const min = new THREE.Vector3(boxes[i6], boxes[i6 + 1], boxes[i6 + 2]);
      const max = new THREE.Vector3(
        boxes[i6 + 3],
        boxes[i6 + 4],
        boxes[i6 + 5]
      );
      const corners = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, max.z),
      ];
      const pts = corners.map((v) => this.viewer.worldToClient(v));
      const xs = pts.map((p) => p.x),
        ys = pts.map((p) => p.y);
      const screenMin = { x: Math.min(...xs), y: Math.min(...ys) };
      const screenMax = { x: Math.max(...xs), y: Math.max(...ys) };

      if (leftToRight) {
        // ───── full inclusion ─────
        if (
          screenMin.x >= bounds.xmin &&
          screenMax.x <= bounds.xmax &&
          screenMin.y >= bounds.ymin &&
          screenMax.y <= bounds.ymax
        ) {
          selDb.add(frag2db[i]);
        }
      } else {
        // ───── crossing ─────
        if (
          screenMax.x >= bounds.xmin &&
          screenMin.x <= bounds.xmax &&
          screenMax.y >= bounds.ymin &&
          screenMin.y <= bounds.ymax
        ) {
          selDb.add(frag2db[i]);
        }
      }
    }

    // 4) 선택 및 복귀
    const sel = Array.from(selDb);
    this.viewer.select(sel);
    console.log(`📦 ${sel.length} selected`);

    this.overlayDiv.style.display = "none";
    this.isDragging = false;
    this.viewer.toolController.deactivateTool(this.name);
    this.viewer.toolController.activateTool("navigation");
    this.viewer.setNavigationLock(false);
    this.viewer.container.style.cursor = "default";
    document
      .querySelectorAll("#viewer-toolbar .tool-button")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelector('#viewer-toolbar [data-tool="click"]')
      .classList.add("active");

    return true;
  }

  handleSingleClick(event, button) {
    if (button !== 0) return false;
    this.viewer.toolController.deactivateTool(this.name);
    this.viewer.toolController.activateTool("navigation");
    this.viewer.container.style.cursor = "default";
    const toolbar = document.querySelector("#viewer-toolbar");
    toolbar
      .querySelectorAll(".tool-button")
      .forEach((b) => b.classList.remove("active"));
    toolbar.querySelector('[data-tool="click"]').classList.add("active");
    return true;
  }
}

/**
 * BoxSelectionTool 등록 및 활성화
 * @param {Autodesk.Viewing.GuiViewer3D} viewer
 */
export function enableBoxSelectionMode(viewer) {
  let tool = viewer.toolController.getTool("BoxSelectionTool");
  if (!tool) {
    tool = new BoxSelectionTool(viewer);
    viewer.toolController.registerTool(tool);
  }
  viewer.toolController.activateTool("BoxSelectionTool");
}
