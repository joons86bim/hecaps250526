let viewer;

// getAccessToken: 서버에서 액세스 토큰을 가져와 콜백에 전달
async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token");
    if (!resp.ok) throw new Error(await resp.text());
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in); // 뷰어에 토큰과 만료 시간 제공
  } catch (err) {
    alert("Could not obtain access token. See the console for more details."); // 에러 알림
    console.error(err); // 콘솔에 에러 로그
  }
}

// initViewer: Autodesk Viewer 초기화 후 GuiViewer3D 인스턴스를 반환
export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer(
      { env: "AutodeskProduction", getAccessToken },
      function () {
        const config = { extensions: ["Autodesk.DocumentBrowser"] };
        viewer = new Autodesk.Viewing.GuiViewer3D(container, config); // GUI 뷰어 생성
        window.viewer = viewer;
        viewer.start(); // 뷰어 시작
        viewer.setTheme("light-theme"); // 라이트 테마 적용

        resolve(viewer); // 초기화 완료 후 뷰어 반환
      }
    );
  });
}

// loadModel: 지정한 URN 모델을 로드하고 기본 지오메트리 노드를 표시
export async function loadModel(viewer, urn) {
  // 로드 실패 시 경고 및 에러 로그
  function onDocumentLoadFailure(code, message) {
    alert("모델 로딩 실패");
    console.error(message);
  }

  // Document.load 호출하여 모델 문서 가져오기
  const doc = await new Promise((resolve, reject) => {
    Autodesk.Viewing.Document.load(
      "urn:" + urn,
      resolve,
      onDocumentLoadFailure
    );
  });

  // 기본 지오메트리 노드를 뷰어에 로드
  await viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
  viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED); // 혼합 선택 모드 설정
  viewer.clearSelection(); // 기존 선택 제거
}

// BoxSelectionTool: 박스 드래그 선택 기능 구현 클래스
class BoxSelectionTool {
  // constructor: 뷰어 참조 및 내부 상태 초기화
  constructor(viewer) {
    this.viewer = viewer;
    this.name = "BoxSelectionTool"; // 툴 식별자
    this.dragStart = null; // 드래그 시작 좌표 저장
    this.isDragging = false; // 드래그 중인지 여부 플래그
    this.overlayDiv = null; // 드래그 영역 표시용 div
  }

  // getNames: 툴 이름 배열 반환 (Viewer 등록용)
  getNames() {
    return [this.name];
  }

  // activate: 툴 활성화 시 호출되어 UI 및 상태 설정
  activate() {
    console.log("👉 [activate] BoxSelectionTool 활성화");
    this.viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED); // 선택 모드 유지
    this.viewer.toolController.deactivateTool("navigation"); // 내비게이션 툴 비활성
    this.viewer.setNavigationLock(true); // 카메라 이동 잠금
    this.viewer.container.style.cursor = "crosshair"; // 커서 변경

    // 오버레이 DOM 생성 및 초기 스타일 설정
    this.overlayDiv = document.createElement("div");
    this.overlayDiv.style.position = "absolute";
    this.overlayDiv.style.border = "2px dashed #4A90E2";
    this.overlayDiv.style.background = "rgba(74, 144, 226, 0.1)";
    this.overlayDiv.style.pointerEvents = "none";
    this.overlayDiv.style.display = "none";
    this.viewer.container.appendChild(this.overlayDiv);

    return true;
  }

  // deactivate: 툴 비활성화 시 호출되어 UI 원상복구
  deactivate() {
    console.log("👈 [deactivate] BoxSelectionTool 비활성화");
    this.viewer.setNavigationLock(false); // 카메라 이동 잠금 해제
    this.viewer.toolController.activateTool("navigation"); // 내비게이션 툴 재활성
    this.viewer.container.style.cursor = "default"; // 커서 기본 복원
    if (this.overlayDiv) {
      this.viewer.container.removeChild(this.overlayDiv); // 오버레이 제거
      this.overlayDiv = null;
    }
    return true;
  }

  // handleButtonDown: 마우스 버튼 누름 이벤트 처리 (드래그 시작)
  handleButtonDown(event, button) {
    if (button !== 0) return false; // 왼쪽 버튼만 처리
    const rect = this.viewer.container.getBoundingClientRect();
    this.dragStart = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    this.isDragging = true;
    // 오버레이 위치 및 크기 초기화
    if (this.overlayDiv) {
      this.overlayDiv.style.display = "block";
      this.overlayDiv.style.left = `${this.dragStart.x}px`;
      this.overlayDiv.style.top = `${this.dragStart.y}px`;
      this.overlayDiv.style.width = "0px";
      this.overlayDiv.style.height = "0px";
    }
    return true;
  }

  // handleButtonUp: 마우스 버튼 떼기 이벤트 처리 (드래그/선택 완료 후 복귀)
  handleButtonUp(event, button) {
    if (button !== 0 || !this.isDragging || !this.dragStart) return false;

    const rect = this.viewer.container.getBoundingClientRect();
    const dragEnd = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const isLeftToRight = dragEnd.x >= this.dragStart.x; // 드래그 방향 판단

    // 드래그 영역 경계 계산
    const bounds = {
      xmin: Math.min(this.dragStart.x, dragEnd.x),
      xmax: Math.max(this.dragStart.x, dragEnd.x),
      ymin: Math.min(this.dragStart.y, dragEnd.y),
      ymax: Math.max(this.dragStart.y, dragEnd.y),
    };

    // 모델 내 모든 DB ID 수집
    const allDbIds = [];
    const instanceTree = this.viewer.model.getInstanceTree();
    instanceTree.enumNodeChildren(
      instanceTree.getRootId(),
      (id) => allDbIds.push(id),
      true
    );

    // 드래그 영역 내/겹침 객체 판별 후 선택
    const selected = [];
    for (const dbId of allDbIds) {
      const fragIds = [];
      instanceTree.enumNodeFragments(dbId, (fragId) => fragIds.push(fragId));
      for (const fragId of fragIds) {
        const fragProxy = this.viewer.impl.getFragmentProxy(
          this.viewer.model,
          fragId
        );
        const box = new THREE.Box3();
        fragProxy.getWorldBounds(box);

        const corners = [
          new THREE.Vector3(box.min.x, box.min.y, box.min.z),
          new THREE.Vector3(box.max.x, box.min.y, box.min.z),
          new THREE.Vector3(box.min.x, box.max.y, box.min.z),
          new THREE.Vector3(box.max.x, box.max.y, box.min.z),
          new THREE.Vector3(box.min.x, box.min.y, box.max.z),
          new THREE.Vector3(box.max.x, box.min.y, box.max.z),
          new THREE.Vector3(box.min.x, box.max.y, box.max.z),
          new THREE.Vector3(box.max.x, box.max.y, box.max.z),
        ];

        const screenPts = corners.map((pt) => this.viewer.worldToClient(pt));

        // 완전 포함 여부 및 일부 겹침 여부 판단
        const inside = screenPts.every(
          (pt) =>
            pt.x >= bounds.xmin &&
            pt.x <= bounds.xmax &&
            pt.y >= bounds.ymin &&
            pt.y <= bounds.ymax
        );
        const overlap = screenPts.some(
          (pt) =>
            pt.x >= bounds.xmin &&
            pt.x <= bounds.xmax &&
            pt.y >= bounds.ymin &&
            pt.y <= bounds.ymax
        );

        if ((isLeftToRight && inside) || (!isLeftToRight && overlap)) {
          selected.push(dbId);
          break;
        }
      }
    }

    this.viewer.select(selected); // 선택 반영
    console.log("📦 선택된 객체 수:", selected.length);

    if (this.overlayDiv) {
      this.overlayDiv.style.display = "none"; // 오버레이 숨김
    }

    // 처리 후 내비게이션 툴로 자동 복귀
    this.viewer.toolController.deactivateTool(this.name);
    this.viewer.toolController.activateTool("navigation");
    this.viewer.setNavigationLock(false);
    this.viewer.container.style.cursor = "default";

    const toolbar = document.querySelector("#viewer-toolbar");
    toolbar
      .querySelectorAll(".tool-button")
      .forEach((b) => b.classList.remove("active"));
    toolbar
      .querySelector(".tool-button[data-tool=click]")
      .classList.add("active");

    // 상태 초기화
    this.dragStart = null;
    this.isDragging = false;
    return true;
  }

  // handleMouseMove: 드래그 중 오버레이 영역 크기 및 위치 업데이트
  handleMouseMove(event) {
    if (!this.isDragging || !this.dragStart) return false;
    const rect = this.viewer.container.getBoundingClientRect();
    const current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const left = Math.min(this.dragStart.x, current.x);
    const top = Math.min(this.dragStart.y, current.y);
    const width = Math.abs(this.dragStart.x - current.x);
    const height = Math.abs(this.dragStart.y - current.y);

    this.overlayDiv.style.left = `${left}px`;
    this.overlayDiv.style.top = `${top}px`;
    this.overlayDiv.style.width = `${width}px`;
    this.overlayDiv.style.height = `${height}px`;

    return true;
  }

  // handleSingleClick: 단일 클릭 시에도 내비게이션 툴로 복귀
  handleSingleClick(event) {
    this.viewer.toolController.deactivateTool(this.name);
    this.viewer.toolController.activateTool("navigation");
    const toolbar = document.querySelector("#viewer-toolbar");
    toolbar
      .querySelectorAll(".tool-button")
      .forEach((b) => b.classList.remove("active"));
    toolbar
      .querySelector(".tool-button[data-tool=click]")
      .classList.add("active");
    return true;
  }
}

// enableBoxSelectionMode: BoxSelectionTool 등록 및 활성화 함수
export function enableBoxSelectionMode() {
  const tool = viewer.toolController.getTool("BoxSelectionTool");
  if (!tool) {
    const boxTool = new BoxSelectionTool(viewer);
    viewer.toolController.registerTool(boxTool); // 툴 등록
    console.log("[등록] BoxSelectionTool 등록 완료");
  }
  viewer.toolController.activateTool("BoxSelectionTool"); // 툴 활성화
  console.log("[활성화] BoxSelectionTool 활성화 완료");
}
