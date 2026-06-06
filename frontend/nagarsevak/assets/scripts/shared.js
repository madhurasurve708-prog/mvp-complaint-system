// =====================================================================
// shared.js
// All cross-cutting helpers live here so the page scripts stay small.
// Sections:
//   1. CONFIG          - constants
//   2. STATE           - mutable app state
//   3. BUS             - pub/sub for cross-module events
//   4. TEMPLATE LOADER - fetch + cache HTML fragments
//   5. CATEGORIES      - complaint category config
//   6. DEMO DATA       - fallback complaints
//   7. UTILS           - pure helpers
//   8. DATA            - loadComplaints / filterWardComplaints
//   9. NAVIGATION      - openView() that loads a page template + script
// =====================================================================

import { getLanguage } from "./i18n/index.js";
import * as overviewPage from "./overview.js";
import * as complaintsPage from "./complaints.js";
import * as detailPage from "./detail.js";
import * as wardPage from "./ward.js";
import * as announcementsPage from "./announcements.js";
import * as monthlyPage from "./monthly.js";
import * as profilePage from "./profile.js";

// # 1. CONFIG START
const API_URL = "http://127.0.0.1:8000/complaints";
const UPLOAD_URL = "../uploads/";
const LOCAL_ACTION_KEY = "nagarsevakComplaintActions";
const TEMPLATE_BASE = "./assets/templates/";
// # CONFIG END

// # 2. STATE START
const state = {
  selectedWard: "1",
  selectedComplaintId: null,
  selectedCategory: "all",
  allComplaints: [],
  wardComplaints: [],
  currentView: "overview",
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

// # 6. DEMO DATA START
const demoComplaints = [
  { id: "D101", citizen_name: "Aarav Naik", ward: "1", category: "garbage", title: "Garbage not collected", description: "Bazaar Peth road has garbage near the shop line.", image: "", status: "Pending" },
  { id: "D102", citizen_name: "Meera Sawant", ward: "1", category: "street-lights", title: "Street light off", description: "Street light near fish market is not working.", image: "", status: "In Progress" },
  { id: "D103", citizen_name: "Rohan Parab", ward: "1", category: "road", title: "Road pothole", description: "Large pothole near main chowk.", image: "", status: "Resolved" },
  { id: "D201", citizen_name: "Madhura Patil", ward: "2", category: "garbage", title: "Garbage", description: "Garbage not collected for 2 days.", image: "photo 1.jpeg", status: "Pending" },
  { id: "D202", citizen_name: "Sagar Kadam", ward: "2", category: "water", title: "Water pressure low", description: "Water pressure is low in the morning.", image: "", status: "Pending" },
  { id: "D301", citizen_name: "Priya Gavade", ward: "3", category: "drainage", title: "Drainage blocked", description: "Drainage water is overflowing near school.", image: "", status: "In Progress" },
  { id: "D401", citizen_name: "Nilesh Chavan", ward: "4", category: "tree", title: "Tree branch issue", description: "Tree branch is touching electric line.", image: "", status: "Pending" },
  { id: "D501", citizen_name: "Anaya More", ward: "5", category: "road", title: "Road cleaning", description: "Road cleaning required near Dandi area.", image: "", status: "Resolved" },
  { id: "D601", citizen_name: "Omkar Khot", ward: "6", category: "water", title: "Water leakage", description: "Pipeline leakage near Chivla beach road.", image: "", status: "Pending" },
  { id: "D701", citizen_name: "Sneha Redkar", ward: "7", category: "animals", title: "Street dog issue", description: "Street dogs creating problem at night.", image: "", status: "Pending" },
  { id: "D801", citizen_name: "Vikram Pednekar", ward: "8", category: "traffic", title: "Traffic problem", description: "Traffic jam near Medha junction.", image: "", status: "In Progress" },
  { id: "D901", citizen_name: "Neha Salgaonkar", ward: "9", category: "gutter", title: "Gutter cover broken", description: "Gutter cover is broken near temple.", image: "", status: "Pending" },
  { id: "D1001", citizen_name: "Kiran Naik", ward: "10", category: "street-lights", title: "Street light repair", description: "Two street lights off on Tarkarli road.", image: "", status: "Resolved" }
];
// # DEMO DATA END

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
  return `Ward ${state.selectedWard}`;
}

function complaintId(complaint) {
  return String(complaint.id || complaint._id || "NA");
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

function getSavedActions() {
  return JSON.parse(localStorage.getItem(LOCAL_ACTION_KEY) || "{}");
}

function saveActions(actions) {
  localStorage.setItem(LOCAL_ACTION_KEY, JSON.stringify(actions));
}

function applyLocalActions(complaints) {
  const actions = getSavedActions();
  return complaints.map((complaint) => {
    const saved = actions[complaintId(complaint)];
    return saved ? { ...complaint, status: saved.status, actionNote: saved.note } : complaint;
  });
}
// # UTILS END

// # 8. DATA START
async function loadComplaints() {
  const { showToast } = await import("./toast.js");
  const { t } = await import("./i18n/index.js");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API not available");
    state.allComplaints = applyLocalActions(await response.json());
    showToast(t("dataLoaded"));
  } catch (error) {
    state.allComplaints = applyLocalActions(demoComplaints);
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

// # 9. NAVIGATION START
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
  if (sidebar) sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  emit("view:changed", viewName);
  emit("view:rendered", viewName);
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
  UPLOAD_URL,
  LOCAL_ACTION_KEY,
  state,
  on,
  emit,
  loadTemplate,
  injectTemplate,
  categories,
  demoComplaints,
  normalizeWard,
  normalizeStatus,
  statusLabel,
  wardLabel,
  complaintId,
  categoryLabel,
  complaintCategory,
  getCategoryCounts,
  getSavedActions,
  saveActions,
  applyLocalActions,
  loadComplaints,
  filterWardComplaints,
  openView,
  pages
};
