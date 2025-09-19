// /wwwroot/js/sidebar/task-wbs/ui/wbs-visibility.js
// 👁 WBS 노드 가시성 토글 — 단순/안정 버전 (viewer.hide/show + 로컬 상태셋)

const ICONS = {
  eye: `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,
  eyeOff: `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 3 18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42"></path>
    <path d="M9.88 5.11A10.94 10.94 0 0 1 12 5c6 0 10 7 10 7a17.49 17.49 0 0 1-3.64 4.9"></path>
    <path d="M6.1 6.1C3.43 7.94 2 12 2 12a17.47 17.47 0 0 0 7.5 7.5"></path>
  </svg>`
};

// 전역 상태셋(현재 숨김인 dbId)
const HIDDEN = new Set();
const CUR_URN = () => window.CURRENT_MODEL_URN || "";
const K = (id) => `${CUR_URN()}:${id}`;

// 도우미
function rowFor(node){
  const uid = node?._id ?? node?.id;
  const li = document.querySelector(`#wbs-group-list li[data-uid="${uid}"]`);
  return li?.querySelector(':scope > .title-wrap') || li;
}
function getDescLeafDbIdsCached(node){
  // 1) 프로바이더가 있으면, 경로 기반으로 정확한 전체 dbIds 반환
  try {
    if (typeof window.__WBS_GET_DBIDS_FOR_NODE === 'function') {
      const list = window.__WBS_GET_DBIDS_FOR_NODE(node) || [];
      if (Array.isArray(list) && list.length) return list;
    }
  } catch(_){}
  // 2) 폴백: 현재 로드된 서브트리만 스캔 (이전 방식)
  if (Array.isArray(node._descLeafIds)) return node._descLeafIds;
  const list = [];
  (function walk(n){
    if (n.hasChildren && n.hasChildren()) (n.children || []).forEach(walk);
    else if (typeof n.dbId === 'number') list.push(n.dbId);
  })(node);
  node._descLeafIds = list;
  return list;
}

function getViewerAndModel(){
  const v = window.viewer;
  if (!v) return null;
  const model = (v.getVisibleModels && v.getVisibleModels()[0]) || v.model;
  return model ? { v, model } : null;
}

// 아이콘 갱신(로컬셋 기반)
function refreshIconFor(node){
  const row = rowFor(node);
  if (!row) return;
  let btn = row.querySelector('.eye-toggle');
  if (!btn) return;

  const ids = getDescLeafDbIdsCached(node);
  let seenHidden=false, seenVisible=false;
  for (let i=0;i<ids.length;i++){
    if (HIDDEN.has(K(ids[i]))) seenHidden = true; else seenVisible = true;
    if (seenHidden && seenVisible) break;
  }
  const state = (seenHidden && seenVisible) ? 'mixed' : (seenHidden ? 'hidden' : 'visible');
  btn.innerHTML = (state === 'hidden') ? ICONS.eyeOff : ICONS.eye;
  btn.title = (state === 'hidden') ? '보이기' : (state === 'mixed' ? '일부 숨김 - 클릭 시 모두 숨김' : '숨기기');
  btn.style.opacity = (state === 'hidden') ? '0.5' : (state === 'mixed' ? '0.85' : '1');
}

// 버튼 보장
export function ensureEyeButton(node){
  const row = rowFor(node);
  if (!row) return;
  let btn = row.querySelector('.eye-toggle');
  if (!btn) {
    btn = document.createElement('span');
    btn.className = 'eye-toggle';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.marginLeft = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.paddingLeft = '6px';
    btn.style.userSelect = 'none';
    btn.style.flex = '0 0 auto';
    btn.setAttribute('tabindex','0');
    row.appendChild(btn);
  }
  refreshIconFor(node);
}

/* ──────────────────────────────────────────────────────────
   아이콘 리프레시 유틸: 서브트리 전체 + 조상까지 갱신
   ────────────────────────────────────────────────────────── */
// 서브트리 전체를 청크로 갱신(깊은 레벨 아이콘 누락 방지)
function refreshIconsDeep(node){
  const q = [node];
  const CHUNK = 600; // 프레임 나눠서 렌더 부담 완화
  function step(deadline){
    let n = 0;
    while (q.length && (!deadline || deadline.timeRemaining() > 3) && n < CHUNK){
      const cur = q.shift();
      try { ensureEyeButton(cur); refreshIconFor(cur); } catch(_){}
      if (cur.hasChildren && cur.hasChildren()) q.push(...(cur.children || []));
      n++;
    }
    if (q.length){
      if (typeof requestIdleCallback === 'function') requestIdleCallback(step, { timeout: 60 });
      else setTimeout(step, 0);
    }
  }
  if (typeof requestIdleCallback === 'function') requestIdleCallback(step, { timeout: 60 });
  else setTimeout(step, 0);
}

// 조상 방향으로 혼합 상태/숨김/보임 재계산
function refreshIconsUp(node){
  let p = node && node.parent;
  while (p && (!p.isRoot || !p.isRoot())){
    try { ensureEyeButton(p); refreshIconFor(p); } catch(_){}
    p = p.parent;
  }
}

/* ──────────────────────────────────────────────────────────
   토글 본체(로컬셋 + viewer.hide/show)
   ────────────────────────────────────────────────────────── */
let busy = false;
async function toggleNode(node){
  if (!node) return;
  if (busy) return;
  busy = true;
  const unlock = setTimeout(()=>{ busy=false; }, 2000);

  try {
    const ids = getDescLeafDbIdsCached(node);
    if (!ids.length) return;

    // 하나라도 보이면 → 숨김, 전부 숨김이면 → 보이기
    let anyVisible = false, anyHidden = false;
    for (let i=0;i<ids.length;i++){
      if (HIDDEN.has(K(ids[i]))) anyHidden = true; else anyVisible = true;
      if (anyHidden && anyVisible) break;
    }
    const hide = anyVisible;

    const todo = hide
      ? ids.filter(id => !HIDDEN.has(K(id)))
      : ids.filter(id =>  HIDDEN.has(K(id)));

    if (!todo.length) { 
      refreshIconsDeep(node);   // 누락 방지: 그래도 서브트리 리프레시
      refreshIconsUp(node);
      return; 
    }

    const ctx = getViewerAndModel();
    if (!ctx) { 
      refreshIconsDeep(node);
      refreshIconsUp(node);
      return; 
    }

    // chunked 적용
    const CHUNK = 2000;
    for (let i=0;i<todo.length; i += CHUNK){
      const slice = todo.slice(i, i+CHUNK);
      if (hide) ctx.v.hide(slice, ctx.model);
      else      ctx.v.show(slice, ctx.model);
      // 상태셋 갱신
      for (let j=0;j<slice.length;j++){
        const id = slice[j];
        if (hide) HIDDEN.add(K(id));
        else      HIDDEN.delete(K(id));
      }
      // 다음 프레임으로 넘겨 숨 고르기
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => requestAnimationFrame(r));
    }
    // 리프레시
    try {
      ctx.v.impl.invalidate(true, true, true);
      ctx.v.impl.sceneUpdated && ctx.v.impl.sceneUpdated(true);
    } catch(_){}

    // ✅ 서브트리 전체 + 조상 아이콘까지 재도색(깊은 레벨 누락 방지)
    refreshIconsDeep(node);
    refreshIconsUp(node);

  } finally {
    clearTimeout(unlock);
    busy = false;
  }
}

/* ──────────────────────────────────────────────────────────
   전역 델리게이트(한 번만)
   ────────────────────────────────────────────────────────── */
export function installWbsVisibilityDelegate(){
  if (window.__WBS_VIS_GLOBAL_INSTALLED) return;
  window.__WBS_VIS_GLOBAL_INSTALLED = true;

  const handler = async (ev) => {
    const t = ev.target && ev.target.closest && ev.target.closest('.eye-toggle');
    if (!t) return;
    if (!t.closest('#wbs-group-list')) return;

    ev.preventDefault();
    ev.stopPropagation();

    const li = t.closest('li[data-uid]');
    const uid = li && li.getAttribute('data-uid');
    const node = uid ? (window.wbsTree && window.wbsTree.node(uid)) : null;
    if (!node) return;

    t.classList.add('busy');
    const autoUnbusy = setTimeout(()=> t.classList.remove('busy'), 1200);
    try { await toggleNode(node); }
    finally { clearTimeout(autoUnbusy); t.classList.remove('busy'); }
  };

  document.addEventListener('click', handler, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const t = e.target && e.target.closest && e.target.closest('.eye-toggle');
      if (!t || !t.closest('#wbs-group-list')) return;
      e.preventDefault(); e.stopPropagation();
      t.click();
    }
  }, true);

  // 모델/패널 초기화 시 상태 리셋
  window.addEventListener('panel2-ready', () => { HIDDEN.clear(); });
}
