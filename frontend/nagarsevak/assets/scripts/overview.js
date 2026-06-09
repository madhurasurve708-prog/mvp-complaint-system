// Overview page: hero card, stats, category grid, priority list, announcements panel.
import { applyTranslations, t, getLanguage } from "./i18n/index.js";
import {
  state,
  categories,
  getCategoryCounts,
  normalizeStatus,
  complaintCategory,
  complaintId,
  localizedComplaintTitle,
  localizedComplaintDescription,
  localizedCitizenName,
  categoryLabel,
  statusLabel,
  wardLabel,
  openView
} from "./shared.js";

let _container = null;

export function init(container) {
  _container = container;
  applyTranslations(container);

  container.querySelectorAll("[data-open-view]").forEach((button) => {
    button.addEventListener("click", () => openView(button.dataset.openView));
  });

  container.querySelector("#categoryGrid").addEventListener("click", (event) => {
    const tile = event.target.closest("[data-category]");
    if (!tile) return;
    state.selectedCategory = tile.dataset.category;
    openView("complaints");
  });

  // Hide the category filter button
  // container.querySelector("#clearCategoryButton").addEventListener("click", () => {
  //   state.selectedCategory = "all";
  //   openView("complaints");
  // });
}

export function render(container = _container) {
  if (!container) return;
  applyTranslations(container);

  // Hero greeting
  const name = state.repName || "Nagarsevak";
  const greeting = container.querySelector("#heroGreeting");
  if (greeting) greeting.textContent = getLanguage() === "mr" ? `नमस्कार, ${name}!` : `Hello, ${name}!`;

  // Stats
  const total = state.wardComplaints.length;
  const pending = state.wardComplaints.filter((c) => normalizeStatus(c.status) === "pending").length;
  const progress = state.wardComplaints.filter((c) => normalizeStatus(c.status) === "progress").length;
  const resolved = state.wardComplaints.filter((c) => normalizeStatus(c.status) === "resolved").length;
  container.querySelector("#totalCount").textContent = total;
  container.querySelector("#pendingCount").textContent = pending;
  container.querySelector("#progressCount").textContent = progress;
  container.querySelector("#resolvedCount").textContent = resolved;

  // Category grid
  const counts = getCategoryCounts();
  const grid = container.querySelector("#categoryGrid");
  grid.innerHTML = categories.map((category) => `
    <button class="category-tile ${category.className} ${state.selectedCategory === category.key ? "active" : ""}" type="button" data-category="${category.key}">
      <span class="category-logo"><i class="fa-solid ${category.icon}"></i></span>
      <strong>${getLanguage() === "mr" ? category.mr : category.en}</strong>
      <small>${counts[category.key] || 0}</small>
    </button>
  `).join("");

  // Priority list
  const visible = state.wardComplaints.filter((c) => normalizeStatus(c.status) !== "resolved").slice(0, 3);
  const priority = container.querySelector("#priorityList");
  priority.innerHTML = visible.length
    ? visible.map(complaintCardCompact).join("")
    : `<div class="empty-state">${t("noComplaints")}</div>`;
}

function complaintCardCompact(complaint) {
  const statusKey = normalizeStatus(complaint.status);
  const categoryKey = complaintCategory(complaint);
  const category = categories.find((c) => c.key === categoryKey) || categories[categories.length - 1];
  const id = complaintId(complaint);
  const title = localizedComplaintTitle(complaint);
  const citizen = localizedCitizenName(complaint);
  const description = localizedComplaintDescription(complaint);

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
          <span>${categoryLabel(categoryKey)}</span>
          <span class="badge ${statusKey}">${statusLabel(complaint.status)}</span>
        </div>
      </div>
    </article>
  `;
}
