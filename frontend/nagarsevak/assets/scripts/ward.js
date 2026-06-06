// Ward page: shows the ward map placeholder and the ward summary.
import { applyTranslations, t, getLanguage } from "./i18n/index.js";
import { state, normalizeStatus, wardLabel } from "./shared.js";

let _container = null;

export function init(container) {
  _container = container;
}

export function render(container = _container) {
  if (!container) return;
  applyTranslations(container);

  const mapLabel = container.querySelector("#mapLabel");
  if (mapLabel) mapLabel.textContent = getLanguage() === "mr" ? `${wardLabel()} तक्रार नकाशा` : `${wardLabel()} Complaint Map`;

  const pending = state.wardComplaints.filter((c) => normalizeStatus(c.status) === "pending").length;
  const progress = state.wardComplaints.filter((c) => normalizeStatus(c.status) === "progress").length;
  const resolved = state.wardComplaints.filter((c) => normalizeStatus(c.status) === "resolved").length;

  container.querySelector("#wardSummary").innerHTML = `
    <div class="summary-row"><span>${t("statTotal")}</span><strong>${state.wardComplaints.length}</strong></div>
    <div class="summary-row"><span>${t("statPending")}</span><strong>${pending}</strong></div>
    <div class="summary-row"><span>${t("statProgress")}</span><strong>${progress}</strong></div>
    <div class="summary-row"><span>${t("statResolved")}</span><strong>${resolved}</strong></div>
  `;
}
