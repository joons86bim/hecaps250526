// 👁 눈알 버튼: 빠른 diff + RAF 청크 토글
const ICONS = {
  eye: `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,
  eyeOff: `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="m3 3 18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42"></path>
    <path d="M9.88 5.11A10.94 10.94 0 0 1 12 5c6 0 10 7 10 7a17.49 17.49 0 0 1-3.64 4.9"></path>
    <path d="M6.1 6.1C3.43 7.94 2 12 2 12a17.47 17.47 0 0 0 7.5 7.5"></path>
  </svg>`
};

function rowFor(node){
  const uid = node?._id ?? node?.id;
  const li = document.querySelector(`#wbs-group-list li[data-uid="${uid}"]`);
  return li?.querySelector(':scope > .title-wrap') || li;
}

export function installWbsVisibilityDelegate(wbsTree){
  const listEl = document.getElementById('wbs-group-list');
  if (!listEl || listEl.__eyeHandlerBound) return;
  listEl.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.eye-toggle');
    if (!btn) return;
    ev.stopPropagation(); ev.preventDefault();
    const li = btn.closest('li[data-uid]'); const uid = li && li.getAttribute('data-uid');
    const node = uid ? wbsTree.node(uid) : null; if (!node) return;
    btn.classList.add('busy');
    try { await toggleNode(node); }
    finally { btn.classList.remove('busy'); }
  }, { capture:false });
  listEl.__eyeHandlerBound = true;
}

const hidden = new Set(); // `${URN}:${dbId}`
const URN = () => (window.CURRENT_MODEL_URN || "");
const K = id => `${URN()}:${id}`;

function getDescLeafDbIdsCached(node){
  if (Array.isArray(node._descLeafIds)) return node._descLeafIds;
  const list = [];
  (function walk(n){
    if (n.hasChildren && n.hasChildren()) n.children.forEach(walk);
    else if (typeof n.dbId === 'number') list.push(n.dbId);
  })(node);
  node._descLeafIds = list;
  return list;
}
function decideHideFast(node){
  const ids = getDescLeafDbIdsCached(node);
  if (!ids.length) return { hide:false, ids };
  for (let i = 0; i < ids.length; i++){
    if (!hidden.has(K(ids[i]))) return { hide:true, ids }; // 하나라도 보이면 → 숨김
  }
  return { hide:false, ids }; // 모두 숨김 상태였다면 → 보이기
}
function diffIdsForToggle(ids, hide){
  const out = [];
  if (hide) {
    for (let i = 0; i < ids.length; i++) if (!hidden.has(K(ids[i]))) out.push(ids[i]);
  } else {
    for (let i = 0; i < ids.length; i++) if (hidden.has(K(ids[i]))) out.push(ids[i]);
  }
  return out;
}
function applyVisibilityChunked(dbIds, hide){
  return new Promise((resolve) => {
    const viewer = window.viewer;
    if (!viewer || !dbIds?.length) return resolve();
    const model = (viewer.getVisibleModels && viewer.getVisibleModels()[0]) || viewer.model;
    const CHUNK = 3000; let i = 0;
    const oldCursor = document.body.style.cursor; document.body.style.cursor = 'progress';
    function step(){
      const slice = dbIds.slice(i, i+CHUNK); i += CHUNK;
      if (slice.length) { if (hide) viewer.hide(slice, model); else viewer.show(slice, model); }
      if (i < dbIds.length) requestAnimationFrame(step);
      else {
        viewer.impl.invalidate(true, true, true);
        setTimeout(() => viewer.impl.sceneUpdated && viewer.impl.sceneUpdated(true), 0);
        document.body.style.cursor = oldCursor || '';
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}
let busy = false;
export async function toggleNode(node){
  if (busy) return;
  busy = true;
  try {
    const d = decideHideFast(node);
    const todo = diffIdsForToggle(d.ids, d.hide);
    if (!todo.length) { ensureEyeButton(node); return; }
    await applyVisibilityChunked(todo, d.hide);
    if (d.hide) for (let i=0;i<todo.length;i++) hidden.add(K(todo[i]));
    else        for (let i=0;i<todo.length;i++) hidden.delete(K(todo[i]));
    // 아이콘 최소 갱신: 자기 자신과 DOM에 있는 자식만
    ensureEyeButton(node);
    if (node.hasChildren && node.hasChildren()) {
      (node.children || []).forEach(ch => {
        const row = rowFor(ch);
        if (row) ensureEyeButton(ch);
      });
    }
  } finally { busy = false; }
}
export function ensureEyeButton(node){
  const row = rowFor(node); if (!row) return;
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
    row.appendChild(btn);
  }
  const ids = getDescLeafDbIdsCached(node);
  let seenHidden = false, seenVisible = false;
  for (let i = 0; i < ids.length; i++){
    if (hidden.has(K(ids[i]))) seenHidden = true; else seenVisible = true;
    if (seenHidden && seenVisible) break;
  }
  const state = (seenHidden && seenVisible) ? 'mixed' : (seenHidden ? 'hidden' : 'visible');
  btn.innerHTML = (state === 'hidden') ? ICONS.eyeOff : ICONS.eye;
  btn.title = (state === 'hidden') ? '보이기' : (state === 'mixed' ? '일부 숨김 - 클릭 시 모두 숨김' : '숨기기');
  btn.style.opacity = (state === 'hidden') ? '0.5' : (state === 'mixed' ? '0.85' : '1');
}
export function resetAllVisibility(){
  const viewer = window.viewer;
  if (viewer) viewer.showAll();
  hidden.clear();
}
