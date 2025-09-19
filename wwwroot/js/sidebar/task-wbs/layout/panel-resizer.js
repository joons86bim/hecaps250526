// /wwwroot/js/sidebar/task-wbs/layout/panel-resizer.js
export function bindPanel2Resizer(viewer){
  const resizer = document.getElementById('sidebar-resizer');
  const root = document.documentElement;
  if (!resizer) return;

  const MIN = 360;       // 사이드바 최소 폭
  const PREVIEW_MIN = 520; // 뷰어 최소 폭(좌표 틀어짐 방지 위한 여유)

  const getMax = () => Math.max(MIN, window.innerWidth - PREVIEW_MIN);

  const getWidth = () => {
    const v = getComputedStyle(root).getPropertyValue('--sidebar-width').trim();
    const n = parseInt(v || '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 900;
  };

  function apply(px){
    const clamped = Math.min(getMax(), Math.max(MIN, Math.round(px)));
    root.style.setProperty('--sidebar-width', clamped + 'px');
    localStorage.setItem('sidebarWidthPx', String(clamped));
    // 좌표 어긋남 방지: 즉시/다음 프레임 두 번 갱신
    try {
      viewer?.resize?.();
      viewer?.impl?.invalidate?.(true, true, true);
      requestAnimationFrame(()=>{
        viewer?.resize?.();
        viewer?.impl?.invalidate?.(true, true, true);
      });
    } catch {}
  }

  // ── Drag handlers
  let dragging = false;
  let startX = 0, startWidth = 0;

  function onDown(e){
    dragging = true;
    startX = e.clientX;
    startWidth = getWidth();
    document.body.classList.add('resizing-x');
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp, { once:true });
    e.preventDefault();
  }
  function onMove(e){
    if (!dragging) return;
    const delta = e.clientX - startX;
    apply(startWidth + delta);
  }
  function onUp(){
    dragging = false;
    document.body.classList.remove('resizing-x');
    window.removeEventListener('mousemove', onMove);
    // 최종 보정
    apply(getWidth());
  }

  // ── Wire events
  resizer.addEventListener('mousedown', onDown);
  resizer.addEventListener('dblclick', () => apply(900));

  // 창 크기 변경 시 현재 폭이 최대치 넘지 않도록 보정
  window.addEventListener('resize', () => {
    const maxNow = getMax();
    const cur = getWidth();
    if (cur > maxNow) apply(maxNow);
  });

  // ── 초기 진입: 저장값 복원 or 900px 기본값
  const stored = parseInt(localStorage.getItem('sidebarWidthPx') || '0', 10);
  const initial = Number.isFinite(stored) && stored >= MIN
    ? Math.min(getMax(), stored)
    : Math.min(getMax(), 900);
  apply(initial);
}
