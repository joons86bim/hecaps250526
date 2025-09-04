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
}