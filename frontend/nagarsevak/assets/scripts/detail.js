// Detail page: shows the selected complaint and the quick action panel.
import { applyTranslations, t } from "./i18n/index.js";
import {
  state,
  complaintId,
  localizedComplaintTitle,
  localizedComplaintDescription,
  localizedCitizenName,
  normalizeStatus,
  statusLabel,
  wardLabel,
  UPLOAD_URL,
  API_BASE,
  filterWardComplaints,
  loadComplaints,
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
    <h3>${localizedComplaintTitle(complaint)}</h3>
    <p>${localizedComplaintDescription(complaint)}</p>
    <div class="detail-photo">${imageMarkup}</div>
    <div class="meta-row">
      <span>#${complaintId(complaint)}</span>
      <span><i class="fa-regular fa-user"></i> ${localizedCitizenName(complaint)}</span>
      <span><i class="fa-solid fa-location-dot"></i> ${wardLabel()}</span>
      ${complaint.locality ? `<span><i class="fa-solid fa-map-pin"></i> ${complaint.locality}</span>` : ""}
      <span class="badge ${normalizeStatus(complaint.status)}">${statusLabel(complaint.status)}</span>
    </div>
  `;
}

async function saveAction() {
  if (!state.selectedComplaintId) return;
  const container = _container;
  try {
    const endpoint = state.repId
      ? `${API_BASE}/nagarsevaks/${state.repId}/complaints/${state.selectedComplaintId}`
      : `${API_BASE}/complaints/${state.selectedComplaintId}`;
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: container.querySelector("#detailStatus").value,
        notes: container.querySelector("#actionNote").value.trim()
      })
    });
    if (!response.ok) throw new Error("Save failed");

    await loadComplaints();
    filterWardComplaints();
    emit("data:changed");
    showToast(t("actionSaved"));
  } catch {
    showToast("Action save failed.");
  }
}
