// panel2-resizer.js

export function bindPanel2Resizer() {
  console.log("[bind] panel2 리사이저 바인딩");
  const container = document.getElementById('vertical-split-container');
    const topPanel = document.getElementById('task-list-panel');
    const bottomPanel = document.getElementById('wbs-group-list-panel');
    const resizer = document.getElementById('resizer');
    // if (!container || !topPanel || !bottomPanel || !resizer) {
    //   // id가 실제 HTML과 일치하는지 꼭 확인!
    //   return;
    // }
  
    let startY, startTopHeight;
    const minPanelHeight = 100;
  
    resizer.addEventListener('mousedown', function(e) {
      startY = e.clientY;
      startTopHeight = topPanel.offsetHeight;
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    });
  
    function onDrag(e) {
      const dy = e.clientY - startY;
      let newTopHeight = startTopHeight + dy;
      const containerHeight = container.clientHeight;
      const maxTopHeight = containerHeight - resizer.offsetHeight - minPanelHeight;
  
      if (newTopHeight < minPanelHeight) newTopHeight = minPanelHeight;
      if (newTopHeight > maxTopHeight) newTopHeight = maxTopHeight;
  
      topPanel.style.height = newTopHeight + 'px';
      bottomPanel.style.height = (containerHeight - newTopHeight - resizer.offsetHeight) + 'px';

    
    }
  
    function stopDrag(e) {
      document.body.style.userSelect = 'auto';
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    }
  
}

// document.addEventListener("DOMContentLoaded", () => {
//     const container = document.getElementById('vertical-split-container');
//     const topPanel = document.getElementById('task-list-panel');
//     const bottomPanel = document.getElementById('wbs-group-list-panel');
//     const resizer = document.getElementById('resizer');
//     // if (!container || !topPanel || !bottomPanel || !resizer) {
//     //   // id가 실제 HTML과 일치하는지 꼭 확인!
//     //   return;
//     // }
  
//     let startY, startTopHeight;
//     const minPanelHeight = 100;
  
//     resizer.addEventListener('mousedown', function(e) {
//       startY = e.clientY;
//       startTopHeight = topPanel.offsetHeight;
//       document.body.style.userSelect = 'none';
//       document.addEventListener('mousemove', onDrag);
//       document.addEventListener('mouseup', stopDrag);
//     });
  
//     function onDrag(e) {
//       const dy = e.clientY - startY;
//       let newTopHeight = startTopHeight + dy;
//       const containerHeight = container.clientHeight;
//       const maxTopHeight = containerHeight - resizer.offsetHeight - minPanelHeight;
  
//       if (newTopHeight < minPanelHeight) newTopHeight = minPanelHeight;
//       if (newTopHeight > maxTopHeight) newTopHeight = maxTopHeight;
  
//       topPanel.style.height = newTopHeight + 'px';
//       bottomPanel.style.height = (containerHeight - newTopHeight - resizer.offsetHeight) + 'px';

    
//     }
  
//     function stopDrag(e) {
//       document.body.style.userSelect = 'auto';
//       document.removeEventListener('mousemove', onDrag);
//       document.removeEventListener('mouseup', stopDrag);
//     }
//   });
  