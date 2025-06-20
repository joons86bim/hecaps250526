// wwwroot/js/sidebar/panel2-ui-helpers.js

// taskTree를 인자로 받음
export function syncTaskDataWithTree(taskTree, taskData) {
  // node → {label, children}
  function toObj(node) {
    return {
      label: node.text,
      children: (node.children || []).map(toObj),
    };
  }
  // taskTree.nodes()는 모든 루트 노드 배열
  const nodes = taskTree.nodes();
  // taskData를 새로 만듦 (배열 내용을 갱신)
  taskData.length = 0;
  nodes.forEach((n) => taskData.push(toObj(n)));
}
