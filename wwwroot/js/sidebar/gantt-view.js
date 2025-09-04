// /wwwroot/js/sidebar/gantt-view.js
import { normalizeTaskCategory, stripCountSuffix } from "../sidebar/panel2-ui-helpers.js";

const DAY = 24*60*60*1000;

function ymdToDate(s){
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s||"")) return null;
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}

function loadGoogleGantt(){
  if (loadGoogleGantt._p) return loadGoogleGantt._p;
  loadGoogleGantt._p = new Promise(res=>{
    google.charts.load('current', { packages: ['gantt'] });
    google.charts.setOnLoadCallback(() => res(true));
  });
  return loadGoogleGantt._p;
}

function buildWbsPathMap(wbsTree, fallbackUrn){
  const map = new Map();
  if (!wbsTree || typeof wbsTree.nodes !== "function") return map;
  const roots = wbsTree.nodes();

  (function walk(nodes, ancestors){
    (nodes||[]).forEach(n=>{
      const name = stripCountSuffix(n.text||"");
      const hasKids = n.hasChildren && n.hasChildren();
      if (hasKids) {
        walk(n.children, name ? [...ancestors, name] : ancestors);
      } else if (typeof n.dbId === "number") {
        const urn = n.urn || fallbackUrn || "";
        map.set(`${urn}:${n.dbId}`, ancestors.join(" - "));
      }
    });
  })(roots, []);

  return map;
}

function makeSimpleLabel(noStr, rawTitle){
  return `${noStr ? (noStr + ' ') : ''}${rawTitle || ''}`;
}

function buildRowObjects(taskTree, wbsTree){
  const rows = [];
  if (!taskTree || !taskTree.getRootNode) return rows;

  const pathMap = buildWbsPathMap(wbsTree, window.CURRENT_MODEL_URN || "");
  let autoId = 1;

  taskTree.getRootNode().visit(n=>{
    const d = n.data || {};

    const s  = ymdToDate(d.start);
    const e  = ymdToDate(d.end);
    const lt = Number(d.leadtime || 0);
    if (!s && !e && !lt) return;

    const id  = (d.no && String(d.no).trim()) || (`T${autoId++}`);
    const cat = normalizeTaskCategory(d.selectedOption);
    const res = (cat === "C") ? "시공" : (cat === "T" ? "가설" : (cat === "D" ? "철거" : "시공"));

    let start = s, end = e, dur = null;
    if (s && e) {
      // ok
    } else if (s && lt>0) {
      end = new Date(s.getTime() + (lt-1)*DAY);
    } else if (e && lt>0) {
      start = new Date(e.getTime() - (lt-1)*DAY);
    } else if (lt>0) {
      dur = lt*DAY;
      start = new Date();
    } else { return; }

    const progress = Math.max(0, Math.min(100, Number(d.progress||0)));
    const objCount = Number(d._aggObjCount || 0);
    const urn      = d.urn || window.CURRENT_MODEL_URN || "";
    let pathStr = "";
    const firstObj = (d.linkedObjects && d.linkedObjects[0]) || null;
    if (firstObj) {
      const key = `${firstObj.urn || urn}:${firstObj.dbId}`;
      pathStr = pathMap.get(key) || stripCountSuffix(firstObj.text || "");
    }
    const rawTitle   = String(d.title || n.title || id);
    const tooltipHtml = htmlTip(rawTitle, res, start, end, objCount, pathStr);
    const noStr = (d.no != null && String(d.no).trim()) ? String(d.no).trim() : '';

    rows.push({
      id: String(id),
      name: makeSimpleLabel(noStr, rawTitle),
      resource: res,
      start, end,
      duration: dur,
      percent: progress,
      deps: null,
      tooltip: tooltipHtml
    });
  });

  return rows;
}

function htmlTip(name, res, start, end, objCount, path){
  const fmt = (dt)=> `${dt.getFullYear()}-${(dt.getMonth()+1+"").padStart(2,"0")}-${(dt.getDate()+"").padStart(2,"0")}`;
  const color =
    res==='시공' ? '#2e7d32' :
    res==='가설' ? '#1565c0' :
    res==='철거' ? '#c62828' : '#777';
  return `
    <div style="padding:8px 10px;min-width:230px">
      <div style="font-weight:600;margin-bottom:6px">${escapeHtml(name)}</div>
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span>
        <span>${res}</span>
      </div>
      <div style="color:#555;margin-bottom:4px">${fmt(start)} ~ ${fmt(end)}</div>
      ${objCount ? `<div style="color:#666;margin-bottom:4px">연결 객체: ${objCount}개</div>` : ``}
      ${path ? `<div style="color:#666">WBS: ${escapeHtml(path)}</div>` : ``}
    </div>`;
}

function escapeHtml(s){
  return String(s||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

function mkOptions(){
  return {
    height: 360,
    gantt: {
      trackHeight: 28,
      percentEnabled: true,
      // 🚫 기본 정렬 끄기: 입력 순서 유지
      sortTasks: false,
      labelStyle: { fontName: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 12 },
      palette: [
        {color:'#2e7d32', dark:'#1b5e20', light:'#a5d6a7'},
        {color:'#1565c0', dark:'#0d47a1', light:'#90caf9'},
        {color:'#c62828', dark:'#8e0000', light:'#ef9a9a'},
      ],
      arrow: { angle: 45, width: 1.2, color: '#999', radius: 0 },
      criticalPathEnabled: false,
    },
    tooltip: { isHtml: true }
  };
}

function fmtDate(d){
  return d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
}

function updateRangeSummary(rows) {
  const el = document.getElementById('gantt-range');
  if (!el) return;
  if (!rows || !rows.length) { el.textContent = ''; return; }

  const dates = [];
  rows.forEach(r => { if (r.start) dates.push(r.start); if (r.end) dates.push(r.end); });
  if (!dates.length) { el.textContent = ''; return; }
  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  el.textContent = `(${fmtDate(min)} ~ ${fmtDate(max)})`;
}

// ─────────────────────────────────────────────
export async function initGanttView({ container, saveBtn }){
  await loadGoogleGantt();
  console.log('[gantt-view] google loaded');

  const el = (typeof container==='string') ? document.querySelector(container) : container;
  if (!el) throw new Error("gantt container not found");

  const chart   = new google.visualization.Gantt(el);
  const options = mkOptions();
  let _heightAdjusted = false; // 재-드로우 1회 제한

  // PNG 저장
  const saveEl = (typeof saveBtn==='string') ? document.querySelector(saveBtn) : saveBtn;
  if (saveEl) {
    saveEl.addEventListener('click', ()=>{
      try {
        const uri = chart.getImageURI();
        const a = document.createElement('a');
        a.href = uri; a.download = 'gantt.png'; a.click();
      } catch (e) {
        alert("PNG 내보내기가 지원되지 않는 브라우저입니다.");
      }
    });
  }

  function drawFromRowObjects(rows){
    // DataTable 구성
    const dt = new google.visualization.DataTable();
    dt.addColumn('string','Task ID');
    dt.addColumn('string','작업명');
    dt.addColumn('string','리소스/구분');
    dt.addColumn('date','시작');
    dt.addColumn('date','종료');
    dt.addColumn('number','소요(ms)');
    dt.addColumn('number','진행(%)');
    dt.addColumn('string','선행');
    dt.addColumn({type:'string', role:'tooltip', p:{html:true}});

    dt.addRows(rows.map(r => [
      r.id, r.name, r.resource, r.start, r.end, r.duration, r.percent, r.deps, r.tooltip
    ]));

    // 👉 입력 순서 고정: DataView로 0..N-1 그대로
    const view = new google.visualization.DataView(dt);
    view.setColumns([0,1,2,3,4,5,6,7,8]);
    view.setRows(rows.map((_, i) => i));

    // // 초기 높이(컨테이너 기준)
    // try { options.height = Math.max(120, el.clientHeight || 320); } catch(_) {}
    // 1) 행 수 기반으로 캔버스 높이 산정(스크롤 생기도록)
    const trackH = (options.gantt?.trackHeight || 28);
    const header  = 56;           // 상단 헤더 여백(경험값)
    const rowGap  = 4;            // 트랙 간 여백 세팅
    const content = rows.length * (trackH + rowGap) + header;
    // 컨테이너보다 크면 스크롤이 생기도록, 작을 때는 컨테이너 높이를 최소로
    const minH = Math.max(el.clientHeight || 320, 120);
    options.height = Math.max(content, minH);


    // 매 드로우 후 후처리: 하단 축 숨김 + 필요 시 높이 재조정
    google.visualization.events.addOneTimeListener(chart, 'ready', ()=>{
      hideBottomAxis(el);   // ⬅️ 하단 월/연 텍스트 제거 (컨테이너 전체 감시)
      // try {
      //   const svg = el.querySelector('svg');
      //   if (svg) {
      //     // 특수기호 제거 + 좌측정렬 시도(브라우저에 따라 한계)
      //     svg.querySelectorAll('text').forEach(t => {
      //       t.textContent = (t.textContent || '')
      //         .replace(/^[■●▪▫◼◻□\s]+/, '')
      //         .replace(/^\s*[▸▹▻▶▷]\s*/, '');
      //       t.setAttribute('text-anchor','start');
      //       t.removeAttribute('dx');
      //     });
      //   }
      // } catch(_) {}


      // // 실제 콘텐츠 높이로 1회 재-드로우(하단 여백 제거)
      // if (!_heightAdjusted) {
      //   const h = measureContentHeight(el);
      //   if (h && Math.abs((options.height||0) - h) > 2) {
      //     _heightAdjusted = true;
      //     options.height = h;
      //     chart.draw(view, options);   // ⚠️ 다시도 view로!
      //     return; // 두 번째 ready에서 다시 hideBottomAxis 호출됨
      //   }
      // }
    });

    // 첫 드로우도 view로!
    chart.draw(view, options);

    // 상단 범위 텍스트
    updateRangeSummary(rows);
    // (선택) 상단 커스텀 축 유지 시 사용
    renderTopAxis(rows, el);
  }

  return {
    drawFromRows: drawFromRowObjects,
    renderFromTrees(taskTree, wbsTree){
      const rows = buildRowObjects(taskTree, wbsTree);
      drawFromRowObjects(rows);
    }
  };
}

// ── 상단 커스텀 축(원하면 유지) ─────────────────────
function renderTopAxis(rows, chartEl){
  const host  = document.getElementById('gantt-top-axis');
  if (!host) return;
  const track = host.querySelector('.axis-track');
  if (!track) return;

  const dates = [];
  rows.forEach(r => { if (r.start) dates.push(r.start); if (r.end) dates.push(r.end); });
  if (!dates.length) { track.innerHTML = ''; return; }
  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));

  const svg = chartEl.querySelector('svg');
  const svgWidth = (svg && (svg.viewBox?.baseVal?.width || svg.width?.baseVal?.value)) || chartEl.scrollWidth || chartEl.clientWidth || 1200;
  const spanDays = Math.max(1, Math.round((max - min) / DAY) + 1);
  const pxPerDay = svgWidth / spanDays;

  const startMonth = new Date(min.getFullYear(), min.getMonth(), 1);
  const endMonth   = new Date(max.getFullYear(), max.getMonth()+1, 1);
  const months = [];
  let cur = new Date(startMonth);
  while (cur < endMonth) {
    const next = new Date(cur.getFullYear(), cur.getMonth()+1, 1);
    const left  = Math.max(cur, min);
    const right = Math.min(next, new Date(max.getFullYear(), max.getMonth(), max.getDate()+1));
    const days  = Math.max(0, Math.round((right - left) / DAY));
    if (days > 0) {
      const w = Math.max(1, Math.round(days * pxPerDay));
      months.push({ y: cur.getFullYear(), m: cur.getMonth()+1, w });
    }
    cur = next;
  }

  track.innerHTML = months.map(({y,m,w}) =>
    `<span class="axis-month" style="width:${w}px">${y}.${String(m).padStart(2,'0')}</span>`
  ).join('');

  const sync = () => { track.style.transform = `translateX(${-chartEl.scrollLeft}px)`; };
  sync();
  chartEl.removeEventListener('scroll', chartEl.__ganttAxisSync);
  chartEl.__ganttAxisSync = sync;
  chartEl.addEventListener('scroll', sync, { passive: true });
}

// ── 하단(월/연) 타임라인 숨김 ─────────────────────
function hideBottomAxis(containerEl){
  // 기존 옵저버 정리
  if (containerEl.__bottomAxisObs) {
    containerEl.__bottomAxisObs.disconnect();
    containerEl.__bottomAxisObs = null;
  }

  const apply = () => {
    try {
      const svg = containerEl.querySelector('svg');
      if (!svg) return;
      // SVG 전체 높이 기준 하단 40px 텍스트 + 월/연 텍스트 제거
      const svgH =
        (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.height) ||
        svg.getBBox().height ||
        svg.getBoundingClientRect().height || 0;

      const month = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/;
      const year  = /^\d{4}$/;

      svg.querySelectorAll('text').forEach(t=>{
        const bb = t.getBBox(); // y는 텍스트 상단이므로 약간 보정 불필요(40px 여유)
        const txt = (t.textContent || '').trim();
        if (bb.y > svgH - 40 || month.test(txt) || year.test(txt)) {
          t.style.display = 'none';
        }
      });
    } catch(_) {}
  };

  // 즉시 1회
  apply();
  // 컨테이너 전체를 관찰(차트가 다시 그려져 svg가 갈아껴져도 대응)
  const obs = new MutationObserver(apply);
  obs.observe(containerEl, { childList: true, subtree: true });
  containerEl.__bottomAxisObs = obs;
}

// ── 실제 컨텐츠 높이(행 영역 + 헤더) 계산 ───────────
function measureContentHeight(containerEl){
  try {
    const svg = containerEl.querySelector('svg');
    if (!svg) return null;

    // 1) 행 배경 rect(줄무늬)들의 (y+height) 최댓값
    let gridBottomY = 0;
    svg.querySelectorAll('rect').forEach(r=>{
      const y = parseFloat(r.getAttribute('y') || '0');
      const h = parseFloat(r.getAttribute('height') || '0');
      gridBottomY = Math.max(gridBottomY, y + h);
    });

    // 2) 상단 헤더 마진(경험값)
    const headerMargin = 32;

    return Math.max(120, Math.round(gridBottomY + headerMargin));
  } catch(_) { return null; }
}
