// Detail page: shows the selected complaint and the quick action panel.
import { applyTranslations, t } from "./i18n/index.js";
import {
  state,
  complaintId,
  normalizeStatus,
  statusLabel,
  wardLabel,
  UPLOAD_URL,
  getSavedActions,
  saveActions,
  applyLocalActions,
  filterWardComplaints,
  emit
} from "./shared.js";
import { showToast } from "./toast.js";

let _container = null;

export function init(container) {
  _container = container;
  applyTranslations(container);

  container.querySelector('[data-open-view="complaints"]').addEventListener("click", () => history.back());
  container.querySelector("#saveActionButton").addEventListener("click", saveAction);
}

export function render(container = _container) {
  if (!container) return;
  applyTranslations(container);

  const complaint = state.wardComplaints.find((c) => complaintId(c) === state.selectedComplaintId) || state.wardComplaints[0];
  if (!complaint) {
    container.querySelector("#detailPanel").innerHTML = `<div class="empty-state">${t("noComplaints")}</div>`;
    return;
  }
  state.selectedComplaintId = complaintId(complaint);

  container.querySelector("#detailStatus").value = complaint.status || "Pending";
  container.querySelector("#actionNote").value = complaint.actionNote || "";

  const imageMarkup = complaint.image
    ? `<img src="${UPLOAD_URL}${complaint.image}" alt="Complaint photo">`
    : `<span>No photo uploaded</span>`;

  container.querySelector("#detailPanel").innerHTML = `
    <h3>${complaint.title || "Complaint"}</h3>
    <p>${complaint.description || ""}</p>
    <div class="detail-photo">${imageMarkup}</div>
    <div class="meta-row">
      <span>#${complaintId(complaint)}</span>
      <span><i class="fa-regular fa-user"></i> ${complaint.citizen_name || "Citizen"}</span>
      <span><i class="fa-solid fa-location-dot"></i> ${wardLabel()}</span>
      <span class="badge ${normalizeStatus(complaint.status)}">${statusLabel(complaint.status)}</span>
    </div>
  `;
}

function saveAction() {
  if (!state.selectedComplaintId) return;
  const container = _container;
  const actions = getSavedActions();
  actions[state.selectedComplaintId] = {
    status: container.querySelector("#detailStatus").value,
    note: container.querySelector("#actionNote").value.trim()
  };
  saveActions(actions);
  state.allComplaints = applyLocalActions(state.allComplaints);
  filterWardComplaints();
  emit("data:changed");
  showToast(t("actionSaved"));
}
