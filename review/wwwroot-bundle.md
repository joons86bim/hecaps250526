# wwwroot review bundle


---

## `wwwroot/css/00-base.css`

```css
/* 파일 최상단 권장 */
*, *::before, *::after { box-sizing: border-box; }

:root{
  --sidebar-min: 320px;              /* 최소폭 */
  --viewer-min: 520px;               /* 뷰어가 최소로 유지할 폭 */
  --sidebar-width: 900px;            /* 초기 기본 폭 (최초 1회) */
}

/* 공통 계산: 좌측 오프셋(= 실제 사이드바 폭) */
:root{
  --sidebar-left: clamp(
    var(--sidebar-min),
    var(--sidebar-width, 900px),
    calc(100vw - var(--viewer-min))
  );
}

html, body{
  height: 100%;
  margin: 0;
  overflow: hidden; /* 페이지 스크롤 방지 */
  font-family: '맑은고딕', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
  line-height: 1.4;             /* 기본 가독성 향상 */
}

@font-face {
  font-family: 'HDHarmony_M';
  src:
    url("/fonts/현대하모니_M.woff2") format('woff2'),
    url("/fonts/현대하모니_M.woff") format('woff'),
    url("/fonts/현대하모니_M.ttf") format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* '맑은고딕'은 윈도우 시스템 폰트이므로 로컬 탐색만: 네트워크 요청 X */
@font-face {
  font-family: '맑은고딕';
  src: local('Malgun Gothic'), local('맑은 고딕'), local('맑은고딕');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* 고급 타이틀 룩 (헤더 타이틀/큰 제목) */
h1, h2, .display-title, #header .title {
  font-family: 'HDHarmony_M';
  letter-spacing: .02em;
  font-weight: 600;
}

```

---

## `wwwroot/css/05-hec-progress-overlay.css`

```css
/* /wwwroot/css/05-hec-progress-overlay.css */

.hec-po-overlay {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    background: rgba(10,14,22,.35);
    backdrop-filter: blur(3px);
    z-index: 9999;
    opacity: 0; pointer-events: none;
    transition: opacity .25s ease;
  }
  .hec-po-overlay.hec-po--show { opacity: 1; pointer-events: auto; }
  
  .hec-po-card {
    min-width: 320px; max-width: min(92vw, 520px);
    padding: 20px 22px;
    border-radius: 16px;
    background: rgba(24,28,38,.85);
    color: #fff;
    box-shadow: 0 6px 28px rgba(0,0,0,.35);
    display: grid;
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto auto;
    grid-column-gap: 16px; grid-row-gap: 10px;
    align-items: center;
    border: 1px solid rgba(255,255,255,.08);
  }
  
  .hec-po-gauge {
    --hec-po-deg: 0deg;
    width: 72px; height: 72px; border-radius: 50%;
    position: relative;
    background: conic-gradient(#6ae3ff var(--hec-po-deg), rgba(255,255,255,.14) 0);
    box-shadow: inset 0 0 0 6px rgba(255,255,255,.06);
  }
  .hec-po-gauge::after {
    content: attr(data-percent);
    position: absolute; inset: 0; display: grid; place-items: center;
    font-weight: 700; font-size: 14px; color: #dff7ff;
  }
  
  .hec-po-message { grid-column: 2 / -1; font-size: 18px; line-height: 1.2; font-weight: 700; }
  .hec-po-sub { grid-column: 2 / -1; font-size: 13px; color: #bcd7e2; opacity: .9; margin-top: -4px; }
  
  .hec-po-bar {
    grid-column: 1 / -1; height: 8px; border-radius: 999px;
    position: relative; overflow: hidden;
    background: rgba(255,255,255,.13);
    border: 1px solid rgba(255,255,255,.08);
  }
  .hec-po-bar__fill {
    position: absolute; left: 0; top: 0; bottom: 0; width: 0%;
    background: linear-gradient(90deg, #5ad2ff, #97f0ff);
    transform: translateZ(0);
    transition: width .25s ease;
  }
  .hec-po-bar.hec-po--indeterminate .hec-po-bar__fill {
    width: 40%;
    animation: hec-po-indet 1.2s ease-in-out infinite;
  }
  @keyframes hec-po-indet {
    0% { left: -40% } 50% { left: 60% } 100% { left: 100% }
  }
  
  .hec-po-toast {
    position: absolute; right: 14px; top: 14px;
    background: rgba(27,32,42,.95); color: #e9faff;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px; padding: 10px 12px;
    box-shadow: 0 6px 20px rgba(0,0,0,.35);
    opacity: 0; transform: translateY(-6px);
    transition: opacity .25s ease, transform .25s ease;
    pointer-events: none; z-index: 10000;
    font-size: 13px; font-weight: 600;
  }
  .hec-po-toast--err { color: #ffe9e9; background: rgba(46,16,16,.95); }
  .hec-po-toast--show { opacity: 1; transform: translateY(0); }
  
  /* body 최상단으로 붙을 때 풀스크린 */
.hec-po-overlay.hec-po--body { position: fixed; inset: 0; }
```

---

## `wwwroot/css/10-layout.css`

```css
/* 헤더 */
#header{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 .5em;
  gap: 10px;
  background: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  z-index: 1000;
}

#header .title{
  margin-left: 20px;
  font-size: 22px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}
#header .logo{ height: 1.75em; width: auto; }

#login{
  margin-left: auto;
  padding: 4px 10px;
  background:#6c757d; color:#fff; border:0; border-radius:5px; cursor:pointer;
  font-size: 16px; transition: all .3s ease-in-out;
}
#login:hover{
  background:#5a6268;
  box-shadow: 0 4px 8px rgba(0,0,0,.2);
  transform: translateY(-2px);
}

/* 미리보기(뷰어+간트) 전체 래퍼: 좌측은 사이드바 폭 변수에 종속 */
#preview{
  position: fixed;
  top: 3em; right: 0; bottom: 0;
  left: var(--sidebar-left);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

---

## `wwwroot/css/20-sidebar.css`

```css
/* 사이드바 전체 */
#sidebar{
  position: fixed;
  top: 3em; left: 0; bottom: 0;
  width: var(--sidebar-width, 900px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:#fff;
}

/* 탭 헤더 */
.tabs{
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}
.tab-button{
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color .2s, border-bottom-color .2s;
  font-size: 18px;
}
.tab-button.active{
  color: #0078d4;
  border-bottom-color: #0078d4;
}

/* 탭 컨텐츠 래퍼 */
.panels{
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  margin: 0; padding: 0;
}
.panels .panel{
  display: none;
  height: 100%;
}
.panels .panel.active{
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 사이드바 리사이저 */
#sidebar-resizer{
  position: fixed;
  top: 3em;
  left: var(--sidebar-left);
  width: 4px;
  height: calc(100vh - 3em);
  background: linear-gradient(to right,#e3eaf3,#d2d9e6);
  cursor: ew-resize;
  z-index: 30;
  transition: background .15s;
  border-right: 1px solid #ccd4e3;
  border-left: 1px solid #f8fafb;
  border-radius: 4px;
}
#sidebar-resizer:hover{ background: #a4cef7; }

/* ───── 프로젝트/파일 트리(panel1) 스타일 ───── */
#panel1 .panel-content{ flex:1; overflow-y:auto; padding:8px; min-height:0; }
.tree-list{ list-style:none; margin:0; padding-left:0; }
.tree-list .tree-item{
  display:flex; align-items:center; padding:4px 0;
  font-size:13px; color:#333; cursor:pointer;
}
.tree-list .tree-item .toggle{
  border:1px solid #ccc; width:1em; height:1em;
  display:inline-flex; align-items:center; justify-content:center;
  margin-right:8px; cursor:pointer; border-radius:2px;
}
.tree-list .tree-item .toggle::after{
  content: attr(data-icon);
  font-size:12px; line-height:1;
}
.tree-list .tree-item .checkbox{ margin-right:4px; }
.tree-list .tree-item .label{ flex:1; }
#panel1 .tree-list .tree-item.selected{ background-color:#e6f7ff; }
#panel1 .tree-list .tree-item:hover{ background:#f5faff; }
.tree-list .tree-children{ list-style:none; padding-left:20px; margin:2px 0; }

/* (옵션) 트리 아이콘 */
.icon-hub:before{ background:url(https://raw.githubusercontent.com/primer/octicons/main/icons/apps-16.svg) center/cover no-repeat; }
.icon-project:before{ background:url(https://raw.githubusercontent.com/primer/octicons/main/icons/project-16.svg) center/cover no-repeat; }
.icon-my-folder:before{ background:url(https://raw.githubusercontent.com/primer/octicons/main/icons/file-directory-16.svg) center/cover no-repeat; }
.icon-item:before{ background:url(https://raw.githubusercontent.com/primer/octicons/main/icons/file-16.svg) center/cover no-repeat; }
.icon-version:before{ background:url(https://raw.githubusercontent.com/primer/octicons/main/icons/clock-16.svg) center/cover no-repeat; }

/* 드래그 중 UX 보조 */
body.resizing-x { cursor: ew-resize; user-select: none; }

/* WBS 내에서는 panel1 트리 hover/selected 배경을 무효화 */
#wbs-group-list .tree-list .tree-item,
#wbs-group-list .tree-list .tree-item:hover,
#wbs-group-list .tree-list .tree-item.selected{
  background: transparent !important;
  box-shadow: none !important;
}

```

---

## `wwwroot/css/30-task-wbs.css`

```css
/* =========================
   Task 패널 + 공용 컨테이너
   (WBS 테이블/행 색칠은 35-wbs-matrix.css 로 이동)
========================= */

:root{
  /* Task 표 objcount 색 (유지) */
  --task-c:  #2e7d32; /* 시공 */
  --task-t:  #1976d2; /* 가설 */
  --task-d:  #f44336; /* 철거 */
}

/* 두 패널 공통 스크롤 영역 */
#task-list-content, #wbs-group-content{
  flex: 1 1 auto;
  overflow: auto;
  padding: 8px 12px;
  min-height: 0;
  background:#fff;
}

/* 패널 헤더(sticky) */
.panel-header{
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 12px; background:#f4f4f4; border-bottom:1px solid #d0d0d0;
}
#task-list-panel .panel-header, #wbs-group-list-panel .panel-header{
  position: sticky; top: 0; z-index: 5; background:#f9f9f9; box-shadow:0 2px 2px -1px #ddd;
}

/* 수직 분할 레이아웃 */
#vertical-split-container{ display:flex; flex-direction:column; width:100%; height:100%; }
#task-list-panel, #wbs-group-list-panel{ min-height:100px; overflow-y:auto; height:50%; transition: height .2s; }
#resizer{ height:2px; background:#ccc; cursor:row-resize; flex-shrink:0; }
#resizer:hover{ background:#a4cef7; }

/* ───────── Task 표 ───────── */

#task-list-panel{ display:flex; flex-direction:column; min-height:0; }
#task-list-panel .table-scroll{ flex:1 1 auto; overflow:auto; min-height:0; }

#treegrid thead th{ position: sticky; top: 0; z-index: 5; background:#fff; }
#treegrid{ border-collapse: separate; }

#treegrid th, #treegrid td.text-center{ text-align:center!important; vertical-align:middle!important; }

/* 구분 드롭다운 */
.treegrid-dropdown{
  width:100%; box-sizing:border-box; background:transparent; border:none; height:28px; font-size:14px; padding:0;
}

/* 객체개수 셀 색상 */
#treegrid td.objcount{ transition:background .15s, color .15s; }
#treegrid td.objcount.objcount--c{ background:var(--task-c); color:#fff; }
#treegrid td.objcount.objcount--t{ background:var(--task-t); color:#fff; }
#treegrid td.objcount.objcount--d{ background:var(--task-d); color:#fff; }

/* 달력/입력 공용 */
.calendar-svg-icon{ vertical-align:middle; margin-left:2px; margin-bottom:2px; width:18px;height:18px; cursor:pointer; transition: stroke .2s; }
.datepicker-btn:hover .calendar-svg-icon{ stroke:#1976d2; }
.datepicker-input{
  font-size:1em; padding:2px 6px; border:1px solid #bbb; border-radius:4px;
  outline:none; width:95px; box-sizing:border-box; text-align:center;
}
.flatpickr-calendar{ z-index: 9999 !important; }
.datepicker-btn{ display:inline-block; vertical-align:middle; margin-left:4px; background:none; border:none; padding:0; cursor:pointer; line-height:1; }

/* ───────── 여기까지 Task 전용.
   ▼ 아래는 WBS(Fancytree) 관련 규칙이므로 35-wbs-matrix.css 로 옮겼고, 
     구(OLD) InspireTree용 #wbs-group-list 규칙은 전부 제거했습니다. */
```

---

## `wwwroot/css/35-wbs-matrix.css`

```css
/* =========================
   WBS (Fancytree + table)
========================= */

/* 컨테이너/테이블 기본 */
#wbs-group-content { overflow:auto; }
#wbs-tree { width: 100%; table-layout: fixed; }

/* 열 비율: 제목 넓게, 개수 좁게, 현황 적당히 */
#wbs-tree col.col-title  { width: auto; }
#wbs-tree col.col-count  { width: 84px; }
#wbs-tree col.col-status { width: 180px; }

/* 셀/타이틀 */
#wbs-tree th, #wbs-tree td { padding: 6px 8px; }
#wbs-tree td { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#wbs-tree .fancytree-title{ white-space: nowrap; }

/* 클릭성 강화 (모바일/포인터 혼용 환경) */
#wbs-tree .fancytree-checkbox,
#wbs-tree .fancytree-expander,
#wbs-tree .fancytree-title{ cursor: pointer; }

/* 확장/체크 UI는 Fancytree 스킨을 따르고, 추가 오버라이드는 최소화 */

/* ───────── 행 색칠(그룹 상태) ─────────
   JS에서 node.tr에 'wbs-c' / 'wbs-td' 클래스를 붙여줌 */
#wbs-tree tr.wbs-c  > td { background: rgba(255, 0,   0,  .06); } /* 시공 */
#wbs-tree tr.wbs-td > td { background: rgba(0,   80,  255, .06); } /* 가설/철거(혼합) */

/* ───────── 현황 뱃지 (임시 요약 UI) ───────── */
.wbs-status { display:flex; gap:6px; align-items:center; }
.wbs-status .b { display:inline-block; min-width:18px; padding:0 4px; border-radius:10px; font-size:11px; text-align:center; background:#f1f3f5; }
.wbs-status .b.c    { background:#e7f5ff; } /* 시공 */
.wbs-status .b.t    { background:#e6fcf5; } /* 가설 */
.wbs-status .b.d    { background:#fff0f6; } /* 철거 */
.wbs-status .b.td   { background:#e9ecef; opacity:.9; } /* 혼합 */
.wbs-status .b.total{ background:#f8f9fa; font-weight:600; }

/* 패널 헤더 고정 */
#wbs-group-list-panel .panel-header {
  position: sticky;
  top: 0;
  background: #f9f9f9;
  z-index: 5;
  box-shadow: 0 2px 2px -1px #ddd;
}

/* 불필요한 오래된(InspireTree) 규칙들이 wbs-tree에 영향주지 않도록 
   유사 셀렉터는 사용하지 않음(예: #wbs-group-list li … 제거) */

   /* 현황 박스: 숫자 + 눈알을 양 끝으로 */
.wbs-status { 
   display:flex; 
   align-items:center; 
   justify-content: space-between; 
   gap:10px; 
 }
 .wbs-status .nums { display:flex; gap:6px; align-items:center; }
 
 /* 눈알 버튼 (Fancytree 용) */
 #wbs-tree .eye-toggle{
   display:inline-flex;
   align-items:center;
   justify-content:center;
   width:22px; height:22px;
   border-radius:50%;
   cursor:pointer;
   opacity:.8;
   border:1px solid transparent;
   user-select:none;
   flex:0 0 auto;
 }
 #wbs-tree .eye-toggle:hover{ opacity:1; border-color:#e5e7eb; background:#f9fafb; }
 
 /* 상태 표시: hidden=강조, mixed=연함 */
 #wbs-tree .eye-toggle.hidden { opacity:1; }
 #wbs-tree .eye-toggle.mixed  { opacity:.5; }
 
 /* SVG 크기 */
 #wbs-tree .eye-toggle svg{ width:16px; height:16px; display:block; pointer-events:none; }

 /* 개수: 가운데 정렬 (thead/tbody 공통) */
#wbs-tree th.text-center,
#wbs-tree td.text-center { text-align: center !important; }

/* 눈알 버튼: 항목(첫 칼럼) 내 문서아이콘 자리에 렌더됨 */
#wbs-tree .eye-toggle{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:22px; height:22px;
  border-radius:50%;
  cursor:pointer;
  opacity:.8;
  border:1px solid transparent;
  user-select:none;
  margin-right: 2px;
}
#wbs-tree .eye-toggle:hover{ opacity:1; border-color:#e5e7eb; background:#f9fafb; }
#wbs-tree .eye-toggle.hidden { opacity:1; }
#wbs-tree .eye-toggle.mixed  { opacity:.5; }
#wbs-tree .eye-toggle svg{ width:16px; height:16px; display:block; pointer-events:none; }

```

---

## `wwwroot/css/40-viewer-ui.css`

```css
/* 뷰어 박스: 남는 공간 모두 */
#viewer-host{
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

/* 커스텀 툴 버튼 아이콘 */
.click-button-class{
  background-image: url('/images/icon-click.svg');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px; height: 32px; padding: 0; margin: 0; border: none; background-color: transparent;
  border-radius: 4px; display: inline-block; box-sizing: border-box; transition: filter .3s;
}
.click-button-class:hover{ filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg); }

.drag-button-class{
  background-image: url('/images/icon-drag.svg');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px; height: 32px; padding: 0; margin: 0; border: none; background-color: transparent;
  border-radius: 4px; display: inline-block; box-sizing: border-box; transition: filter .3s;
}
.drag-button-class:hover{ filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg); }

.hide-button-class{
  background-image: url('/images/icon-hide-selected.svg');
  background-size: 32px 32px; background-repeat:no-repeat; background-position:center;
  width:32px; height:32px; border:0; background-color:transparent; border-radius:4px; transition: filter .3s;
}
.hide-button-class:hover{ filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg); }

.isolate-button-class{
  background-image: url('/images/icon-isolate-selected.svg');
  background-size: 32px 32px; background-repeat:no-repeat; background-position:center;
  width:32px; height:32px; border:0; background-color:transparent; border-radius:4px; transition: filter .3s;
}
.isolate-button-class:hover{ filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg); }

.reset-button-class{
  background-image: url('/images/icon-reset.svg');
  background-size: 32px 32px; background-repeat:no-repeat; background-position:center;
  width:32px; height:32px; border:0; background-color:transparent; border-radius:4px; transition: filter .3s;
}
.reset-button-class:hover{ filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg); }
```

---

## `wwwroot/css/95-modal-current-task.css`

```css
/* 현재 공정 모달 */
.current-task-modal{
  position: fixed;
  left: 50%; top: 30%;
  transform: translate(-50%,-20%);
  min-width: 260px; background:#fff; border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,.22);
  z-index: 10000;
}
.current-task-modal-header{
  cursor: move; background:#f4f4f4; border-bottom:1px solid #d0d0d0;
  font-weight:600; display:flex; justify-content:space-between; align-items:center;
  padding: 10px 18px 8px 16px; border-radius: 8px 8px 0 0; user-select:none;
}
.current-task-modal-header .modal-close{
  background:none; border:0; font-size:22px; color:#888; cursor:pointer; padding:2px 6px; margin-left:6px; font-weight:bold;
}
.current-task-modal-body{ padding:22px 20px 18px; text-align:center; }

.current-task-date-row{ display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:14px; }
.current-task-date-input{
  width:120px; font-size:16px; text-align:center; border:none; border-bottom:2px solid #1976d2; outline:none;
  background:#f6f8ff; padding:5px 8px 3px; letter-spacing:2px; transition: border-color .2s;
}
.current-task-date-input:focus{ border-color:#1565c0; background:#fff; }
.datepicker-btn{ background:none; border:0; padding:0; margin-left:3px; cursor:pointer; }
.current-task-date-result{ margin:7px 0 0; min-height:20px; font-size:13px; }

.modal-actions{ margin:4px 0 8px; }
.modal-confirm{
  padding:5px 32px; font-size:14px; border-radius:5px; border:0; background:#1976d2; color:#fff; cursor:pointer; font-weight:bold;
  letter-spacing:.1em; box-shadow:0 1px 6px 0 #dde3ea88; transition: background .17s;
}
.modal-confirm:hover{ background:#1158ad; }

/* flatpickr는 반드시 모달 위로 */
.flatpickr-calendar{ z-index: 99999 !important; }

/* 모달 내 인풋 */
.current-task-modal .datepicker-input{
  font-size:14px; font-weight:600; color:#333; text-align:center; padding:8px 0; width:130px; letter-spacing:2px;
  border:none; border-bottom:2px solid #1976d2; background:transparent; outline:none; margin:0 auto; display:block;
}
.current-task-slider-row{ margin:10px 0 14px; }
.current-task-slider{ width:100%; max-width:200px; }
```

---

## `wwwroot/css/current-task.css`

```css
.current-task-modal {
  position: fixed;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -20%);
  min-width: 260px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.22);
  z-index: 10000;
  font-family: 'MyCustomFont', 'Noto Sans KR', Arial, sans-serif;
}
.current-task-modal-header {
  cursor: move;
  background: #f4f4f4;
  border-bottom: 1px solid #d0d0d0;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px 8px 16px;
  border-radius: 8px 8px 0 0;
  user-select: none;
}
.current-task-modal-header .modal-close {
  background: none;
  border: none;
  font-size: 22px;
  color: #888;
  cursor: pointer;
  padding: 2px 6px;
  margin-left: 6px;
  font-weight: bold;
}
.current-task-modal-header .modal-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.1em;
}

.current-task-modal-body {
  padding: 22px 20px 18px 20px;
  text-align: center;
}

.current-task-date-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}
.current-task-date-input {
  width: 120px;
  font-size: 16px;
  text-align: center;
  border: none;
  border-bottom: 2px solid #1976d2;
  outline: none;
  background: #f6f8ff;
  padding: 5px 8px 3px 8px;
  letter-spacing: 2px;
  font-family: 'MyCustomFont', 'Noto Sans KR', Arial, sans-serif;
  transition: border-color 0.2s;
}
.current-task-date-input:focus {
  border-color: #1565c0;
  background: #fff;
}
.datepicker-btn {
  background: none;
  border: none;
  padding: 0;
  margin-left: 3px;
  cursor: pointer;
}
.current-task-date-result {
  margin: 7px 0 0 0;
  min-height: 20px;
  font-size: 13px;
}
.modal-actions {
  margin-top: 4px;
  margin-bottom: 8px;
}
.modal-confirm {
  padding: 5px 32px;
  font-size: 14px;
  border-radius: 5px;
  border: none;
  background: #1976d2;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 0.1em;
  box-shadow: 0 1px 6px 0 #dde3ea88;
  transition: background 0.17s;
}
.modal-confirm:hover { background: #1158ad; }

/* flatpickr calendar가 반드시 모달 위로 */
.flatpickr-calendar { z-index: 99999 !important; }

.current-task-modal .datepicker-input {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
  padding: 8px 0;
  width: 130px;
  letter-spacing: 2px;
  border: none;
  border-bottom: 2px solid #1976d2;
  background: transparent;
  outline: none;
  margin: 0 auto;
  display: block;
}

.current-task-slider-row {
  margin: 10px 0 14px 0;
}
.current-task-slider {
  width: 100%;
  max-width: 200px;
}
```

---

## `wwwroot/css/gantt.css`

```css
/* 간트 패널은 #preview 내부에서만 레이아웃. (※ #preview의 left는 10-layout.css가 담당) */

/* viewer 위/아래로 배치 */
#gantt-splitter{
  position: relative;
  z-index: 2600;
  flex: 0 0 4px;
  height: 4px;
  cursor: row-resize;
  background: linear-gradient(to bottom,#e9edf3,#dfe5ee);
  border-top: 1px solid #cfd6e3;
  border-bottom: 1px solid #cfd6e3;
}
#gantt-pane{
  flex: 0 0 var(--gantt-height, 320px);
  min-height: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  z-index: 2000;
  position: relative;
}
.gantt-open-btn{ z-index: 3000; }

.gantt-toolbar{
  display:flex; align-items:center; gap:8px; padding:8px 10px;
  border-bottom:1px solid #eef1f6; background:#f9fafb;
}
.gantt-toolbar .btn{
  border:1px solid #d1d5db; background:#fff; padding:4px 10px; border-radius:6px; font-size:12px; cursor:pointer;
}
.gantt-toolbar .btn:hover{ background:#f3f4f6; }

.gantt-range{ margin-left:8px; color:#6b7280; font-weight:500; font-size:12px; }

/* 차트 */
#gantt-chart{
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
  box-sizing: border-box;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
}
#gantt-chart > div{ height:100% !important; }
#gantt-chart svg text{ text-anchor: start !important; }

/* 접힘 상태 */
#preview.gantt-collapsed #gantt-pane{ flex-basis:0!important; height:0!important; border-top:none; }
#preview.gantt-collapsed #gantt-splitter{ cursor: ns-resize; }
.gantt-open-btn{
  position:absolute; right:12px; bottom:12px; z-index:3000; display:none;
  padding:6px 10px; font-size:12px; border:1px solid #d1d5db; border-radius:999px;
  background:#fff; color:#111827; box-shadow:0 2px 8px rgba(0,0,0,.08); cursor:pointer;
}
.gantt-open-btn:hover{ background:#f3f4f6; }
#preview.gantt-collapsed .gantt-open-btn{ display:inline-flex; }

/* 상단 날짜축(커스텀) */
.gantt-top-axis{
  position: sticky; top: 0; z-index: 2;
  background:#fafbff; border-bottom:1px solid #eef1f6;
  height:26px; display:flex; align-items:center; overflow:hidden; padding:0 8px;
  font-size:12px; color:#4b5563;
}
.gantt-top-axis .axis-track{ position:relative; height:100%; white-space:nowrap; will-change: transform; }
.gantt-top-axis .axis-month{ display:inline-block; text-align:center; border-left:1px solid #e5e7eb; height:100%; line-height:26px; padding:0 4px; }
```

---

## `wwwroot/css/main.css`

```css
/*──────────────────────────────────────────
  기본 리셋 & 전역
──────────────────────────────────────────*/
body,
html {
  margin: 0;
  padding: 0;
  height: 100vh;  
}


/*──────────────────────────────────────────
  헤더 & 뷰어 포지셔닝
──────────────────────────────────────────*/
#header,
#preview {
  position: absolute;
  left: 260px; /* sidebar 시작폭과 일치 */
  top: 3em;
  right: 0;
  bottom: 0;
  background: #fff;
  transition: left 0.2s;
}


#header {
  top: 0;
  left: 0;
  right: 0;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5em;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa; /* 헤더 배경색 */
}

#header .title {
  margin-left: 20px;
  font-size: 22px;
  font-weight: bold;
  color: #333; /* 헤더 타이틀 색상 */
  white-space: nowrap; /* 줄바꿈 방지 */
}

#header .logo {
  height: 1.75em;      /* 헤더 높이에 맞게 */
  width: auto;      /* 비율 유지 */
  /* margin-right: 18px; */
}

#preview {
  top: 3em; /* 헤더 아래에서 시작 */
  left: 25%; /* 사이드바(25%) 오른쪽부터 */
  right: 0;
  bottom: 0;
}

/*──────────────────────────────────────────
  로그인 버튼 & 헤더 타이틀
──────────────────────────────────────────*/
#login {
  margin-left: auto;
  padding: 4px 10px;
  background-color: #6c757d; /* 회색 배경 */
  color: white; /* 흰색 글자 */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease-in-out;
}

#login:hover {
  background-color: #5a6268; /* 호버 시 색상 변경 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 그림자 효과 */
  transform: translateY(-2px);
}

/*──────────────────────────────────────────
  트리 마진 리셋
──────────────────────────────────────────*/
#tree {
  margin: 0;
}

/*──────────────────────────────────────────
  반응형
──────────────────────────────────────────*/
@media (max-width: 768px) {
  #sidebar {
    width: 100%;
    top: 3em;
    bottom: 75%;
  }
  #preview {
    left: 0;
    top: 25%;
    bottom: 0;
  }
}

/*──────────────────────────────────────────
  아이콘
──────────────────────────────────────────*/
.icon-hub:before {
  background-image: url(https://raw.githubusercontent.com/primer/octicons/main/icons/apps-16.svg);
  background-size: cover;
}
.icon-project:before {
  background-image: url(https://raw.githubusercontent.com/primer/octicons/main/icons/project-16.svg);
  background-size: cover;
}
.icon-my-folder:before {
  background-image: url(https://raw.githubusercontent.com/primer/octicons/main/icons/file-directory-16.svg);
  background-size: cover;
}
.icon-item:before {
  background-image: url(https://raw.githubusercontent.com/primer/octicons/main/icons/file-16.svg);
  background-size: cover;
}
.icon-version:before {
  background-image: url(https://raw.githubusercontent.com/primer/octicons/main/icons/clock-16.svg);
  background-size: cover;
}

.click-button-class {
  background-image: url('/images/icon-click.svg');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  display: inline-block;
  box-sizing: border-box;
  transition: filter 0.3s ease;
}

.click-button-class:hover {
  filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg);
}

.drag-button-class {
  background-image: url('/images/icon-drag.svg');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  display: inline-block;
  box-sizing: border-box;
  transition: filter 0.3s ease;
}

.drag-button-class:hover {
  filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg);
}

.hide-button-class {
  background-image: url('/images/icon-hide-selected.svg');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  display: inline-block;
  box-sizing: border-box;
  transition: filter 0.3s ease;
}

.hide-button-class:hover {
  filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg);
}

.isolate-button-class {
  background-image: url('/images/icon-isolate-selected.svg');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  display: inline-block;
  box-sizing: border-box;
  transition: filter 0.3s ease;
}

.isolate-button-class:hover {
  filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg);
}

.reset-button-class {
  background-image: url('/images/icon-reset.svg');
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  display: inline-block;
  box-sizing: border-box;
  transition: filter 0.3s ease;
}

.reset-button-class:hover {
  filter: brightness(0) saturate(100%) invert(37%) sepia(89%) saturate(672%) hue-rotate(180deg);
}

/*──────────────────────────────────────────
  뷰어 툴바 스타일
──────────────────────────────────────────*/
#viewer-container {
  /* 실제 container ID/클래스에 맞게 */
  position: relative;
}

/* #viewer-toolbar {
  position: absolute;
  top: 1.5em;
  left: 1.5em;
  z-index: 1000;
  display: flex;
  gap: 0.5em;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 0.6em 1em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transform: scale(0.8);
  transform-origin: top left;
}
.tool-button {
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 10px;
  background: #f3f3f3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.tool-button:hover {
  background: #ddd;
}
.tool-button.active {
  background-color: #0078d7;
  color: white;
  box-shadow: inset 0 0 0 2px #005ea2;
}
.tool-button svg,
.tool-button img {
  width: 30px;
  height: 30px;
  stroke-width: 2;
}

.tool-button .lucide {
  font-size: 24px;
  line-height: 1;
} */

/*──────────────────────────────────────────
  사이드바 레이아웃
──────────────────────────────────────────*/
#sidebar {
  position: absolute;
  top: 3em; /* 헤더 아래 */
  left: 0;
  bottom: 0;
  width: 25%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 내부 패널에만 스크롤 위임 */
}

/* 탭 버튼(헤더) 부분은 높이 고정 */
#sidebar .tabs {
  flex: 0 0 auto;
}

/* 패널(container) 부분이 남은 공간 모두 차지 */
#sidebar .panels {
  flex: 1 1 auto;
  overflow: hidden;
  min-height: 0; /* 자식 스크롤 허용을 위해 필수 */
}

/* 뷰 선택 모달 */
#view-select-modal {
  position: fixed;       /* 화면 기준으로 고정 */
  top: 50%;              /* 화면 위에서 50% */
  left: 50%;             /* 화면 왼쪽에서 50% */
  transform: translate(-50%, -50%);  /* 정확히 정중앙으로 이동 */
  z-index: 9999;         /* 다른 UI 위에 */
  background: #fff;      /* 배경색 */
  border-radius: 10px;   /* 모서리 둥글게(선택) */
  box-shadow: 0 4px 16px rgba(0,0,0,0.2); /* 그림자(선택) */
  padding: 2em 2em;
  min-width: 320px;
  min-height: 160px;
  display: none;         /* 필요시 JS에서 block으로 표시 */
}

/* 폰트 설정 */
@font-face {
  font-family: '나눔명조';
  src: url("/fonts/NanumMyeongjo.ttf") format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: '맑은고딕';
  src: url("/fonts/malgun.ttf") format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* @font-face {
  font-family: '바탕';
  src: url("/fonts/batang.ttf") format('truetype');
  font-weight: normal;
  font-style: normal;
} */

@font-face {
  font-family: 'HDHarmony_M';
  src: url("/fonts/현대하모니_M.ttf") format('truetype');
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: '맑은고딕', "바탕", "Source Han Serif KR", serif; /* 기본 폰트 설정 */
}

h1 {
  font-family: 'HDHarmony_M'; /* 타이틀 폰트 설정 */
}
```

---

## `wwwroot/css/panel-task-wbs.css`

```css
/* panel-task-wbs.css */

/* ───────────────────────────────────────────────────────────
   1) 패널 레이아웃 (변경 없음)
─────────────────────────────────────────────────────────── */
#panel2 > .sidebar-panel {
  flex: none;
  height: 50%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #e0e0e0;
  min-height: 0;
}

/* ───────────────────────────────────────────────────────────
   2) 컨텐트 스크롤
─────────────────────────────────────────────────────────── */
#task-list-content,
#wbs-group-content {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: auto;
  padding: 8px 12px;
  background-color: #fff;
  min-height: 0;
}

/* ───────────────────────────────────────────────────────────
   3) 패널 헤더 스타일 (변경 없음)
─────────────────────────────────────────────────────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f4f4f4;
  border-bottom: 1px solid #d0d0d0;
}
.panel-header .title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.panel-header .button-group button {
  margin-left: 6px;
  padding: 4px 8px;
  font-size: 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.panel-header .button-group button:hover {
  background-color: #e8e8e8;
}

/* 4) 트리 전용 추가 스타일 */
#panel2 .tree-list .toggle {
  border: 1px solid #ccc;
  width: 1em;
  height: 1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  cursor: pointer;
  border-radius: 2px;
}
#panel2 .tree-list .toggle::after {
  content: attr(data-icon);
  font-size: 12px;
  line-height: 1;
}
/* 체크박스, 라벨 간격 */
#panel2 .tree-list .checkbox {
  margin-right: 4px;
}
/* 선택 강조 */
#panel2 .tree-list .tree-item.selected > .tree-node {
  background-color: #e6f7ff;
}
/* hover 강조 */
#panel2 .tree-list .tree-node:hover {
  background-color: #f0f8ff;
}
/* 드래그 오버 */
#panel2 .tree-list .tree-item.drag-over > .tree-node {
  outline: 2px dashed #888;
}

/* 수직 분할 전체 컨테이너 (flex column) */
#vertical-split-container {
  display: flex;
  flex-direction: column;      /* 세로로 배치 */
  width: 100%;
  height: 100vh;               /* 필요한 만큼 높이 지정 */
}

/* 위/아래 각 패널 */
#task-list-panel,
#wbs-group-list-panel {
  /* flex: 1 1 0%;                초기에 공간을 균등하게 나눔 */
  min-height: 100px;           /* 최소 높이 제한 */
  overflow-y: auto;            /* 내용이 넘치면 스크롤바 표시 */
  height: 50%;                 /* 각 패널의 높이를 50%로 설정 */
  transition: height 0.2s;     /* 높이 변경 시 부드러운 전환 효과 */
}

/* 패널 헤더(버튼+타이틀) sticky */
#task-list-panel .panel-header {
  position: sticky;
  top: 0;
  z-index: 10; /* 위로 띄움 */
  background: #f9f9f9;
  box-shadow: 0 2px 2px -1px #ddd;
}

/* 구분선(드래그 바) 스타일 */
#resizer {
  height: 2px;
  background: #ccc;
  cursor: row-resize;        
  flex-shrink: 0;
}

/* 드래그 바 hover 시 스타일 (선택) */
#resizer:hover {
  background: #a4cef7;
}

/* treegrid의 시작일, 완료일, 객체개수 가운데 정렬 */
#treegrid th,
#treegrid td.text-center {
  text-align: center !important;
  vertical-align: middle !important;
}

/* ── Task 표: 객체개수 셀 색상 (구분별) ───────── */
#treegrid td.objcount { transition: background 0.15s, color 0.15s; }
#treegrid td.objcount.objcount--c { background:#2e7d32; color:#fff; }  /* 시공=초록 */
#treegrid td.objcount.objcount--t { background:#1976d2; color:#fff; }  /* 가설=파랑 */
#treegrid td.objcount.objcount--d { background:#f44336; color:#fff; }  /* 철거=빨강 */

/* ── WBS 트리: 연결 상태(leaf 기준) ─────────── */
#wbs-group-list li.wbs-c   > .title-wrap { background:#2e7d32 !important; color:#fff !important; font-weight:600 !important; border-radius:2px; } /* 시공 */
#wbs-group-list li.wbs-blue> .title-wrap { color:#1976d2 !important; background:transparent !important; font-weight:600 !important; }            /* 가설-only or 철거-only */
#wbs-group-list li.wbs-td  > .title-wrap { background:#f44336 !important; color:#1976d2 !important; font-weight:600 !important; border-radius:2px; } /* 가설+철거 */

/* 각 항목 한 줄(.title-wrap) 안에 우측 뱃지/아이콘 표시 */
#wbs-group-list li > .title-wrap {
  display: flex;
  align-items: center;
  gap: .5rem; /* 체크박스/타이틀 사이 여백 */
}

/* 숫자 뱃지(비-리프, 2개 이상일 때만 표시) */
#wbs-group-list .count-badge {
  display: inline-flex;
  min-width: 20px;
  padding: 0 8px;
  height: 20px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  font-weight: 600;
  justify-content: center;
  background: #eef2ff;   /* 연한 파랑 */
  color: #3b82f6;        /* 파랑 텍스트 */
  border: 1px solid #dbeafe;
  user-select: none;
}

/* (옵션) 연결된 항목일 때 뱃지 톤 */
#wbs-group-list li.connected > .title-wrap .count-badge {
  background: #ffe3e3;
  color: #b00;
}

/* ⚠️ 텍스트 없으면 완전 제거 (점/테두리도 X) */
#wbs-group-list .count-badge:empty{
  display:none !important;
  padding:0 !important;
  border:0 !important;
  min-width:0 !important;
  height:auto !important;
}

/* ── 👁 WBS 가시성(눈) 아이콘 ─────────── */
#wbs-group-list .eye-toggle{
  margin-left: auto;               /* 오른쪽 끝 정렬 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  opacity: .7;
  border: 1px solid transparent;
  user-select: none;
  flex: 0 0 auto;
}
#wbs-group-list .eye-toggle:hover{
  opacity: 1;
  border-color: #e5e7eb;
  background: #f9fafb;
}
#wbs-group-list .eye-toggle i{
  font-size: 16px;
  line-height: 1;
}
#wbs-group-list .eye-toggle.hidden{  opacity: .85; }  /* 전체 숨김 상태 */
#wbs-group-list .eye-toggle.mixed{   opacity: .45; }  /* 일부만 숨김 (희미) */

#wbs-group-list .eye-toggle svg { width:16px; height:16px; display:block; pointer-events: none; }


/* WBS Group List 헤더 고정 */
#wbs-group-list-panel .panel-header {
  position: sticky;
  top: 0;
  background: #f9f9f9;
  z-index: 5;
  box-shadow: 0 2px 2px -1px #ddd;
}

/* panel-task-wbs.css 또는 panel2-ui-helpers.js와 같은 경로에서 관리 */

/* 달력 아이콘 스타일 */
.calendar-svg-icon {
  vertical-align: middle;
  margin-left: 2px;
  margin-bottom: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  transition: fill 0.2s;
}

.datepicker-btn:hover .calendar-svg-icon {
  stroke: #1976d2; /* MUI 블루 계열 */
}

/* 인풋 스타일 (작업 테이블 셀에 어울리도록) */
.datepicker-input {
  font-size: 1em;
  padding: 2px 6px;
  border: 1px solid #bbb;
  border-radius: 4px;
  outline: none;
  width: 95px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.datepicker-input:focus {
  border-color: #1976d2;
}

/* flatpickr 달력 팝업 위치 약간 조정 (필요 시) */
.flatpickr-calendar {
  z-index: 9999 !important;
}

/* 달력 버튼과 인풋 사이 여백 */
.datepicker-btn {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  line-height: 1;
}

/* 달력 아이콘 클릭시 highlight 효과 */
.datepicker-btn:active .calendar-svg-icon {
  stroke: #145ea8;
}

.datepicker-input {
  text-align: center;
}

/* TASK 드롭다운 셀 서식 */
.treegrid-dropdown {
  width: 100%;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  height: 28px; /* 또는 100% */
  font-size: 14px;
  padding: 0;
}

/* Task 리스트 영역이 스크롤 컨테이너가 되도록 */
#task-list-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;   /* flex 컨테이너 내부 스크롤 필수 */
}

/* 상단 헤더는 고정, 표 본문만 스크롤 */
#task-list-panel .table-scroll {
  flex: 1 1 auto;
  overflow: auto;          /* 여기서 세로 스크롤 발생 */
  min-height: 0;
}

/* sticky header */
#treegrid thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #fff;        /* 밑 행과 겹침 방지 */
}

/* 필요한 경우(브라우저별) 테이블 설정 */
#treegrid {
  border-collapse: separate; /* sticky 안정성 ↑ */
}

```

---

## `wwwroot/css/panel-tree.css`

```css
/* panel-tree.css */

/* 1) 탭1 내부 스크롤 래퍼 */
#panel1 .panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
}

/* 2) 프로젝트 트리 스타일 */
.tree-list {
  list-style: none;
  margin: 0;
  padding-left: 0;
}
.tree-list .tree-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  color: #333;
  cursor: pointer;
}

.tree-list .tree-item .toggle,
.tree-list .tree-item .spacer {
  width: 16px;
  display: inline-block;
  margin-right: 4px;
  cursor: pointer;
}
.tree-list .tree-item .checkbox {
  width: 16px;
  margin-right: 4px;
}
.tree-list .tree-item .label {
  flex: 1;
}
.tree-list .tree-item.selected {
  background-color: #e6f7ff;
}
.tree-list .tree-children {
  list-style: none;
  padding-left: 20px;
  margin: 2px 0;
}
```

---

## `wwwroot/css/sidebar.css`

```css
/* sidebar.css */

/* 1) 사이드바 전체 */
#sidebar {
  position: absolute; /* 위치 고정 */
  top: 3em; /*헤더(3em) 바로 아래*/
  bottom: 0; /*화면 하단까지 채움*/
  left: 0;
  width: 25%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 1-1) 사이드바 리사이저 */
#sidebar-resizer {
  position: absolute;
  top: 3em;
  left: 25%; /* sidebar 시작폭과 일치 */
  width: 3px;
  height: calc(100vh - 3em);
  background: linear-gradient(to right, #e3eaf3, #d2d9e6);
  cursor: ew-resize;
  z-index: 30;
  transition: background 0.15s;
  border-right: 1px solid #ccd4e3;
  border-left: 1px solid #f8fafb;
  border-radius: 4px;
}
#sidebar-resizer:hover {
  background: #a4cef7;
}

/* 2) 탭 헤더 */
.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}
.tab-button {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-bottom-color 0.2s;
  font-size: 18px;
}
.tab-button.active {
  color: #0078d4;
  border-bottom-color: #0078d4;
}

/* 3) 패널 래퍼 */
.panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  margin: 0;
  padding: 0;
}
/* 4) 기본 숨김 */
.panels .panel {
  display: none;
  height: 100%;
}
/* active 클래스가 붙은 .panel 만 flex 컬럼으로 표시 */
.panels .panel.active {
  display: flex;
  flex-direction: column;
  height: 100%;
}
```

---

## `wwwroot/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="https://cdn.autodesk.io/favicon.ico" />

    <!-- Autodesk Viewer 스타일 -->
    <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css" />

    <!-- Inspire Tree 스타일 -->
    <link rel="stylesheet" href="https://unpkg.com/inspire-tree-dom@4.0.6/dist/inspire-tree-light.min.css" />

    <!-- flatpickr CSS/JS CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

    <!-- Fancytree -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jquery.fancytree@2/dist/skin-win8/ui.fancytree.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/jquery.fancytree@2/dist/jquery.fancytree-all-deps.min.js"></script>

    <!-- 입력 마스킹 -->
    <script src="https://unpkg.com/imask"></script>

    <!-- 전역 CSS -->
    <link rel="stylesheet" href="/css/00-base.css">
    <link rel="stylesheet" href="/css/05-hec-progress-overlay.css">
    <link rel="stylesheet" href="/css/10-layout.css">
    <link rel="stylesheet" href="/css/20-sidebar.css">
    <link rel="stylesheet" href="/css/30-task-wbs.css">
    <link rel="stylesheet" href="/css/35-wbs-matrix.css">
    <link rel="stylesheet" href="/css/40-viewer-ui.css">
    <link rel="stylesheet" href="/css/gantt.css">
    <link rel="stylesheet" href="/css/95-modal-current-task.css">
    
    <!-- Lucide Icons -->
    <link rel="stylesheet" href="https://unpkg.com/lucide-static/font/css/lucide.css" />

    <title>HEC-BIM 객체 공정 매핑도구</title>
  </head>

  <body>
    <!-- Google Charts loader -->
    <script src="https://www.gstatic.com/charts/loader.js"></script>

    <script type="module">
      import { initGanttView } from "/js/sidebar/task-wbs/ui/gantt-view.js";;

      window.addEventListener('DOMContentLoaded', () => {
        // 간트 스플리터
        (function splitter(){
          const host = document.getElementById('preview');
          const sp   = document.getElementById('gantt-splitter');
          const open = document.getElementById('gantt-open-btn');
          if (!host || !sp) return;

          const saved = localStorage.getItem('ganttHeight');
          if (saved) host.style.setProperty('--gantt-height', saved);

          let dragging = false, startY = 0, startH = 0;

          function onDown(e){
            if (host.classList.contains('gantt-collapsed')) return;
            dragging = true;
            startY = e.clientY || (e.touches?.[0]?.clientY ?? 0);
            const cs = getComputedStyle(host);
            startH = parseFloat(cs.getPropertyValue('--gantt-height')) || 320;
            document.body.style.userSelect = 'none';
          }
          function onMove(e){
            if (!dragging) return;
            const y = e.clientY || (e.touches?.[0]?.clientY ?? 0);
            const dy = y - startY;
            let h = Math.max(120, startH - dy);
            h = Math.min(h, window.innerHeight - 160);
            host.style.setProperty('--gantt-height', h + 'px');
          }
          function onUp(){
            if (!dragging) return;
            dragging = false;
            document.body.style.userSelect = '';
            const cs = getComputedStyle(host);
            localStorage.setItem('ganttHeight', cs.getPropertyValue('--gantt-height').trim());
            setTimeout(()=> window.gantt?.renderFromTrees(window.taskTree, window.wbsTree), 80);
          }

          sp.addEventListener('mousedown', onDown);
          sp.addEventListener('touchstart', onDown, { passive: true });
          window.addEventListener('mousemove', onMove);
          window.addEventListener('touchmove', onMove, { passive: false });
          window.addEventListener('mouseup', onUp);
          window.addEventListener('touchend', onUp);

          sp.addEventListener('dblclick', () => {
            host.classList.toggle('gantt-collapsed');
            setTimeout(()=> window.gantt?.renderFromTrees(window.taskTree, window.wbsTree), 120);
          });
          document.addEventListener('click', (e) => {
            if (e.target?.id === 'gantt-toggle') {
              host.classList.toggle('gantt-collapsed');
              setTimeout(()=> window.gantt?.renderFromTrees(window.taskTree, window.wbsTree), 120);
            }
          });
          open?.addEventListener('click', () => {
            const wasCollapsed = host.classList.contains('gantt-collapsed');
            host.classList.remove('gantt-collapsed');
            if (wasCollapsed) setTimeout(()=> window.gantt?.renderFromTrees(window.taskTree, window.wbsTree), 120);
          });
        })();

        // panel2 준비되면 간트 초기화
        window.addEventListener("panel2-ready", async () => {
          if (!window.gantt) {
            window.gantt = await initGanttView({
              container: "#gantt-chart",
              saveBtn:   "#gantt-save-png"
            });
          }
          if (window.taskTree) {
            window.gantt.renderFromTrees(window.taskTree, window.wbsTree);
          }
        });
      });
    </script>

    <!-- 로딩 중 -->
    <div id="loading" style="display:flex;flex-direction:column;justify-content:center;align-items:center;position:fixed;inset:0;width:100vw;height:100vh;font-size:2rem;font-weight:500;color:#555;background:#f7f8fa;z-index:9999;">
      <h1>Welcome to HEC-BIM Platform...!!</h1>
    </div>

    <!-- 헤더 -->
    <div id="header" style="display: none">
      <img class="logo" src="/images/hec_logo.png" alt="HYUNDAI ENGINEERING" />
      <span class="title" style="font-size: 25px">BIM 객체 공정 매핑도구</span>
      <button id="login" style="visibility: visible">Login</button>
    </div>

    <!-- 사이드바 -->
    <div id="sidebar" style="display: none">
      <div class="tabs">
        <button class="tab-button active" data-target="panel1">Files</button>
        <button class="tab-button" data-target="panel2">Tasks</button>
      </div>

      <div class="panels">
        <!-- 1번 패널: 파일 트리 -->
        <div id="panel1" class="panel active">
          <div class="panel-content">
            <div id="tree"></div>
          </div>
        </div>

        <!-- 2번 패널: Task / WBS -->
        <div id="panel2" class="panel">
          <div id="vertical-split-container">
            <div id="task-list-panel">
              <div class="panel-header sticky-task-header">
                <span class="title">Task List</span>
                <div class="button-group">
                  <button id="btn-add">추가</button>
                  <button id="btn-delete">삭제</button>
                  <button id="btn-select">객체 선택</button>
                  <button id="btn-link">데이터 연결</button>
                  <button id="btn-unlink">연결 해제</button>
                  <button id="btn-date">공정현황</button>
                  <button id="btn-test">테스트</button>
                  <button id="btn-update">저장</button>
                </div>
              </div>
              <div id="task-list-content">
                <table id="treegrid" style="width: 100%" class="fancytree-ext-table">
                  <colgroup>
                    <col width="40px" />
                    <col width="60px" />
                    <col width="260px" />
                    <col width="100px" />
                    <col width="100px" />
                    <col width="100px" />
                    <col width="60px" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>구분</th>
                      <th>작업명</th>
                      <th>시작일</th>
                      <th>소요시간(Day)</th>
                      <th>완료일</th>
                      <th>객체개수</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>

            <!-- 드래그 바 -->
            <div id="resizer"></div>

            <div class="sidebar-panel" id="wbs-group-list-panel">
              <div class="panel-header">
                <span class="title">WBS Group List</span>
              </div>
              <div class="panel-content" id="wbs-group-content">
                <div id="wbs-tree"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 사이드바 리사이저 -->
    <div id="sidebar-resizer" style="display: none"></div>

    <!-- 뷰어 + 간트 -->
    <div id="preview" style="display:none">
      <div id="viewer-host"><div id="forgeViewerMount"></div></div>
      <div id="gantt-splitter" title="드래그하여 간트 높이 조절"></div>
      <button id="gantt-open-btn" class="gantt-open-btn" title="간트 펼치기">▲ 간트</button>
      <section id="gantt-pane">
        <div class="gantt-toolbar">
          <strong>공정현황개발중</strong>
          <span id="gantt-range" class="gantt-range"></span>
          <span style="flex:1"></span>
          <button id="gantt-save-png" class="btn btn-sm">PNG 저장</button>
          <button id="gantt-toggle"   class="btn btn-sm">접기/펼치기</button>
        </div>
        <div id="gantt-top-axis" class="gantt-top-axis"><div class="axis-track"></div></div>
        <div id="gantt-chart"></div>
      </section>
    </div>

    <!-- 외부 라이브러리 -->
    <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
    <script src="https://unpkg.com/inspire-tree@4.3.1/dist/inspire-tree.js"></script>
    <script src="https://unpkg.com/inspire-tree-dom@4.0.6/dist/inspire-tree-dom.min.js"></script>

    <!-- 메인 부트스트랩 -->
    <script type="module" src="/js/viewer/CustomViewerExtension.js"></script>
    <script type="module" src="/js/main.js"></script>

    <!-- ⚠️ 유지: 좌측 사이드바(파일탭) 리사이저가 이 파일에 있다면 필요 -->
    <script type="module" src="/js/sidebar/task-wbs/layout/sidebar-resizer.js"></script>

    <!-- ⚠️ 제거: main.js에서 import하여 중복 바인딩되던 항목 -->
    <!-- <script type="module" src="/js/sidebar/task-wbs/layout/panel2-resizer.js"></script> -->

    <!-- 뷰 선택 모달 -->
    <div id="view-select-modal" style="display:none;position:fixed;left:50%;top:42%;transform:translate(-50%,-40%);min-width:330px;background:#fff;border-radius:12px;box-shadow:0 4px 32px #2223;z-index:10001;padding:28px 24px 22px 24px;">
      <div style="font-weight:600;font-size:1.1em;margin-bottom:12px;letter-spacing:0.02em;">
        뷰 선택
        <button id="view-close-btn" style="float:right;background:none;border:none;font-size:22px;color:#888;cursor:pointer;margin-right:-8px;margin-top:-8px;" aria-label="닫기">&times;</button>
      </div>
      <div style="margin-bottom:10px">
        <label for="view-type-dropdown" style="font-size:0.97em;font-weight:500">뷰 타입</label>
        <select id="view-type-dropdown" style="width:100%;padding:6px;font-size:1em;margin-top:4px">
          <option value="3d">3D 뷰</option>
          <option value="2d">2D 뷰</option>
        </select>
      </div>
      <div style="margin-bottom:14px">
        <label for="view-list-dropdown" style="font-size:0.97em;font-weight:500">뷰 리스트</label>
        <select id="view-list-dropdown" style="width:100%;padding:6px;font-size:1em;margin-top:4px">
          <!-- JS로 동적 생성 -->
        </select>
      </div>
      <div style="text-align:right">
        <button id="view-ok-btn" style="padding:7px 20px;font-size:1em;background:#1976d2;color:#fff;border:none;border-radius:5px;">확인</button>
        <button id="view-cancel-btn" style="padding:7px 20px;margin-right:8px;font-size:1em">취소</button>
      </div>
    </div>
  </body>
</html>
```

---

## `wwwroot/js/main.js`

```javascript
// /wwwroot/js/main.js

import { initTabs } from "./sidebar/init-tabs.js";
import { initTree } from "./sidebar/init-tree.js";
import { initViewer, loadModel } from "./viewer/init-viewer.js";
import { buildWbsProviderLazy   } from "./sidebar/task-wbs/wbs/loader.js";
import { bindPanel2Resizer } from "./sidebar/task-wbs/layout/panel-resizer.js";

// ✅ task-wbs 퍼사드(확정 구조)
import {
  initTaskPanel,
  initTaskListButtons,
  setSavedTaskData,
  disableViewerEscReset,
  // requestWbsHighlightGateOn,
  initWbsPanelWithFancytree,   // ✅ 새 WBS 초기화
} from "./sidebar/index.js";

/* ==============================
   상수 & 유틸
============================== */
const SIDEBAR_MIN = 360;
const SIDEBAR_DEFAULT = 900;
const PREVIEW_MIN = 520;

function onceViewer(viewer, type) {
  return new Promise((resolve) => {
    const h = () => {
      viewer.removeEventListener(type, h);
      resolve();
    };
    viewer.addEventListener(type, h);
  });
}
function hasObjectTree(viewer) {
  return !!viewer.model?.getData?.()?.instanceTree;
}
async function waitObjectTree(viewer) {
  if (hasObjectTree(viewer)) return;
  await onceViewer(viewer, Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT);
}

async function waitGeometry(viewer, timeoutMs = 180000) {
  // GEOMETRY_LOADED_EVENT를 확실히 기다리되, 아주 긴 안전 타임아웃만 둠
  await new Promise((resolve) => {
    let done = false;
    const h = () => {
      if (done) return;
      done = true;
      try { viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, h); } catch {}
      resolve();
    };
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, h, { once: true });
    setTimeout(h, timeoutMs); // 비정상 케이스 보호용
  });
}

function waitIdle(timeout = 60) {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout });
    } else {
      setTimeout(resolve, timeout);
    }
  });
}
async function waitViewerReady(viewer) {
  await waitObjectTree(viewer);
  await waitGeometry(viewer);
  await waitIdle(60);
}

function ensureCss(href) {
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href.includes(href))) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href; // 배포 루트 기준: /css/05-hec-progress-overlay.css
    document.head.appendChild(link);
  }
}

/** 초기 사이드바 폭을 1곳에서만 결정 & 반영 */
function initSidebarWidth() {
  const root = document.documentElement;
  const stored = parseInt(localStorage.getItem("sidebarWidthPx") || "0", 10);
  const maxNow = Math.max(SIDEBAR_MIN, window.innerWidth - PREVIEW_MIN);
  const initial = Number.isFinite(stored) && stored >= SIDEBAR_MIN
    ? Math.min(maxNow, stored)
    : Math.min(maxNow, SIDEBAR_DEFAULT);
  root.style.setProperty("--sidebar-width", initial + "px");
  return initial;
}

/** 뷰어 입력/카메라/툴 기본 상태 강제 초기화 */
function resetViewerInputAndCamera(viewer) {
  try {
    const tc = viewer.toolController;

    // 커스텀 툴 해제
    if (tc?.isToolActivated?.("BoxSelectionTool")) {
      tc.deactivateTool("BoxSelectionTool");
    }

    // 네비 복구
    viewer.setNavigationLock(false);
    const fallbackNav = viewer.impl?.is2d ? "pan" : "orbit";
    viewer.setActiveNavigationTool?.(fallbackNav);

    // 선택 모드 + 선택 해제
    viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
    viewer.clearSelection?.();

    // 3D: 월드업 + 피벗/시점 보정
    if (!viewer.impl?.is2d) {
      viewer.navigation.setWorldUpVector(new THREE.Vector3(0, 0, 1), true);
      const bb = viewer.model?.getBoundingBox?.();
      if (bb) {
        const center = bb.getCenter(new THREE.Vector3());
        viewer.navigation.setPivotPoint(center);
        viewer.navigation.setTarget(center);
      }
    }

    viewer.fitToView?.();
  } catch (e) {
    console.warn("[init] resetViewerInputAndCamera failed:", e);
  }
}

/* ==============================
   전역 상태/샘플
============================== */
// 전면 하이라이트 게이트: 초기엔 OFF
window.__ALLOW_WBS_UPDATE = false;

const login = document.getElementById("login");
let taskData = [];

// 샘플 데이터 (서버에 데이터 없을 때 사용)
const SAMPLE_TASK_DATA = [
  {
    no: "1",
    selectOptions: ["시공", "가설", "철거"],
    selectedOption: "시공",
    title: "Task A",
    start: "2024-06-25",
    end: "2024-07-01",
    linkedObjects: [{ urn: "SAMPLE_URN", dbId: 1001, text: "벽체1" }],
    children: [
      {
        no: "1.1",
        selectOptions: ["시공", "가설", "철거"],
        selectedOption: "시공",
        title: "Subtask A1",
        start: "2024-06-26",
        end: "2024-06-30",
        linkedObjects: [{ urn: "SAMPLE_URN", dbId: 1002, text: "벽체2" }],
      },
    ],
  },
  {
    no: "2",
    selectOptions: ["시공", "가설", "철거"],
    selectedOption: "시공",
    title: "Task B",
    start: "",
    end: "",
    linkedObjects: [],
  },
];

// URN을 특수문자 없는 safe key로 변환
function safeUrn(urn) {
  return urn.replace(/[^a-zA-Z0-9]/g, "_");
}
// taskData의 모든 linkedObjects에 urn 채워넣기
function fillUrnRecursive(task, defaultUrn) {
  if (Array.isArray(task.linkedObjects)) {
    task.linkedObjects.forEach((obj) => {
      if (!obj.urn) obj.urn = defaultUrn || window.CURRENT_MODEL_URN;
    });
  }
  if (Array.isArray(task.children)) {
    task.children.forEach((child) => fillUrnRecursive(child, defaultUrn));
  }
}

/* ==============================
   전역 리사이즈(쓰로틀)
============================== */
window.addEventListener(
  "resize",
  _.throttle(() => {
    try {
      // 창이 줄면 사이드바가 최대치 넘지 않도록 보정
      initSidebarWidth();
      // 뷰어 좌표계 붕괴 방지
      window.viewer?.resize?.();
      window.viewer?.impl?.invalidate?.(true, true, true);
      // 간트 재랜더
      if (window.gantt && window.taskTree) {
        window.gantt.renderFromTrees(window.taskTree, window.wbsTree);
      }
    } catch (e) {
      console.warn("[resize] redraw failed", e);
    }
  }, 120)
);

/* ==============================
   앱 전체 초기화
============================== */
(async function () {
  try {
    // 1) 로그인 체크
    const resp = await fetch("/api/auth/profile", { credentials: "include" });
    if (!resp.ok) {
      window.location.replace("/api/auth/login");
      return;
    }
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

    // 2) 레이아웃 표시 & 사이드바 초기폭 1회 반영
    const Sidebar = document.getElementById("sidebar");
    const Header  = document.getElementById("header");
    const Preview = document.getElementById("preview");
    const sidebarResizer = document.getElementById("sidebar-resizer");
    const Loading = document.getElementById("loading");

    Sidebar.style.display = "";
    sidebarResizer.style.display = "";
    Preview.style.display = "";
    Header.style.display = "";
    Loading.style.display = "none";
    login.style.visibility = "visible";

    // 인라인 폭/left 제거(전부 CSS 변수로 통일)
    Sidebar.style.removeProperty("width");
    Preview.style.removeProperty("left");
    sidebarResizer.style.removeProperty("left");

    // ★ 반드시 viewer 생성 전, CSS 변수 준비
    initSidebarWidth();

    // 3) 탭/뷰어 초기화
    initTabs("#sidebar");
    const viewerHost = document.getElementById("viewer-host");
    const viewer = await initViewer(viewerHost);
    window.viewer = viewer;               // ✅ 전역 참조
    disableViewerEscReset(viewer);

    // [추가] CSS 주입 + 확장 로드
    ensureCss('/css/05-hec-progress-overlay.css');
    await import('./viewer/hec.ProgressOverlay.js');
    const progressOverlay = await viewer.loadExtension('hec.ProgressOverlay', {
      startVisible: false,
      autoHideOnGeometryLoaded: true,
      autoHideDelayMs: 900,
      clickToDismiss: true,
      useToastOnDone: true,
      keepAlive: 'off',   // ← 완전 끔 (문제 원인 절연)
    });
    window.progressOverlay = progressOverlay; // (디버그용)

    // 리사이저 바인딩(반드시 viewer 전달)
    bindPanel2Resizer(viewer);

    // 초기 좌표 보정
    viewer.resize();
    viewer.impl?.invalidate?.(true, true, true);
    requestAnimationFrame(() => {
      try {
        viewer.resize();
        viewer.impl?.invalidate?.(true, true, true);
      } catch {}
    });

    // 입력/카메라 보정
    resetViewerInputAndCamera(viewer);

    // 혹시 첫 프레임 사이드바가 0이라면 복구
    requestAnimationFrame(() => {
      const sb = document.getElementById("sidebar");
      if (sb && sb.offsetWidth === 0) {
        document.documentElement.style.setProperty("--sidebar-width", SIDEBAR_DEFAULT + "px");
        viewer.resize();
        viewer.impl?.invalidate?.(true, true, true);
      }
    });

    // 4) 프로젝트 트리 초기화(모델 선택 콜백)
    initTree("#tree", async (versionId) => {
      destroyTaskPanel();

      const urn = window.btoa(versionId).replace(/=/g, "");
      window.CURRENT_MODEL_URN = urn;
      window.CURRENT_MODEL_SAFE_URN = safeUrn(urn);

      taskData.length = 0;
      setSavedTaskData([]);
      await loadTaskDataIfExists();
      taskData.forEach((t) => fillUrnRecursive(t, urn));

      console.log("[main.js] 모델 선택!", versionId, urn);

      // 모델 클릭 → 팝업 즉시 표시
      const ov = viewer.getExtension('hec.ProgressOverlay');
      ov?.beginLoadFor(urn, '모델을 로드하는 중입니다…');
            
      await loadModel(viewer, urn);

      // ✅ 뷰어 로딩 완료 + idle 보장
      await waitViewerReady(viewer);

      // ▶ 모델마다 1회 카메라/피벗/입력 보정
      resetViewerInputAndCamera(viewer);
      viewer.resize();

      // WBS 데이터
      // let wbsData = [];
      // try {
      //   wbsData = await buildWbsTreeData(viewer);
      let wbsProvider;
      try { const { provider } = await buildWbsProviderLazy(viewer, { bucketThreshold: 400, bucketSize: 200, source: 'all' }); 
      wbsProvider = provider;
      } catch (e) {
        console.warn("[main.js] WBS 데이터 생성 실패!", e);
        // wbsData = [];
        wbsProvider = { __provider:true, roots: async()=>[], children: async()=>[], countAt: ()=>0 };
      }

      // Task 패널 초기화
      initTaskPanel(taskData);
      initTaskListButtons();

      window.dispatchEvent(new Event("panel2-ready"));

      // ▶ 로딩 종료 전, 루트~Level~Zone(=3단) 워밍업
      async function warmup(provider, maxDepth=3, hardCap=1200){
        const roots = await provider.roots();
        let q = roots.map(r => ({ path: [r.text], depth: 1 }));
        let c = 0;
        while (q.length && c < hardCap) {
          const { path, depth } = q.shift();
          if (depth >= maxDepth) continue;
          const kids = await provider.childrenByPath(path);
          c += kids.length;
          kids.forEach(k => q.push({ path: [...path, k.text], depth: depth+1 }));
        }
      }
      try { progressOverlay.setMessage('WBS 준비 중…'); } catch {}
      try { await warmup(wbsProvider, 3, 1200); } catch {}

      // ✅ WBS 패널(Fancytree) 초기화
      try { await initWbsPanelWithFancytree(wbsProvider, { primaryOrder: ["HEC.WBS","HEC.Level","HEC.Zone"] }); } catch (e) {
        console.warn("[main.js] initWbsPanelWithFancytree 실패:", e);
      }

      // 간트 1회 렌더(가볍게)
      requestAnimationFrame(() => {
        try {
          window.gantt?.renderFromTrees(window.taskTree, window.wbsTree);
        } catch {}
      });

      // ▷ WBS 초기화/첫 렌더/하이라이트까지 끝난 뒤에 종료
      try { progressOverlay.finishFor(urn, '모델 로딩이 완료되었습니다.'); } catch (e) {}
    });
  } catch (err) {
    alert("Could not initialize the application. See console for more details.");
    console.error(err);
  }
})();

/* ==============================
   데이터 로드/파괴 유틸
============================== */
async function loadTaskDataIfExists() {
  try {
    const safeUrnVal = window.CURRENT_MODEL_SAFE_URN;
    const url = `/api/tasks?urn=${safeUrnVal}`;
    const resp = await fetch(url, { credentials: "include" });
    if (resp.ok) {
      const data = await resp.json();
      taskData.length = 0;
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => taskData.push(item));
        setSavedTaskData(taskData);
      } else {
        SAMPLE_TASK_DATA.forEach((item) => taskData.push(structuredClone(item)));
        setSavedTaskData(taskData);
      }
    } else {
      taskData.length = 0;
      SAMPLE_TASK_DATA.forEach((item) => taskData.push(structuredClone(item)));
      setSavedTaskData(taskData);
    }
  } catch (err) {
    taskData.length = 0;
    SAMPLE_TASK_DATA.forEach((item) => taskData.push(structuredClone(item)));
    setSavedTaskData(taskData);
    console.warn("task 데이터를 불러오지 못했습니다. 샘플로 초기화:", err);
  }
}

function destroyTaskPanel() {
  console.log("[destroy] panel2 destroy & 재생성");
  try { $.ui.fancytree.getTree("#treegrid")?.destroy(); } catch {}
  window.taskTree = null;
  window.wbsTree = null;
  try { window.gantt?.drawFromRows?.([]); } catch {}
  $("#wbs-group-content").empty();
  $("#treegrid tbody").empty();
}
```

---

## `wwwroot/js/sidebar/index.js`

```javascript
// /wwwroot/js/sidebar/index.js
// 퍼사드: 외부에서는 이 파일만 import 하세요.

// Task / WBS 패널
export { initTaskPanel } from "./task-wbs/task-tree.js";
export { initTaskListButtons, setSavedTaskData } from "./task-wbs/task-buttons.js";

// ✅ 새 WBS(Fancytree + 매트릭스)
export { initWbsPanelWithFancytree } from "./task-wbs/wbs-panel-init.js";

// (구 하이라이트 모듈 호출 제거: Fancytree 전환 중에는 불필요)

// ── 하이라이트 게이트(트래픽 조절) ──

// 날짜/리드타임 유틸(필요 시 외부 사용)
export * as DateHelpers from "./task-wbs/core/date-helpers.js";

// ESC: 뷰어 상태 초기화 차단 + ESC로 Task/WBS 선택만 해제
export { disableViewerEscReset } from "./task-wbs/helpers/viewer-esc.js";

// (선택) WBS 로더(지연 프로바이더)도 퍼사드로 노출
// ※ 당신의 실제 파일 위치에 맞춰 경로 유지하세요.
export { buildWbsProviderLazy } from "./task-wbs/wbs/loader.js";

// Box Selection (있으면 유지)
export { BoxSelectionTool, enableBoxSelectionMode } from "/js/viewer/selection-tool.js";
```

---

## `wwwroot/js/sidebar/init-tabs.js`

```javascript
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
```

---

## `wwwroot/js/sidebar/init-tree.js`

```javascript
async function getJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    alert("Could not load tree data. See console for more details.");
    console.error(await resp.text());
    return [];
  }
  return resp.json();
}

function createTreeNode(id, text, icon, children = false) {
  return { id, text, children, itree: { icon } };
}

async function getHubs() {
  const hubs = await getJSON("/api/hubs");
  return hubs.map((hub) =>
    createTreeNode(`hub|${hub.id}`, hub.name, "icon-hub", true)
  );
}

async function getProjects(hubId) {
  const projects = await getJSON(`/api/hubs/${hubId}/projects`);
  return projects.map((project) =>
    createTreeNode(
      `project|${hubId}|${project.id}`,
      project.name,
      "icon-project",
      true
    )
  );
}

async function getContents(hubId, projectId, folderId = null) {
  const contents = await getJSON(
    `/api/hubs/${hubId}/projects/${projectId}/contents` +
      (folderId ? `?folder_id=${folderId}` : "")
  );
  return contents.map((item) => {
    if (item.folder) {
      return createTreeNode(
        `folder|${hubId}|${projectId}|${item.id}`,
        item.name,
        "icon-my-folder",
        true
      );
    } else {
      return createTreeNode(
        `item|${hubId}|${projectId}|${item.id}`,
        item.name,
        "icon-item",
        true
      );
    }
  });
}

async function getVersions(hubId, projectId, itemId) {
  const versions = await getJSON(
    `/api/hubs/${hubId}/projects/${projectId}/contents/${itemId}/versions`
  );
  return versions.map((version, idx) =>
    createTreeNode(
      `version|${version.id}`,
      formatVersion(version, versions.length - idx - 1),
      "icon-version"
    )
  );
}

export function initTree(selector, onSelectionChanged) {
  // See http://inspire-tree.com
  const tree = new InspireTree({
    data: function (node) {
      if (!node || !node.id) {
        return getHubs();
      } else {
        const tokens = node.id.split("|");
        switch (tokens[0]) {
          case "hub":
            return getProjects(tokens[1]);
          case "project":
            return getContents(tokens[1], tokens[2]);
          case "folder":
            return getContents(tokens[1], tokens[2], tokens[3]);
          case "item":
            return getVersions(tokens[1], tokens[2], tokens[3]);
          default:
            return [];
        }
      }
    },
  });
  tree.on("node.click", function (event, node) {
    event.preventTreeDefault();
    const tokens = node.id.split("|");
    if (tokens[0] === "version") {
      onSelectionChanged(tokens[1]);
    }
  });
  return new InspireTreeDOM(tree, { target: selector });
}

// version.name 또는 version.createTime 처럼 날짜가 들어오는 경우
function formatVersion(version, idx) {
  const dateStr = version.name || version.createTime;
  const date = new Date(dateStr);

  const versionNum = "V" + (idx + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateOnly = `${y}-${m}-${d}`;

  return `${versionNum}_${dateOnly}`;
}
```

---

## `wwwroot/js/sidebar/task-wbs/core/aggregate.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/core/aggregate.js

function aggKey(o){
  if (!o || o.dbId == null) return null;
  const urn = String(o.urn || window.CURRENT_MODEL_URN || "");
  return `${urn}::${String(o.dbId)}`;
}

export function recomputeAggDown(node) {
  if (!node) return new Set();
  const set = new Set();
  const arr = (node.data && Array.isArray(node.data.linkedObjects)) ? node.data.linkedObjects : [];
  for (const o of arr) { const k = aggKey(o); if (k) set.add(k); }
  if (node.children && node.children.length) {
    for (const c of node.children) { const cs = recomputeAggDown(c); cs.forEach(k => set.add(k)); }
  }
  node.data._aggSet = set;
  node.data._aggObjCount = set.size;
  return set;
}

export function recomputeAggUp(from) {
  let cur = from;
  while (cur && cur.parent) {
    cur = cur.parent;
    if (cur.isRoot && cur.isRoot()) break;
    const set = new Set();
    const arr = (cur.data && Array.isArray(cur.data.linkedObjects)) ? cur.data.linkedObjects : [];
    for (const o of arr) { const k = aggKey(o); if (k) set.add(k); }
    if (cur.children && cur.children.length) {
      for (const ch of cur.children) {
        const cs = ch.data && ch.data._aggSet;
        if (cs) cs.forEach(k => set.add(k));
      }
    }
    cur.data._aggSet = set;
    cur.data._aggObjCount = set.size;
  }
}

export function recomputeAggObjects(tree) {
  if (!tree?.getRootNode) return;
  const roots = tree.getRootNode().children || [];
  function walk(node){
    const own = new Set();
    const arr = (node.data && Array.isArray(node.data.linkedObjects)) ? node.data.linkedObjects : [];
    for (const o of arr) { const k = aggKey(o); if (k) own.add(k); }
    if (node.children && node.children.length) {
      for (const c of node.children) { const cs = walk(c); cs.forEach(k => own.add(k)); }
    }
    node.data._aggSet = own;
    node.data._aggObjCount = own.size;
    return own;
  }
  for (const n of roots) walk(n);
}
```

---

## `wwwroot/js/sidebar/task-wbs/core/categories.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/core/categories.js

export function stripCountSuffix(s) {
  if (s == null) return s;
  return String(s).replace(/\s*(?:=>\s*)?\(\s*\d+\s*\)\s*$/,'').trim();
}

export function normalizeTaskCategory(val) {
  const s = String(val || "").trim();
  if (s === "시공") return "C";
  if (s === "가설") return "T";
  if (s === "철거") return "D";
  return "";
}

export function propagateCategoryDown(node, categoryLabel) {
  if (!node) return;
  node.data = node.data || {};
  node.data.selectedOption = categoryLabel;
  (node.children || []).forEach(ch => propagateCategoryDown(ch, categoryLabel));
}

export function enforceCategoryInheritance(tree) {
  if (!tree?.getRootNode) return;
  const root = tree.getRootNode();
  (root.children || []).forEach(top => {
    const cat = top?.data?.selectedOption || "시공";
    propagateCategoryDown(top, cat);
  });
}
```

---

## `wwwroot/js/sidebar/task-wbs/core/date-helpers.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/core/date-helpers.js

function toUTCDate(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd||"")) return new Date('Invalid');
  const [y,m,d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m-1, d));
}
function fromUTCDate(date) {
  return date.toISOString().slice(0, 10);
}

export function calcLeadtime(start, end) {
  if (start && end) {
    const s = toUTCDate(start), e = toUTCDate(end);
    if (!isNaN(s) && !isNaN(e)) {
      const diffDays = Math.round((e - s) / 86400000) + 1;
      return diffDays > 0 ? diffDays : "";
    }
  }
  return "";
}
export function calcEnd(start, leadtime) {
  if (start && leadtime) {
    const s = toUTCDate(start);
    const lt = Number(leadtime);
    if (!isNaN(s) && lt > 0) {
      const e = new Date(s.getTime());
      e.setUTCDate(e.getUTCDate() + lt - 1);
      return fromUTCDate(e);
    }
  }
  return "";
}
export function calcStart(end, leadtime) {
  if (end && leadtime) {
    const e = toUTCDate(end);
    const lt = Number(leadtime);
    if (!isNaN(e) && lt > 0) {
      const s = new Date(e.getTime());
      s.setUTCDate(s.getUTCDate() - lt + 1);
      return fromUTCDate(s);
    }
  }
  return "";
}

export function recalcLeadtimeFields(node, changedField, popupCallback) {
  node.data = node.data || {};
  let { start, end, leadtime } = node.data;
  const has = v => v !== undefined && v !== null && v !== "";
  const cnt = (has(start)?1:0) + (has(end)?1:0) + (has(leadtime)?1:0);

  if (cnt === 2) {
    if (has(start) && has(leadtime) && !has(end)) node.data.end = calcEnd(start, leadtime);
    else if (has(start) && has(end) && !has(leadtime)) node.data.leadtime = calcLeadtime(start, end);
    else if (has(end) && has(leadtime) && !has(start)) node.data.start = calcStart(end, leadtime);
    return;
  }
  if (cnt === 3 && changedField) {
    if (changedField === "leadtime" && typeof popupCallback === "function") {
      popupCallback((updateField) => {
        start = node.data.start; end = node.data.end; leadtime = node.data.leadtime;
        if (updateField === "start") node.data.start = calcStart(end, leadtime);
        else if (updateField === "end") node.data.end = calcEnd(start, leadtime);
      });
    } else if (changedField === "start" || changedField === "end") {
      node.data.leadtime = calcLeadtime(node.data.start, node.data.end);
    }
  }
}

export function recalcLeadtimeDescendants(node) {
  if (!(node.hasChildren && node.hasChildren())) recalcLeadtimeFields(node);
  else (node.children || []).forEach(recalcLeadtimeDescendants);
}

export function recalcLeadtimeAncestors(node) {
  if (!node.parent) return;
  const p = node.parent, children = p.children || [];
  if (!children.length) return;
  let minStart = "", maxEnd = "";
  for (const c of children) {
    const cs = c.data && c.data.start || "";
    const ce = c.data && c.data.end   || "";
    if (cs) minStart = (!minStart || cs < minStart) ? cs : minStart;
    if (ce) maxEnd   = (!maxEnd   || ce > maxEnd)   ? ce : maxEnd;
  }
  p.data = p.data || {};
  p.data.start = minStart || "";
  p.data.end   = maxEnd   || "";
  p.data.leadtime = (p.data.start && p.data.end) ? calcLeadtime(p.data.start, p.data.end) : "";
  recalcLeadtimeAncestors(p);
}

export function recalcAllLeadtime(tree) {
  if (!tree?.getRootNode) return;
  const roots = tree.getRootNode().children || [];
  function dfs(node) {
    if (!node) return { start: "", end: "" };
    if (!node.hasChildren || !node.hasChildren()) {
      recalcLeadtimeFields(node);
      return { start: node.data?.start || "", end: node.data?.end || "" };
    }
    let minStart = "", maxEnd = "";
    for (const c of (node.children || [])) {
      const agg = dfs(c);
      if (agg.start) minStart = (!minStart || agg.start < minStart) ? agg.start : minStart;
      if (agg.end)   maxEnd   = (!maxEnd   || agg.end   > maxEnd)   ? agg.end   : maxEnd;
    }
    node.data = node.data || {};
    node.data.start = minStart || "";
    node.data.end   = maxEnd   || "";
    node.data.leadtime = (node.data.start && node.data.end) ? calcLeadtime(node.data.start, node.data.end) : "";
    return { start: node.data.start, end: node.data.end };
  }
  for (const n of roots) dfs(n);
}
```

---

## `wwwroot/js/sidebar/task-wbs/core/element-id.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/core/element-id.js

// 전역 캐시: dbId -> elementId
const ELID = (window.__ELID_INDEX = window.__ELID_INDEX || new Map());

// 후보 Property 이름(모델별 편차 흡수)
const CANDIDATE_PROPS = [
  "Element Id", "ElementId", "Element ID", "요소 ID",
  "element id", "elementId",
  "ExternalId", "externalId"
];

// 내부: bulk로 받아 캐시 채움
async function bulkFill(dbIds) {
  const viewer = window.viewer;
  const model  = viewer?.model;
  if (!model || !dbIds?.length) return;

  const need = Array.from(new Set(dbIds.map(Number))).filter(id => !ELID.has(id));
  if (!need.length) return;

  await new Promise((resolve) => {
    try {
      model.getBulkProperties(
        need,
        { propFilter: CANDIDATE_PROPS },
        (results) => {
          try {
            results.forEach(r => {
              const dbId = Number(r.dbId);
              if (!r?.properties) return;
              let elid = null;
              for (const p of r.properties) {
                const name = String(p.displayName || p.attributeName || p.name || "");
                if (CANDIDATE_PROPS.includes(name)) {
                  elid = String(p.displayValue ?? p.value ?? "");
                  if (elid) break;
                }
              }
              if (elid) ELID.set(dbId, elid);
            });
          } finally { resolve(); }
        },
        () => resolve()
      );
    } catch { resolve(); }
  });

  // 폴백 1: externalId 매핑
  let still = need.filter(id => !ELID.has(id));
  if (still.length) {
    await new Promise((resolve) => {
      try {
        model.getExternalIdMapping((mapping) => {
          try {
            const reverse = new Map();
            Object.keys(mapping || {}).forEach(extId => {
              const d = Number(mapping[extId]);
              if (still.includes(d)) reverse.set(d, extId);
            });
            reverse.forEach((extId, d) => ELID.set(d, String(extId)));
          } finally { resolve(); }
        });
      } catch { resolve(); }
    });
  }

  // 폴백 2: 인스턴스 트리 이름의 [숫자] 추출 (예: "패밀리 [123456]")
  still = need.filter(id => !ELID.has(id));
  if (still.length) {
    try {
      const it = model.getData?.()?.instanceTree;
      if (it) {
        still.forEach(d => {
          try {
            const nm = it.getNodeName ? it.getNodeName(d) : "";
            const m = /\[(\d+)\]\s*$/.exec(String(nm || ""));
            if (m && m[1]) ELID.set(d, m[1]);
          } catch {}
        });
      }
    } catch {}
  }
}

// 외부: 여러 개 한꺼번에 준비
export async function ensureElementIdIndexForDbIds(dbIds = []) {
  await bulkFill(dbIds);
}

// 외부: 즉시 조회(캐시에 없으면 null)
export function getElementIdFor(urn, dbId) {
  return ELID.get(Number(dbId)) || null;
}

// 외부: 어디서든 표기를 통일
export function formatObjectLabel(o) {
  const id = o?.elementId ?? getElementIdFor(o?.urn, o?.dbId);
  return id ? `[${id}]` : `[${o?.dbId}]`;
}
```

---

## `wwwroot/js/sidebar/task-wbs/core/matrix-index.js`

```javascript
//wwwroot/js/sidebar/task-wbs/core/matrix-index.js
// 행(경로) × 열(DBID) 인덱스 + 카테고리 집합 + 경로 상태/카운트 계산
import { toKey } from "./path-key.js";

const PATH_TO_IDS = new Map();        // pathKey -> Int32Array(dbIds)
const PATH_STATE = new Map();         // pathKey -> "C"|"TD"|"" (undefined = 아직 미계산)
const PATH_COUNTS = new Map();        // pathKey -> { total, c, t, d, td }
let __provider = null;

// 카테고리 집합(실시간 재생성)
let S_C = new Set(); // 시공
let S_T = new Set(); // 가설
let S_D = new Set(); // 철거

const CUR_URN = () => String(window.CURRENT_MODEL_URN || "");
const normCat = (v) => v === "시공" || v === "C" ? "C" : v === "가설" || v === "T" ? "T" : v === "철거" || v === "D" ? "D" : "";

function buildCatSetsFromTasks() {
  S_C = new Set(); S_T = new Set(); S_D = new Set();
  const tree = window.taskTree;
  if (!tree?.getRootNode) return;
  tree.getRootNode().visit((n) => {
    const cat = normCat(n.data?.selectedOption);
    if (!cat) return;
    (n.data?.linkedObjects || []).forEach(o => {
      const urn = String(o.urn || CUR_URN());
      if (urn !== CUR_URN()) return; // 현재 모델만
      const d = Number(o.dbId);
      if (!Number.isFinite(d)) return;
      if (cat === "C") S_C.add(d);
      if (cat === "T") S_T.add(d);
      if (cat === "D") S_D.add(d);
    });
  });
}

export async function initMatrix({ primaryOrder, provider }) {
  __provider = provider;
  PATH_TO_IDS.clear(); PATH_STATE.clear(); PATH_COUNTS.clear();
  buildCatSetsFromTasks();
}

export function markTasksChanged() {
  buildCatSetsFromTasks();
  // 경로 상태/카운트는 필요 시 재계산하도록 캐시는 지워두는 편이 안전
  PATH_STATE.clear(); PATH_COUNTS.clear();
}

export function getPathState(pathKey) {
  return PATH_STATE.get(pathKey);
}

export function getCounts(pathKey) {
  return PATH_COUNTS.get(pathKey);
}

function reduceStateAndCounts(ids = []) {
  const total = ids.length | 0;
  if (!total) return { state: "", counts: { total: 0, c: 0, t: 0, d: 0, td: 0 } };

  let c = 0, t = 0, d = 0, td = 0;
  for (const id of ids) {
    const inC = S_C.has(id), inT = S_T.has(id), inD = S_D.has(id);
    if (inC && !inT && !inD) c++;
    else if (!inC && inT && !inD) t++;
    else if (!inC && !inT && inD) d++;
    else if (!inC && (inT || inD)) td++; // T/D 혼합(파란계열)
    else {
      // 아무 데도 없거나 C와 T/D가 혼합된 경우 → 혼합 취급 (state="")
      // counts에는 포함 안 함
    }
  }

  // 경로 상태 규칙
  //  - 전부 C  → "C"
  //  - 전부 T/D(=t+d+td == total) → "TD"
  //  - 그 외(혼합/미완성) → ""
  let state = "";
  if (c === total) state = "C";
  else if ((t + d + td) === total) state = "TD";
  else state = "";

  return { state, counts: { total, c, t, d, td } };
}

// 특정 경로의 dbIds 확보(가능하면 동기, 아니면 provider에서 유도)
export async function ensureIdsForPath(pathKey) {
  if (PATH_TO_IDS.has(pathKey)) return PATH_TO_IDS.get(pathKey);
  if (!__provider) return undefined;

  const path = pathKey ? pathKey.split("¦") : [];
  // provider.getDbIdsForPath는 상위 groups 캐시로 동기 유도 가능(allowUnbuilt:true)
  const ids = __provider.getDbIdsForPath(path, { includeDescendants: true, allowUnbuilt: true });
  if (ids == null) return undefined; // 아직 준비안됨(렌더 유지)

  const arr = Int32Array.from(ids.map(Number).filter(Number.isFinite));
  PATH_TO_IDS.set(pathKey, arr);
  return arr;
}

// 여러 경로 한꺼번에 보충
export async function bulkEnsureForVisible(pathKeys = []) {
  for (const k of pathKeys) {
    if (!PATH_TO_IDS.has(k)) {
      await ensureIdsForPath(k);
    }
  }
}

// 상태/카운트 계산(동기 입력이 없으면 보류)
export function computePathState(pathKey) {
  const idsArr = PATH_TO_IDS.get(pathKey);
  if (!idsArr) return undefined; // 아직 unknown → 렌더 유지

  const ids = Array.from(idsArr);
  const { state, counts } = reduceStateAndCounts(ids);

  PATH_STATE.set(pathKey, state);
  PATH_COUNTS.set(pathKey, counts);
  return state;
}
```

---

## `wwwroot/js/sidebar/task-wbs/core/path-key.js`

```javascript
//wwwroot/js/sidebar/task-wbs/core/path-key.js

// 경로 직렬화/비교 유틸
const SEP = "¦";

export function normalizeLabel(s) {
  return String(s ?? "")
    .normalize("NFKC")
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toKey(pathArr = []) {
  return (pathArr || []).map(normalizeLabel).join(SEP);
}

export function fromKey(k = "") {
  if (!k) return [];
  return String(k).split(SEP).map(normalizeLabel);
}

export function startsWithKey(full, head) {
  if (!head) return true;
  if (full === head) return true;
  return full.startsWith(head + SEP);
}
```

---

## `wwwroot/js/sidebar/task-wbs/helpers/viewer-esc.js`

```javascript
// viewer-esc.js
// APS Viewer에서 ESC로 도구/선택 상태만 처리하고 "객체 상태 초기화"는 막는다.

// ESC로 Task/WBS만 해제할지 제어하는 전역 플래그(기본 false)
window.__DISABLE_ESC_CLEAR = window.__DISABLE_ESC_CLEAR ?? false;

export function disableViewerEscReset(viewer) {
  try {
    if (!viewer || !viewer.toolController) return;

    // 1) Autodesk Viewer tool로 ESC 기본 리셋 차단
    if (!viewer.__escToolInstalled) {
      const EscBlockerTool = {
        getName() { return 'esc-blocker'; },
        getNames() { return ['esc-blocker']; },
        activate() { return true; },
        deactivate() { return true; },
        handleKeyDown(ev){ if ((ev?.key === 'Escape') || ev?.keyCode === 27){ ev.stopPropagation?.(); ev.preventDefault?.(); return true; } return false; },
        handleKeyUp(ev){ if ((ev?.key === 'Escape') || ev?.keyCode === 27){ ev.stopPropagation?.(); ev.preventDefault?.(); return true; } return false; },
      };
      const tc = viewer.toolController;
      tc.registerTool(EscBlockerTool);
      tc.activateTool('esc-blocker');
      viewer.__escToolInstalled = true;
    }

    // 2) 캡처 레벨 가드 (입력폼 제외, 뷰어 영역에서만)
    const container = viewer.container || document.querySelector('#forgeViewerMount, #viewer-host');
    const guard = (e) => {
      const t = e.target, tag = (t && t.tagName) || '';
      const isForm = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable;
      if (isForm) return;
      const inViewer = container && (container.contains(e.target) || container.contains(document.activeElement));
      if (!inViewer) return;
      if (e.key === 'Escape' || e.keyCode === 27) { e.stopImmediatePropagation(); e.preventDefault(); }
    };
    if (!viewer.__escCaptureBound) {
      window.addEventListener('keydown', guard, true);
      document.addEventListener('keydown', guard, true);
      container && container.addEventListener('keydown', guard, true);
      viewer.__escCaptureBound = true;
    }

    // 3) (옵션) ESC 시 뷰어 리셋 대신 Task/WBS 선택만 해제
    if (!window.__escClearBound) {
      window.__escClearBound = true;
      const isFormTarget = (t) => {
        const tag = (t && t.tagName) || '';
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable;
      };
      document.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.keyCode === 27) && !isFormTarget(e.target)) {
          try { window.taskTree?.visit?.(n => n.setActive(false)); } catch {}
          try { window.wbsTree?.selected?.()?.forEach(n => n.deselect()); } catch {}
        }
      }, true);
    }
  } catch (e) {
    console.warn('[ESC block] install failed:', e);
  }
}
```

---

## `wwwroot/js/sidebar/task-wbs/layout/panel-resizer.js`

```javascript
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
```

---

## `wwwroot/js/sidebar/task-wbs/layout/sidebar-resizer.js`

```javascript
// wwwroot/js/sidebar/sidebar-resizer.js

const sidebar = document.getElementById("sidebar");
const resizer = document.getElementById("sidebar-resizer");
const preview = document.getElementById("preview");
const minWidth = 220; // 최소폭
const maxWidth = 750; // 최대폭

function setSidebarWidth(px) {
  sidebar.style.width = px + "px";
  resizer.style.left = px + "px";
  if (preview) preview.style.left = px + "px";
}

resizer.addEventListener("mousedown", function (e) {
  e.preventDefault();
  document.body.style.cursor = "ew-resize";

  function onMouseMove(e2) {
    let newWidth = e2.clientX;
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    setSidebarWidth(newWidth);
  }

  function onMouseUp() {
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

window.addEventListener("DOMContentLoaded", () => {
  const sidebarRect = sidebar.getBoundingClientRect();
  setSidebarWidth(sidebarRect.width);
});
```

---

## `wwwroot/js/sidebar/task-wbs/logic/task-aggregate.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/logic/task-aggregate.js
// 연결 객체 수 집계: (자기 + 하위) linkedObjects를 모아 중복 제거하여 반환

/**
 * 특정 Task 노드 기준으로 (자신 + 하위) 연결 객체를 합산하여 반환합니다.
 * - 동일 (urn, dbId) 객체는 중복 제거됩니다.
 * - 날짜/리드타임 원본값은 그대로 전달합니다.
 * @param {FancytreeNode} node
 * @returns {{ start:string, end:string, leadtime:number|string, objects:Array<{urn:string, dbId:number, text?:string}> }}
 */

export function aggregateTaskFields(node) {
  let objects = (node?.data?.linkedObjects || []).slice();

  if (node?.hasChildren && node.hasChildren()) {
    (node.children || []).forEach(child => {
      const childAgg = aggregateTaskFields(child);
      objects = objects.concat(childAgg.objects);
    });
  }

  // urn::dbId 단위로 중복 제거
  const seen = new Set();
  objects = objects.filter(obj => {
    const key = `${obj.urn || ""}::${obj.dbId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    start: node?.data?.start || "",
    end: node?.data?.end || "",
    leadtime: node?.data?.leadtime || "",
    objects
  };
}
```

---

## `wwwroot/js/sidebar/task-wbs/logic/task-check-basedondate.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/logic/task-check-basedondate.js

/**
 * 날짜별 Task 객체 상태 갱신 함수 (APS Viewer 호환)
 * @param {string} dateStr - 기준일자 (yyyy-mm-dd)
 * @param {object} taskTree - fancytree 인스턴스 (window.taskTree)
 * @param {Autodesk.Viewing.GuiViewer3D} viewer - 전역 viewer 객체
 */

function themeForAll(viewer, ids, hex) {
  if (!ids?.length || !window.THREE) return;
  const color = new window.THREE.Color(hex);
  const models = (viewer.getVisibleModels && viewer.getVisibleModels().length)
    ? viewer.getVisibleModels()
    : (viewer.model ? [viewer.model] : []);
  for (const m of models) {
    for (let i=0;i<ids.length;i++) {
      try { viewer.setThemingColor(ids[i], color, m); } catch(_) {}
    }
  }
}

export function checkTaskStatusByDate(dateStr, taskTree, viewer) {
  if (!dateStr || !taskTree || !viewer) return;

  // 1. 색상/숨김 상태 초기화 (전체 리셋)
  viewer.clearThemingColors();
  if (viewer.impl.visibilityManager.setAllOn) {
    viewer.impl.visibilityManager.setAllOn(); // 전체 보이기
  }

  // 2. 최하위(leaf) 노드 순회
  taskTree.visit(function (node) {
    if (!node.hasChildren()) {
      const type = node.data.selectedOption || "";
      const start = node.data.start;
      const end = node.data.end;
      const objs = node.data.linkedObjects || [];

      const inputDate = dateStr;

      objs.forEach((o) => {
        const dbId = o.dbId;
        if (type === "시공") {
          if (inputDate < start) {
            viewer.impl.visibilityManager.hide(dbId);
          } else if (start <= inputDate && inputDate < end) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, new THREE.Vector4(0, 1, 0, 0.5));
          } else if (end && inputDate >= end) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, null);
          }
        } else if (type === "철거") {
          if (inputDate < start) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, null);
          } else if (start <= inputDate && inputDate < end) {
            viewer.impl.visibilityManager.show(dbId);
            viewer.setThemingColor(dbId, new THREE.Vector4(1, 0, 0, 0.5));
          } else if (end && inputDate >= end) {
            viewer.impl.visibilityManager.hide(dbId);
          }
        } else if (type === "가설") {
          // 향후 로직 구현
        }
      });
    }
  });

  viewer.impl.invalidate(true);
}
```

---

## `wwwroot/js/sidebar/task-wbs/task-buttons.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/task-buttons.js
import { normalizeTaskCategory, enforceCategoryInheritance } from "./core/categories.js";
import { aggregateTaskFields } from "./logic/task-aggregate.js";
import { scheduleWbsRepaint } from "./ui/wbs-highlight.js";
import { showCurrentTaskModal } from "./ui/current-task-modal.js";
import { notifyCoverageDirtyAndRepaint } from "./ui/wbs-fixed-paint.js";
import { ensureElementIdIndexForDbIds, getElementIdFor, formatObjectLabel } from "./core/element-id.js";

// 상태 반영을 위해 추가:
function notifyWbsStatusRefresh(){
  try { window.__WBS_MARK_TASKS_CHANGED?.(); } catch {}
}

// 페인트 배치(간단 락)
async function runWbsHighlightBatch(cb){
  const prev = window.__WBS_PAINT_LOCK === true;
  window.__WBS_PAINT_LOCK = true;
  try { await cb(); }
  finally {
    window.__WBS_PAINT_LOCK = prev;
    requestAnimationFrame(()=>{ try{ window.updateWBSHighlight?.(); } catch{} });
  }
}

// 외부 저장 스냅샷
export function setSavedTaskData(data) {
  window.savedTaskData = JSON.parse(JSON.stringify(data ?? []));
}

export function initTaskListButtons() {
  window.__ALLOW_WBS_UPDATE = window.__ALLOW_WBS_UPDATE ?? false;

  function withWbsGate(fn){
    const prev = window.__ALLOW_WBS_UPDATE;
    window.__ALLOW_WBS_UPDATE = true;
    try { return fn(); }
    finally { window.__ALLOW_WBS_UPDATE = prev; } // ← 버그 수정 (예: __WBS_PAINT_LOCK 되돌리던 라인 교체)
  }

  function flush(recalc = false) {
    if (recalc && window.requestTaskRecalcAndFlush) {
      window.requestTaskRecalcAndFlush();
    } else if (window.requestTaskTreeFlush) {
      window.requestTaskTreeFlush();
    } else {
      const tree = $.ui.fancytree.getTree("#treegrid");
      tree.render(true, true);
    }
    if (!window.__WBS_PAINT_LOCK) scheduleWbsRepaint();
  }

  // [추가]
  $("#btn-add").off("click").on("click", function () {
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();
    const parentNode = sel || null;
    const baseCat = (parentNode?.data?.selectedOption) || "시공";
    const no = generateNo(parentNode);
    const nodeData = {
      no,
      selectOptions: ["시공", "가설", "철거"],
      selectedOption: baseCat,
      title: "새 작업",
      start: "",
      end: "",
      linkedObjects: []
    };
    if (parentNode) {
      if (Array.isArray(parentNode.data?.linkedObjects) && parentNode.data.linkedObjects.length) {
        parentNode.data.linkedObjects = [];
        parentNode.render && parentNode.render();
      }
      parentNode.addChildren(nodeData);
      parentNode.setExpanded(true);
      parentNode.data.start = "";
      parentNode.data.end = "";
      parentNode.render && parentNode.render();
    } else {
      tree.getRootNode().addChildren(nodeData);
    }
    enforceCategoryInheritance(tree);
    flush(true);
  });

  // [삭제]
  $("#btn-delete").off("click").on("click", function(){
    const tree = $.ui.fancytree.getTree("#treegrid");
    const sel = tree.getActiveNode();
    if (sel && !sel.isRoot()) {
      sel.remove();
      flush(true);
    }
  });

  // [객체선택] → 3D viewer select
  $("#btn-select").off("click").on("click", function() {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selected = taskTree.getActiveNode();
    if (!selected) return alert("Task를 선택하세요!");

    const objects = aggregateTaskFields(selected).objects;
    if (!objects || objects.length === 0) return alert("이 Task(및 하위 Task)에 연결된 객체가 없습니다.");

    const byUrn = {};
    objects.forEach(obj => {
      if (!byUrn[obj.urn]) byUrn[obj.urn] = [];
      byUrn[obj.urn].push(obj.dbId);
    });
    Object.entries(byUrn).forEach(([urn, dbIds]) => {
      if (urn === window.CURRENT_MODEL_URN && window.viewer) {
        window.viewer.select(dbIds);
      }
    });
  });

  // [업데이트] 저장
  $("#btn-update").off("click").on("click", async function () {
    const safeUrnVal = window.CURRENT_MODEL_SAFE_URN;
    const url = `/api/tasks?urn=${safeUrnVal}`;
    const currentTaskData = getCurrentTaskDataFromTree();
    const current = JSON.stringify(currentTaskData ?? []);
    const saved   = JSON.stringify(window.savedTaskData ?? []);

    if (!window.savedTaskData || (Array.isArray(window.savedTaskData) && window.savedTaskData.length === 0 && currentTaskData.length > 0)) {
      // 최초 저장 허용
    } else if (current === saved) {
      alert("수정된 데이터가 없습니다.");
      return;
    }

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentTaskData),
      });
      if (resp.ok) {
        alert("Task 데이터가 저장되었습니다!");
        window.savedTaskData = JSON.parse(JSON.stringify(currentTaskData));
      } else {
        alert("Task 데이터 저장 실패!");
      }
    } catch (err) {
      alert("저장 중 오류 발생: " + err.message);
    }
  });

  // [데이터연결]
  $("#btn-link").off("click").on("click", async function () {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedTaskNode = taskTree.getActiveNode();
    if (!selectedTaskNode) return alert("Task를 선택하세요!");
    if (selectedTaskNode.hasChildren && selectedTaskNode.hasChildren()) {
      alert("하위 작업이 있는 Task에는 연결할 수 없습니다.\n 최하위 Task를 선택해 주세요.");
      return;
    }

    const urn = window.CURRENT_MODEL_URN;
    const catSel = normalizeTaskCategory(selectedTaskNode.data?.selectedOption); // "C"|"T"|"D"
    const catLabel = catSel === "C" ? "시공" : (catSel === "T" ? "가설" : "철거");

    // 체크된 노드 → 그룹이면 하위 전체 dbId, 리프는 해당 dbId
    const provider = window.__WBS_PROVIDER;
    const checked = window.wbsTree.checked();
    const dbSet = new Set();

    function pathOfNode(n){
      if (Array.isArray(n.__path)) return n.__path.slice();
      const out=[]; let cur=n; while (cur && cur.text && !cur.isRoot?.()){ out.unshift(cur.text); cur=cur.parent; }
      return out;
    }

    for (const node of checked) {
      if (node.hasChildren && node.hasChildren()) {
        let ids = provider?.getDbIdsForPath(pathOfNode(node), { includeDescendants:true, allowUnbuilt:true });
        if (ids == null) {
          try { await provider?.childrenByPath(pathOfNode(node)); } catch {}
          ids = provider?.getDbIdsForPath(pathOfNode(node), { includeDescendants:true, allowUnbuilt:true });
        }
        if (Array.isArray(ids)) ids.forEach(id => dbSet.add(Number(id)));
      } else {
        dbSet.add(Number(node.dbId));
      }
    }

    const dbIds = Array.from(dbSet).filter(Number.isFinite);
    if (dbIds.length === 0) return alert("WBS에서 객체를 선택하세요!");

    // ElementId 대량 프리페치
    try { await ensureElementIdIndexForDbIds(dbIds); } catch {}

    // 저장 데이터에 ElementId/표시문구 같이 심기
    const checkedObjects = dbIds.map(d => ({
      urn,
      dbId: d,
      elementId: getElementIdFor(urn, d),
      text: formatObjectLabel({ urn, dbId: d })
    }));

    await runWbsHighlightBatch(async () => {
      // 점유 현황
      const occupancy = new Map();
      taskTree.getRootNode().visit(n => {
        const cat = normalizeTaskCategory(n.data?.selectedOption);
        if (!cat) return;
        (n.data?.linkedObjects || []).forEach(o => {
          const key = `${o.urn || urn}:${o.dbId}`;
          const slot = occupancy.get(key) || { C: null, T: null, D: null };
          if (cat === "C" && !slot.C) slot.C = n;
          if (cat === "T" && !slot.T) slot.T = n;
          if (cat === "D" && !slot.D) slot.D = n;
          occupancy.set(key, slot);
        });
      });

      const allowed = [];
      const conflictsForC = [];
      const conflictsC = [];
      const conflictsSame = [];

      checkedObjects.forEach(obj => {
        const key = `${obj.urn}:${obj.dbId}`;
        const slot = occupancy.get(key) || { C: null, T: null, D: null };

        if (catSel === "C") {
          if (!slot.C && !slot.T && !slot.D) allowed.push(obj);
          else conflictsForC.push({ obj, slot });
        } else if (catSel === "T") {
          if (slot.C) conflictsC.push({ obj, slot });
          else if (slot.T) conflictsSame.push({ obj, slot });
          else allowed.push(obj);
        } else if (catSel === "D") {
          if (slot.C) conflictsC.push({ obj, slot });
          else if (slot.D) conflictsSame.push({ obj, slot });
          else allowed.push(obj);
        }
      });

      function unlinkFromNode(node, obj) {
        if (!node) return;
        node.data.linkedObjects = (node.data.linkedObjects || []).filter(
          o => !(String(o.urn || urn) === String(obj.urn) && Number(o.dbId) === Number(obj.dbId))
        );
        node.render && node.render();
      }

      if (catSel === "C" && conflictsForC.length) {
        const res = prompt([
          `선택한 객체 중 ${conflictsForC.length}개는 이미 다른 Task에 연결되어 있습니다.`,
          `규칙상 '시공'은 단독 연결만 가능합니다.`,
          ``,
          `1. 기존 연결 해제 후 이 Task(시공)로 새로 연결`,
          `2. 이미 연결된 객체만 제외하고 진행`,
          `3. 취소`,
          ``,
          `번호를 입력하세요 (1/2/3)`
        ].join("\n"), "2");
        if (res === "3" || res == null) return;
        if (res === "1") {
          conflictsForC.forEach(({ obj, slot }) => {
            unlinkFromNode(slot.C, obj);
            unlinkFromNode(slot.T, obj);
            unlinkFromNode(slot.D, obj);
            allowed.push(obj);
          });
        }
      }

      if ((catSel === "T" || catSel === "D") && conflictsC.length) {
        const res = prompt([
          `다음 객체는 '시공'에 이미 연결되어 있어 ${catLabel}과(와) 병행할 수 없습니다.`,
          ``,
          `1. 시공 연결 해제 후 이 Task(${catLabel})로 새로 연결`,
          `2. 이미 연결된 객체만 제외하고 진행`,
          `3. 취소`,
          ``,
          `번호를 입력하세요 (1/2/3)`
        ].join("\n"), "2");
        if (res === "3" || res == null) return;
        if (res === "1") {
          conflictsC.forEach(({ obj, slot }) => { unlinkFromNode(slot.C, obj); allowed.push(obj); });
        }
      }

      if ((catSel === "T" || catSel === "D") && conflictsSame.length) {
        const label = catLabel;
        const res = prompt([
          `다음 객체는 이미 '${label}'에 연결되어 있습니다.`,
          ``,
          `1. 기존 '${label}' 연결을 이 Task로 교체 (해당 카테고리만 교체)`,
          `2. 이미 연결된 객체만 제외하고 진행`,
          `3. 취소`,
          ``,
          `번호를 입력하세요 (1/2/3)`
        ].join("\n"), "2");
        if (res === "3" || res == null) return;
        if (res === "1") {
          conflictsSame.forEach(({ obj, slot }) => {
            if (catSel === "T") unlinkFromNode(slot.T, obj);
            if (catSel === "D") unlinkFromNode(slot.D, obj);
            allowed.push(obj);
          });
        }
      }

      if (allowed.length > 0) {
        selectedTaskNode.data.linkedObjects = _.uniqBy(
          (selectedTaskNode.data.linkedObjects || []).concat(allowed),
          o => o.urn + ":" + o.dbId
        );
      }

      withWbsGate(() => {
        flush(true);
        try { window.gantt?.renderFromTrees(window.taskTree, window.wbsTree); } catch(_) {}
      });

      // 고정 색칠 갱신
      try { await notifyCoverageDirtyAndRepaint(); } catch {}
    });
    notifyWbsStatusRefresh();
  });

  // [연결 해제]
  $("#btn-unlink").off("click").on("click", async function () {
    const taskTree = $.ui.fancytree.getTree("#treegrid");
    const selectedNode = taskTree.getActiveNode();
    if (!selectedNode) return alert("연결을 해제할 Task를 선택하세요!");

    await runWbsHighlightBatch(async () => {
      (function unlinkAll(node){
        node.data.linkedObjects = [];
        if (node.hasChildren()) node.children.forEach(unlinkAll);
      })(selectedNode);

      withWbsGate(() => {
        flush(true);
        try { window.gantt?.renderFromTrees(window.taskTree, window.wbsTree); } catch(_) {}
      });

      try { await notifyCoverageDirtyAndRepaint(); } catch {}
    });
    notifyWbsStatusRefresh();
  });

  // 공정현황 버튼
  $("#btn-date").off("click").on("click", function(){
    showCurrentTaskModal();
  });

  // TEST 버튼
  $("#btn-test").off("click").on("click", async function() {
    const viewer = window.viewer;
    if (!viewer) return alert('뷰어가 초기화되지 않았습니다.');
    alert('테스트 훅 자리입니다.');
  });
}

function generateNo(parentNode) {
  if (!parentNode || parentNode.isRoot()) {
    const roots = $.ui.fancytree.getTree("#treegrid").getRootNode().children || [];
    return String(roots.length + 1);
  } else {
    const siblings = parentNode.children || [];
    const baseNo = parentNode.data.no || parentNode.title;
    return baseNo + "." + (siblings.length + 1);
  }
}

function getCurrentTaskDataFromTree() {
  const tree = $.ui.fancytree.getTree("#treegrid");
  const urn = window.CURRENT_MODEL_URN;
  function nodeToData(node) {
    const obj = {
      no: node.data.no,
      selectOptions: node.data.selectOptions ?? ["시공", "가설", "철거"],
      selectedOption: node.data.selectedOption ?? "시공",
      title: node.data.title ?? node.title,
      start: node.data.start,
      end: node.data.end,
      linkedObjects: (node.data.linkedObjects || []).map(o => ({
        urn: o.urn ?? urn,
        dbId: o.dbId,
        elementId: o.elementId ?? null, // ElementId 일관 저장
        text: formatObjectLabel(o),      // ← 항상 [ElementId] 우선
      })),
    };
    if (node.hasChildren()) obj.children = node.children.map(nodeToData);
    return obj;
  }
  return tree.getRootNode().children.map(nodeToData);
}
```

---

## `wwwroot/js/sidebar/task-wbs/task-tree.js`

```javascript
// Task(Fancytree) 초기화 + 편집 + 날짜/집계/간트 플러시
import { calcLeadtime, calcEnd, calcStart, recalcAllLeadtime } from "./core/date-helpers.js";
import { propagateCategoryDown, enforceCategoryInheritance, normalizeTaskCategory } from "./core/categories.js";
import { recomputeAggDown, recomputeAggUp, recomputeAggObjects } from "./core/aggregate.js";
import { aggregateTaskFields } from "./logic/task-aggregate.js";
import { attachDatePickerToInput } from "./ui/mask-and-picker.js";
import { calendarSvg } from "./ui/calendar-svg.js";
import { requestWbsHighlight, requestWbsHighlightGateOn } from "./wbs/highlight.js";

export function initTaskPanel(taskData) {
  $("#treegrid").fancytree({
    extensions: ["table", "gridnav"],
    checkbox: false,
    selectMode: 2,
    table: { indentation: 20, nodeColumnIdx: 2 },
    source: taskData,

    init: function (event, data) {
      // 리드타임 전체 재계산 + 객체 집계
      try { recalcAllLeadtime(data.tree); } catch(e){}
      try { recomputeAggObjects(data.tree); } catch(e){}
      data.tree.render(true, true);
      enforceCategoryInheritance(data.tree);
      setTimeout(() => scheduleFlush(), 0);
    },

    renderColumns: function (event, data) {
      const node = data.node;
      const $tdList = $(node.tr).find(">td");
      const isTop = (typeof node.getLevel === "function")
        ? node.getLevel() === 1
        : (node.parent?.isRoot?.() === true);

      $tdList.eq(0).text(node.data.no || "");
      $tdList.eq(1).html(
        `<select class="treegrid-dropdown" ${isTop ? "" : "disabled"} style="width:100%;box-sizing:border-box;height:28px;">
          ${node.data.selectOptions.map(opt => `<option${opt === node.data.selectedOption ? " selected" : ""}>${opt}</option>`).join("")}
        </select>`
      );
      $tdList.eq(2).find(".fancytree-title").text(node.data.title || node.title || "");
      $tdList.eq(3).text(node.data.start || "").addClass("text-center");
      $tdList.eq(4).text(node.data.leadtime || "").addClass("text-center");
      $tdList.eq(5).text(node.data.end || "").addClass("text-center");

      const objCount = Number(node.data._aggObjCount || 0);
      $tdList.eq(6)
        .text(objCount || "")
        .addClass("text-center objcount")
        .removeClass("highlight objcount--c objcount--t objcount--d")
        .each(function(){
          if (!objCount) return;
          const cat = normalizeTaskCategory(node.data?.selectedOption);
          if (cat === "C") $(this).addClass("objcount--c");
          else if (cat === "T") $(this).addClass("objcount--t");
          else if (cat === "D") $(this).addClass("objcount--d");
        });
    }
  });

  const tree = $.ui.fancytree.getTree("#treegrid");
  window.taskTree = tree;

  // Fancytree 초기화 직후 어딘가(중복 감싸기 방지)
  const $tbl = $("#treegrid");
  if ($tbl.length && !$tbl.parent().hasClass("table-scroll")) {
    $tbl.wrap('<div class="table-scroll"></div>');
  }


  // 더블클릭 편집
  $("#treegrid")
    .off("dblclick", "td")
    .on("dblclick", "td", function(){
      const colIdx = this.cellIndex;
      const node = $.ui.fancytree.getNode(this);
      if (!node) return;

      if (colIdx === 0 || colIdx === 2) {
        const field = (colIdx === 0 ? "no" : "title");
        const label = (colIdx === 0 ? "No." : "작업명");
        const oldValue = (colIdx === 0 ? node.data.no : node.data.title) || "";
        const newValue = prompt(`${label} 값을 입력하세요:`, oldValue);
        if (newValue !== null && newValue !== oldValue) {
          commit(node, { [field]: newValue });
          if (field === "title") node.setTitle(newValue);
        }
        return;
      }

      if (!node.hasChildren() && (colIdx === 3 || colIdx === 4 || colIdx === 5)) {
        const $td = $(this);
        if ($td.find("input").length) return;
        if (colIdx === 4) openLeadtimeEditor($td, node);
        else openDateEditor($td, node, (colIdx === 3 ? "start" : "end"));
        return;
      }

      if (colIdx === 6) {
        const objs = aggregateTaskFields(node).objects;
        if (objs.length === 0) return alert("연결된 객체 없음");
        const CUR_URN = window.CURRENT_MODEL_URN || "";
        const pathMap = window.__WBS_PATHMAP || new Map();
        const lines = objs.map(o => {
          const urn = o.urn || CUR_URN;
          const key = `${urn}:${o.dbId}`;
          const fallback = (o.text || "").trim();
          const path = pathMap.get(key) || fallback || "(이름없음)";
          return `${path} - [${o.dbId}]`;
        });
        alert(lines.join("\n"));
      }
    });

  // 구분 변경 → 전면 하이라이트 1회 (게이트 ON 후 트리거)
  $("#treegrid").on("change", ".treegrid-dropdown", function(){
    const $tr = $(this).closest("tr");
    const node = $.ui.fancytree.getNode($tr);
    const isTop = (typeof node.getLevel === "function") ? node.getLevel() === 1 : (node.parent?.isRoot?.() === true);
    if (!isTop) { this.value = node.data.selectedOption; return; }
    const newCat = this.value;

    propagateCategoryDown(node, newCat);
    node.tree.render(true, true);
    window.requestTaskTreeFlush?.();

    requestWbsHighlightGateOn();
    requestWbsHighlight();
  });

  // 글로벌 플러시 유틸 등록
  window.requestTaskTreeFlush = () => scheduleFlush();
  window.requestTaskRecalcAndFlush = function () {
    scheduleFlush({ full: true });
  };
}

/* ───────── 내부 유틸 ───────── */
let __pending = false;
function scheduleFlush({ full = false } = {}) {
  const tree = window.taskTree || $.ui.fancytree.getTree("#treegrid");
  if (!tree) return;
  if (__pending) return;

  __pending = true;
  requestAnimationFrame(() => {
    try {
      if (full) {
        // 링크 개수 등 집계 필요 시
        recomputeAggObjects(tree);
      }
      // ✅ 전체 테이블 렌더(헤더/부모/형제까지 모두 갱신)
      tree.render(true, true);
    } finally {
      __pending = false;
    }
  });

  // 간트는 가볍게 스로틀
  const redraw = () => { try { window.gantt?.renderFromTrees(window.taskTree, window.wbsTree); } catch(_){} };
  (typeof _ !== "undefined" && _.throttle) ? _.throttle(redraw, 250)() : redraw();
}

function commit(node, patch, changedField, adjustTarget) {
  if (!node?.data) return;
  if (typeof patch === "function") patch(node.data);
  else if (patch && typeof patch === "object") Object.assign(node.data, patch);

  // 날짜/리드타임 계산
  recalcLeadtimeFields(node, changedField, adjustTarget);
  recalcLeadtimeDescendants(node);
  recalcLeadtimeAncestors(node);

  // 객체 집계는 날짜 변경이 아닐 때만
  const isDate = (changedField === "start" || changedField === "end" || changedField === "leadtime");
  if (!isDate) { recomputeAggDown(node); recomputeAggUp(node); }

  // ✅ 즉시 반영: 해당 노드 + 조상 노드까지 바로 렌더
  let cur = node;
  while (cur) {
    try { cur.render && cur.render(); } catch(_) {}
    const p = cur.parent;
    if (!p || (p.isRoot && p.isRoot())) break;
    cur = p;
  }

  // ✅ 배치 플러시: 전체 테이블 렌더 + 간트 갱신(스로틀)
  scheduleFlush();
}


/* ───────── 리드타임 보조(이 파일 내 구현) ───────── */
function recalcLeadtimeFields(node, changedField, popupCallback) {
  node.data = node.data || {};
  let { start, end, leadtime } = node.data;
  const has = v => v !== undefined && v !== null && v !== "";
  const cnt = (has(start)?1:0) + (has(end)?1:0) + (has(leadtime)?1:0);

  if (cnt === 2) {
    if (has(start) && has(leadtime) && !has(end)) node.data.end = calcEnd(start, leadtime);
    else if (has(start) && has(end) && !has(leadtime)) node.data.leadtime = calcLeadtime(start, end);
    else if (has(end) && has(leadtime) && !has(start)) node.data.start = calcStart(end, leadtime);
    return;
  }
  if (cnt === 3 && changedField) {
    if (changedField === "leadtime" && typeof popupCallback === "function") {
      popupCallback((updateField) => {
        start = node.data.start; end = node.data.end; leadtime = node.data.leadtime;
        if (updateField === "start") node.data.start = calcStart(end, leadtime);
        else if (updateField === "end") node.data.end = calcEnd(start, leadtime);
      });
    } else if (changedField === "start" || changedField === "end") {
      node.data.leadtime = calcLeadtime(node.data.start, node.data.end);
    }
  }
}
function recalcLeadtimeDescendants(node) {
  if (!(node.hasChildren && node.hasChildren())) recalcLeadtimeFields(node);
  else (node.children || []).forEach(recalcLeadtimeDescendants);
}
function recalcLeadtimeAncestors(node) {
  if (!node.parent) return;
  const p = node.parent, children = p.children || [];
  if (!children.length) return;
  let minStart = "", maxEnd = "";
  for (const c of children) {
    const cs = c.data && c.data.start || "";
    const ce = c.data && c.data.end   || "";
    if (cs) minStart = (!minStart || cs < minStart) ? cs : minStart;
    if (ce) maxEnd   = (!maxEnd   || ce > maxEnd)   ? ce : maxEnd;
  }
  p.data = p.data || {};
  p.data.start = minStart || "";
  p.data.end   = maxEnd   || "";
  p.data.leadtime = (p.data.start && p.data.end) ? calcLeadtime(p.data.start, p.data.end) : "";
  recalcLeadtimeAncestors(p);
}

/* ───────── 인라인 에디터 ───────── */
function openLeadtimeEditor($td, node) {
  const field = "leadtime";
  const oldValue = node.data.leadtime || "";
  $td.empty();

  const $input = $('<input type="number" min="1" step="1" style="width:60px;text-align:center;">').val(oldValue);
  $td.append($input);
  $input.focus();

  function restoreCell() { setTimeout(() => $td.text(node.data[field] ?? ""), 10); $(document).off("mousedown.cellEdit"); }
  $input.on("keydown", (ev) => { if (ev.key === "Enter") $input.blur(); if (ev.key === "Escape") restoreCell(); });
  $input.on("blur", () => {
    const v = $input.val();
    if (/^\d+$/.test(v) && Number(v) > 0) {
      const val = parseInt(v, 10);
      commit(node, { leadtime: val }, "leadtime", (choose) => {
        const okMeansEnd = confirm("소요시간을 변경했습니다.\n\n확인: 시작일 고정 → 종료일 재계산\n취소: 종료일 고정 → 시작일 재계산");
        choose(okMeansEnd ? "end" : "start");
      });
    }
    restoreCell();
  });
  setTimeout(() => {
    $(document).on("mousedown.cellEdit", (e) => {
      if (!$.contains($td[0], e.target) && e.target !== $input[0]) restoreCell();
    });
  }, 0);
}

function openDateEditor($td, node, field) {
  const oldValue = node.data[field] || "";
  $td.empty();

  const $input   = $('<input type="text" class="datepicker-input" style="width:100px;text-align:center;" placeholder="yyyy-mm-dd">').val(oldValue);
  const $iconBtn = $('<button type="button" class="datepicker-btn" style="margin-left:4px; padding:0; background:none; border:none; cursor:pointer;"></button>').html(calendarSvg);
  $td.append($input, $iconBtn);

  // ⛔ 여기서 IMask 직접 붙이지 마세요(아래 attachDatePickerToInput에서 처리)
  function restoreCell() {
    setTimeout(() => $td.text(node.data[field] || ""), 10);
    $(document).off("mousedown.cellEdit");
  }
  function commitDate(dateStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      commit(node, { [field]: dateStr }, field); // → 리드타임/조상 집계 계산 + node.render() + flush
    }
    restoreCell();
  }

  // ✅ 안전하게 달력+마스크+스마트커서 부착
  attachDatePickerToInput($input[0], {
    initial: oldValue,
    onPicked: commitDate,
    onCancel: restoreCell
  });

  // 아이콘으로 달력 열기
  $iconBtn.on("click", (ev) => { ev.stopPropagation(); $input[0].__fp?.open(); });

  // 엔터/ESC 처리 + 바깥 클릭 시 복구
  $input.on("keydown", (ev) => { if (ev.key === "Enter") $input.blur(); if (ev.key === "Escape") restoreCell(); });
  setTimeout(() => {
    $(document).on("mousedown.cellEdit", (e) => {
      if (!$.contains($td[0], e.target) && e.target !== $input[0] && e.target !== $iconBtn[0]) restoreCell();
    });
  }, 0);

  // 입력만으로도 커밋 허용
  $input.on("blur", () => commitDate($input.val()));
}


function renderRowAndAncestors(node) {
  // 현재 행
  if (node?.render) node.render();

  // 부모/조상 행들
  let p = node?.parent;
  while (p && (!p.isRoot || !p.isRoot())) {
    if (p.render) p.render();
    p = p.parent;
  }
}
```

---

## `wwwroot/js/sidebar/task-wbs/ui/calendar-svg.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/ui/calendar-svg.js
export const calendarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" class="calendar-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <line x1="16" x2="16" y1="2" y2="6" />
  <line x1="8" x2="8" y1="2" y2="6" />
  <line x1="3" x2="21" y1="10" y2="10" />
</svg>`;
```

---

## `wwwroot/js/sidebar/task-wbs/ui/current-task-modal.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/ui/current-task-modal.js
import { calendarSvg } from "./calendar-svg.js";
// import { checkTaskStatusByDate } from "../logic/task-check-basedondate.js"; // 사용 안 함(정책 오버라이드)

export function showCurrentTaskModal() {
  if (document.querySelector(".current-task-modal")) return;

  const todayStr = isoToday();

  // ─ UI
  const modal = document.createElement("div");
  modal.className = "current-task-modal";
  modal.tabIndex = 0;
  modal.innerHTML = `
    <div class="current-task-modal-header">
      <span class="modal-title">공정현황</span>
      <button type="button" class="modal-close" title="닫기" aria-label="닫기">×</button>
    </div>
    <div class="current-task-modal-body">
      <div class="current-task-date-row">
        <input type="text" class="current-task-date-input" maxlength="10" placeholder="yyyy-mm-dd" value="${todayStr}" autocomplete="off" />
        <button type="button" class="datepicker-btn" tabindex="-1" title="달력 열기">${calendarSvg}</button>
        <button type="button" class="btn-today" title="오늘로 이동">오늘</button>
      </div>

      <div class="current-task-slider-row">
        <input type="range" class="current-task-slider" min="-15" max="15" value="0" />
      </div>

      <div class="sim-toolbar" aria-label="시뮬레이션 컨트롤">
        <button type="button" class="sim-btn sim-begin" title="처음으로" aria-label="처음으로">${svgIcon('begin')}</button>
        <button type="button" class="sim-btn sim-play"  title="재생"     aria-label="재생">${svgIcon('play')}</button>
        <button type="button" class="sim-btn sim-stop"  title="정지"     aria-label="정지">${svgIcon('stop')}</button>
        <button type="button" class="sim-btn sim-end"   title="끝으로"   aria-label="끝으로">${svgIcon('end')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  applyInlineStyles(modal);   // 폭 300 고정, 여백 최소화
  centerModal(modal);         // 픽셀 좌표 확정(드래그 점프 방지)

  // 핸들
  const $input    = modal.querySelector(".current-task-date-input");
  const $btnCal   = modal.querySelector(".datepicker-btn");
  const $btnToday = modal.querySelector(".btn-today");
  const $close    = modal.querySelector(".modal-close");
  const $header   = modal.querySelector(".current-task-modal-header");
  const $slider   = modal.querySelector(".current-task-slider");

  // IMask
  let mask = null;
  if (window.IMask) mask = window.IMask($input, { mask: "0000-00-00", lazy: false, autofix: true });
  enforceSmartSelection($input);

  // flatpickr
  const fp = window.flatpickr($input, {
    dateFormat: "Y-m-d",
    defaultDate: todayStr,
    allowInput: true,
    clickOpens: false,
    onChange: (_, dateStr) => { if (isISO(dateStr)) setDateInput(dateStr, { apply: true, from: "flatpickr" }); }
  });

  // 직접 입력
  $input.addEventListener("change", () => {
    const val = $input.value.trim();
    if (isISO(val)) setDateInput(val, { apply: true, from: "input-change" });
  });

  // 달력 버튼
  $btnCal.addEventListener("click", (e) => { e.stopPropagation(); fp.open(); });

  // 오늘 버튼
  $btnToday.addEventListener("click", () => setDateInput(isoToday(), { apply: true, from: "today" }));

  // 슬라이더 범위
  const tree = window.taskTree;
  updateSliderRangeFromTaskData(tree?.getRootNode()?.children || [], $slider);

  // 슬라이더: 드래그 중 빠른 반응(40ms), 드롭 시 즉시
  const debouncedApply = debounce((d) => applyByPolicy(d, "slider-input", modal), 40);
  $slider.addEventListener("input", () => {
    const d = isoOffsetFromToday(parseInt($slider.value, 10));
    setDateInput(d, { apply: false, from: "slider-input" });
    debouncedApply(d);
  });
  $slider.addEventListener("change", () => {
    const d = isoOffsetFromToday(parseInt($slider.value, 10));
    setDateInput(d, { apply: true, from: "slider-change" });
  });

  // 헤더 드래그(포인터 캡처) — 버튼 클릭은 드래그 무시
  enableModalDrag(modal, $header);

  // 닫기(모델 원복) — 캡처/드래그보다 먼저 가로채지 않도록 별도 리스너
  $close.addEventListener("click", (e) => { e.stopPropagation(); resetViewerAndClose(modal); });

  modal.addEventListener("keydown", (ev) => { if (ev.key === "Escape") resetViewerAndClose(modal); });

  // 최초 1회 적용(오늘)
  setDateInput(todayStr, { apply: true, from: "init" });

  function setDateInput(dateStr, { apply = true, from = "" } = {}) {
    $input.value = dateStr;
    if (mask) { try { mask.updateValue(); } catch(_) {} }
    syncSliderFromDate($slider, dateStr);
    if (apply) applyByPolicy(dateStr, from, modal);
  }
}

/* ───────────── 정책 적용: C/T/D 규칙을 즉시 뷰어에 반영 ─────────────
   C(시공):  시작 전 숨김 / 기간 중 녹색 / 이후 원래색(보이기)
   T(가설):  시작 전 숨김 / 기간 중 파랑 / 이후 원래색(보이기)
   D(철거):  시작 전 원래색(보이기) / 기간 중 빨강 / 이후 숨김
*/
function applyByPolicy(dateStr, source, ctxEl){
  const v = window.viewer; const tree = window.taskTree;
  if (!v || !tree || !isISO(dateStr)) return;

  const model = (v.getVisibleModels && v.getVisibleModels()[0]) || v.model;
  if (!model) return;

  const urnCur = String(window.CURRENT_MODEL_URN || "");
  const showSet  = new Set();
  const hideSet  = new Set();
  const themeC   = new Set(); // green
  const themeT   = new Set(); // blue
  const themeD   = new Set(); // red

  const inRange = (d, s, e) => (isISO(s) && isISO(e) && d >= s && d <= e);
  const beforeS = (d, s)     => (isISO(s) && d < s);
  const afterE  = (d, e)     => (isISO(e) && d > e);

  // 트리 전수 조사
  tree.getRootNode()?.visit((n) => {
    const d = n.data || {};
    const cat = normCat(d.selectedOption);
    if (!cat) return;

    const objs = Array.isArray(d.linkedObjects) ? d.linkedObjects : [];
    for (const o of objs) {
      const urn = String(o.urn || urnCur);
      if (!urnCur || urn !== urnCur) continue;
      const id = Number(o.dbId);
      if (!Number.isFinite(id)) continue;

      // 규칙 적용
      if (cat === "C") {
        if (beforeS(dateStr, d.start)) { hideSet.add(id); }
        else if (inRange(dateStr, d.start, d.end)) { showSet.add(id); themeC.add(id); }
        else if (afterE(dateStr, d.end)) { showSet.add(id); }
        else { showSet.add(id); } // 경계값/결측치는 보이기
      } else if (cat === "T") {
        if (beforeS(dateStr, d.start)) { hideSet.add(id); }
        else if (inRange(dateStr, d.start, d.end)) { showSet.add(id); themeT.add(id); }
        else if (afterE(dateStr, d.end)) { showSet.add(id); }
        else { showSet.add(id); }
      } else if (cat === "D") {
        if (beforeS(dateStr, d.start)) { showSet.add(id); }
        else if (inRange(dateStr, d.start, d.end)) { showSet.add(id); themeD.add(id); }
        else if (afterE(dateStr, d.end)) { hideSet.add(id); }
        else { showSet.add(id); }
      }
    }
  });

  // 충돌 해소: 보이기가 우선
  for (const id of showSet) hideSet.delete(id);

  // 적용(빠르게): 테마 초기화 → show/hide → 테마 칠하기
  try {
    // 최초 1회만 전체 가시화(이후는 증감만)
    if (!ctxEl.__simVisInit) {
      v.impl?.visibilityManager?.setAllOn?.();
      ctxEl.__simVisInit = true;
    }

    // 테마 전체 초기화 후 다시 칠함
    try { v.clearThemingColors?.(model); } catch(_) {}
    try { v.clearThemingColors?.(); } catch(_) {} // 일부 버전 호환

    // show/hide를 묶음 호출(성능)
    const showArr = [...showSet];
    const hideArr = [...hideSet];
    if (showArr.length) v.show(showArr, model);
    if (hideArr.length) v.hide(hideArr, model);

    // 테마 색상
    const V4 = (r,g,b,a=1) => (window.THREE ? new window.THREE.Vector4(r,g,b,a) : { r,g,b,a });
    const cGreen = V4(0.16, 0.57, 0.20, 1); // 시공
    const cBlue  = V4(0.12, 0.45, 0.90, 1); // 가설
    const cRed   = V4(0.95, 0.27, 0.23, 1); // 철거

    // chunked theming(너무 많으면 몇 프레임 분할)
    const paintChunk = (ids, color) => {
      const CHUNK = 4000;
      for (let i = 0; i < ids.length; i += CHUNK) {
        const slice = ids.slice(i, i + CHUNK);
        for (let j = 0; j < slice.length; j++) {
          v.setThemingColor(slice[j], color, model);
        }
      }
    };
    if (themeC.size) paintChunk([...themeC], cGreen);
    if (themeT.size) paintChunk([...themeT], cBlue);
    if (themeD.size) paintChunk([...themeD], cRed);

    // 렌더 스냅
    v.impl?.sceneUpdated?.(true);
    v.impl?.invalidate?.(true, true, true);
  } catch (err) {
    console.warn("[CurrentTask] policy apply error", err);
  }
}

/* ───────────── 스타일 ───────────── */
function applyInlineStyles(modal){
  Object.assign(modal.style, {
    zIndex: 10000,
    width: "300px",
    maxWidth: "90vw",
    background: "#fff",
    border: "1px solid #d9d9d9",
    borderRadius: "10px",
    boxShadow: "0 10px 24px rgba(0,0,0,.12)",
    fontFamily: "'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    position: "fixed",
  });

  const header = modal.querySelector(".current-task-modal-header");
  Object.assign(header.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "6px",
    padding: "6px 8px",
    borderBottom: "1px solid #eee",
    cursor: "grab",
    userSelect: "none",
    touchAction: "none"
  });

  const close = modal.querySelector(".modal-close");
  Object.assign(close.style, {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    lineHeight: "1",
  });

  const body = modal.querySelector(".current-task-modal-body");
  Object.assign(body.style, {
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  });

  const row = modal.querySelector(".current-task-date-row");
  Object.assign(row.style, {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
    margin: "0"
  });

  const input = modal.querySelector(".current-task-date-input");
  Object.assign(input.style, {
    width: "118px",
    textAlign: "center",
    padding: "4px 6px",
    border: "1px solid #bbb",
    borderRadius: "6px",
    outline: "none",
  });

  const btnCal = modal.querySelector(".datepicker-btn");
  Object.assign(btnCal.style, {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "pointer",
    padding: "0"
  });

  const calSvg = btnCal.querySelector("svg");
  if (calSvg) { calSvg.setAttribute("width","16"); calSvg.setAttribute("height","16"); }

  const btnToday = modal.querySelector(".btn-today");
  Object.assign(btnToday.style, {
    height: "28px",
    padding: "0 10px",
    borderRadius: "6px",
    border: "1px solid #1976d2",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer"
  });

  const sliderRow = modal.querySelector(".current-task-slider-row");
  Object.assign(sliderRow.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    margin: "0"
  });

  const slider = modal.querySelector(".current-task-slider");
  Object.assign(slider.style, {
    width: "100%",
    maxWidth: "260px",
    display: "block",
    margin: "2px 0"
  });

  const sim = modal.querySelector(".sim-toolbar");
  Object.assign(sim.style, {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    paddingTop: "4px",
    borderTop: "1px dashed #eee",
    marginTop: "0"
  });
  sim.querySelectorAll(".sim-btn").forEach(btn => {
    Object.assign(btn.style, {
      width: "36px",
      height: "30px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      background: "#f8f9fb",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0"
    });
  });
}

function centerModal(modal){
  modal.style.visibility = "hidden";
  requestAnimationFrame(() => {
    const { innerWidth: w, innerHeight: h } = window;
    const r = modal.getBoundingClientRect();
    modal.style.left = Math.max(8, (w / 2 - r.width / 2)) + "px";
    modal.style.top  = Math.max(8, (h / 3 - r.height / 2)) + "px";
    modal.style.visibility = "visible";
  });
}

/* ───── 유틸 ───── */
function svgIcon(name){
  const stroke = "currentColor";
  if (name === "play")  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7-11-7z" fill="${stroke}"/></svg>`;
  if (name === "stop")  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" fill="${stroke}"/></svg>`;
  if (name === "begin") return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 6l-7 6 7 6V6z" fill="${stroke}"/><rect x="5" y="6" width="2" height="12" fill="${stroke}"/></svg>`;
  if (name === "end")   return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 6l7 6-7 6V6z" fill="${stroke}"/><rect x="17" y="6" width="2" height="12" fill="${stroke}"/></svg>`;
  return "";
}

function isISO(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")); }
function isoToday(){ return new Date().toISOString().slice(0,10); }
function isoOffsetFromToday(offsetDays){
  const base = new Date();
  base.setDate(base.getDate() + (Number(offsetDays) || 0));
  return base.toISOString().slice(0,10);
}

function updateSliderRangeFromTaskData(nodes, sliderEl){
  if (!Array.isArray(nodes) || !sliderEl) return;
  const all = [];
  (function walk(arr){
    for (const n of arr) {
      const d = n.data || n;
      if (isISO(d.start)) all.push(d.start);
      if (isISO(d.end))   all.push(d.end);
      if (n.children) walk(n.children);
    }
  })(nodes);
  if (!all.length) { sliderEl.min = -15; sliderEl.max = 15; sliderEl.value = 0; return; }

  const minISO = all.reduce((a,b)=> a < b ? a : b);
  const maxISO = all.reduce((a,b)=> a > b ? a : b);
  const t = isoToday();

  const diffMin = Math.ceil((Date.parse(minISO) - Date.parse(t)) / 86400000);
  const diffMax = Math.ceil((Date.parse(maxISO) - Date.parse(t)) / 86400000);

  sliderEl.min = String(diffMin);
  sliderEl.max = String(diffMax);
  sliderEl.value = "0";
}

function syncSliderFromDate(sliderEl, dateStr){
  if (!sliderEl || !isISO(dateStr)) return;
  const t = isoToday();
  const diff = Math.round((Date.parse(dateStr) - Date.parse(t)) / 86400000);
  sliderEl.value = String(Math.min(Math.max(diff, Number(sliderEl.min)), Number(sliderEl.max)));
}

function normCat(v){
  const s = String(v || "").trim();
  if (s === "C" || s.startsWith("시공")) return "C";
  if (s === "T" || s.startsWith("가설")) return "T";
  if (s === "D" || s.startsWith("철거")) return "D";
  return "";
}

function enforceSmartSelection(input){
  const digitIdx = [0,1,2,3,5,6,8,9];
  const setSel = (pos) => { if (digitIdx.includes(pos)) input.setSelectionRange(pos, pos + 1); };
  const getDigitPos = (pos) => digitIdx.includes(pos) ? pos : (digitIdx.find(d => d > pos) ?? 9);
  const nextDigitIdx = (pos) => { const i = digitIdx.indexOf(pos); return (i !== -1 && i < digitIdx.length - 1) ? digitIdx[i+1] : pos; };
  const prevDigitIdx = (pos) => { const i = digitIdx.indexOf(pos); return (i > 0) ? digitIdx[i-1] : pos; };

  ["focus", "click"].forEach(evt => input.addEventListener(evt, () => setTimeout(() => setSel(getDigitPos(input.selectionStart)), 0)));
  input.addEventListener("keydown", (e) => {
    const pos = input.selectionStart;
    if (e.key === "ArrowLeft"  && pos !== 0)  { e.preventDefault(); setSel(prevDigitIdx(pos)); }
    if (e.key === "ArrowRight" && pos !== 9)  { e.preventDefault(); setSel(nextDigitIdx(pos)); }
  });
  input.addEventListener("input", () => {
    const pos = input.selectionStart;
    if (digitIdx.includes(pos - 1)) setSel(nextDigitIdx(pos - 1));
    else setSel(getDigitPos(pos));
  });
}

/* 포인터 캡처 기반 드래그(점프 방지: Δ이동 + dragstart 차단) */
function enableModalDrag(modal, handle){
  let dragging = false, pid = null;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;
  let raf = 0, nextLeft = 0, nextTop = 0;

  // 헤더 내 인터랙티브 요소는 드래그 무시 (닫기/버튼 등 클릭 보장)
  const isInteractive = (el) =>
    el.closest?.('.modal-close, .datepicker-btn, .btn-today, .sim-toolbar, .sim-btn, input, button, svg, path, rect, circle');

  // 기본 drag 이벤트(HTML5 DnD) 차단 → 점프 예방
  const killDrag = (e) => e.preventDefault();
  handle.addEventListener('dragstart', killDrag);
  modal.addEventListener('dragstart', killDrag);

  const onPointerDown = (e) => {
    if (isInteractive(e.target)) return;     // 버튼/아이콘 클릭은 드래그 시작 안 함
    if (e.button !== 0) return;              // 좌클릭만
    e.preventDefault();
    e.stopPropagation();

    pid = e.pointerId;
    handle.setPointerCapture(pid);

    // 현재 style 좌표를 기준점으로 고정
    const cs = window.getComputedStyle(modal);
    const l = parseFloat(cs.left);
    const t = parseFloat(cs.top);
    // style 값이 없으면 getBoundingClientRect로 폴백
    if (Number.isFinite(l) && Number.isFinite(t)) {
      startLeft = l; startTop = t;
    } else {
      const r = modal.getBoundingClientRect();
      startLeft = r.left; startTop = r.top;
      // 다음 계산을 위해 style에도 확정값을 심어둠
      modal.style.left = `${startLeft}px`;
      modal.style.top  = `${startTop}px`;
    }

    startX = e.clientX;
    startY = e.clientY;
    dragging = true;
    handle.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    // Δ 이동만 반영 → 점프 없음
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    nextLeft = Math.max(0, Math.round(startLeft + dx));
    nextTop  = Math.max(0, Math.round(startTop  + dy));

    // rAF로 한 프레임에 한 번만 반영 (부드럽게)
    if (!raf) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        modal.style.left = `${nextLeft}px`;
        modal.style.top  = `${nextTop}px`;
      });
    }
  };

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    if (pid !== null) { try { handle.releasePointerCapture(pid); } catch(_){} }
    pid = null;
    handle.style.cursor = "grab";
  };

  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", stopDrag);
  handle.addEventListener("pointercancel", stopDrag);
  // (선택) 포인터가 창 밖으로 나가도 마무리
  window.addEventListener("pointerup", stopDrag, { passive: true });
}


function resetViewerAndClose(m){
  try {
    const v = window.viewer;
    v?.clearThemingColors?.();
    const vm = v?.impl?.visibilityManager;
    vm?.setAllOn?.();
    v?.impl?.invalidate?.(true, true, true);
  } catch(_){}
  m.remove();
}

function debounce(fn, ms){
  let t=0;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
```

---

## `wwwroot/js/sidebar/task-wbs/ui/fancy-tree-init.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/ui/fancy-tree-init.js
import { toKey } from "../core/path-key.js";
import {
  initMatrix, bulkEnsureForVisible,
  computePathState, getPathState, getCounts,
  markTasksChanged
} from "../core/matrix-index.js";
import { formatObjectLabel } from "../core/element-id.js";

const HIDDEN_KEYS = new Set();
const pendingCompute = new Map();

function buildPathFromNode(node){
  const out=[]; let cur=node;
  while (cur && !cur.isRoot()) { out.unshift(cur.title); cur = cur.parent; }
  return out;
}
function stateToClass(st){ if(st==="C")return"wbs-c"; if(st==="TD")return"wbs-td"; return ""; }

const Eye = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5 0 9 4 10 7-1 3-5 7-10 7S3 15 2 12c1-3 5-7 10-7Zm0 3a4 4 0 100 8 4 4 0 000-8Z"/></svg>`;
const EyeOff = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.58 10.58A4 4 0 0012 16a4 4 0 002.83-6.83M12 5c5 0 9 4 10 7-.43 1.28-1.33 2.7-2.6 3.98M6.62 6.62C4.62 8.05 3.28 9.94 2 12c1 3 5 7 10 7 1.28 0 2.5-.22 3.62-.62"/></svg>`;

async function getAllDbIdsForPath(provider, path){
  let ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
  if (ids != null) return ids;
  try { await provider.childrenByPath(path); } catch {}
  ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
  if (ids != null) return ids;
  return provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:false }) || [];
}
function calcEyeStateForNode(node){
  const key = node.data?.pathKey; if(!key) return "none";
  let anyHidden=false, allHidden=true;
  node.visit(n=>{
    const k=n.data?.pathKey; if(!k) return;
    const hid = HIDDEN_KEYS.has(k);
    anyHidden = anyHidden || hid;
    allHidden = allHidden && hid;
  });
  if(!anyHidden) return "none";
  return allHidden ? "hidden" : "mixed";
}

export async function initWbsWithFancytree(provider, { primaryOrder } = {}) {
  await initMatrix({ primaryOrder, provider });

  const host = document.getElementById("wbs-group-content");
  host.innerHTML = `
    <table id="wbs-tree" class="table table-sm wbs-table">
      <colgroup>
        <col class="col-title" />
        <col class="col-count" />
        <col class="col-status" />
      </colgroup>
      <thead>
        <tr>
          <th>항목</th>
          <th class="text-center">개수</th>
          <th>현황</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  // 🔥 잔재 청소(중복 init/UL 컨테이너 제거)
  try { $.ui.fancytree.getTree("#wbs-tree")?.destroy(); } catch {}
  $("#wbs-tree").children("ul.ui-fancytree").remove();
  $("#wbs-group-content .ui-fancytree").remove();

  $("#wbs-tree").fancytree({
    extensions: ["table", "gridnav"],     // ✅ checkbox 확장 넣지 말 것
    checkbox: true,                       // 표시는 이 옵션으로
    selectMode: 3,

    // 1) 빈 소스로 시작
    source: [],

    // 2) init 이벤트에서 루트 주입 (가장 호환성 좋음)
    init: function(event, data){
      provider.roots().then((nodes)=>{
        const rows = nodes.map(ch => ({
          title: ch.text,
          lazy: ch.children === true,
          data: {
            __path: ch.__path || [ch.text],
            pathKey: toKey(ch.__path || [ch.text]),
            leafCount: ch.leafCount || 0
          }
        }));
        data.tree.reload(rows);
      }).catch(()=> data.tree.reload([]));
    },

    // 3) lazyLoad: 반드시 data.result에 배열/Promise 대입
    lazyLoad: function(event, data){
      const node = data.node;
      const path = node.data?.__path || buildPathFromNode(node);
      data.result = provider.childrenByPath(path).then(children => {
        return children.map(ch => {
          const __path = ch.__path || [...path, ch.text];
          return {
            title: ch.text,
            lazy: ch.children === true,
            data: {
              __path,
              pathKey: toKey(__path),
              leafCount: ch.leafCount || 0,
              dbId: ch.dbId,
              elementId: ch.elementId
            }
          };
        });
      });
    },

    table: { indentation: 14, nodeColumnIdx: 0 },

    renderColumns: function(event, data){
      const node = data.node;
      const $tds = $(node.tr).find(">td");

      // 0) 항목 칼럼: 눈알 아이콘으로 문서아이콘 교체
      const $titleCell = $tds.eq(0);
      const $nodeSpan  = $titleCell.find("> .fancytree-node");
      const $iconSpan  = $nodeSpan.find("> .fancytree-icon");
      const eyeState   = calcEyeStateForNode(node);
      $iconSpan.replaceWith(
        $(`<span class="eye-toggle ${eyeState}" title="가시성 토글">${eyeState==="hidden"?EyeOff:Eye}</span>`)
      );

      // 1) 개수: 가운데 정렬
      const $cntCell = $tds.eq(1).removeClass("text-end").addClass("text-center");
      if (node.data?.dbId != null) {
        $cntCell.text("");
      } else {
        const cnt = node.data?.leafCount ?? "";
        $cntCell.text(cnt === undefined ? "…" : String(cnt));
      }

      // 2) 현황
      const $statusCell = $tds.eq(2);
      if (node.data?.dbId != null) {
        $statusCell.text(formatObjectLabel({ elementId: node.data.elementId, dbId: node.data.dbId }));
      } else {
        const st  = getPathState(node.data?.pathKey);
        const cls = stateToClass(st);
        $(node.tr).removeClass("wbs-c wbs-td");
        if (cls) $(node.tr).addClass(cls);

        const counts = getCounts(node.data?.pathKey);
        $statusCell.html(`
          <div class="wbs-status">
            <div class="nums">
              <span class="b c" title="시공">${counts?.c ?? 0}</span>
              <span class="b t" title="가설">${counts?.t ?? 0}</span>
              <span class="b d" title="철거">${counts?.d ?? 0}</span>
              <span class="b td" title="혼합">${counts?.td ?? 0}</span>
              <span class="b total" title="총계">${counts?.total ?? 0}</span>
            </div>
          </div>
        `);

        if (st === undefined) {
          const key = node.data.pathKey;
          if (!pendingCompute.has(key)) {
            const p = Promise.resolve(computePathState(key))
              .catch(()=>{})
              .finally(()=>{ pendingCompute.delete(key); try{ data.tree.render(true, true); }catch{} });
            pendingCompute.set(key, p);
          }
        }
      }
    },

    expand: function(event, data){
      const keys = [];
      data.node.visit(n => { if (n.data?.pathKey && n.lazy !== false) keys.push(n.data.pathKey); });
      bulkEnsureForVisible(keys).then(()=>{
        keys.forEach(k => computePathState(k));
        data.tree.render(true, true);
      });
    },

    // 더블클릭: 선택/해제 토글
    dblclick: function(event, data){
      const node = data.node; const viewer = window.viewer; if (!viewer) return;
      (async ()=>{
        let ids=[];
        if (node.data?.dbId != null) ids=[node.data.dbId];
        else {
          const path = node.data?.__path || buildPathFromNode(node);
          ids = await getAllDbIdsForPath(provider, path);
        }
        try{
          const cur = viewer.getSelection()||[];
          const same = cur.length===ids.length && cur.every((v,i)=>v===ids[i]);
          if (same) viewer.clearSelection(); else if (ids?.length) viewer.select(ids);
        }catch{}
      })();
      event.preventDefault(); return false;
    },

    // 단일 클릭: 제목은 noop (확장/체크는 기본동작)
    click: function(event, data){
      if (data.targetType === "title"){ event.preventDefault(); return false; }
      return;
    }
  });

  // 눈알 위임 핸들러(항목 칼럼)
  $("#wbs-tree").off("click.wbsEye").on("click.wbsEye", ".eye-toggle", async (e)=>{
    e.stopPropagation();
    const node = $.ui.fancytree.getNode(e.currentTarget);
    const viewer = window.viewer; if(!node || !viewer) return;
    const path = node.data?.__path || buildPathFromNode(node);
    const key  = node.data?.pathKey; if(!key) return;

    const ids = await getAllDbIdsForPath(provider, path);
    if (!ids?.length) return;

    const isHidden = HIDDEN_KEYS.has(key);
    try{
      if(isHidden){ viewer.show(ids); HIDDEN_KEYS.delete(key); }
      else{ viewer.hide(ids); HIDDEN_KEYS.add(key); }
    }finally{
      node.visit(n => n.render(true));
      node.getParentList(false, true).forEach(p => p.render(true));
      try{ $.ui.fancytree.getTree("#wbs-tree").render(true, true); }catch{}
    }
  });

  // Task 갱신 훅
  window.__WBS_MARK_TASKS_CHANGED = function(){
    markTasksChanged();
    const tree = $.ui.fancytree.getTree("#wbs-tree");
    const keys=[];
    tree.getRootNode().visit(n => { if (n.data?.pathKey) keys.push(n.data.pathKey); });
    bulkEnsureForVisible(keys).then(()=>{
      keys.forEach(k => computePathState(k));
      tree.render(true, true);
    });
  };
}
```

---

## `wwwroot/js/sidebar/task-wbs/ui/gantt-view.js`

```javascript
// /wwwroot/js/sidebar/gantt-view.js
import { normalizeTaskCategory, stripCountSuffix } from "../core/categories.js";

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

    // 1) 행 수 기반으로 캔버스 높이 산정(스크롤 생기도록)
    const trackH = (options.gantt?.trackHeight || 28);
    const header  = 56;           // 상단 헤더 여백(경험값)
    const rowGap  = 4;            // 트랙 간 여백 세팅
    const content = rows.length * (trackH + rowGap) + header;
    const minH = Math.max(el.clientHeight || 320, 120);
    options.height = Math.max(content, minH);

    google.visualization.events.addOneTimeListener(chart, 'ready', ()=>{
      hideBottomAxis(el);
    });

    chart.draw(view, options);

    updateRangeSummary(rows);
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
  if (containerEl.__bottomAxisObs) {
    containerEl.__bottomAxisObs.disconnect();
    containerEl.__bottomAxisObs = null;
  }

  const apply = () => {
    try {
      const svg = containerEl.querySelector('svg');
      if (!svg) return;

      const svgH =
        (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.height) ||
        svg.getBBox().height ||
        svg.getBoundingClientRect().height || 0;

      const month = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/;
      const year  = /^\d{4}$/;

      svg.querySelectorAll('text').forEach(t=>{
        const bb = t.getBBox();
        const txt = (t.textContent || '').trim();
        if (bb.y > svgH - 40 || month.test(txt) || year.test(txt)) {
          t.style.display = 'none';
        }
      });
    } catch(_) {}
  };

  apply();
  const obs = new MutationObserver(apply);
  obs.observe(containerEl, { childList: true, subtree: true });
  containerEl.__bottomAxisObs = obs;
}

function measureContentHeight(containerEl){
  try {
    const svg = containerEl.querySelector('svg');
    if (!svg) return null;

    let gridBottomY = 0;
    svg.querySelectorAll('rect').forEach(r=>{
      const y = parseFloat(r.getAttribute('y') || '0');
      const h = parseFloat(r.getAttribute('height') || '0');
      gridBottomY = Math.max(gridBottomY, y + h);
    });

    const headerMargin = 32;
    return Math.max(120, Math.round(gridBottomY + headerMargin));
  } catch(_) { return null; }
}
```

---

## `wwwroot/js/sidebar/task-wbs/ui/mask-and-picker.js`

```javascript
// mask-and-picker.js
export const calendarSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="calendar-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
`;

// 예전 UX처럼 한 자리 단위로 커서 이동(←/→) 보조
export function attachSmartDigitNav(inputEl) {
  const digitIdx = [0,1,2,3,5,6,8,9];
  const firstIdx = 0, lastIdx = 9;
  const isDigitPos = (p) => digitIdx.includes(p);
  const getDigitPos = (p) => isDigitPos(p) ? p : (digitIdx.find(d => d > p) ?? lastIdx);
  const nextPos = (p) => {
    const i = digitIdx.indexOf(p);
    return (i !== -1 && i < digitIdx.length - 1) ? digitIdx[i+1] : p;
  };
  const prevPos = (p) => {
    const i = digitIdx.indexOf(p);
    return (i > 0) ? digitIdx[i-1] : p;
  };
  const setSingleSel = (p) => { if (isDigitPos(p)) inputEl.setSelectionRange(p, p + 1); };

  ["focus","click"].forEach(evt =>
    inputEl.addEventListener(evt, () => { setTimeout(() => setSingleSel(getDigitPos(inputEl.selectionStart)), 0); })
  );

  inputEl.addEventListener("keydown", (e) => {
    const pos = inputEl.selectionStart;
    if (e.key === "ArrowLeft" && pos !== firstIdx) { e.preventDefault(); setSingleSel(prevPos(pos)); }
    if (e.key === "ArrowRight" && pos !== lastIdx) { e.preventDefault(); setSingleSel(nextPos(pos)); }
  });

  inputEl.addEventListener("input", () => {
    const pos = inputEl.selectionStart;
    if (isDigitPos(pos - 1)) setSingleSel(nextPos(pos - 1));
    else setSingleSel(getDigitPos(pos));
  });
}

export function attachDatePickerToInput(inputEl, opts = {}) {
  const isYmd = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || "").trim());
  const initial = isYmd(opts.initial) ? opts.initial
                : (isYmd(inputEl.value) ? inputEl.value : "");

  // ⚠️ flatpickr가 "____-__-__"를 파싱하지 않도록 값은 ''로 정리하고 먼저 붙입니다
  inputEl.value = initial || "";

  const fp = window.flatpickr(inputEl, {
    dateFormat: "Y-m-d",
    allowInput: true,
    clickOpens: true,
    defaultDate: initial || undefined,
    onClose: (_, dateStr) => {
      const picked = isYmd(dateStr) ? dateStr : (isYmd(inputEl.value) ? inputEl.value : "");
      if (picked && typeof opts?.onPicked === "function") {
        opts.onPicked(picked);
      } else if (typeof opts?.onCancel === "function") {
        opts.onCancel();
      }
    }
  });

  // ✅ 예전처럼 보이게: IMask는 lazy:false (플레이스홀더 표시)
  if (window.IMask) {
    window.IMask(inputEl, { mask: "0000-00-00", lazy: false, autofix: true });
  }
  // ✅ 스마트 커서 이동(한 자리씩)
  attachSmartDigitNav(inputEl);

  inputEl.__fp = fp;
  return fp;
}
```

---

## `wwwroot/js/sidebar/task-wbs/ui/wbs-fixed-paint.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/ui/wbs-fixed-paint.js
// 고정 색칠(coverage) 계산/캐시 (UI 확장과 무관하게 동작)

import { ensureElementIdIndexForDbIds } from "../core/element-id.js";

// ──────────────────────────────────────────────────────────────
// 내부 상태
// ──────────────────────────────────────────────────────────────
const PATH_STATE = new Map();     // key(path) -> "C" | "TD" | ""  (undefined = 미계산/미확정)
const PENDING = new Map();        // key -> Promise 진행 중

const SEP = "¦"; // 경로 구분자(일반 텍스트에 잘 안 쓰이는 문자)
const hostId = "wbs-group-list";

// 캐시: dbId -> elementId
window.__ELID_INDEX = window.__ELID_INDEX || new Map();

// ──────────────────────────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────────────────────────
function normUrn(urn){
  const s = String(urn || "");
  const i = s.indexOf("?");
  return i >= 0 ? s.slice(0, i) : s;
}
function keyOfPath(pathArr){
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");
  return `${CUR}//${(pathArr||[]).join(SEP)}`;
}
function parseUrnFromUid(uid) {
  const s = String(uid || "");
  const i = s.indexOf("::");
  return i > -1 ? s.slice(0, i) : null;
}
function applyPaintOnLi(li, state){
  // undefined: 유지, "": 지움, "C"/"TD"/"T"/"D": 세팅
  if (typeof state === "undefined") return;
  if (state) li.setAttribute("data-wbs-state", state);
  else li.removeAttribute("data-wbs-state");

  li.classList.remove("wbs-c","wbs-td","wbs-blue");
  if (state === "C")       li.classList.add("wbs-c");
  else if (state === "TD") li.classList.add("wbs-td");
  else if (state === "T" || state === "D") li.classList.add("wbs-blue");
}
function pathOfNode(node){
  if (Array.isArray(node.__path) && node.__path.length) return node.__path.slice();
  const out=[]; let cur=node;
  while (cur && cur.text && !cur.isRoot?.()){ out.unshift(cur.text); cur = cur.parent; }
  return out;
}

// ──────────────────────────────────────────────────────────────
// Task → 카테고리 맵 (즉석 생성 or 전역 캐시)
// ──────────────────────────────────────────────────────────────
function getCatMap(){
  if (window.__WBS_CATMAP instanceof Map) return window.__WBS_CATMAP;

  const map = new Map();
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");
  const taskTree = window.taskTree;
  if (!taskTree?.getRootNode) return map;

  const toCat = (v) =>
    v==="C"||v==="시공" ? "C" :
    v==="T"||v==="가설" ? "T" :
    v==="D"||v==="철거" ? "D" : "";

  taskTree.getRootNode().visit(n=>{
    const cat = toCat(n.data?.selectedOption);
    if (!cat) return;
    (n.data?.linkedObjects||[]).forEach(o=>{
      const urn = normUrn(o.urn || CUR);
      const db  = Number(o.dbId);
      if (!db) return;
      const up = (key) => {
        const cur = map.get(key) || { C:false, T:false, D:false };
        if (cat==="C") cur.C = true; else if (cat==="T") cur.T = true; else if (cat==="D") cur.D = true;
        map.set(key, cur);
      };
      up(`${urn}::${db}`);
      if (urn && CUR && urn !== CUR) up(`${CUR}::${db}`);
      up(String(db));
    });
  });
  window.__WBS_CATMAP = map;
  return map;
}

/** 카테고리 맵 조회: "C" | "T" | "D" | "TD" | "" */
function getStateFromCatMap(catMap, { urn, dbId, curUrn }){
  if (dbId == null) return "";
  const nUrn = normUrn(urn);
  const nCur = normUrn(curUrn);
  const keys = [];
  if (nUrn) keys.push(`${nUrn}::${dbId}`);
  if (urn && urn !== nUrn) keys.push(`${urn}::${dbId}`);
  if (nCur) keys.push(`${nCur}::${dbId}`);
  if (curUrn && curUrn !== nCur) keys.push(`${curUrn}::${dbId}`);
  keys.push(String(dbId));
  for (const k of keys){
    const f = catMap.get(k);
    if (!f) continue;
    const C = !!f.C, T = !!f.T, D = !!f.D;
    if (C && !T && !D) return "C";
    if (!C && T && !D) return "T";
    if (!C && !T && D) return "D";
    if (!C && T && D)  return "TD";
    if (C) return "C";
  }
  return "";
}

// ids -> "C" | "TD" | "" (혼합/미완성)
function reduceIdsState(ids){
  if (!ids?.length) return "";
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");
  const catMap = getCatMap();

  let bucket = null; // "C" | "B"(=T/D 묶음) | ""
  for (const id of ids){
    const st = getStateFromCatMap(catMap, { urn: CUR, dbId: id, curUrn: CUR });
    const b  = (st==="C" ? "C" : (st==="TD"||st==="T"||st==="D") ? "B" : "");
    if (!b){ bucket = ""; break; }
    if (bucket == null) bucket = b;
    else if (bucket !== b){ bucket = ""; break; }
  }
  if (bucket === "C") return "C";
  if (bucket === "B") return "TD";  // UI에선 파란색
  return "";
}

// ──────────────────────────────────────────────────────────────
async function computePathState(pathArr){
  const provider = window.__WBS_PROVIDER;
  if (!provider) return undefined;

  const key = keyOfPath(pathArr);
  if (PATH_STATE.has(key)) return PATH_STATE.get(key);
  if (PENDING.has(key)) return undefined;

  const p = (async ()=>{
    try{
      const total = provider.countAt(pathArr);
      if (!total){ PATH_STATE.set(key, ""); return ""; }

      const ids = await provider.getDbIdsForPath(pathArr, { includeDescendants:true, allowUnbuilt:true });
      if (ids == null){ // 아직 인덱스 미구축 → 지우지 말고 보류
        return undefined;
      }
      const st = reduceIdsState(ids);
      PATH_STATE.set(key, st);
      return st;
    } catch {
      return undefined;
    } finally {
      PENDING.delete(key);
    }
  })();

  PENDING.set(key, p);
  return p;
}

// ──────────────────────────────────────────────────────────────
function repaintVisibleDom(){
  const host = document.getElementById(hostId);
  const tree = window.wbsTree;
  if (!host || !tree) return;
  const CUR = normUrn(window.CURRENT_MODEL_URN || "");

  // 1) 리프
  host.querySelectorAll("li[data-uid].leaf").forEach(li=>{
    try{
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      const dbId = (node && typeof node.dbId === "number") ? node.dbId : null;
      if (dbId == null) return;
      const urn = parseUrnFromUid(uid) || node?.urn || CUR;
      const st  = getStateFromCatMap(getCatMap(), { urn, dbId, curUrn: CUR });
      applyPaintOnLi(li, st);
    }catch{}
  });

  // 2) 그룹
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li=>{
    try{
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      if (!node) return;
      const path = pathOfNode(node);
      const key  = keyOfPath(path);
      const st   = PATH_STATE.get(key); // undefined면 유지
      applyPaintOnLi(li, st);
    }catch{}
  });

  // 보험: data-wbs-state ↔ class 동기화
  host.querySelectorAll('li[data-uid]').forEach(li=>{
    const st = li.getAttribute('data-wbs-state') || "";
    let need = "";
    if (st === 'C') need = 'wbs-c';
    else if (st === 'TD') need = 'wbs-td';
    else if (st === 'T' || st === 'D') need = 'wbs-blue';
    if (!need){ li.classList.remove('wbs-c','wbs-td','wbs-blue'); return; }
    if (!li.classList.contains(need)){
      li.classList.remove('wbs-c','wbs-td','wbs-blue');
      li.classList.add(need);
    }
  });
}

// ──────────────────────────────────────────────────────────────
// 외부 노출 API
// ──────────────────────────────────────────────────────────────

/** 현재 화면에 보이는 모든 그룹 경로의 커버리지 상태를 준비(비동기) */
export async function ensureCoverageReady(){
  const host = document.getElementById(hostId);
  const tree = window.wbsTree;
  if (!host || !tree) return;

  const tasks = [];
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li=>{
    try{
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      if (!node) return;
      const path = pathOfNode(node);
      tasks.push(computePathState(path));
    }catch{}
  });
  await Promise.allSettled(tasks);
}

/** 경로의 상태를 조회(미계산이면 undefined) */
export function getPathState(pathArr){
  const key = keyOfPath(pathArr||[]);
  return PATH_STATE.get(key);
}

// [교체] refreshFixedPaint: 캐시를 지우지 말고, 보이는 경로만 재계산 후 덮어쓰기
export async function refreshFixedPaint(opts = {}) {
  const { repaint = true } = opts;
  const host = document.getElementById(hostId);
  const tree = window.wbsTree;
  if (!host || !tree) return;

  const paths = [];
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li => {
    try {
      const uid = li.getAttribute("data-uid") || "";
      const node = tree.node ? tree.node(uid) : null;
      if (!node) return;
      paths.push(pathOfNode(node));
    } catch {}
  });

  await Promise.allSettled(paths.map(p => computePathState(p)));
  if (repaint) repaintVisibleDom();
}


// [추가] 가벼운 디바운스 리페인트(노드 대량 추가 시 1회로 합침)
let __debounceTimer = 0;
export function requestDebouncedRepaint(delay=32){
  if (__debounceTimer) return;
  __debounceTimer = setTimeout(async ()=>{
    __debounceTimer = 0;
    try{
      await ensureCoverageReady();
      repaintVisibleDom();
    }catch{}
  }, delay);
}

/** 연결/해제 등 데이터 변경 후 호출 → 커버리지 갱신 + 즉시 칠 */
export async function notifyCoverageDirtyAndRepaint(){
  // 카테고리 맵 갱신
  window.__WBS_CATMAP = null;
  await refreshFixedPaint({ repaint:true });
}

/** 초기 1회: 화면 렌더 직후 커버리지 준비 + 일괄 페인트 */
export async function activateFixedPaint(){
  try{
    await ensureCoverageReady();
    repaintVisibleDom();
  } catch {}
}

// 모델 로딩 시 1회: Task에 연결된 객체의 elementId를 검증/보정하고 캐시에 미리 로딩
export async function verifyElementIdsOnce() {
  if (window.__ELID_VERIFY_DONE) return;   // 1회만 수행
  window.__ELID_VERIFY_DONE = true;

  const taskTree = window.taskTree;
  const urn = window.CURRENT_MODEL_URN;
  if (!taskTree?.getRootNode || !urn) return;

  // 1) 현재 모델(URN) 대상으로 Task에 연결된 dbId 수집
  const set = new Set();
  taskTree.getRootNode().visit(n => {
    (n.data?.linkedObjects || []).forEach(o => {
      const oUrn = String(o?.urn ?? urn);
      if (oUrn !== String(urn)) return;      // 다른 모델은 스킵
      const d = Number(o?.dbId);
      if (Number.isFinite(d)) set.add(d);
    });
  });

  const dbIds = Array.from(set);
  if (!dbIds.length) return;

  // 2) elementId 인덱스 프리페치(비동기는 여기서만 await)
  try { await ensureElementIdIndexForDbIds(dbIds); } catch {}

  // 3) Task 데이터에 저장된 elementId가 없거나 틀리면 "캐시"로만 보정
  const idx = window.__ELID_INDEX || new Map();

  taskTree.getRootNode().visit(n => {
    const arr = n.data?.linkedObjects || [];
    let changed = false;
    for (const o of arr) {
      const oUrn = String(o?.urn ?? urn);
      if (oUrn !== String(urn)) continue;
      const d = Number(o?.dbId);
      if (!Number.isFinite(d)) continue;

      const elid = idx.get?.(d);
      if (elid && o.elementId !== elid) {
        o.elementId = elid;
        changed = true;
      }
    }
    if (changed && n.render) n.render();
  });
}

/** 캐시에서 elementId 읽기(없으면 null) */
export function getElementIdFromCache(dbId) {
  const v = window.__ELID_INDEX.get(Number(dbId));
  return (v == null ? null : v);
}

// ===== 새로 추가: 방금 확장된 노드 기준으로 서브트리를 '즉시' 칠한다 =====
export function paintSubtreeNow(node) {
  try {
    const host = document.getElementById("wbs-group-list");
    const tree = window.wbsTree;
    if (!host || !tree || !node) return;

    const CUR = normUrn(window.CURRENT_MODEL_URN || "");
    const provider = window.__WBS_PROVIDER;
    if (!provider) return;

    const stack = [node];
    while (stack.length) {
      const n = stack.pop();
      const uid = n?._id ?? n?.id;
      const li  = uid ? host.querySelector(`li[data-uid="${uid}"]`) : null;

      // 1) 리프: dbId 기준 즉시 칠
      if (!n.hasChildren?.()) {
        const dbId = (typeof n.dbId === "number") ? n.dbId : null;
        if (dbId != null && li) {
          const st = getStateFromCatMap(getCatMap(), { urn: CUR, dbId, curUrn: CUR });
          applyPaintOnLi(li, st);
        }
        continue;
      }

      // 2) 그룹: 경로 기반 즉시 계산 → 캐시에 반영 → 칠
      const path = pathOfNode(n);
      const key  = keyOfPath(path);

      // 부모 groups 폴백으로 동기 ids 확보(미빌드 여도 OK)
      const ids = provider.getDbIdsForPath(path, { includeDescendants:true, allowUnbuilt:true });
      if (ids && ids.length) {
        const st = reduceIdsState(ids);
        PATH_STATE.set(key, st);
        if (li) applyPaintOnLi(li, st);
      } else {
        // 아직 모르면 이전 상태 유지(덮어쓰지 않음)
        // 이후 ensureCoverageReady()/repaintVisibleDom()가 메꿔줌
      }

      // 자식 계속 진행
      (n.children || []).forEach(ch => stack.push(ch));
    }

    // 보험: data-wbs-state ↔ class 동기화
    repaintVisibleDom();
  } catch {}
}

```

---

## `wwwroot/js/sidebar/task-wbs/ui/wbs-highlight.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/ui/wbs-highlight.js
import { normalizeTaskCategory } from "../core/categories.js";
import { ensureCoverageReady, getPathState } from "./wbs-fixed-paint.js";

// ★ Fixed Paint 모드에서는 이 파일의 모든 동작을 우회(no-op)한다.
function fixedModeOn(){ return window.__WBS_FIXED_MODE === true; }

/* ──────────────────────────────────────────────────────────
   페인트 스케줄/잠금
────────────────────────────────────────────────────────── */
let __repaintRAF = 0;
window.__WBS_PAINT_LOCK = window.__WBS_PAINT_LOCK ?? false;
const paintLocked = () => window.__WBS_PAINT_LOCK === true;

export function scheduleWbsRepaint() {
  if (fixedModeOn() || paintLocked() || __repaintRAF) return;
  __repaintRAF = requestAnimationFrame(() => {
    __repaintRAF = 0;
    try { updateWBSHighlight(); } catch {}
  });
}

export function repaintWbsSync() {
  if (fixedModeOn()) return;
  const tree = window.wbsTree;
  if (!tree?.nodes) return;
  const catMap = buildCatMapFromTasks();
  window.__WBS_CATMAP = catMap;
  for (const r of tree.nodes()) applyHighlightForSubtreeUI(r, catMap);
  domSweepRepaint(catMap);
}

/* ──────────────────────────────────────────────────────────
   유틸
────────────────────────────────────────────────────────── */
function liOf(node) {
  const host = document.getElementById("wbs-group-list");
  if (!host || !node) return null;
  const uid = node._id ?? node.id;
  if (!uid) return null;
  const any = host.querySelector(`[data-uid="${String(uid)}"]`);
  return any?.closest("li[data-uid]") || null;
}
function parseUrnFromUid(uid) {
  const s = String(uid || "");
  const i = s.indexOf("::");
  return i > -1 ? s.slice(0, i) : null;
}
function normalizeUrn(urn) {
  const s = String(urn || "");
  const i = s.indexOf("?");
  return i >= 0 ? s.slice(0, i) : s;
}
const bucketOf = (s) => s === "C" ? "C" : s === "TD" ? "TD" : (s === "T" || s === "D") ? "B" : "";

/** catMap에서 상태 조회: URN 정규화 + CURRENT + dbOnly 폴백 */
function getStateFromCatMap(catMap, { urn, dbId, curUrn }) {
  if (dbId == null) return "";
  const nUrn = normalizeUrn(urn);
  const nCur = normalizeUrn(curUrn);
  const keys = [];
  if (nUrn) keys.push(`${nUrn}::${dbId}`);
  if (urn && urn !== nUrn) keys.push(`${urn}::${dbId}`);
  if (nCur) keys.push(`${nCur}::${dbId}`);
  if (curUrn && curUrn !== nCur) keys.push(`${curUrn}::${dbId}`);
  keys.push(String(dbId));
  for (const k of keys) {
    const f = catMap.get(k);
    if (!f) continue;
    const C = !!f.C, T = !!f.T, D = !!f.D;
    if (C && !T && !D) return "C";
    if (!C && T && !D) return "T";
    if (!C && !T && D) return "D";
    if (!C && T && D)  return "TD";
    if (C) return "C";
  }
  return "";
}

function purgeWbsDomPaint() {
  const host = document.getElementById("wbs-group-list");
  if (!host) return;
  host.querySelectorAll("li[data-uid]").forEach(li => {
    li.removeAttribute("data-wbs-state");
    li.classList.remove("wbs-c","wbs-td","wbs-blue");
  });
}

/** li 하나에 상태 반영 — state===undefined 는 '유지' 의미 */
function applyPaintOnLi(li, state) {
  // 준비 안된 경로 → 기존 칠을 유지(덮어쓰지 않음)
  if (typeof state === 'undefined') return;

  // data-wbs-state 동기화
  if (state) li.setAttribute('data-wbs-state', state);
  else li.removeAttribute('data-wbs-state');

  // 클래스 재적용
  li.classList.remove('wbs-c', 'wbs-td', 'wbs-blue');
  if (state === 'C')       li.classList.add('wbs-c');
  else if (state === 'TD') li.classList.add('wbs-td');
  else if (state === 'T' || state === 'D') li.classList.add('wbs-blue');
}

/* ──────────────────────────────────────────────────────────
   1) Task → 객체 카테고리 맵
────────────────────────────────────────────────────────── */
export function buildCatMapFromTasks() {
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  const map = new Map();
  const tree = window.taskTree;
  if (!tree?.getRootNode) return map;

  tree.getRootNode().visit((n) => {
    const cat = normalizeTaskCategory(n.data?.selectedOption);
    if (!cat) return;
    const arr = n.data?.linkedObjects || [];
    for (const o of arr) {
      const key = `${String(o.urn || CUR_URN)}::${String(o.dbId)}`;
      const cur = map.get(key) || { C:false, T:false, D:false };
      if (cat === "C") cur.C = true;
      else if (cat === "T") cur.T = true;
      else if (cat === "D") cur.D = true;
      map.set(key, cur);

      if (o.urn && CUR_URN && String(o.urn) !== String(CUR_URN)) {
        const aliasKey = `${String(CUR_URN)}::${String(o.dbId)}`;
        const aliasVal = map.get(aliasKey) || { C:false, T:false, D:false };
        aliasVal.C ||= cur.C; aliasVal.T ||= cur.T; aliasVal.D ||= cur.D;
        map.set(aliasKey, aliasVal);
      }
      const dbOnlyKey = String(o.dbId);
      const dbOnlyVal = map.get(dbOnlyKey) || { C:false, T:false, D:false };
      if (cat === "C") dbOnlyVal.C = true;
      else if (cat === "T") dbOnlyVal.T = true;
      else if (cat === "D") dbOnlyVal.D = true;
      map.set(dbOnlyKey, dbOnlyVal);
    }
  });
  return map;
}

/* ──────────────────────────────────────────────────────────
   2) 서브트리 적용(DFS)
────────────────────────────────────────────────────────── */
// 그룹은 '경로(prefix) 단위'로 색 결정, leaf는 기존(dbId) 로직 유지
export function applyHighlightForSubtreeUI(node, catMap) {
  if (!node) return "";

  // 노드 경로 얻기 (provider 가 준 __path 우선)
  const pathOf = (n) => {
    if (Array.isArray(n.__path)) return n.__path.slice();
    const out = []; let cur = n;
    while (cur && cur.text && !cur.isRoot?.()) { out.unshift(cur.text); cur = cur.parent; }
    return out;
  };

  const CUR_URN = window.CURRENT_MODEL_URN || "";

  function liOfLocal(n) {
    const host = document.getElementById("wbs-group-list");
    if (!host || !n) return null;
    const uid = n._id ?? n.id;
    if (!uid) return null;
    const any = host.querySelector(`[data-uid="${String(uid)}"]`);
    return any?.closest("li[data-uid]") || null;
  }

  const applyPaint = (n, st) => {
    const li = liOfLocal(n);
    if (!li) return;
    applyPaintOnLi(li, st);
  };

  function leafState(n) {
    const uid  = n._id ?? n.id ?? "";
    const urn  = parseUrnFromUid(uid) || String(n.urn || CUR_URN);
    const dbId = (typeof n.dbId === "number") ? n.dbId : null;
    return getStateFromCatMap(catMap, { urn, dbId, curUrn: CUR_URN });
  }

  function dfs(n) {
    const hasKids = (n.hasChildren && n.hasChildren());
    if (!hasKids) {
      const st = leafState(n);
      applyPaint(n, st);
      return st;
    }

    // ★ 그룹 상태: 경로(prefix) 단위 비교
    const path = pathOf(n);
    const groupState = getPathState(path);
    applyPaint(n, groupState);

    // 자식은 계속 내려가며 칠함(그룹색엔 영향 없음)
    const children = n.children || [];
    for (const ch of children) dfs(ch);
    return groupState;
  }

  // 교체 대상: applyHighlightForSubtreeUI 내부 summarizeByProvider()

  function summarizeByProvider(n){
    // 0) 경로 기반 커버리지 우선 사용
    try {
      const pathFrom = (node) => {
        const arr = []; let cur = node;
        while (cur && cur.text && !cur.isRoot?.()) { arr.unshift(cur.text); cur = cur.parent; }
        return arr;
      };
      if (typeof window.__WBS_GET_PATH_STATE === "function") {
        const st = window.__WBS_GET_PATH_STATE(pathFrom(n));
        if (st !== undefined) {
          // "T" | "D" 는 UI에서 모두 파란색 "T"로 통합 표현
          if (st === "T" || st === "D") return "T";
          return st; // "C" | "TD" | "" (빈문자면 미칠)
        }
      }
    } catch {}

    // 1) 커버리지 준비 안됐으면 기존 방식 폴백
    try {
      const getDbIds = window.__WBS_GET_DBIDS_FOR_NODE;
      const res = (typeof getDbIds === 'function')
        ? getDbIds(n, { allowUnbuilt: true })
        : [];
      if (res == null) return undefined;          // 아직 준비 X → 유지
      const ids = res || [];
      if (!ids.length) return "";                 // 비어있음 → 제거

      let first = null;
      for (const id of ids) {
        const st = getStateFromCatMap(window.__WBS_CATMAP || new Map(), {
          urn: window.CURRENT_MODEL_URN, dbId: id, curUrn: window.CURRENT_MODEL_URN
        });
        const b = (st === 'C' ? 'C' : st === 'TD' ? 'TD' : (st==='T'||st==='D') ? 'B' : '');
        if (!b) { first = ""; break; }
        if (first == null) first = b;
        else if (first !== b) { first = ""; break; }
      }
      return (first === 'B') ? 'T' : (first || "");
    } catch {
      return undefined;                           // 예외시 유지
    }
  }


  return dfs(node);
}

/* ──────────────────────────────────────────────────────────
   3) DOM 강제 스윕(누락/지연 렌더 대비)
────────────────────────────────────────────────────────── */
function domSweepRepaint(catMap) {
  const host = document.getElementById("wbs-group-list");
  if (!host) return;
  const CUR_URN = window.CURRENT_MODEL_URN || "";
  const tree = window.wbsTree;
  const bucketOf = (s) => s === "C" ? "C" : s === "TD" ? "TD" : (s === "T" || s === "D") ? "B" : "";

  // 리프 고정
  host.querySelectorAll("li[data-uid].leaf").forEach(li => {
    const uid = li.getAttribute("data-uid") || "";
    const node = tree?.node ? tree.node(uid) : null;
    const dbId = (node && typeof node.dbId === "number") ? node.dbId : null;
    if (dbId == null) return;
    const urn = parseUrnFromUid(uid) || node?.urn || CUR_URN;
    const st = getStateFromCatMap(catMap, { urn, dbId, curUrn: CUR_URN });
    applyPaintOnLi(li, st);
  });

  // 2) 그룹 노드: '경로(prefix)' 단위로 상태 결정
  host.querySelectorAll('li[data-uid]:not(.leaf)').forEach(li => {
    try {
      const uid = li.getAttribute('data-uid') || "";
      const node = tree?.node ? tree.node(uid) : null;
      if (!node) return;
      // node.__path가 없으면 타이틀 체인으로 경로 복원
      const path = (Array.isArray(node.__path) && node.__path.length)
        ? node.__path.slice()
        : (function build() {
            const out = []; let cur = node;
            while (cur && cur.text && !cur.isRoot?.()) { out.unshift(cur.text); cur = cur.parent; }
            return out;
          })();
      const st = getPathState(path);
      applyPaintOnLi(li, st);
    } catch { /* 유지 */ }
  });

  __resyncPaintClasses();
}

/** data-wbs-state ↔ 클래스 불일치 자동 보정(보험용) */
function __resyncPaintClasses() {
  const host = document.getElementById("wbs-group-list");
  if (!host) return;
  host.querySelectorAll('li[data-uid]').forEach(li => {
    const st = li.getAttribute('data-wbs-state') || "";
    let need = "";
    if (st === 'C') need = 'wbs-c';
    else if (st === 'TD') need = 'wbs-td';
    else if (st === 'T' || st === 'D') need = 'wbs-blue';
    if (!need) {
      li.classList.remove('wbs-c','wbs-td','wbs-blue');
      return;
    }
    if (!li.classList.contains(need)) {
      li.classList.remove('wbs-c','wbs-td','wbs-blue');
      li.classList.add(need);
    }
  });
}


/* ──────────────────────────────────────────────────────────
   4) 전면 하이라이트
────────────────────────────────────────────────────────── */
export function updateWBSHighlight() {
  if (fixedModeOn() || paintLocked()) return;

  // 경로 기반 커버리지 인덱스 준비(비동기). 준비되면 다음 프레임에서 자동 리페인트.
  try { ensureCoverageReady().then(()=>{ try{ scheduleWbsRepaint(); }catch{} }); } catch {}

  const catMap = buildCatMapFromTasks();
  window.__WBS_CATMAP = catMap;
  const tree = window.wbsTree;
  if (tree?.nodes) {
    for (const r of tree.nodes()) applyHighlightForSubtreeUI(r, catMap);
  }
  // DOM 강제 스윕(누락/지연 렌더 대비)
  domSweepRepaint(catMap);
  // ★ 보험: 상태-클래스 재동기화
  __resyncPaintClasses();
}

/* ──────────────────────────────────────────────────────────
   5) 이벤트 바인딩(선택)
────────────────────────────────────────────────────────── */
export function attachWbsTreeHighlightEvents(wbsTree, { includeExpand = false } = {}) {
  if (fixedModeOn()) return;
  if (!includeExpand || !wbsTree) return;
  const idle = (cb) => (typeof requestIdleCallback === "function" ? requestIdleCallback(cb, { timeout: 60 }) : setTimeout(cb, 0));
  wbsTree.on("node.expanded", (n) => idle(() => { const m = window.__WBS_CATMAP || buildCatMapFromTasks(); applyHighlightForSubtreeUI(n, m); domSweepRepaint(m); }));
  wbsTree.on("node.collapsed", (n) => idle(() => { const m = window.__WBS_CATMAP || buildCatMapFromTasks(); applyHighlightForSubtreeUI(n, m); domSweepRepaint(m); }));
}

/* ──────────────────────────────────────────────────────────
   6) 변화 지속성
────────────────────────────────────────────────────────── */
export function bindWbsHighlightPersistence(tree) {
  if (fixedModeOn()) return;
  if (!tree || tree.__wbsHLBound) return;
  tree.__wbsHLBound = true;
  const reapply = () => { if (!paintLocked()) scheduleWbsRepaint(); };
  ["node.selected","node.deselected","node.expanded","node.collapsed","node.rendered"].forEach(evt => tree.on(evt, reapply));
  tree.on("changes.applied", reapply);

  try {
    const host = document.getElementById("wbs-group-list");
    if (host && !host.__wbsObserver) {
      const obs = new MutationObserver(() => { if (!paintLocked()) scheduleWbsRepaint(); });
      obs.observe(host, { childList:true, subtree:true, attributes:false });
      host.__wbsObserver = obs;
    }
  } catch {}
}

/* ──────────────────────────────────────────────────────────
   (옵션) 디버깅
────────────────────────────────────────────────────────── */
export function findTasksByDbId(dbId, urn = window.CURRENT_MODEL_URN) {
  const tree = window.taskTree;
  const hits = [];
  if (!tree?.getRootNode) return hits;
  const targetUrn = normalizeUrn(urn);
  tree.getRootNode().visit((n) => {
    const cat = normalizeTaskCategory(n.data?.selectedOption) || "?";
    const arr = n.data?.linkedObjects || [];
    for (const o of arr) {
      const oUrn = normalizeUrn(o.urn || urn);
      if (oUrn === targetUrn && Number(o.dbId) === Number(dbId)) {
        hits.push({ title: n.title || n.data?.title, cat, node: n });
        break;
      }
    }
  });
  return hits;
}
```

---

## `wwwroot/js/sidebar/task-wbs/ui/wbs-visibility.js`

```javascript
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
```

---

## `wwwroot/js/sidebar/task-wbs/wbs-panel-init.js`

```javascript
import { buildWbsProviderLazy } from "./wbs/loader.js";
import { initWbsWithFancytree } from "./ui/fancy-tree-init.js";

export async function initWbsPanelWithFancytree(){
  const viewer = window.viewer;
  if (!viewer) return;

  const { provider } = await buildWbsProviderLazy(viewer, {
    primaryOrder: ["HEC.WBS", "HEC.Level", "HEC.Zone"],
    source: "all",
    bucketThreshold: 400,
    bucketSize: 200
  });

  await initWbsWithFancytree(provider, { primaryOrder: ["HEC.WBS", "HEC.Level", "HEC.Zone"] });
}
```

---

## `wwwroot/js/sidebar/task-wbs/wbs-tree.js`

```javascript
import { ensureEyeButton, installWbsVisibilityDelegate } from "./ui/wbs-visibility.js";
import { applyHighlightForSubtreeUI } from "./ui/wbs-highlight.js";
import { activateFixedPaint, refreshFixedPaint, requestDebouncedRepaint, paintSubtreeNow } from "./ui/wbs-fixed-paint.js";

const rIC = typeof requestIdleCallback === "function"
  ? requestIdleCallback
  : (fn)=>setTimeout(()=>fn({ timeRemaining:()=>5 }),0);

// 체크 프리픽스 규칙 (전역 공유)
const CHECK_RULES = (window.__WBS_CHECK_RULES = window.__WBS_CHECK_RULES || { on:new Set(), off:new Set() });
const PSEP = "¦";
const pkey = (path) => (path||[]).join(PSEP);
const startsWithKey = (full, key) => (full===key || full.startsWith(key + PSEP));

function registerAutoCheck(pathArr, turnOn){
  const k = pkey(pathArr);
  if (turnOn){
    Array.from(CHECK_RULES.off).forEach(x => { if (startsWithKey(x,k) || startsWithKey(k,x)) CHECK_RULES.off.delete(x); });
    Array.from(CHECK_RULES.on).forEach(x => { if (startsWithKey(x,k)) CHECK_RULES.on.delete(x); });
    CHECK_RULES.on.add(k);
  }else{
    Array.from(CHECK_RULES.on).forEach(x => { if (startsWithKey(x,k) || startsWithKey(k,x)) CHECK_RULES.on.delete(x); });
    CHECK_RULES.off.add(k);
  }
}
function shouldBeChecked(pathArr){
  const k = pkey(pathArr);
  for (const off of CHECK_RULES.off) if (startsWithKey(k,off)) return false;
  for (const on  of CHECK_RULES.on ) if (startsWithKey(k,on )) return true;
  return null; // 규칙 없음
}
const shouldBeCheckedByNode = (n) => shouldBeChecked(pathOf(n));

export function initWbsPanel(input){
  // 1) 확장 반짝임 억제용 CSS 1회 주입
  (function injectWbsPaintCss(){
    if (document.getElementById('wbs-expanding-css')) return;
    const st = document.createElement('style');
    st.id = 'wbs-expanding-css';
    st.textContent = `
      /* 확장되는 노드의 직계 자식 목록은 칠 완료까지 숨김 */
      #wbs-group-list li.expanding > ol { visibility: hidden; }
    `;
    document.head.appendChild(st);
  })();

  const wrap = document.getElementById("wbs-group-content");
  if (!wrap) return;
  wrap.innerHTML = `<div id="wbs-group-list"></div>`;
  const host = document.getElementById("wbs-group-list");

  const rawProvider = (input && input.__provider) ? input : null;
  let provider = rawProvider;
  const usingProvider = !!rawProvider;

  function pathOf(node){
    if (node && Array.isArray(node.__path)) return node.__path.slice();
    const out = []; let cur = node;
    while (cur && cur.text && !cur.isRoot?.()) { out.unshift(cur.text); cur = cur.parent; }
    return out;
  }
  const rawPathOf = pathOf; // 별칭

  // 2) ★★★ 체크 규칙을 '초기 데이터'에 주입하는 래퍼 프로바이더
  if (usingProvider) {
    const coerceCheckOnData = (items, parentPath=[]) => {
      if (!Array.isArray(items)) return items;
      return items.map(item => {
        // 버킷이면 내부 항목까지 재귀 적용
        if (item?._isBucket && Array.isArray(item.__bucket)) {
          item.__bucket = coerceCheckOnData(item.__bucket, parentPath);
          return item;
        }
        // 정상 노드: label로 경로 확장
        const label = item?.text ?? "";
        const path = parentPath.concat([label]);
        const want = shouldBeChecked(path);
        if (want !== null) {
          item.itree = item.itree || {};
          item.itree.state = item.itree.state || {};
          item.itree.state.checked = !!want;
        }
        return item;
      });
    };

    provider = {
      __provider: true,
      async roots(){
        const items = await rawProvider.roots();
        return coerceCheckOnData(items, []);
      },
      async childrenByPath(path){
        const items = await rawProvider.childrenByPath(path);
        return coerceCheckOnData(items, path);
      },
      countAt: (...a)=>rawProvider.countAt(...a),
      getDbIdsForPath: (...a)=>rawProvider.getDbIdsForPath(...a),
      ensurePathMapForDbIds: (...a)=>rawProvider.ensurePathMapForDbIds?.(...a)
    };
  }

  const tree = new window.InspireTree({
    selection: { multi:true, mode:"simple", autoSelectChildren:false, autoDselectChildren:false, require:false, autoSelectParents:false },
    data: usingProvider
      ? function(node, resolve){
          if (!node) { provider.roots().then(resolve); return; }
          if (node._isBucket && Array.isArray(node.__bucket)) { resolve(node.__bucket); return; }
          provider.childrenByPath(pathOf(node)).then(resolve);
        }
      : (input || [])
  });
  window.wbsTree = tree;

  new window.InspireTreeDOM(tree, { target:"#wbs-group-list", showCheckboxes:true, dragAndDrop:{enabled:false} });

  if (usingProvider) {
    window.__WBS_PROVIDER = provider;
    window.__WBS_GET_DBIDS_FOR_NODE = (node, opts) => provider.getDbIdsForPath(pathOf(node), opts);
  }

  function rowFor(node){
    const wrap = ensureRowShell(node);
    if (wrap) return wrap;
    const uid = node?._id ?? node?.id;
    const li = host.querySelector(`li[data-uid="${uid}"]`);
    return li?.querySelector(':scope > .title-wrap') || li;
  }

  function ensureCountBadge(node){
    const row = rowFor(node); if (!row) return;

    let badge = row.querySelector('.count-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'count-badge';
      row.appendChild(badge);
    }

    const isLeaf = (typeof node.dbId === "number");
    if (isLeaf) {
      badge.textContent = '';
      badge.style.display = 'none';
      return;
    }

    let cnt = (typeof node.leafCount === 'number') ? node.leafCount : undefined;
    if (cnt == null && usingProvider) { cnt = provider.countAt(pathOf(node)); }

    badge.textContent = (typeof cnt === 'number') ? String(cnt) : '…';
    badge.style.display = '';
  }

  function ensureDecor(n){ try { ensureCountBadge(n); } catch {} try { ensureEyeButton(n); } catch {} }

  function decorateDeep(root){
    const Q = [root]; const CHUNK = 600;
    (function step(deadline){
      let n=0;
      while (Q.length && (!deadline || deadline.timeRemaining()>3) && n<CHUNK){
        const cur = Q.shift();
        try { ensureDecor(cur); } catch {}
        if (cur.hasChildren && cur.hasChildren()) (cur.children||[]).forEach(ch=>Q.push(ch));
        n++;
      }
      if (Q.length) rIC(step,{timeout:60});
    })();
  }

  // 하이라이트 스로틀
  let HL_SUSPENDED = false;
  const q = new Set(); let scheduled = false;
  function scheduleHL(n){
    if (HL_SUSPENDED || window.__WBS_FIXED_MODE) return;
    q.add(n); if (scheduled) return; scheduled = true;
    requestAnimationFrame(()=>{
      const map = window.__WBS_CATMAP;
      if (!window.__WBS_FIXED_MODE && map) {
        q.forEach(x=>{ try{ applyHighlightForSubtreeUI(x,map);}catch{} });
      }
      q.clear(); scheduled=false;
    });
  }
  function flushOnce(){
    if (window.__WBS_FIXED_MODE) return;
    const map = window.__WBS_CATMAP; if (!map) return;
    tree.nodes().forEach(r=>{ try{ applyHighlightForSubtreeUI(r,map);}catch{} });
  }

  tree.on("node.rendered", (n)=>requestAnimationFrame(()=>{ ensureDecor(n); scheduleHL(n); }));

  // 막 로드된 자식들에게 규칙/칠 즉시 적용 (보조 안전장치)
  tree.on("children.loaded", (parent) => {
    try {
      (parent.children || []).forEach(ch => {
        try {
          const want = shouldBeCheckedByNode(ch);
          if (want === true) ch.check?.();
          else if (want === false) ch.uncheck?.();
        } catch {}
      });
      paintSubtreeNow(parent);
    } catch {}
  });

  // 확장시 반짝임 억제 + 고정색칠 경로 최신화
  tree.on("node.expanded",  async (n)=>{
    HL_SUSPENDED = true;
    decorateDeep(n);

    const uid = n?._id ?? n?.id;
    const li  = uid ? host.querySelector(`li[data-uid="${uid}"]`) : null;
    li?.classList.add('expanding');

    const prevLock = window.__WBS_PAINT_LOCK === true;
    window.__WBS_PAINT_LOCK = true;

    if (usingProvider) { try { await provider.childrenByPath(rawPathOf(n)); } catch {} }

    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));

    try { paintSubtreeNow(n); } catch {}
    try { await refreshFixedPaint({ repaint:true }); } catch {}

    window.__WBS_PAINT_LOCK = prevLock;
    li?.classList.remove('expanding');
    HL_SUSPENDED = false;

    flushOnce();
  });

  requestAnimationFrame(()=>{ try { tree.nodes().forEach(ensureDecor); } catch {} });
  requestAnimationFrame(()=>{ try { activateFixedPaint(); } catch {} });

  installWbsVisibilityDelegate();

  // DOM 추가 감시
  try {
    if (!host.__wbsDecorObserver){
      const obs = new MutationObserver((mutList)=>{
        let addedSomething = false;
        for (const m of mutList){
          m.addedNodes && m.addedNodes.forEach(el=>{
            if (el.nodeType !== 1) return;
            const lis = el.matches?.('li[data-uid]') ? [el] : Array.from(el.querySelectorAll?.('li[data-uid]') || []);
            if (!lis.length) return;
            addedSomething = true;
            requestAnimationFrame(()=>{
              lis.forEach(li => {
                try {
                  const uid = li.getAttribute('data-uid');
                  const node = uid ? tree.node(uid) : null;
                  if (!node) return;
                  ensureRowShell(node);
                  ensureCountBadge(node);
                  ensureEyeButton(node);
                  try {
                    const want = shouldBeCheckedByNode(node);
                    if (want === true) node.check?.();
                    else if (want === false) node.uncheck?.();
                  } catch {}
                } catch {}
              });
            });
          });
        }
        if (addedSomething) requestDebouncedRepaint?.(32);
      });
      obs.observe(host, { childList:true, subtree:true });
      host.__wbsDecorObserver = obs;
    }
  } catch {}

  // 체크 이벤트 → 규칙 갱신(미확장 자식에도 적용되도록)
  tree.on("node.checked", (n)=>{
    registerAutoCheck(pathOf(n), true);
    if (n.hasChildren && n.hasChildren()) (n.children||[]).forEach(ch => { try{ ch.check?.(); }catch{} });
  });
  tree.on("node.unchecked", (n)=>{
    registerAutoCheck(pathOf(n), false);
    if (n.hasChildren && n.hasChildren()) (n.children||[]).forEach(ch => { try{ ch.uncheck?.(); }catch{} });
  });
}

function ensureRowShell(node){
  const uid = node?._id ?? node?.id;
  if (!uid) return null;
  const li = document.querySelector(`#wbs-group-list li[data-uid="${uid}"]`);
  if (!li) return null;

  let wrap = li.querySelector(':scope > .title-wrap');
  if (wrap) return wrap;

  wrap = document.createElement('div');
  wrap.className = 'title-wrap';

  const moveSelectors = ['a.toggle', 'input[type="checkbox"]', '.title'];
  const moving = [];
  moveSelectors.forEach(sel => {
    const el = li.querySelector(`:scope > ${sel}`);
    if (el) moving.push(el);
  });

  li.insertBefore(wrap, li.firstChild);
  moving.forEach(el => wrap.appendChild(el));

  return wrap;
}
```

---

## `wwwroot/js/sidebar/task-wbs/wbs/highlight.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/wbs/highlight.js
import { updateWBSHighlight } from "../ui/wbs-highlight.js";

console.info("[hec] wbs/highlight.js loaded");

window.__ALLOW_WBS_UPDATE = window.__ALLOW_WBS_UPDATE ?? false;

export function requestWbsHighlightGateOn()  { window.__ALLOW_WBS_UPDATE = true; }
export function requestWbsHighlightGateOff() { window.__ALLOW_WBS_UPDATE = false; }

const _req = () => { if (window.__ALLOW_WBS_UPDATE) updateWBSHighlight(); };
const _throttled = (typeof _ !== "undefined" && _.throttle) ? _.throttle(_req, 120) : _req;

export function requestWbsHighlight() { _throttled(); }
// 대량 처리 후 마지막에 1번 강제 반영
export function requestWbsHighlightNow() { if (window.__ALLOW_WBS_UPDATE) updateWBSHighlight(); }
```

---

## `wwwroot/js/sidebar/task-wbs/wbs/loader.js`

```javascript
// /wwwroot/js/sidebar/task-wbs/wbs/loader.js
// Lazy WBS Provider v2.2
// depth: 1=HEC.WBS, 2=HEC.Level, 3=HEC.Zone, 4=Family, 5=Type, 6=Elements
export async function buildWbsProviderLazy(viewer, options = {}) {
  const urn = (window.CURRENT_MODEL_URN || "unknown_urn");
  const {
    primaryOrder = ["HEC.WBS", "HEC.Level", "HEC.Zone"],
    batchSize = 4000,
    bucketThreshold = 400,
    bucketSize = 200,
    source = "all" // "all" | "visible"
  } = options;

  const N = (s) => String(s ?? "")
    .normalize('NFKC')
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const SAFE = s => N(s).replace(/[:/\\]/g, "_");
  const koCmp = (a, b) => N(a).localeCompare(N(b), "ko");
  const numCmp = (a, b) => Number(a) - Number(b);

  const allowedPrimary = ["HEC.WBS", "HEC.Level", "HEC.Zone"];
  const prim = primaryOrder.filter(k => allowedPrimary.includes(k));
  while (prim.length < 3) for (const k of allowedPrimary) if (!prim.includes(k)) { prim.push(k); break; }

  const KEY_TYPE = ["유형 이름", "Type Name"];
  const KEY_ELEM = ["ElementId", "Element Id", "Element ID", "요소 ID"];
  const UNSET = {
    "HEC.WBS":   "WBS 미지정",
    "HEC.Level": "Level 미지정",
    "HEC.Zone":  "Zone 미지정",
    __FAMILY__:  "Family 미지정",
    __TYPE__:    "Type 미지정"
  };

  function looseGet(groups, label){
    const key = N(label);
    let box = groups.get(key);
    if (box) return box;
    for (const [k, b] of groups.entries()){
      if (N(k) === key || N(b?.label) === key) return b;
    }
    return null;
  }

  function collectAllLeafDbIds(model) {
    const it = model?.getData?.()?.instanceTree;
    if (!it) return [];
    const root = it.getRootId();
    const out = [];
    (function walk(id){
      let hasChild = false;
      it.enumNodeChildren(id, c => { hasChild = true; walk(c); });
      if (!hasChild) {
        let hasFrag = false;
        it.enumNodeFragments(id, () => { hasFrag = true; });
        if (hasFrag) out.push(id);
      }
    })(root);
    return out;
  }
  function collectVisibleDbIds(model) {
    if (typeof viewer.getVisibleDbIds === "function") return viewer.getVisibleDbIds(model) || [];
    if (typeof model.getVisibleDbIds === "function")   return model.getVisibleDbIds() || [];
    return collectAllLeafDbIds(model);
  }
  async function waitPropertyDb(model){
    if (model.getPropertyDb && model.getPropertyDb()) return;
    await new Promise((resolve) => {
      let done = false;
      const h = () => {
        if (model.getPropertyDb && model.getPropertyDb()) {
          viewer.removeEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
          done = true; resolve();
        }
      };
      viewer.addEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
      let tries = 0;
      const iv = setInterval(() => {
        if (model.getPropertyDb && model.getPropertyDb()) {
          clearInterval(iv);
          if (!done) viewer.removeEventListener(Autodesk.Viewing.PROPERTY_DATABASE_READY_EVENT, h);
          resolve();
        } else if (++tries > 600) { clearInterval(iv); resolve(); }
      }, 100);
    });
  }

  function propsToLowerMap(props){
    const map = new Map();
    for (const p of props) {
      const low = new Map(p.properties.map(q => [String(q.displayName || '').toLowerCase(), q.displayValue]));
      if (p.name) low.set('name', p.name);
      map.set(p.dbId, low);
    }
    return map;
  }
  function bulkProps(model, dbIds, names, batch = batchSize){
    return new Promise((resolve, reject) => {
      if (!dbIds.length) return resolve([]);
      const out = [];
      let i = 0;
      (function step(){
        if (i >= dbIds.length) return resolve(out);
        const slice = dbIds.slice(i, i + batch);
        i += batch;
        model.getBulkProperties(slice, names, (res) => { out.push(...res); setTimeout(step, 0); }, reject);
      })();
    });
  }

  const models = viewer.getVisibleModels ? viewer.getVisibleModels() : [viewer.model];
  if (!models || !models.length) return { provider: emptyProvider() };

  const byModelIds = new Map();
  for (const m of models) {
    await waitPropertyDb(m);
    const base = (source === "all") ? collectAllLeafDbIds(m) : collectVisibleDbIds(m);
    byModelIds.set(m, base);
  }

  const cache = new Map(); // key(path) -> { ids, groups, count }
  const pathMap = (window.__WBS_PATHMAP = window.__WBS_PATHMAP || new Map());
  const pkey = (path) => path.map(N).join("::");
  const ensure = (path) => { const k=pkey(path); let o=cache.get(k); if(!o){o={ids:null,groups:null,count:0}; cache.set(k,o);} return o; };

  function gset(groups, label, item){
    const k = N(label);
    let box = groups.get(k);
    if (!box) { box = { label: N(label) === "" ? "" : label, ids: [] }; groups.set(k, box); }
    box.ids.push(item);
  }

  async function buildRoot(){
    const root = ensure([]);
    if (root.groups) return root;
    root.ids = [];
    const groups = new Map();
    for (const [model, ids] of byModelIds.entries()) {
      root.ids.push(...ids.map(dbId => ({ model, dbId })));
      const props = await bulkProps(model, ids, [prim[0]]);
      const low = propsToLowerMap(props);
      for (const id of ids) {
        const v = low.get(id)?.get(prim[0].toLowerCase());
        const keyLabel = (v==null || v==="") ? "WBS 미지정" : String(v);
        gset(groups, keyLabel, { model, dbId: id });
      }
    }
    root.groups = groups; root.count = root.ids.length;
    return root;
  }

  async function buildNext(path){ // depth: 1->prim1, 2->prim2, 3->Family, 4->Type
    const depth = path.length;
    const cur = ensure(path);
    if (cur.groups) return cur;

    let ids = [];
    if (depth === 0) {
      const r = await buildRoot(); ids = r.ids;
    } else if (depth === 1) {
      const r = await buildRoot();
      const box = looseGet(r.groups, path[0]);
      ids = box ? box.ids.slice() : [];
    } else {
      const parentPath = path.slice(0, -1);
      const parent = ensure(parentPath);
      if (!parent.groups) await buildNext(parentPath);
      const box = looseGet(ensure(parentPath).groups, path[path.length - 1]);
      ids = box ? box.ids.slice() : [];
    }
    cur.ids = ids; cur.count = ids.length;
    if (!ids.length) { cur.groups = new Map(); return cur; }

    let propKeys = null;
    let getVal   = null;

    if      (depth === 1) { propKeys = [prim[1]]; getVal = l => l.get(prim[1].toLowerCase()) ?? "Level 미지정"; }
    else if (depth === 2) { propKeys = [prim[2]]; getVal = l => l.get(prim[2].toLowerCase()) ?? "Zone 미지정"; }
    else if (depth === 3) { // Family → name에서 [..] 제거
      const groups = new Map();
      for (const [model, dbIdList] of groupByModel(ids)) {
        const it = model?.getData?.()?.instanceTree;
        for (const dbId of dbIdList) {
          let nm = "";
          try { nm = it?.getNodeName ? it.getNodeName(dbId) : ""; } catch {}
          const fam = (nm ? String(nm).replace(/\s*\[[^\]]*\]\s*$/, '').trim() : "") || "Family 미지정";
          gset(groups, fam, { model, dbId, name: nm });
        }
      }
      cur.groups = groups;
      return cur;
    }
    else if (depth === 4) { propKeys = ["유형 이름", "Type Name"]; getVal = l => l.get('유형 이름') || l.get('type name') || "Type 미지정"; }
    else { cur.groups = new Map(); return cur; }

    const groups = new Map();
    for (const [model, dbIdList] of groupByModel(ids)) {
      const props = await bulkProps(model, dbIdList, propKeys);
      const low = propsToLowerMap(props);
      for (const dbId of dbIdList) {
        const l = low.get(dbId) || new Map();
        let label = getVal(l);
        label = (label==null || label==="") ? ((depth===4)?"Type 미지정" : (depth===1?"Level 미지정":"Zone 미지정")) : String(label);
        gset(groups, label, { model, dbId, name: l.get('name') });
      }
    }
    cur.groups = groups;
    return cur;
  }

  function* groupByModel(ids){
    const map = new Map();
    for (const x of ids) { if (!map.has(x.model)) map.set(x.model, []); map.get(x.model).push(x.dbId); }
    yield* map.entries();
  }

  async function makeLeaves(path){
    const cur = ensure(path);
    if (!cur.ids) {
      const parentPath = path.slice(0, -1);
      if (!ensure(parentPath).groups) await buildNext(parentPath);
      const box = looseGet(ensure(parentPath).groups, path[path.length - 1]);
      cur.ids = box ? box.ids.slice() : [];
      cur.count = cur.ids.length || 0;
    }
    if (!cur.ids?.length) return [];

    const results = [];
    for (const [model, dbIdList] of groupByModel(cur.ids)) {
      const props = await bulkProps(model, dbIdList, KEY_ELEM);
      const low = propsToLowerMap(props);
      for (const dbId of dbIdList) {
        const l = low.get(dbId) || new Map();
        const elemId = l.get('elementid') || l.get('element id') || dbId;
        const idBase = `${urn}::${SAFE(path.join('::'))}`;
        results.push({ id: `${idBase}::${elemId}`, text: `[${elemId}]`, urn, dbId, elementId: elemId });
        pathMap.set(`${urn}:${dbId}`, path.join(' - '));
      }
    }
    results.sort((a,b)=>numCmp(a.elementId, b.elementId));
    return results;
  }

  function makeGroupNodesFrom(groups, path, parentId, depth){
    const entries = Array.from(groups.entries())
      .map(([k,box]) => [box.label, box.ids])
      .sort(([a],[b]) => koCmp(a,b));
    const mk = (val, ids) => ({
      id: `${urn}::${SAFE([...path, val].join('::'))}`,
      text: val,
      __path: [...path, val],
      leafCount: ids.length,
      children: true
    });
    const allowBucket = (depth >= 6);
    if (allowBucket && entries.length >= bucketThreshold) {
      const out = [];
      for (let i=0;i<entries.length;i+=bucketSize) {
        const slice = entries.slice(i, i+bucketSize);
        out.push({
          id: `${parentId || urn}__bucket__${(i/bucketSize)|0}`,
          text: `그룹 ${((i/bucketSize)|0)+1} (${slice.length})`,
          _isBucket: true,
          __bucket: slice.map(([val, ids]) => mk(val, ids)),
          children: true
        });
      }
      return out;
    }
    return entries.map(([val, ids]) => mk(val, ids));
  }

  function emptyProvider(){
    return { __provider: true, async roots(){ return []; }, async childrenByPath(){ return []; }, countAt(){ return 0; }, getDbIdsForPath(){ return []; }, ensurePathMapForDbIds: async () => {} };
  }

  const provider = {
    __provider: true,

    countAt(path){
      const cur = ensure(path);
      if (cur.count) return cur.count;
      if (cur.groups) {
        let c = 0; for (const [, box] of cur.groups) c += (box?.ids?.length || 0);
        cur.count = c; return c;
      }
      return 0;
    },

    async roots(){ const root = await buildRoot(); return makeGroupNodesFrom(root.groups, [], urn, 0); },

    async childrenByPath(path){
      const d = path?.length ?? 0;
      if (d <= 4) {
        const cur = await buildNext(path);
        return makeGroupNodesFrom(cur.groups, path, undefined, d);
      }
      if (d === 5) return await makeLeaves(path);
      return [];
    },

    // ★ 펼치지 않아도 상위 요약 가능하도록 부모 groups 폴백
    getDbIdsForPath(path, opts = {}) {
      const cur = ensure(path);
    
      // 0) 이미 준비됨
      if (cur.ids && cur.ids.length) return cur.ids.map(x => x.dbId);
    
      // 1) 부모 groups 폴백(항상 허용) — allowUnbuilt와 무관
      const parentPath = path.slice(0, -1);
      const parent = ensure(parentPath);
      if (parent.groups) {
        const box = looseGet(parent.groups, path[path.length - 1]);
        if (box && box.ids) {
          cur.ids = box.ids.slice();
          cur.count = cur.ids.length;
          return cur.ids.map(x => x.dbId);
        }
      }
    
      // 2) 루트 특례(그룹 합침)
      if (path.length === 0 && cur.groups) {
        const all = [];
        for (const [, box] of cur.groups) all.push(...(box?.ids || []));
        if (all.length) {
          cur.ids = all;
          cur.count = all.length;
          return cur.ids.map(x => x.dbId);
        }
      }
    
      // 3) 여기까지 못 찾았으면, 정말 미구축 상태
      if (opts.allowUnbuilt) return null;
      return [];
    },
    

    async ensurePathMapForDbIds(dbIds){
      const need = [];
      for (const dbId of dbIds) if (!pathMap.has(`${urn}:${dbId}`)) need.push(dbId);
      if (!need.length) return;

      for (const m of models) {
        const all = byModelIds.get(m) || [];
        const set = new Set(all);
        const pick = need.filter(id => set.has(id));
        if (!pick.length) continue;

        const props = await bulkProps(m, pick, [...prim, "Name", ...KEY_TYPE]);
        const low = propsToLowerMap(props);
        for (const id of pick) {
          const l = low.get(id) || new Map();
          const k0 = l.get(prim[0].toLowerCase()) || "WBS 미지정";
          const k1 = l.get(prim[1].toLowerCase()) || "Level 미지정";
          const k2 = l.get(prim[2].toLowerCase()) || "Zone 미지정";
          const nm = l.get('name');
          const fam = (nm ? String(nm).replace(/\s*\[[^\]]*\]\s*$/, '').trim() : '') || "Family 미지정";
          const typ = l.get('유형 이름') || l.get('type name') || "Type 미지정";
          pathMap.set(`${urn}:${id}`, [k0, k1, k2, fam, typ].map(N).join(' - '));
        }
      }
    }
  };

  return { provider };
}
```

---

## `wwwroot/js/viewer/CustomViewerExtension.js`

```javascript
// /wwwroot/js/viewer/CustomViewerExtension.js
import { enableBoxSelectionMode } from "./selection-tool.js";
import { openSelectViewer } from "./open-select-viewer.js";

export class MyCustomViewerExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._viewer = viewer;
    this._onToolbarCreated = null;
    this._customized = false; // 중복 실행 방지
  }

  load() {
    console.log("MyCustomViewerExtension이 로드되었습니다.");

    this._onToolbarCreated = () => {
      if (this._customized) return;
      const ok = this._customizeToolbar();
      if (this._viewer) {
        this._viewer.removeEventListener(
          Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
          this._onToolbarCreated
        );
      }
      this._customized = !!ok;
    };

    if (this._viewer.toolbar) {
      setTimeout(this._onToolbarCreated, 0);
    } else {
      this._viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        this._onToolbarCreated
      );
    }
    return true;
  }

  unload() {
    console.log("MyCustomViewerExtension이 언로드되었습니다.");
    if (this._onToolbarCreated) {
      this._viewer?.removeEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        this._onToolbarCreated
      );
      this._onToolbarCreated = null;
    }
    this._customized = false;
    return true;
  }

  _customizeToolbar() {
    console.log("툴바가 생성되었습니다. 사용자 정의를 시작합니다.");
    const toolbar = this._viewer && this._viewer.toolbar;
    if (!toolbar) {
      console.warn("[MyCustomViewerExtension] toolbar not ready");
      return false;
    }

    // ── 그룹 준비 (있으면 재사용, 없으면 생성)
    const hecToolsID = "hec-select-tool-group";
    let hecToolsGroup =
      safeGetGroup(toolbar, hecToolsID) ||
      new Autodesk.Viewing.UI.ControlGroup(hecToolsID);
    if (!safeGetGroup(toolbar, hecToolsID)) safeAddGroup(toolbar, hecToolsGroup);

    const hecSettingsID = "hec-setting-tool-group";
    let hecSettingsGroup =
      safeGetGroup(toolbar, hecSettingsID) ||
      new Autodesk.Viewing.UI.ControlGroup(hecSettingsID);
    if (!safeGetGroup(toolbar, hecSettingsID))
      safeAddGroup(toolbar, hecSettingsGroup);

    // ── 버튼 팩토리
    const mkBtn = (id, tooltip, iconClass, onClick) => {
      const b = new Autodesk.Viewing.UI.Button(id);
      b.setToolTip(tooltip);
      if (iconClass) b.setIcon(iconClass);
      b.onClick = onClick;
      return b;
    };

    // 🔧 측정 비활성 헬퍼 (unload 금지: 버튼이 사라짐)
    const deactivateMeasure = (v) => {
      try {
        if (v.isExtensionLoaded?.('Autodesk.Measure')) {
          const ext = v.getExtension('Autodesk.Measure');
          ext?.deactivate?.();
          ext?.clearMeasurements?.();
        }
      } catch(_) {}
    };

    // ── 버튼 생성
    const clickBtn = mkBtn("my-click-button", "단일 선택", "click-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      deactivateMeasure(v);
      v.toolController?.deactivateTool("BoxSelectionTool");
      v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
      v.container.style.cursor = "default";
    });

    const dragBtn = mkBtn("my-drag-button", "올가미 선택", "drag-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      deactivateMeasure(v);               // 이벤트 충돌 방지
      enableBoxSelectionMode(this._viewer);
    });

    const hideBtn = mkBtn("my-hide-button", "선택 숨기기", "hide-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      const sel = v.getSelection();
      if (!sel.length) return;
      v.hide(sel);
      setTimeout(() => {
        v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
        v.container.style.cursor = "default";
      }, 100);
    });

    const isolateBtn = mkBtn(
      "my-isolate-button",
      "선택 제외 숨기기",
      "isolate-button-class",
      () => {
        const v = this._viewer;
        if (!v) return;
        const sel = v.getSelection();
        if (!sel.length) return;
        v.isolate(sel);
        setTimeout(() => {
          v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
          v.container.style.cursor = "default";
        }, 100);
      }
    );

    const resetBtn = mkBtn("my-reset-button", "뷰 초기화", "reset-button-class", () => {
      const v = this._viewer;
      if (!v) return;
      v.clearSelection();
      v.showAll();
      setTimeout(() => {
        v.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
        v.container.style.cursor = "default";
      }, 100);
    });

    const viewBtn = mkBtn(
      "my-viewer-setting-button",
      "뷰 선택 모드",
      "adsk-icon-camera",
      () => {
        const urn = window.CURRENT_MODEL_URN;
        if (!urn) return alert("현재 선택된 모델의 URN이 없습니다.");
        openSelectViewer({
          urn,
          viewer: this._viewer,
          onModelLoaded: (viewer, model) => {
            console.log("새 뷰 로드 완료:", model);
          },
        });
      }
    );

    const taskBtn = mkBtn(
      "my-task-setting-button",
      "공정 옵션",
      "adsk-icon-mem-mgr",
      () => {
        // TODO: 옵션 모달 열기 등
      }
    );

    // ── 그룹에 버튼 붙이기 (중복 방지로 기존 버튼 제거 후 추가)
    clearControls(hecToolsGroup);
    hecToolsGroup.addControl(clickBtn);
    hecToolsGroup.addControl(dragBtn);
    hecToolsGroup.addControl(hideBtn);
    hecToolsGroup.addControl(isolateBtn);
    hecToolsGroup.addControl(resetBtn);

    clearControls(hecSettingsGroup);
    hecSettingsGroup.addControl(viewBtn);
    hecSettingsGroup.addControl(taskBtn);

    // ── 기본 그룹 참조
    const modelTools = safeGetGroup(toolbar, "modelTools");
    const settingsTools = safeGetGroup(toolbar, "settingsTools");

    // navTools는 제거 X, 숨기기만(레이스 방지하여 재시도)
    scheduleHideNavTools(toolbar);

    // ── 순서 재배치
    [hecToolsGroup, modelTools, settingsTools, hecSettingsGroup].forEach((g) =>
      safeRemoveGroup(toolbar, g)
    );
    [hecToolsGroup, hecSettingsGroup, modelTools, settingsTools]
      .filter(Boolean)
      .forEach((g) => safeAddGroup(toolbar, g));

    // ── 원치 않는 기본 버튼만 반복 제거
    scheduleRemoveDefaultButtons(toolbar, this._viewer);

    console.log("툴바 커스터마이징 완료.");
    return true;
  }
}

/* ────────────────────────── 안전 헬퍼 ────────────────────────── */
function safeGetGroup(toolbar, id) {
  if (!toolbar) return null;
  try { return toolbar.getControl(id) || null; } catch (_) { return null; }
}
function safeGetChild(group, childId) {
  if (!group) return null;
  try { return group.getControl(childId) || null; } catch (_) { return null; }
}
function safeRemoveChild(group, childId) {
  const c = safeGetChild(group, childId);
  if (group && c) { try { group.removeControl(c); } catch(_){} }
}
function safeRemoveGroup(toolbar, groupOrId) {
  if (!toolbar) return;
  const g = (typeof groupOrId === "string")
    ? safeGetGroup(toolbar, groupOrId)
    : groupOrId;
  if (g) { try { toolbar.removeControl(g); } catch(_){} }
}
function safeAddGroup(toolbar, group) {
  if (toolbar && group) { try { toolbar.addControl(group); } catch(_){} }
}
function clearControls(group) {
  if (!group || !group._controls) return;
  try {
    const ids = Object.keys(group._controls || {});
    ids.forEach((id) => safeRemoveChild(group, id));
  } catch (_) {
    try {
      while (group._controls && Object.keys(group._controls).length) {
        const k = Object.keys(group._controls)[0];
        safeRemoveChild(group, k);
      }
    } catch(_) {}
  }
}

/* navTools는 제거하지 말고 숨기기 */
function hideNavTools(toolbar) {
  const nav = safeGetGroup(toolbar, 'navTools');
  if (!nav) return false;
  try { nav.setVisible(false); } catch(_) {}
  // DOM 레벨에서도 한 번 더 강제
  try {
    const el = nav.container || document.getElementById('navTools');
    if (el) el.style.display = 'none';
  } catch(_) {}
  return true;
}
function scheduleHideNavTools(toolbar) {
  let tries = 0;
  const MAX = 20;
  const tick = () => {
    if (hideNavTools(toolbar) || tries++ >= MAX) return;
    setTimeout(tick, 100);
  };
  if (!hideNavTools(toolbar)) setTimeout(tick, 100);

  // 🔧 추가: 영구 옵저버(측정/다른 확장으로 DOM 바뀌어도 즉시 숨김)
  try {
    const root = toolbar.container || document.querySelector('.adsk-viewing-toolbar');
    if (root && !root.__navToolsObserver) {
      const obs = new MutationObserver(() => hideNavTools(toolbar));
      obs.observe(root, {childList:true, subtree:true, attributes:true, attributeFilter:['style','class','hidden']});
      root.__navToolsObserver = obs;
    }
  } catch(_) {}
}

/* ───────── 보수적 반복 제거: 필요 없는 3개만 ───────── */
const BUTTONS_TO_REMOVE = [
  { groupId: 'modelTools',    controlId: 'toolbar-explodeTool' },
  { groupId: 'settingsTools', controlId: 'toolbar-modelStructureTool' },
  { groupId: 'settingsTools', controlId: 'toolbar-fullscreenTool' },
];

function removeDefaultButtonsOnce(toolbar) {
  if (!toolbar) return false;
  let allGone = true;
  for (const { groupId, controlId } of BUTTONS_TO_REMOVE) {
    const g  = safeGetGroup(toolbar, groupId);
    if (safeGetChild(g, controlId)) {
      safeRemoveChild(g, controlId);
    }
    if (safeGetChild(g, controlId)) allGone = false;
  }
  return allGone;
}

function scheduleRemoveDefaultButtons(toolbar, viewer) {
  // 즉시 1회
  removeDefaultButtonsOnce(toolbar);

  // 지연 추가 대비: 10초간 폴링
  let tries = 0;
  const MAX = 100;  // 100 * 100ms = 10초
  const STEP = 100;
  const timer = setInterval(() => {
    const done = removeDefaultButtonsOnce(toolbar);
    if (done || ++tries >= MAX) clearInterval(timer);
  }, STEP);

  // 다른 확장이 로딩되며 다시 붙는 경우에도 제거
  if (viewer) {
    const onExtLoaded = () => removeDefaultButtonsOnce(toolbar);
    viewer.addEventListener(Autodesk.Viewing.EXTENSION_LOADED_EVENT, onExtLoaded);
    // 필요하면 unload에서 removeEventListener로 정리 가능
  }
}
```

---

## `wwwroot/js/viewer/hec.ProgressOverlay.js`

```javascript
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
  ```

---

## `wwwroot/js/viewer/init-viewer.js`

```javascript
import { getAccessToken } from "./token-provider.js";
import { MyCustomViewerExtension } from './CustomViewerExtension.js';
import { BoxSelectionTool } from './selection-tool.js';

/**
 * Autodesk Viewer 초기화
 * @param {HTMLElement} container - Viewer를 넣을 DOM 엘리먼트
 * @returns {Promise<Autodesk.Viewing.GuiViewer3D>}
 */

Autodesk.Viewing.theExtensionManager.registerExtension(
  'MyCustomViewerExtensionId',
  MyCustomViewerExtension
);

export function initViewer(container) {
  return new Promise((resolve, reject) => {
    Autodesk.Viewing.Initializer(
      { env: "AutodeskProduction", getAccessToken },
      () => {
        const config = {
          extensions: ['MyCustomViewerExtensionId'],  
        };
        const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
        window.viewer = viewer;
        viewer.start();
        viewer.setTheme("light-theme");
        resolve(viewer);
        const boxTool = new BoxSelectionTool(viewer);
        viewer.toolController.registerTool(boxTool);
        viewer.__boxSelectionTool = boxTool; // (디버그용 핸들)
        // (권장) 단순 활성화
        viewer.toolController.activateTool('BoxSelectionTool');
      }
    );
  });
}

/**
 * URN을 이용해 모델을 로드
 * @param {Autodesk.Viewing.GuiViewer3D} viewer
 * @param {string} urn - Base64로 인코딩된 URN
 */
export async function loadModel(viewer, urn) {
  function onDocumentLoadFailure(code, message) {
    alert("모델 로딩 실패");
    console.error(message);
  }

  const doc = await new Promise((resolve, reject) => {
    Autodesk.Viewing.Document.load(
      "urn:" + urn,
      resolve,
      onDocumentLoadFailure
    );
  });

  await viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
  viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MIXED);
  viewer.clearSelection();
}```

---

## `wwwroot/js/viewer/open-select-viewer.js`

```javascript
export async function openSelectViewer({ urn, viewer, onModelLoaded  }) {
  console.log("Document.load에 전달되는 값:", 'urn:' + urn); 
  Autodesk.Viewing.Document.load('urn:' + urn, function (doc) {
    const views2D = [];
    const views3D = [];
    doc.getRoot().search({ type: 'geometry', role: '3d' }).forEach(node => {
      views3D.push({ type: '3d', name: node.data.name, node });
    });
    doc.getRoot().search({ type: 'geometry', role: '2d' }).forEach(node => {
      views2D.push({ type: '2d', name: node.data.name, node });
    });

    // 모달 관련 요소 가져오기
    const modal = document.getElementById('view-select-modal');
    const typeDropdown = document.getElementById('view-type-dropdown');
    const listDropdown = document.getElementById('view-list-dropdown');
    // const thumbImg = document.getElementById('view-thumb');  // 삭제!
    const okBtn = document.getElementById('view-ok-btn');
    const cancelBtn = document.getElementById('view-cancel-btn');
    const closeBtn = document.getElementById('view-close-btn');

    // 모달 초기화
    modal.style.display = 'block';

    // 현재 카테고리 뷰 배열 반환 함수
    function getCurrentViewList() {
      return typeDropdown.value === '3d' ? views3D : views2D;
    }

    // 뷰 리스트 드롭다운 갱신 함수 (썸네일 처리 부분 완전 삭제)
    function refreshViewListDropdown() {
      const currentViews = getCurrentViewList();
      listDropdown.innerHTML = '';
      currentViews.forEach((view, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = view.name;
        listDropdown.appendChild(opt);
      });
    }

    // 카테고리(2D/3D) 드롭다운 이벤트
    typeDropdown.onchange = function () {
      refreshViewListDropdown();
    };

    // 확인 버튼 (뷰어에 로드)
    okBtn.onclick = function () {
      const currentViews = getCurrentViewList();
      const selIdx = listDropdown.selectedIndex;
      if (selIdx >= 0 && currentViews[selIdx]) {
        const selectedView = currentViews[selIdx];
        viewer.addEventListener(
          Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
          function handler() {
            viewer.removeEventListener(
              Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
              handler
            );
            // 구버전에서는 model에 urn 할당 이렇게!
            if (viewer.model && !viewer.model.urn) {
              viewer.model.urn = getUrnFromDocument(doc);
            }
            if (typeof onModelLoaded === "function") {
              onModelLoaded(viewer, viewer.model);
            }
          }
        );
        viewer.loadDocumentNode(doc, selectedView.node);
      }
      closeModal();
    };
      
    // 취소/닫기
    cancelBtn.onclick = closeBtn.onclick = function () {
      closeModal();
    };

    function closeModal() {
      modal.style.display = 'none';
      // 이벤트 해제/클린업 필요시 여기에 추가
    }

    // 기본값 세팅 (초기에는 3D, 2D 자동 선택만 해주고 로드는 NO!)
    if (views3D.length > 0) {
      typeDropdown.value = '3d';
      refreshViewListDropdown();
    } else if (views2D.length > 0) {
      typeDropdown.value = '2d';
      refreshViewListDropdown();
    } else {
      listDropdown.innerHTML = '';
    }
  },
  function (code, msg) {
    alert('모델 뷰어 데이터를 불러오지 못했습니다.\n' + msg);
  });
}

function getUrnFromDocument(doc) {
  // 1. 신버전은 getDocumentId()
  if (typeof doc.getDocumentId === 'function') {
    return doc.getDocumentId();
  }
  // 2. 구버전은 urn 프로퍼티 or root.data.urn
  if (doc.urn) return doc.urn;
  if (doc.getRoot && doc.getRoot().data && doc.getRoot().data.urn)
    return doc.getRoot().data.urn;
  // 3. 없으면 에러
  throw new Error('URN 정보를 찾을 수 없습니다');
}```

---

## `wwwroot/js/viewer/selection-tool.js`

```javascript
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
```

---

## `wwwroot/js/viewer/token-provider.js`

```javascript
/**
 * Autodesk Viewer에 토큰을 공급합니다.
 * @param {function(string, number)} callback - (accessToken, expiresIn) 형태로 호출
 */
export async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token", { credentials: "include" });
    if (!resp.ok) throw new Error(await resp.text());
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See console for more details.");
    console.error(err);
  }
}
```
