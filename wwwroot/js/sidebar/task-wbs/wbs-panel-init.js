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
