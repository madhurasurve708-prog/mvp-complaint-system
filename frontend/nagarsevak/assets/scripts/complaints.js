// Complaints list page: search, category filter, status filter, list of complaint cards.
import { applyTranslations, t, getLanguage } from "./i18n/index.js";
import {
  state,
  categories,
  complaintCategory,
  complaintId,
  localizedComplaintTitle,
  localizedComplaintDescription,
  localizedCitizenName,
  categoryLabel,
  statusLabel,
  normalizeStatus,
  wardLabel,
  openView
} from "./shared.js";

let _container = null;

export function init(container) {
  _container = container;
  applyTranslations(container);

  container.querySelector("#searchInput").addEventListener("input", render);
  container.querySelector("#statusFilter").addEventListener("change", render);
  container.querySelector("#categoryFilter").addEventListener("change", (event) => {
    state.selectedCategory = event.target.value;
    render();
  });

  container.querySelector("#complaintsList").addEventListener("click", (event) => {
    const button = event.target.closest(".open-complaint");
    if (!button) return;
    state.selectedComplaintId = button.dataset.id;
    openView("detail");
  });
}

export function render(container = _container) {
  if (!container) return;
  applyTranslations(container);

  // Category filter
  const filter = container.querySelector("#categoryFilter");
  filter.innerHTML = categories.map((c) => `
    <option value="${c.key}" ${state.selectedCategory === c.key ? "selected" : ""}>${getLanguage() === "mr" ? c.mr : c.en}</option>
  `).join("");

  // Search and filter logic
  const query = container.querySelector("#searchInput").value.trim().toLowerCase();
  const status = container.querySelector("#statusFilter").value;
  let visible = state.wardComplaints;

  if (state.selectedCategory !== "all") {
    visible = visible.filter((c) => complaintCategory(c) === state.selectedCategory);
  }
  if (status !== "all") {
    visible = visible.filter((c) => normalizeStatus(c.status) === status);
  }
  if (query) {
    visible = visible.filter((c) => {
      const text = `${complaintId(c)} ${localizedCitizenName(c)} ${localizedComplaintTitle(c)} ${localizedComplaintDescription(c)}`.toLowerCase();
      return text.includes(query);
    });
  }

  const list = container.querySelector("#complaintsList");
  list.innerHTML = visible.length
    ? visible.map(complaintCard).join("")
    : `<div class="empty-state">${query ? t("noMatch") : t("noComplaints")}</div>`;
}

function complaintCard(complaint) {
  const statusKey = normalizeStatus(complaint.status);
  const categoryKey = complaintCategory(complaint);
  const category = categories.find((c) => c.key === categoryKey) || categories[categories.length - 1];
  const id = complaintId(complaint);
  const title = localizedComplaintTitle(complaint);
  const citizen = localizedCitizenName(complaint);
  const description = localizedComplaintDescription(complaint);
  const locality = complaint.locality || "";

  return `
    <article class="complaint-item">
      <div class="complaint-icon ${category.className}"><i class="fa-solid ${category.icon}"></i></div>
      <div>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="meta-row">
          <span>#${id}</span>
          <span><i class="fa-regular fa-user"></i> ${citizen}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${wardLabel()}</span>
          ${locality ? `<span><i class="fa-solid fa-map-pin"></i> ${locality}</span>` : ""}
          <span>${categoryLabel(categoryKey)}</span>
          <span class="badge ${statusKey}">${statusLabel(complaint.status)}</span>
        </div>
      </div>
      <button class="open-complaint" type="button" data-id="${id}" aria-label="Open complaint"><i class="fa-solid fa-chevron-right"></i></button>
    </article>
  `;
}
