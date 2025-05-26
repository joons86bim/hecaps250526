import { getAccessToken } from "./token-provider.js";

/**
 * Autodesk Viewer 초기화
 * @param {HTMLElement} container - Viewer를 넣을 DOM 엘리먼트
 * @returns {Promise<Autodesk.Viewing.GuiViewer3D>}
 */
export function initViewer(container) {
  return new Promise((resolve, reject) => {
    Autodesk.Viewing.Initializer(
      { env: "AutodeskProduction", getAccessToken },
      () => {
        const config = {
          extensions: ["Autodesk.DocumentBrowser"],
        };
        const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
        window.viewer = viewer;
        viewer.start();
        viewer.setTheme("light-theme");
        resolve(viewer);
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
}
