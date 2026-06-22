// =====================================================================
// shared.js
// All cross-cutting helpers live here so the page scripts stay small.
// Sections:
//   1. CONFIG          - constants
//   2. STATE           - mutable app state
//   3. BUS             - pub/sub for cross-module events
//   4. TEMPLATE LOADER - fetch + cache HTML fragments
//   5. CATEGORIES      - complaint category config
//   6. UTILS           - pure helpers
//   7. DATA            - loadComplaints / filterWardComplaints
//   8. NAVIGATION      - openView() that loads a page template + script
// =====================================================================

import { getLanguage, t } from "./i18n/index.js";
import * as overviewPage from "./overview.js";
import * as complaintsPage from "./complaints.js";
import * as detailPage from "./detail.js";
import * as wardPage from "./ward.js";
import * as announcementsPage from "./announcements.js";
import * as monthlyPage from "./monthly.js";
import * as profilePage from "./profile.js";

// # 1. CONFIG START
const API_BASE = "http://127.0.0.1:8000";
const API_URL = `${API_BASE}/complaints`;
const UPLOAD_URL = "../uploads/";
const TEMPLATE_BASE = "./assets/templates/";
// # CONFIG END

// # 2. STATE START
const state = {
  selectedWard: "",
  selectedComplaintId: null,
  selectedCategory: "all",
  allComplaints: [],
  wardComplaints: [],
  currentView: "overview",
  repId: null,
  repName: "",
  repMobile: ""
};
// # STATE END

// # 3. BUS START
const listeners = new Map();
function on(event, callback) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(callback);
  return () => listeners.get(event).delete(callback);
}
function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach((cb) => {
    try { cb(payload); } catch (err) { console.error(`[bus] ${event} handler failed`, err); }
  });
}
// # BUS END

// # 4. TEMPLATE LOADER START
const templateCache = new Map();
async function loadTemplate(name) {
  if (templateCache.has(name)) return templateCache.get(name);
  const response = await fetch(`${TEMPLATE_BASE}${name}.html`);
  if (!response.ok) throw new Error(`Failed to load template: ${name}`);
  const html = await response.text();
  templateCache.set(name, html);
  return html;
}
async function injectTemplate(name, container) {
  const html = await loadTemplate(name);
  container.innerHTML = html;
  return container;
}
// # TEMPLATE LOADER END

// # 5. CATEGORIES START
const categories = [
  { key: "all", mr: "सर्व", en: "All", icon: "fa-table-cells-large", className: "all", keywords: [] },
  { key: "water", mr: "पाणी", en: "Water", icon: "fa-droplet", className: "water", keywords: ["water", "paani", "पाणी"] },
  { key: "garbage", mr: "कचरा", en: "Garbage", icon: "fa-trash-can", className: "garbage", keywords: ["garbage", "waste", "trash", "कचरा"] },
  { key: "street-lights", mr: "रस्त्यावरील दिवे", en: "Street Lights", icon: "fa-lightbulb", className: "lights", keywords: ["light", "street light", "दिवे"] },
  { key: "road", mr: "रस्ता", en: "Road", icon: "fa-road", className: "road", keywords: ["road", "pothole", "रस्ता", "खड्ड"] },
  { key: "gutter", mr: "गटार", en: "Gutter", icon: "fa-water", className: "gutter", keywords: ["gutter", "drain", "गटार"] },
  { key: "animals", mr: "भटकी जनावरे", en: "Animals", icon: "fa-dog", className: "animals", keywords: ["dog", "animal", "जनावरे"] },
  { key: "traffic", mr: "वाहतूक समस्या", en: "Traffic", icon: "fa-traffic-light", className: "traffic", keywords: ["traffic", "वाहतूक"] },
  { key: "drainage", mr: "नाले / पाणी साचणे", en: "Drainage", icon: "fa-person-digging", className: "drainage", keywords: ["drainage", "overflow", "नाले"] },
  { key: "tree", mr: "झाड समस्या", en: "Tree", icon: "fa-tree", className: "tree", keywords: ["tree", "branch", "झाड"] },
  { key: "other", mr: "इतर", en: "Other", icon: "fa-circle-plus", className: "other", keywords: ["other", "इतर"] }
];
// # CATEGORIES END

// # 7. UTILS START
function normalizeWard(value) {
  return String(value || "").toLowerCase().replace("ward", "").replace("वॉर्ड", "").replace(/[^0-9]/g, "");
}

function normalizeStatus(status) {
  const value = String(status || "Pending").toLowerCase();
  if (value.includes("resolve") || value.includes("पूर्ण")) return "resolved";
  if (value.includes("progress") || value.includes("कारवाई")) return "progress";
  return "pending";
}

function statusLabel(status) {
  const key = normalizeStatus(status);
  if (key === "resolved") return getLanguage() === "mr" ? "पूर्ण" : "Resolved";
  if (key === "progress") return getLanguage() === "mr" ? "कारवाई सुरू" : "In Progress";
  return getLanguage() === "mr" ? "प्रलंबित" : "Pending";
}

function wardLabel() {
  return getLanguage() === "mr" ? `वॉर्ड ${state.selectedWard}` : `Ward ${state.selectedWard}`;
}

function complaintId(complaint) {
  return String(complaint.id || complaint._id || "NA");
}

function localizedComplaintTitle(complaint) {
  return getLanguage() === "mr" && complaint.mr_title ? complaint.mr_title : (complaint.title || "Complaint");
}

function localizedComplaintDescription(complaint) {
  return getLanguage() === "mr" && complaint.mr_description ? complaint.mr_description : (complaint.description || "");
}

function localizedCitizenName(complaint) {
  return getLanguage() === "mr" && complaint.mr_citizen_name ? complaint.mr_citizen_name : (complaint.citizen_name || complaint.citizenName || "Citizen");
}

function categoryLabel(categoryKey) {
  const category = categories.find((item) => item.key === categoryKey) || categories[categories.length - 1];
  return getLanguage() === "mr" ? category.mr : category.en;
}

function complaintCategory(complaint) {
  if (complaint.category && categories.some((item) => item.key === complaint.category)) {
    return complaint.category;
  }
  const text = `${complaint.title || ""} ${complaint.description || ""}`.toLowerCase();
  const match = categories.find((category) => category.key !== "all" && category.key !== "other" && category.keywords.some((keyword) => text.includes(keyword.toLowerCase())));
  return match ? match.key : "other";
}

function getCategoryCounts() {
  return state.wardComplaints.reduce((counts, complaint) => {
    const key = complaintCategory(complaint);
    counts[key] = (counts[key] || 0) + 1;
    counts.all = (counts.all || 0) + 1;
    return counts;
  }, { all: state.wardComplaints.length });
}

// # UTILS END

// # 7. DATA START
async function loadComplaints() {
  const { showToast } = await import("./toast.js");
  const { t } = await import("./i18n/index.js");
  try {
    const url = state.repId
      ? `${API_BASE}/nagarsevaks/${state.repId}/complaints`
      : `${API_BASE}/complaints/ward/${state.selectedWard}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("API not available");
    state.allComplaints = await response.json();
    showToast(t("dataLoaded"));
  } catch (error) {
    state.allComplaints = [];
    showToast(t("backendOff"));
  }
  filterWardComplaints();
  emit("data:changed");
}

function filterWardComplaints() {
  state.wardComplaints = state.allComplaints.filter(
    (complaint) => normalizeWard(complaint.ward) === state.selectedWard
  );
  if (!state.selectedComplaintId && state.wardComplaints.length) {
    state.selectedComplaintId = complaintId(state.wardComplaints[0]);
  }
}
// # DATA END

// # 8. NAVIGATION START
// Map of view name -> page module. Each module exports init(container) and render(container).
const pages = {
  overview: overviewPage,
  complaints: complaintsPage,
  detail: detailPage,
  ward: wardPage,
  announcements: announcementsPage,
  monthly: monthlyPage,
  profile: profilePage
};

async function openView(viewName, options = {}) {
  state.currentView = viewName;
  const container = document.getElementById("viewContainer");
  if (!container) return;

  // Track this view in the browser history so Back/Forward navigate the app.
  // skipPush is used by the popstate handler to avoid an infinite loop.
  if (!options.skipPush) {
    history.pushState({ view: viewName }, "", "#" + viewName);
  }

  await injectTemplate(viewName, container);
  const page = pages[viewName];
  if (page && typeof page.init === "function") page.init(container);
  if (page && typeof page.render === "function") page.render(container);

  // Sidebar active state
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.remove("open");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("sidebar-open");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Make the topbar h1 reflect the current view's page heading so users
  // always see the page they're on (Ward Complaints, Monthly Analytics,
  // Profile, etc.) instead of the generic "Nagarsevak Dashboard".
  syncTopbarTitle();

  emit("view:changed", viewName);
  emit("view:rendered", viewName);
}

// Copy the data-i18n key + translated text from the current view's
// page-heading h2 into the persistent topbar h1. Falls back to the
// default "Nagarsevak Dashboard" key when the view has no heading
// (e.g. the overview hero card).
function syncTopbarTitle() {
  const topbarTitle = document.getElementById("topbarTitle");
  if (!topbarTitle) return;
  const container = document.getElementById("viewContainer");
  const viewHeading = container && container.querySelector(".page-heading h2[data-i18n]");
  if (viewHeading) {
    const key = viewHeading.getAttribute("data-i18n");
    topbarTitle.setAttribute("data-i18n", key);
    topbarTitle.textContent = t(key);
  } else {
    topbarTitle.setAttribute("data-i18n", "dashboardTitle");
    topbarTitle.textContent = t("dashboardTitle");
  }
}

// React to browser Back/Forward (and history.back()/forward() calls).
//   - state has a view  -> open that view inside the dashboard
//   - state is null     -> user went past the dashboard, show the login page
// The dashboard's DOM is preserved across login/logout, so showing/hiding
// is enough; we never need to re-fetch templates or re-init modules.
window.addEventListener("popstate", (event) => {
  const view = event.state && event.state.view;
  const dashboard = document.getElementById("dashboardContainer");
  const loginContainer = document.getElementById("loginContainer");

  if (view) {
    if (dashboard && dashboard.hidden) {
      // Coming forward from the login page into the dashboard
      dashboard.hidden = false;
      if (loginContainer) loginContainer.hidden = true;
    }
    if (dashboard && !dashboard.hidden) {
      openView(view, { skipPush: true });
    }
  } else if (dashboard && !dashboard.hidden) {
    // No view in state -> user backed out to before the dashboard
    dashboard.hidden = true;
    if (loginContainer) loginContainer.hidden = false;
  }
});
// # NAVIGATION END

// Exports for use by app.js, dashboard.js, and page scripts.
export {
  API_URL,
  API_BASE,
  UPLOAD_URL,
  state,
  on,
  emit,
  loadTemplate,
  injectTemplate,
  categories,
  normalizeWard,
  normalizeStatus,
  statusLabel,
  wardLabel,
  complaintId,
  localizedComplaintTitle,
  localizedComplaintDescription,
  localizedCitizenName,
  categoryLabel,
  complaintCategory,
  getCategoryCounts,
  loadComplaints,
  filterWardComplaints,
  openView,
  pages
};
