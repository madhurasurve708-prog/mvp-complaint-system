// # CONFIG AND STATE START
const API_URL = "https://seva-setu-complaint-app.onrender.com";
const NAGARSEVAK_LOGIN_API = "https://seva-setu-complaint-app.onrender.com/nagarsevaks/login";
const UPLOAD_URL = "../uploads/";
const LOCAL_ACTION_KEY = "nagarsevakComplaintActions";

let currentLanguage = "mr";
let selectedWard = "";
let loggedInNagarsevakId = null;
let selectedComplaintId = null;
let selectedCategory = "all";
let allComplaints = [];
let wardComplaints = [];
// # CONFIG AND STATE END

// # DOM REFERENCES START
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const wardSelect = document.getElementById("wardSelect");
const representativeName = document.getElementById("representativeName");
const representativeMobile = document.getElementById("representativeMobile");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const refreshButton = document.getElementById("refreshButton");
const logoutButton = document.getElementById("logoutButton");
const navButtons = document.querySelectorAll("[data-view]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const languageButtons = document.querySelectorAll("[data-lang]");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const complaintsList = document.getElementById("complaintsList");
const priorityList = document.getElementById("priorityList");
const categoryGrid = document.getElementById("categoryGrid");
const clearCategoryButton = document.getElementById("clearCategoryButton");
const detailPanel = document.getElementById("detailPanel");
const detailStatus = document.getElementById("detailStatus");
const actionNote = document.getElementById("actionNote");
const saveActionButton = document.getElementById("saveActionButton");
const sendAnnouncementButton = document.getElementById("sendAnnouncementButton");
// # DOM REFERENCES END

// # TRANSLATIONS START
const translations = {
  mr: {
    portalLabel: "नगरसेवक पोर्टल",
    heroTitle: "वॉर्डनुसार तक्रारी, स्पष्ट कारवाई.",
    heroSubtitle: "प्रत्येक नगरसेवकाला फक्त त्याच्या वॉर्डमधील तक्रारी दिसतील.",
    welcome: "आपले स्वागत आहे!",
    loginTitle: "नगरसेवक लॉगिन",
    loginSubtitle: "तुमचा वॉर्ड निवडा आणि तक्रारी पहा.",
    openDashboard: "डॅशबोर्ड उघडा",
    sidePortal: "नगरसेवक पोर्टल",
    navOverview: "मुख्यपृष्ठ",
    navComplaints: "वॉर्ड तक्रारी",
    navWard: "माझा वॉर्ड",
    navAnnouncements: "घोषणा",
    navMonthly: "मासिक विश्लेषण",
    navProfile: "प्रोफाइल",
    logout: "लॉगआउट",
    dashboardTitle: "नगरसेवक डॅशबोर्ड",
    refresh: "रिफ्रेश",
    wardOnly: "फक्त निवडलेल्या वॉर्डच्या तक्रारी",
    overviewText: "तुमच्या वॉर्डमधील तक्रारी, प्राधान्य आणि कारवाई एका ठिकाणी.",
    seeComplaints: "तक्रारी पहा",
    seeWard: "वॉर्ड स्थिती",
    statTotal: "एकूण तक्रारी",
    statPending: "प्रलंबित",
    statProgress: "कारवाई सुरू",
    statResolved: "पूर्ण",
    priorityTitle: "तातडीच्या तक्रारी",
    prioritySub: "पहिले लक्ष देण्यासारख्या तक्रारी.",
    categoryTitle: "तक्रार विभाग",
    categorySub: "आयकॉनवर क्लिक केल्यावर त्या विभागाच्या तक्रारी दिसतील.",
    clearCategory: "सर्व विभाग",
    announcementsTitle: "घोषणा",
    announcementsSub: "वॉर्ड नागरिकांसाठी महत्वाचे अपडेट.",
    announceOne: "शनिवारी सकाळी बाजारपेठ स्वच्छता मोहीम.",
    announceTwo: "उद्या पाणीपुरवठा वेळेत बदल.",
    announceThree: "मुख्य रस्त्यावर दुरुस्ती काम सुरू.",
    viewAll: "सर्व पहा",
    complaintsTitle: "वॉर्ड तक्रारी",
    lockedWard: "वॉर्ड लॉक आहे",
    searchPlaceholder: "नाव, तक्रार किंवा क्रमांक शोधा",
    filterAll: "सर्व स्थिती",
    filterPending: "प्रलंबित",
    filterProgress: "कारवाई सुरू",
    filterResolved: "पूर्ण",
    detailTitle: "तक्रार कारवाई",
    backToList: "यादीकडे परत",
    quickAction: "जलद कारवाई",
    changeStatus: "स्थिती बदला",
    noteLabel: "टीप",
    notePlaceholder: "आज कोणती कारवाई केली ते लिहा",
    saveAction: "कारवाई सेव्ह करा",
    sendSms: "नागरिकाला SMS",
    wardTitle: "माझा वॉर्ड",
    wardSummary: "वॉर्ड सारांश",
    newAnnouncement: "नवीन घोषणा",
    announcementSubject: "विषय",
    announcementMessage: "संदेश",
    sendAnnouncement: "घोषणा पाठवा",
    recentAnnouncements: "अलीकडील घोषणा",
    monthlyTitle: "मासिक विश्लेषण",
    monthComplaints: "या महिन्यात तक्रारी",
    monthResolved: "या महिन्यात पूर्ण",
    topCategory: "टॉप विभाग",
    resolutionRate: "निवारण दर",
    categoryReport: "विभागनिहाय तक्रारी",
    profileSub: "खाते माहिती",
    profileTitle: "प्रोफाइल",
    profileNote: "ही भूमिका निवडलेल्या वॉर्डपुरती मर्यादित आहे.",
    noComplaints: "या वॉर्डमध्ये सध्या कोणतीही तक्रार नाही.",
    noMatch: "या शोधानुसार तक्रार सापडली नाही.",
    dataLoaded: "वॉर्डनुसार तक्रारी लोड झाल्या.",
    actionSaved: "कारवाई सेव्ह झाली.",
    announcementSent: "घोषणा पाठवली गेली.",
    backendOff: "Backend बंद आहे, सध्या तक्रारी लोड होत नाहीत."
  },
  en: {
    portalLabel: "Nagarsevak Portal",
    heroTitle: "Ward-wise complaints, clear action.",
    heroSubtitle: "Each Nagarsevak sees only complaints from the selected ward.",
    welcome: "Welcome!",
    loginTitle: "Nagarsevak Login",
    loginSubtitle: "Select your ward and view complaints.",
    openDashboard: "Open Dashboard",
    sidePortal: "Nagarsevak Portal",
    navOverview: "Overview",
    navComplaints: "Ward Complaints",
    navWard: "My Ward",
    navAnnouncements: "Announcements",
    navMonthly: "Monthly Analytics",
    navProfile: "Profile",
    logout: "Logout",
    dashboardTitle: "Nagarsevak Dashboard",
    refresh: "Refresh",
    wardOnly: "Only selected ward complaints",
    overviewText: "Complaints, priority and action for your ward in one simple place.",
    seeComplaints: "View Complaints",
    seeWard: "Ward Status",
    statTotal: "Total Complaints",
    statPending: "Pending",
    statProgress: "In Progress",
    statResolved: "Resolved",
    priorityTitle: "Priority Complaints",
    prioritySub: "Complaints that need attention first.",
    categoryTitle: "Complaint Categories",
    categorySub: "Tap an icon to see that category's complaints.",
    clearCategory: "All Categories",
    announcementsTitle: "Announcements",
    announcementsSub: "Important updates for ward citizens.",
    announceOne: "Bazaar cleaning drive on Saturday morning.",
    announceTwo: "Water supply timing will change tomorrow.",
    announceThree: "Main road repair work is in progress.",
    viewAll: "View All",
    complaintsTitle: "Ward Complaints",
    lockedWard: "Ward is locked",
    searchPlaceholder: "Search name, complaint or number",
    filterAll: "All Status",
    filterPending: "Pending",
    filterProgress: "In Progress",
    filterResolved: "Resolved",
    detailTitle: "Complaint Action",
    backToList: "Back to List",
    quickAction: "Quick Action",
    changeStatus: "Change Status",
    noteLabel: "Note",
    notePlaceholder: "Write today's action",
    saveAction: "Save Action",
    sendSms: "Send SMS",
    wardTitle: "My Ward",
    wardSummary: "Ward Summary",
    newAnnouncement: "New Announcement",
    announcementSubject: "Subject",
    announcementMessage: "Message",
    sendAnnouncement: "Send Announcement",
    recentAnnouncements: "Recent Announcements",
    monthlyTitle: "Monthly Analytics",
    monthComplaints: "Complaints This Month",
    monthResolved: "Resolved This Month",
    topCategory: "Top Category",
    resolutionRate: "Resolution Rate",
    categoryReport: "Category-wise Complaints",
    profileSub: "Account Info",
    profileTitle: "Profile",
    profileNote: "This role is limited to the selected ward.",
    noComplaints: "There are no complaints in this ward right now.",
    noMatch: "No complaints matched this search.",
    dataLoaded: "Ward complaints loaded.",
    actionSaved: "Action saved.",
    announcementSent: "Announcement sent.",
    backendOff: "Backend is off, complaints could not be loaded."
  }
};
// # TRANSLATIONS END

// # CATEGORY CONFIG START
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
// # CATEGORY CONFIG END

// # DEMO DATA START
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

// # UTILITY FUNCTIONS START
function t(key) {
  return translations[currentLanguage][key] || translations.mr[key] || key;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

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
  if (key === "resolved") return currentLanguage === "mr" ? "पूर्ण" : "Resolved";
  if (key === "progress") return currentLanguage === "mr" ? "कारवाई सुरू" : "In Progress";
  return currentLanguage === "mr" ? "प्रलंबित" : "Pending";
}

function wardLabel() {
  return `Ward ${selectedWard}`;
}

function getSavedActions() {
  return JSON.parse(localStorage.getItem(LOCAL_ACTION_KEY) || "{}");
}

function saveActions(actions) {
  localStorage.setItem(LOCAL_ACTION_KEY, JSON.stringify(actions));
}

function complaintId(complaint) {
  return String(complaint.id || complaint._id || "NA");
}

function categoryLabel(categoryKey) {
  const category = categories.find((item) => item.key === categoryKey) || categories[categories.length - 1];
  return currentLanguage === "mr" ? category.mr : category.en;
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
  return wardComplaints.reduce((counts, complaint) => {
    const key = complaintCategory(complaint);
    counts[key] = (counts[key] || 0) + 1;
    counts.all = (counts.all || 0) + 1;
    return counts;
  }, { all: wardComplaints.length });
}
// # UTILITY FUNCTIONS END

// # LANGUAGE FUNCTIONS START
function applyLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang === "mr" ? "mr" : "en";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });

  languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  renderAll();
}
// # LANGUAGE FUNCTIONS END

// # DATA FUNCTIONS START
async function loadComplaints() {
  try {
    const response = await fetch(
      loggedInNagarsevakId
        ? `https://seva-setu-complaint-app.onrender.com/nagarsevaks/${loggedInNagarsevakId}/complaints`
        : `${API_URL}/ward/${selectedWard}`
    );
    if (!response.ok) throw new Error("API not available");
    allComplaints = await response.json();
    applyLocalActions();
    showToast(t("dataLoaded"));
  } catch (error) {
    allComplaints = [];
    showToast(t("backendOff"));
  }

  filterWardComplaints();
  renderAll();
}

function applyLocalActions() {
  const actions = getSavedActions();
  allComplaints = allComplaints.map((complaint) => {
    const saved = actions[complaintId(complaint)];
    return saved ? { ...complaint, status: saved.status, actionNote: saved.note } : complaint;
  });
}

function filterWardComplaints() {
  wardComplaints = allComplaints.filter(
    (complaint) =>
      normalizeWard(complaint.ward || complaint.ward_id) === selectedWard
  );
  if (!selectedComplaintId && wardComplaints.length) {
    selectedComplaintId = complaintId(wardComplaints[0]);
  }
}
// # DATA FUNCTIONS END

// # RENDER FUNCTIONS START
function renderAll() {
  updateWardText();
  renderCategoryControls();
  renderStats();
  renderPriorityList();
  renderComplaints();
  renderDetail();
  renderWardSummary();
  renderAnnouncements();
  renderMonthlyAnalytics();
  renderProfile();
}

function updateWardText() {
  const name = representativeName.value.trim() || "Nagarsevak";
  const firstLetter = name.trim().charAt(0) || "N";
  const labels = ["activeWardLabel", "complaintsWardLabel", "detailWardLabel", "wardPageLabel", "announcementsWardLabel", "monthlyWardLabel", "mapLabel"];

  labels.forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.textContent = id === "mapLabel" ? `${wardLabel()} Complaint Map` : wardLabel();
  });

  document.getElementById("heroGreeting").textContent = currentLanguage === "mr" ? `नमस्कार, ${name}!` : `Hello, ${name}!`;
  document.getElementById("profileName").textContent = name;
  document.getElementById("profileRole").textContent = `${wardLabel()} Nagarsevak`;
  document.getElementById("avatarLetter").textContent = firstLetter;
  document.getElementById("bigAvatar").textContent = firstLetter;
  document.getElementById("navCount").textContent = wardComplaints.length;
}

function renderCategoryControls() {
  const counts = getCategoryCounts();

  categoryGrid.innerHTML = categories.map((category) => `
    <button class="category-tile ${category.className} ${selectedCategory === category.key ? "active" : ""}" type="button" data-category="${category.key}">
      <span class="category-logo"><i class="fa-solid ${category.icon}"></i></span>
      <strong>${currentLanguage === "mr" ? category.mr : category.en}</strong>
      <small>${counts[category.key] || 0}</small>
    </button>
  `).join("");

  categoryFilter.innerHTML = categories.map((category) => `
    <option value="${category.key}" ${selectedCategory === category.key ? "selected" : ""}>${currentLanguage === "mr" ? category.mr : category.en}</option>
  `).join("");
}

function renderStats() {
  document.getElementById("totalCount").textContent = wardComplaints.length;
  document.getElementById("pendingCount").textContent = wardComplaints.filter((item) => normalizeStatus(item.status) === "pending").length;
  document.getElementById("progressCount").textContent = wardComplaints.filter((item) => normalizeStatus(item.status) === "progress").length;
  document.getElementById("resolvedCount").textContent = wardComplaints.filter((item) => normalizeStatus(item.status) === "resolved").length;
}

function complaintCard(complaint, compact = false) {
  const statusKey = normalizeStatus(complaint.status);
  const categoryKey = complaintCategory(complaint);
  const category = categories.find((item) => item.key === categoryKey) || categories[categories.length - 1];
  const id = complaintId(complaint);
  const title = complaint.title || "Complaint";
  const citizen = complaint.citizen_name || complaint.citizenName || "Citizen";
  const description = complaint.description || "";

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
      ${compact ? "" : `<button class="open-complaint" type="button" data-id="${id}" aria-label="Open complaint"><i class="fa-solid fa-chevron-right"></i></button>`}
    </article>
  `;
}

function renderPriorityList() {
  const visible = wardComplaints.filter((item) => normalizeStatus(item.status) !== "resolved").slice(0, 3);
  priorityList.innerHTML = visible.length
    ? visible.map((item) => complaintCard(item, true)).join("")
    : `<div class="empty-state">${t("noComplaints")}</div>`;
}

function renderComplaints() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  let visible = wardComplaints;

  if (selectedCategory !== "all") {
    visible = visible.filter((item) => complaintCategory(item) === selectedCategory);
  }

  if (status !== "all") {
    visible = visible.filter((item) => normalizeStatus(item.status) === status);
  }

  if (query) {
    visible = visible.filter((item) => {
      const text = `${complaintId(item)} ${item.citizen_name || ""} ${item.title || ""} ${item.description || ""}`.toLowerCase();
      return text.includes(query);
    });
  }

  complaintsList.innerHTML = visible.length
    ? visible.map((item) => complaintCard(item)).join("")
    : `<div class="empty-state">${query ? t("noMatch") : t("noComplaints")}</div>`;
}

function renderDetail() {
  const complaint = wardComplaints.find((item) => complaintId(item) === selectedComplaintId) || wardComplaints[0];

  if (!complaint) {
    detailPanel.innerHTML = `<div class="empty-state">${t("noComplaints")}</div>`;
    return;
  }

  selectedComplaintId = complaintId(complaint);
  detailStatus.value = complaint.status || "Pending";
  actionNote.value = complaint.actionNote || "";

  const imageMarkup = complaint.image
    ? `<img src="${UPLOAD_URL}${complaint.image}" alt="Complaint photo">`
    : `<span>No photo uploaded</span>`;

  detailPanel.innerHTML = `
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

function renderWardSummary() {
  const pending = wardComplaints.filter((item) => normalizeStatus(item.status) === "pending").length;
  const progress = wardComplaints.filter((item) => normalizeStatus(item.status) === "progress").length;
  const resolved = wardComplaints.filter((item) => normalizeStatus(item.status) === "resolved").length;

  document.getElementById("wardSummary").innerHTML = `
    <div class="summary-row"><span>${t("statTotal")}</span><strong>${wardComplaints.length}</strong></div>
    <div class="summary-row"><span>${t("statPending")}</span><strong>${pending}</strong></div>
    <div class="summary-row"><span>${t("statProgress")}</span><strong>${progress}</strong></div>
    <div class="summary-row"><span>${t("statResolved")}</span><strong>${resolved}</strong></div>
  `;
}

function renderAnnouncements() {
  document.getElementById("announcementList").innerHTML = `
    <div><i class="fa-solid fa-broom"></i><span>${t("announceOne")}</span></div>
    <div><i class="fa-solid fa-droplet"></i><span>${t("announceTwo")}</span></div>
    <div><i class="fa-solid fa-road"></i><span>${t("announceThree")}</span></div>
  `;
}

function renderMonthlyAnalytics() {
  const grouped = wardComplaints.reduce((acc, complaint) => {
    const key = complaintCategory(complaint);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(grouped), 1);
  const resolved = wardComplaints.filter((item) => normalizeStatus(item.status) === "resolved").length;
  const top = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];

  document.getElementById("monthTotal").textContent = wardComplaints.length;
  document.getElementById("monthResolved").textContent = resolved;
  document.getElementById("topCategory").textContent = top ? categoryLabel(top[0]) : "-";
  document.getElementById("resolutionRate").textContent = wardComplaints.length ? `${Math.round((resolved / wardComplaints.length) * 100)}%` : "0%";

  document.getElementById("monthlyBars").innerHTML = Object.keys(grouped).length
    ? Object.entries(grouped).map(([title, count]) => `
      <div class="report-row">
        <strong>${categoryLabel(title)}</strong>
        <div class="bar-track"><span style="width:${(count / max) * 100}%"></span></div>
        <b>${count}</b>
      </div>
    `).join("")
    : `<div class="empty-state">${t("noComplaints")}</div>`;
}

function renderProfile() {
  const name = representativeName.value.trim() || "Nagarsevak";
  document.getElementById("profilePanelName").textContent = name;
  document.getElementById("profilePanelWard").textContent = `${wardLabel()} Nagarsevak | ${representativeMobile.value}`;
}
// # RENDER FUNCTIONS END

// # NAVIGATION FUNCTIONS START
function openView(viewName) {
  viewPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === viewName));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
// # NAVIGATION FUNCTIONS END

// # EVENT HANDLERS START
languageButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(NAGARSEVAK_LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim()
      })
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.detail || data.message || "Login failed");
    }

    loggedInNagarsevakId = data.nagarsevak.id;
    selectedWard = String(data.nagarsevak.ward_id);
    representativeName.value = data.nagarsevak.name;
    representativeMobile.value = data.nagarsevak.mobile_number || "";
    loginPage.hidden = true;
    dashboardPage.hidden = false;
    await loadComplaints();
    openView("overview");
  } catch (error) {
    showToast(error.message || "Login failed");
  }
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => openView(button.dataset.view));
});

document.querySelectorAll("[data-open-view]").forEach((button) => {
  button.addEventListener("click", () => openView(button.dataset.openView));
});

menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
refreshButton.addEventListener("click", loadComplaints);

logoutButton.addEventListener("click", () => {
  dashboardPage.hidden = true;
  loginPage.hidden = false;
});

categoryGrid.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-category]");
  if (!tile) return;
  selectedCategory = tile.dataset.category;
  categoryFilter.value = selectedCategory;
  renderAll();
  openView("complaints");
});

clearCategoryButton.addEventListener("click", () => {
  selectedCategory = "all";
  categoryFilter.value = "all";
  renderAll();
  openView("complaints");
});

searchInput.addEventListener("input", renderComplaints);
categoryFilter.addEventListener("change", () => {
  selectedCategory = categoryFilter.value;
  renderAll();
});
statusFilter.addEventListener("change", renderComplaints);

complaintsList.addEventListener("click", (event) => {
  const button = event.target.closest(".open-complaint");
  if (!button) return;
  selectedComplaintId = button.dataset.id;
  renderDetail();
  openView("detail");
});

saveActionButton.addEventListener("click", async () => {
  if (!selectedComplaintId) return;
  try {
    const endpoint = loggedInNagarsevakId
      ? `https://seva-setu-complaint-app.onrender.com/nagarsevaks/${loggedInNagarsevakId}/complaints/${selectedComplaintId}`
      : `${API_URL}/${selectedComplaintId}`;
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: detailStatus.value,
        notes: actionNote.value.trim()
      })
    });
    if (!response.ok) throw new Error("Save failed");
    await loadComplaints();
    showToast(t("actionSaved"));
  } catch {
    showToast("Action save failed.");
  }
});

sendAnnouncementButton.addEventListener("click", () => {
  showToast(t("announcementSent"));
});
// # EVENT HANDLERS END

// # INITIALIZATION START
applyLanguage("mr");
// # INITIALIZATION END
