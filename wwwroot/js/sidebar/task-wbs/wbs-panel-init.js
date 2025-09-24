import { buildWbsProviderLazy } from "./wbs/loader.js";
import { initWbsWithFancytree } from "./ui/fancy-tree-init.js";

export async function initWbsPanelWithFancytree(provider, Options = {}) {
  if (!provider || typeof provider.roots !== "function" || typeof provider.childrenByPath !== "function") {
  throw new Error("initWbsPanelWithFancytree: invalid provider (roots/childrenByPath requied)");
  }
  const primaryOrder = Options.primaryOrder || ["HEC.WBS", "HEC.Level", "HEC.Zone"];
  return initWbsWithFancytree(provider, { primaryOrder });
}