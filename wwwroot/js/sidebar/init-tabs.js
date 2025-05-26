/**
 * 사이드바 탭 초기화
 * @param {string} sidebarSelector - 사이드바 컨테이너 셀렉터 (기본: '#sidebar')
 */
export function initTabs(sidebarSelector = "#sidebar") {
  const tabButtons = document.querySelectorAll(
    `${sidebarSelector} .tab-button`
  );
  const panels = document.querySelectorAll(
    `${sidebarSelector} .panels > .panel`
  );

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;

      // 1) 탭 버튼 active 토글
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 2) 패널 보이기 / 숨기기
      panels.forEach((p) => {
        if (p.id === targetId) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });
    });
  });
}
