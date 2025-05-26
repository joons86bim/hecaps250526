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

  getNames() {
    return [this.name];
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

  handleButtonUp(event, button) {
    if (!this.isDragging || button !== 0) return false;

    // 1) 드래그 영역 계산
    const rect = this.viewer.container.getBoundingClientRect();
    const end = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const bounds = {
      xmin: Math.min(this.dragStart.x, end.x),
      xmax: Math.max(this.dragStart.x, end.x),
      ymin: Math.min(this.dragStart.y, end.y),
      ymax: Math.max(this.dragStart.y, end.y),
    };
    const leftToRight = end.x >= this.dragStart.x;

    // 2) 모든 dbId 순회
    const itree = this.viewer.model.getInstanceTree();
    const allDb = [];
    itree.enumNodeChildren(itree.getRootId(), (id) => allDb.push(id), true);

    const sel = [];
    allDb.forEach((dbId) => {
      const frags = [];
      itree.enumNodeFragments(dbId, (fid) => frags.push(fid));
      for (const fragId of frags) {
        const fp = this.viewer.impl.getFragmentProxy(this.viewer.model, fragId);
        fp.updateAnimTransform(); // ★ 반드시 최신 transform 반영
        const box = new THREE.Box3();
        fp.getWorldBounds(box);

        // 8개 꼭짓점 → 화면 좌표
        const pts = [
          new THREE.Vector3(box.min.x, box.min.y, box.min.z),
          new THREE.Vector3(box.max.x, box.min.y, box.min.z),
          new THREE.Vector3(box.min.x, box.max.y, box.min.z),
          new THREE.Vector3(box.max.x, box.max.y, box.min.z),
          new THREE.Vector3(box.min.x, box.min.y, box.max.z),
          new THREE.Vector3(box.max.x, box.min.y, box.max.z),
          new THREE.Vector3(box.min.x, box.max.y, box.max.z),
          new THREE.Vector3(box.max.x, box.max.y, box.max.z),
        ].map((v) => this.viewer.worldToClient(v)); // ★ viewer.worldToClient 사용

        const fullyInside = pts.every(
          (p) =>
            p.x >= bounds.xmin &&
            p.x <= bounds.xmax &&
            p.y >= bounds.ymin &&
            p.y <= bounds.ymax
        );
        const partlyInside = pts.some(
          (p) =>
            p.x >= bounds.xmin &&
            p.x <= bounds.xmax &&
            p.y >= bounds.ymin &&
            p.y <= bounds.ymax
        );

        if ((leftToRight && fullyInside) || (!leftToRight && partlyInside)) {
          sel.push(dbId);
          break;
        }
      }
    });

    // 3) 선택 적용
    this.viewer.select(sel);
    console.log(`📦 ${sel.length} selected`);

    // 4) 복귀
    this.overlayDiv.style.display = "none";
    this.isDragging = false;
    this.viewer.toolController.deactivateTool(this.name); // 반드시 ToolController에서 내리기
    this.viewer.toolController.activateTool("navigation");
    this.viewer.setNavigationLock(false);
    this.viewer.container.style.cursor = "default";

    // 툴바 버튼도 클릭 모드로 돌려놓기
    const toolbar = document.querySelector("#viewer-toolbar");
    toolbar
      .querySelectorAll(".tool-button")
      .forEach((b) => b.classList.remove("active"));
    toolbar.querySelector('[data-tool="click"]').classList.add("active");

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
