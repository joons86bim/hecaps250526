// /wwwroot/js/viewer/hec.ProgressOverlay.js
// HEC Progress Overlay (v1.8)
// - attachToBody 유지, 하지만 재부착은 "필요할 때만"
// - MutationObserver -> flag set, DOM 작업은 rAF 한 번에
// - keepAlive: 'auto' (activeLoad 중 또는 dirty일 때만)

// 파일 상단 유틸 추가
function normUrn(u){
    if (!u) return null;
    let s = String(u).trim();
    s = s.replace(/^urn:/i, '');     // 'urn:' 접두 제거
    // 쿼리스트링 제거(예: ?guid=..., ?session=...)
    const qi = s.indexOf('?');
    if (qi >= 0) s = s.slice(0, qi);
    s = s.replace(/[=]+$/g, '');     // 패딩 제거
    return s;
  }
function eventUrn(ev){
  try {
    return normUrn(
      ev?.model?.getData?.()?.urn ||
      ev?.model?.urn ||
      ev?.model?.myData?.urn
    );
  } catch { return null; }
}

(function () {
    const EXT_ID = 'hec.ProgressOverlay';
    const BIG_Z = 2147483647;
  
    function getCurrentUrnSafe(){ return window.CURRENT_MODEL_URN || null; }
    function eventUrn(ev){
        try {
          return normUrn(
            ev?.model?.getData?.()?.urn ||
            ev?.model?.urn ||
            ev?.model?.myData?.urn
          );
        } catch { return null; }
      }
  
    class ProgressOverlayExtension extends Autodesk.Viewing.Extension {
      constructor(viewer, options){
        super(viewer, options);
        this.options = Object.assign({
          startVisible: false,
          autoHideOnGeometryLoaded: true,
          autoHideDelayMs: 900,
          clickToDismiss: true,
          useToastOnDone: true,
          manualFinish: true,
          attachToBody: true,
          keepAlive: 'auto'   // 'auto' | 'on' | 'off'
        }, options || {});
        this._els = {};
        this._visible = false;
        this._activeLoad = false;
        this._completedOnce = false;
        this._currentKey = null;
        this._hideTimer = null;
        this._minVisibleUntil = 0;     // 최소 표시 종료 시각(ms)
  
        this._mo = null;
        this._keepAliveId = null;
        this._dirty = false;        // 컨테이너 변화 감지 플래그
  
        this.onProgress = this.onProgress.bind(this);
        this.onGeometryLoaded = this.onGeometryLoaded.bind(this);
        this.onError = this.onError.bind(this);
        this._onKey = this._onKey.bind(this);
        this._tick = this._tick.bind(this);
      }
  
      load(){ this._buildUI(); this._bindEvents(); this._observeHost(); if(this.options.startVisible) this.show('모델을 로드하는 중입니다…'); return true; }
      unload(){ this._unbindEvents(); this._unobserveHost(); this._destroyUI(); return true; }
  
      /* ========= Public ========= */
      beginLoadFor(key, message='모델을 로드하는 중입니다…'){
        this._clearHideTimer();
        // (선택) 이벤트 리바인딩이 필요하면 아래 두 메서드 구현 후 사용
        this._detachEvents?.();
        this._attachEvents?.();
        this._ensureUIAttached(true);
        this._currentKey = normUrn(key);    // ★ 정규화 저장
        this._activeLoad = true;
        this._completedOnce = false;
        this._clearHideTimer();
        // 최소 표시시간(캐시 히트로 너무 빨리 사라지는 느낌 방지)
        this._minVisibleUntil = (typeof performance!=='undefined' ? performance.now() : Date.now()) + 400;
        this.setMessage(message);
        this.setPercent(0);
        this._setIndeterminate();
        this.show();
        this._startLoop();
      }
      beginLoad(message){ this.beginLoadFor(getCurrentUrnSafe() || '__no-key__', message); }
  
      finishFor(key, message='모델 로딩이 완료되었습니다.'){
        const nkey = key ? normUrn(key) : null;
        if (!this._activeLoad) return;
        if (this._currentKey && nkey && this._currentKey !== nkey) return;
        this._activeLoad = false;
        this._completedOnce = true;
        this._progress = 0;
        this._currentKey = null;
        this._clearHideTimer();
  
        this.setPercent(100);
        this.setMessage(message);
        if (this.options.useToastOnDone) this._showToast(message);
        // 최소 표시 보장: 남은 시간이 있으면 추가로 더 기다렸다가 닫음
        const now = (typeof performance!=='undefined' ? performance.now() : Date.now());
        const remain = Math.max(0, this._minVisibleUntil - now);
        window.setTimeout(()=>this.hide(), Math.max(this.options.autoHideDelayMs, remain));      
      }
  
      show(msg){
        if (msg) this.setMessage(msg);
        this._ensureUIAttached(true);
        const el = this._els.overlay; if (!el) return;
        el.classList.add('hec-po--show');
        el.removeAttribute('aria-hidden');
        this._visible = true;
        this._startLoop();
      }
      hide(){
        const el = this._els.overlay; if (!el) return;
        el.classList.remove('hec-po--show');
        el.setAttribute('aria-hidden','true');
        this._visible = false;
        this._resetIndeterminate();
        this._clearHideTimer();
      }
      setMessage(msg){ if (this._els.message) this._els.message.textContent = msg; }
      setPercent(pct){
        const p = Math.max(0, Math.min(100, Math.round(pct ?? 0)));
        this._els.gauge?.style.setProperty('--hec-po-deg', `${p*3.6}deg`);
        this._els.gauge?.setAttribute('data-percent', `${p}%`);
        if (this._els.barFill) this._els.barFill.style.width = `${p}%`;
        if (this._els.bar) (p>0) ? this._els.bar.classList.remove('hec-po--indeterminate') : this._els.bar.classList.add('hec-po--indeterminate');
      }
  
      /* ========= Viewer events ========= */
      onProgress(ev = {}){
        const PS = Autodesk.Viewing.ProgressState || {};
        if (ev.state === PS.PROGRESS_START && !this._activeLoad) return;
        const eUrn = eventUrn(ev);
        if (this._currentKey && eUrn && eUrn !== this._currentKey) return; // ★ 정규화된 키 비교
        if (!this._activeLoad) return;
  
        let raw=null, from=null;
        if (typeof ev.percent === 'number') raw=ev.percent, from='100';
        else if (typeof ev.percentDone === 'number') raw=ev.percentDone, from='100';
        else if (typeof ev.progress === 'number') raw=ev.progress, from='1';
        const p = (raw==null ? null : Math.round(Math.max(0, Math.min(100, from==='1'?raw*100:raw))));
        if (p==null) this._setIndeterminate(); else { this.setPercent(p); this.setMessage('로딩 중입니다…'); }

        // ★ 추가: 로더가 PROGRESS_END를 쏘면 수동모드여도 안전하게 닫아준다.
        if (PS && ev.state === PS.PROGRESS_END && this._activeLoad) {
          // 현재 키로 finish 처리 (키 불일치 방지)
          this.finishFor(this._currentKey, '모델 로딩이 완료되었습니다.');
        }

      }
      onGeometryLoaded(ev){
        const eUrn = eventUrn(ev);
        if (this._currentKey && eUrn && eUrn !== this._currentKey) return;
        if (!this._activeLoad && this.options.manualFinish) return;
        if (!this.options.manualFinish) {
          this.setPercent(100);
          this.setMessage('모델 로딩이 완료되었습니다.');
          this._completedOnce = true;
          this._activeLoad = false;
          if (this.options.useToastOnDone) this._showToast('모델 로딩이 완료되었습니다.');
          window.setTimeout(()=>this.hide(), this.options.autoHideDelayMs);
        }
      }
      onError(){
        if (!this._activeLoad && !this._visible) return;
        this.setMessage('로딩 중 오류가 발생했습니다.');
        this._setIndeterminate();
        this._showToast('로딩 오류가 발생했습니다.', true);
        if (!this.options.manualFinish) { this._activeLoad = false; this._scheduleHideFallback(); }
      }
  
      /* ========= UI/Host ========= */
      _host(){ return this.options.attachToBody ? document.body : this.viewer.container; }
  
      _buildUI(){
        const host = this._host(); if (!host) return;
        const overlay = document.createElement('div');
        overlay.className = 'hec-po-overlay';
        if (this.options.attachToBody) overlay.classList.add('hec-po--body');
        overlay.setAttribute('aria-hidden','true');
        overlay.setAttribute('role','dialog');
        overlay.setAttribute('aria-live','polite');
        overlay.style.zIndex = String(BIG_Z);
  
        const card = document.createElement('div'); card.className = 'hec-po-card';
        const gauge = document.createElement('div'); gauge.className = 'hec-po-gauge'; gauge.setAttribute('data-percent','0%');
        const msg = document.createElement('div'); msg.className = 'hec-po-message'; msg.textContent = '모델을 로드하는 중입니다…';
        const sub = document.createElement('div'); sub.className = 'hec-po-sub'; sub.textContent = '잠시만 기다려 주세요.';
        const bar = document.createElement('div'); bar.className = 'hec-po-bar hec-po--indeterminate';
        const barFill = document.createElement('div'); barFill.className = 'hec-po-bar__fill'; bar.appendChild(barFill);
  
        card.appendChild(gauge); card.appendChild(msg); card.appendChild(sub); card.appendChild(bar);
        overlay.appendChild(card);
        host.appendChild(overlay);
  
        if (this.options.clickToDismiss) overlay.addEventListener('click', (e)=>{ if (e.target===overlay && this._completedOnce) this.hide(); });
        document.addEventListener('keydown', this._onKey);
  
        this._els = { overlay, message: msg, sub, gauge, bar, barFill };
        if (this.options.startVisible) this.show();
      }
  
      // 이미 올바른 위치면 re-append 금지 (레이아웃 스톰 방지)
      _needsReattach(host){
        const el = this._els.overlay;
        if (!el || !host) return true;
        if (el.parentNode !== host) return true;
        // 이미 최상단(마지막 자식)인가?
        if (el === host.lastElementChild) return false;
        return true;
      }
  
      _ensureUIAttached(bringToFront=false){
        const host = this._host();
        if (!this._els.overlay || !document.contains(this._els.overlay)) {
          this._buildUI(); return;
        }
        if (bringToFront ? this._needsReattach(host) : (this._els.overlay.parentNode !== host)) {
          try { this._els.overlay.parentNode?.removeChild(this._els.overlay); } catch {}
          host.appendChild(this._els.overlay);
          this._els.overlay.style.zIndex = String(BIG_Z);
          if (this.options.attachToBody) this._els.overlay.classList.add('hec-po--body');
        }
      }
  
      _observeHost(){
        const host = this._host();
        if (!host || this._mo) return;
        this._mo = new MutationObserver(() => { this._dirty = true; }); // DOM 변화만 표시
        this._mo.observe(host, { childList: true, subtree: false });
      }
      _unobserveHost(){ if (this._mo){ this._mo.disconnect(); this._mo = null; } }
  
      _startLoop(){
        if (this.options.keepAlive === 'off') return;
        if (this._keepAliveId) return;
        const tick = this._tick;
        this._keepAliveId = requestAnimationFrame(tick);
      }
      _stopLoop(){ if (this._keepAliveId){ cancelAnimationFrame(this._keepAliveId); this._keepAliveId = null; } }
  
      _tick(){
        // auto: 로딩 중이거나(진행중) host가 더러워졌을 때만 DOM 확인
        const need = (this.options.keepAlive === 'on') || this._activeLoad || this._dirty;
        if (need) {
          this._ensureUIAttached(this._dirty); // 더러웠을 때만 bringToFront
          this._dirty = false;
        }
        if (this._activeLoad || (this.options.keepAlive === 'on')) {
          this._keepAliveId = requestAnimationFrame(this._tick);
        } else {
          this._stopLoop();
        }
      }
  
      _destroyUI(){ document.removeEventListener('keydown', this._onKey); this._els.overlay?.parentNode?.removeChild(this._els.overlay); this._els = {}; }
      _bindEvents(){ const v=this.viewer; v.addEventListener(Autodesk.Viewing.PROGRESS_UPDATE_EVENT,this.onProgress); v.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,this.onGeometryLoaded); v.addEventListener(Autodesk.Viewing.ERROR_EVENT,this.onError); }
      _unbindEvents(){ const v=this.viewer; v.removeEventListener(Autodesk.Viewing.PROGRESS_UPDATE_EVENT,this.onProgress); v.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,this.onGeometryLoaded); v.removeEventListener(Autodesk.Viewing.ERROR_EVENT,this.onError); }
  
      _setIndeterminate(){ this._els.bar?.classList.add('hec-po--indeterminate'); }
      _resetIndeterminate(){ this._els.bar?.classList.remove('hec-po--indeterminate'); }
      _onKey(e){ if (e.key==='Escape' && this._completedOnce && this._visible) this.hide(); }
      _showToast(text,isError=false){ const host = this._host(); const t=document.createElement('div'); t.className=`hec-po-toast${isError?' hec-po-toast--err':''}`; t.textContent=text; host.appendChild(t); setTimeout(()=>t.classList.add('hec-po-toast--show'),10); setTimeout(()=>{ t.classList.remove('hec-po-toast--show'); setTimeout(()=>t.remove(),300); },2000); }
      _scheduleHideFallback(){ if (this.options.manualFinish) return; this._clearHideTimer(); this._hideTimer = window.setTimeout(()=>{ if (!this._activeLoad && this._visible) this.hide(); },1500); }
      _clearHideTimer(){ if (this._hideTimer){ clearTimeout(this._hideTimer); this._hideTimer=null; } }
    }
  
    Autodesk.Viewing.theExtensionManager.registerExtension(EXT_ID, ProgressOverlayExtension);
  })();
  