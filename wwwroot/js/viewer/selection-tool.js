// /wwwroot/js/viewer/selection-tool.js

function addClassSafe(el, cls) { if (el && el.classList) el.classList.add(cls); }
function removeClassSafe(el, cls) { if (el && el.classList) el.classList.remove(cls); }

// (선택 박스 DOM 유틸이 필요할 경우 사용 가능하지만, 현재 overlayDiv 사용하므로 미사용)

// Box Selection
export class BoxSelectionTool {
  constructor(viewer) {
    this.viewer = viewer;
    this.name = "BoxSelectionTool";
    this.dragStart = null;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // 화면 오버레이 박스
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

  getName() { return this.name; }
  getNames() { return [this.name]; }
  getPriority() { return 100; }
  getCursor() { return "crosshair"; }

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

    const hasCanvasXY = (event.canvasX != null && event.canvasY != null);
    if (hasCanvasXY) {
      this.dragStart = { x: event.canvasX, y: event.canvasY };
    } else {
      const rect = this.viewer.container.getBoundingClientRect();
      this.dragStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
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

    let cx, cy;
    if (event.canvasX != null && event.canvasY != null) {
      cx = event.canvasX; cy = event.canvasY;
    } else {
      const rect = this.viewer.container.getBoundingClientRect();
      cx = event.clientX - rect.left; cy = event.clientY - rect.top;
    }

    const left   = Math.min(this.dragStart.x, cx);
    const top    = Math.min(this.dragStart.y, cy);
    const width  = Math.abs(this.dragStart.x - cx);
    const height = Math.abs(this.dragStart.y - cy);

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
  
    // 1) 드래그 영역 계산 (반드시 end를 먼저 계산)
    const end = (event.canvasX != null && event.canvasY != null)
      ? { x: event.canvasX, y: event.canvasY }
      : (() => {
          const r = this.viewer.container.getBoundingClientRect();
          return { x: event.clientX - r.left, y: event.clientY - r.top };
        })();
  
    const bounds = {
      xmin: Math.min(this.dragStart.x, end.x),
      xmax: Math.max(this.dragStart.x, end.x),
      ymin: Math.min(this.dragStart.y, end.y),
      ymax: Math.max(this.dragStart.y, end.y),
    };
  
    // ← 여기서 계산해야 "Cannot access 'end'…" 안 뜸
    const leftToRight = end.x >= this.dragStart.x;
  
    // 2) 프래그먼트 목록 확보
    const selDb = new Set();
    const model = this.viewer && this.viewer.model;
    const frags = model && model.getFragmentList && model.getFragmentList();
    if (!frags) {
      // 안전 복귀
      this.overlayDiv.style.display = "none";
      this.isDragging = false;
      this.viewer.toolController.deactivateTool(this.name);
      this.viewer.toolController.activateTool("navigation");
      this.viewer.setNavigationLock(false);
      this.viewer.container.style.cursor = "default";
      return true;
    }
  
    // 3) 각 프래그먼트 AABB → 화면좌표 투영 후 포함/교차 판정
    const count = (frags.getCount && frags.getCount()) || 0;
    const box = new THREE.Box3();
    const PAD = 0.5; // 경계 오차 보정(필요 없으면 0으로)
  
    for (let fragId = 0; fragId < count; fragId++) {
      frags.getWorldBounds(fragId, box);
      const min = box.min, max = box.max;
  
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
      const pts = corners.map(v => this.viewer.worldToClient(v));
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
      const screenMin = { x: Math.min(...xs), y: Math.min(...ys) };
      const screenMax = { x: Math.max(...xs), y: Math.max(...ys) };
  
      let hit = false;
      if (leftToRight) {
        // 좌→우 : '완전 포함' 된 것만
        hit =
          screenMin.x >= (bounds.xmin + PAD) &&
          screenMax.x <= (bounds.xmax - PAD) &&
          screenMin.y >= (bounds.ymin + PAD) &&
          screenMax.y <= (bounds.ymax - PAD);
      } else {
        // 우→좌 : '교차'만 해도 선택
        hit =
          screenMax.x >= (bounds.xmin - PAD) &&
          screenMin.x <= (bounds.xmax + PAD) &&
          screenMax.y >= (bounds.ymin - PAD) &&
          screenMin.y <= (bounds.ymax + PAD);
      }
  
      if (hit) {
        // Forge 버전별 안전 폴백
        let dbId = null;
        if (typeof frags.getDbid === 'function') {
          dbId = frags.getDbid(fragId);
        } else if (typeof frags.getDbId === 'function') {
          dbId = frags.getDbId(fragId);
        } else {
          dbId = frags.fragments?.fragId2dbId?.[fragId] ?? null;
        }
        if (dbId != null) selDb.add(dbId);
      }
    }
  
    // 4) 선택 및 툴 복귀
    const sel = Array.from(selDb);
    this.viewer.select(sel);
    console.log(`📦 ${sel.length} selected`);
  
    this.overlayDiv.style.display = "none";
    this.isDragging = false;
    this.viewer.toolController.deactivateTool(this.name);
    this.viewer.toolController.activateTool("navigation");
    this.viewer.setNavigationLock(false);
    this.viewer.container.style.cursor = "default";
  
    const toolbar = document.querySelector("#viewer-toolbar");
    if (toolbar) {
      toolbar.querySelectorAll(".tool-button").forEach(b => b?.classList?.remove("active"));
      toolbar.querySelector('[data-tool="click"]')?.classList?.add("active");
    }
  
    return true;
  }
  

  handleSingleClick(event, button) {
    if (button !== 0) return false;
    this._cleanupAndRestore();
    return true;
  }

  _cleanupAndRestore() {
    this.overlayDiv.style.display = "none";
    this.isDragging = false;
    this.viewer.toolController.deactivateTool(this.name);
    this.viewer.toolController.activateTool("navigation");
    this.viewer.setNavigationLock(false);
    this.viewer.container.style.cursor = "default";

    // 툴바 버튼 상태 복귀 (있으면)
    const tb = document.querySelector("#viewer-toolbar");
    if (tb) {
      tb.querySelectorAll(".tool-button").forEach((b) => b.classList?.remove("active"));
      tb.querySelector('[data-tool="click"]')?.classList?.add("active");
    }
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
