// /wwwroot/js/main.js

import { initTabs } from "./sidebar/init-tabs.js";
import { initTree } from "./sidebar/init-tree.js";
import { initPanel2Content } from "./sidebar/panel2.js";
import { initViewer, loadModel } from "./viewer/init-viewer.js";
import { initToolbar } from "./viewer/toolbar.js";
import { initTaskListButtons } from "./sidebar/panel2-buttons.js";

const login = document.getElementById("login");

(async function () {
  try {
    // 1) 사용자 인증 확인
    const resp = await fetch("/api/auth/profile", { credentials: "include" });
    if (resp.ok) {
      const user = await resp.json();
      login.innerText = `Logout (${user.name})`;
      login.onclick = () => {
        const iframe = document.createElement("iframe");
        iframe.style.visibility = "hidden";
        iframe.src = "https://accounts.autodesk.com/Authentication/LogOut";
        document.body.appendChild(iframe);
        iframe.onload = () => {
          window.location.replace("/api/auth/logout");
          document.body.removeChild(iframe);
        };
      };

      // 2) 사이드바 탭 초기화
      initTabs("#sidebar");

      // 3) Viewer 초기화
      const viewer = await initViewer(document.getElementById("preview"));

      // 4) 툴바 버튼 설정
      initToolbar(viewer);

      // 5) 트리 초기화 및 모델 로드 후 panel2 렌더링
      initTree("#tree", async (versionId) => {
        // versionId를 Base64 URN으로 인코딩
        const urn = window.btoa(versionId).replace(/=/g, "");
        await loadModel(viewer, urn);
        viewer.clearSelection();
        // 1) panel2 마크업+리스트 렌더링
        initPanel2Content();
        // 2) 추가/삭제 버튼 기능 바인딩
        initTaskListButtons();
      });
    } else {
      // 로그인 안 된 상태
      login.innerText = "Login";
      login.onclick = () => window.location.replace("/api/auth/login");
    }

    login.style.visibility = "visible";
  } catch (err) {
    alert(
      "Could not initialize the application. See console for more details."
    );
    console.error(err);
  }
})();
