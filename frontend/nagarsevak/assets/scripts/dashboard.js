// Dashboard page: loads sidebar + topbar + opens the first view.
// Also handles sidebar nav, topbar refresh, mobile menu, logout,
// and listens to bus events to refresh the persistent chrome.
import { applyTranslations, getLanguage } from "./i18n/index.js";
import {
  injectTemplate,
  openView,
  loadComplaints,
  state,
  wardLabel,
  pages,
  on
} from "./shared.js";

let _sidebarContainer = null;
let _topbarContainer = null;
let _busWired = false;

export async function init() {
  _sidebarContainer = document.getElementById("sidebarContainer");
  _topbarContainer = document.getElementById("topbarContainer");

  // Load chrome templates
  await injectTemplate("sidebar", _sidebarContainer);
  await injectTemplate("topbar", _topbarContainer);
  applyTranslations(document);

  // Sidebar nav
  _sidebarContainer.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => openView(button.dataset.view));
  });

  // Logout
  document.getElementById("logoutButton").addEventListener("click", () => {
    document.getElementById("dashboardContainer").hidden = true;
    document.getElementById("loginContainer").hidden = false;
  });

  // Topbar: mobile menu + refresh. The menu button exists in BOTH the
  // topbar (visible on mobile/tablet) and the sidebar (visible on desktop).
  // CSS hides the wrong one per screen size; here we wire up every
  // .menu-toggle we find so whichever is visible works.
  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    const dashboard = document.getElementById("dashboardContainer");
    if (window.matchMedia("(min-width: 1081px)").matches) {
      sidebar.classList.toggle("collapsed");
      dashboard.classList.toggle("collapsed");
    } else {
      sidebar.classList.toggle("open");
    }
  };
  document.querySelectorAll(".menu-toggle").forEach((button) => {
    button.addEventListener("click", toggleSidebar);
  });
  document.getElementById("refreshButton").addEventListener("click", loadComplaints);

  // Bus listeners are registered only once even if init() runs again
  // (e.g. user logs out and logs back in).
  if (!_busWired) {
    on("data:changed", () => {
      renderChrome();
      rerenderActiveView();
    });
    on("language:change", () => {
      applyTranslations(document);
      renderChrome();
      rerenderActiveView();
    });
    on("view:rendered", () => {
      renderChrome();
    });
    _busWired = true;
  }

  // Initial data load and open the first view
  await loadComplaints();
  renderChrome();
  await openView("overview");
}

function rerenderActiveView() {
  const active = pages[state.currentView];
  if (active && typeof active.render === "function") {
    const container = document.getElementById("viewContainer");
    if (container) active.render(container);
  }
}

// Update the persistent chrome (topbar, sidebar, profile chip, ward labels).
function renderChrome() {
  const name = state.repName || "Nagarsevak";
  const firstLetter = name.trim().charAt(0) || "N";
  const labels = ["activeWardLabel", "complaintsWardLabel", "detailWardLabel", "wardPageLabel", "announcementsWardLabel", "monthlyWardLabel", "mapLabel"];

  labels.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    if (id === "mapLabel") {
      node.textContent = getLanguage() === "mr" ? `${wardLabel()} तक्रार नकाशा` : `${wardLabel()} Complaint Map`;
    } else {
      node.textContent = wardLabel();
    }
  });

  const heroGreeting = document.getElementById("heroGreeting");
  if (heroGreeting) {
    heroGreeting.textContent = getLanguage() === "mr" ? `नमस्कार, ${name}!` : `Hello, ${name}!`;
  }
  const profileName = document.getElementById("profileName");
  if (profileName) profileName.textContent = name;
  const profileRole = document.getElementById("profileRole");
  if (profileRole) profileRole.textContent = getLanguage() === "mr" ? `${wardLabel()} नगरसेवक` : `${wardLabel()} Nagarsevak`;
  const avatarLetter = document.getElementById("avatarLetter");
  if (avatarLetter) avatarLetter.textContent = firstLetter;
  const bigAvatar = document.getElementById("bigAvatar");
  if (bigAvatar) bigAvatar.textContent = firstLetter;
  const navCount = document.getElementById("navCount");
  if (navCount) navCount.textContent = state.wardComplaints.length;
}
