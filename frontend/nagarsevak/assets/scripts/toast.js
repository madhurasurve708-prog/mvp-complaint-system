// Toast notification helper.
// Used by shared.js (data loading) and individual page scripts (save action, announcement, etc.)
import { t } from "./i18n/index.js";

let timer;

export function showToast(message) {
  const node = document.getElementById("toast");
  if (!node) return;
  node.textContent = message || t("dataLoaded");
  node.classList.add("show");
  window.clearTimeout(timer);
  timer = window.setTimeout(() => node.classList.remove("show"), 2400);
}
