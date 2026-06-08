// Monthly analytics page: stats cards and category-wise bar chart.
import { applyTranslations, t } from "./i18n/index.js";
import { state, complaintCategory, categoryLabel, normalizeStatus } from "./shared.js";

let _container = null;

export function init(container) {
  _container = container;
}

export function render(container = _container) {
  if (!container) return;
  applyTranslations(container);

  const grouped = state.wardComplaints.reduce((acc, complaint) => {
    const key = complaintCategory(complaint);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(grouped), 1);
  const resolved = state.wardComplaints.filter((c) => normalizeStatus(c.status) === "resolved").length;
  const top = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];

  container.querySelector("#monthTotal").textContent = state.wardComplaints.length;
  container.querySelector("#monthResolved").textContent = resolved;
  container.querySelector("#topCategory").textContent = top ? categoryLabel(top[0]) : "-";
  container.querySelector("#resolutionRate").textContent = state.wardComplaints.length
    ? `${Math.round((resolved / state.wardComplaints.length) * 100)}%`
    : "0%";

  container.querySelector("#monthlyBars").innerHTML = Object.keys(grouped).length
    ? Object.entries(grouped).map(([title, count]) => `
      <div class="report-row">
        <strong>${categoryLabel(title)}</strong>
        <div class="bar-track"><span style="width:${(count / max) * 100}%"></span></div>
        <b>${count}</b>
      </div>
    `).join("")
    : `<div class="empty-state">${t("noComplaints")}</div>`;
}
