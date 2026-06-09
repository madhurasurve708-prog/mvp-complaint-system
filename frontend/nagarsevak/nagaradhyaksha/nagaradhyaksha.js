// # CONFIG START
const API_URL = "http://127.0.0.1:8000/complaints";
const ANNOUNCEMENTS_API = "http://127.0.0.1:8000/announcements";
const LOCAL_ACTION_KEY = "nagarsevakComplaintActions";
const ANNOUNCEMENT_KEY = "nagaradhyakshaAnnouncements";
// # CONFIG END

// # STATE START
const state = {
  currentPage: "overview",
  previousPage: "overview",
  selectedWard: "all",
  selectedCategory: "all",
  announcementAudience: "citizen",
  allComplaints: [],
  announcements: []
};
// # STATE END

// # DOM REFERENCES START
const viewContainer = document.getElementById("viewContainer");
const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const backButton = document.getElementById("backButton");
const toast = document.getElementById("toast");
const presidentLogin = document.getElementById("presidentLogin");
const presidentPage = document.getElementById("presidentPage");
const presidentLoginForm = document.getElementById("presidentLoginForm");
// # DOM REFERENCES END

// # WARD DATA START
const wards = [
  { id: "1", name: "बाजारपेठ", nagarsevak: "सुरेश पाटील", focus: "कचरा व पाणीपुरवठा" },
  { id: "2", name: "किनारपट्टी", nagarsevak: "माधुरी सावंत", focus: "स्वच्छता व रस्ते" },
  { id: "3", name: "मालवण मध्य", nagarsevak: "अमित नाईक", focus: "ड्रेनेज व वाहतूक" },
  { id: "4", name: "देऊळवाडा", nagarsevak: "प्रिया परब", focus: "स्ट्रीट लाईट" },
  { id: "5", name: "दांडी", nagarsevak: "विकास कदम", focus: "रस्ते व आरोग्य" },
  { id: "6", name: "चिवला", nagarsevak: "निलेश चव्हाण", focus: "पाणीगळती" },
  { id: "7", name: "मेढा", nagarsevak: "स्नेहा रेडकर", focus: "नागरिक सुरक्षा" },
  { id: "8", name: "भरड", nagarsevak: "रोहित गावडे", focus: "वाहतूक" },
  { id: "9", name: "तारकर्ली मार्ग", nagarsevak: "किरण साळगावकर", focus: "गटार" },
  { id: "10", name: "मुख्य रस्ता", nagarsevak: "मेघा मोरे", focus: "दिवे व रस्ते" }
];
// # WARD DATA END

// # CATEGORY DATA START
const categories = [
  { key: "all", label: "सर्व", icon: "fa-table-cells-large", className: "blue", keywords: [] },
  { key: "water", label: "पाणी", icon: "fa-droplet", className: "blue", keywords: ["water", "paani", "पाणी"] },
  { key: "garbage", label: "कचरा", icon: "fa-trash-can", className: "green", keywords: ["garbage", "waste", "trash", "कचरा"] },
  { key: "street-lights", label: "रस्त्यावरील दिवे", icon: "fa-lightbulb", className: "orange", keywords: ["light", "street light", "दिवे"] },
  { key: "road", label: "रस्ता", icon: "fa-road", className: "blue", keywords: ["road", "pothole", "रस्ता", "खड्ड"] },
  { key: "gutter", label: "गटार", icon: "fa-water", className: "green", keywords: ["gutter", "drain", "गटार"] },
  { key: "animals", label: "भटकी जनावरे", icon: "fa-shield-heart", className: "orange", keywords: ["dog", "animal", "जनावरे"] },
  { key: "traffic", label: "वाहतूक समस्या", icon: "fa-traffic-light", className: "red", keywords: ["traffic", "वाहतूक"] },
  { key: "drainage", label: "नाले / पाणी साचणे", icon: "fa-person-digging", className: "green", keywords: ["drainage", "overflow", "नाले"] },
  { key: "tree", label: "झाड समस्या", icon: "fa-tree", className: "green", keywords: ["tree", "branch", "झाड"] },
  { key: "other", label: "इतर", icon: "fa-circle-plus", className: "purple", keywords: ["other", "इतर"] }
];
// # CATEGORY DATA END

// # DEMO COMPLAINTS START
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
// # DEMO COMPLAINTS END

// # UTILS START
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
  if (key === "resolved") return "पूर्ण";
  if (key === "progress") return "कारवाई सुरू";
  return "प्रलंबित";
}

function complaintId(complaint) {
  return String(complaint.id || complaint._id || "NA");
}

function wardInfo(wardId) {
  return wards.find((ward) => ward.id === normalizeWard(wardId)) || wards[0];
}

function wardLabel(wardId) {
  const ward = wardInfo(wardId);
  return `वॉर्ड ${ward.id} - ${ward.name}`;
}

function complaintCategory(complaint) {
  if (complaint.category && categories.some((item) => item.key === complaint.category)) return complaint.category;
  const text = `${complaint.title || ""} ${complaint.description || ""}`.toLowerCase();
  const match = categories.find((category) => category.key !== "all" && category.key !== "other" && category.keywords.some((keyword) => text.includes(keyword.toLowerCase())));
  return match ? match.key : "other";
}

function categoryInfo(key) {
  return categories.find((item) => item.key === key) || categories[categories.length - 1];
}

function getSavedActions() {
  return JSON.parse(localStorage.getItem(LOCAL_ACTION_KEY) || "{}");
}

function applyLocalActions(complaints) {
  const actions = getSavedActions();
  return complaints.map((complaint) => {
    const saved = actions[complaintId(complaint)];
    return saved ? { ...complaint, status: saved.status, actionNote: saved.note } : complaint;
  });
}

function getAnnouncements() {
  return [
    { type: "citizen", ward: "1", subject: "बाजारपेठ स्वच्छता मोहीम", message: "शनिवारी सकाळी ७ ते १० बाजारपेठ स्वच्छता मोहीम राबवली जाईल." },
    { type: "citizen", ward: "all", subject: "पाणीपुरवठा सूचना", message: "उद्या सकाळच्या पाणीपुरवठ्याच्या वेळेत बदल असेल." },
    { type: "nagarsevak", ward: "all", subject: "मासिक आढावा बैठक", message: "सर्व नगरसेवकांनी सोमवार सकाळी ११ वाजता आढावा बैठकीला उपस्थित राहावे." },
    ...state.announcements
  ];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2300);
}
// # UTILS END

// # DATA START
async function loadComplaints() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API not available");
    state.allComplaints = applyLocalActions(await response.json());
    showToast("Backend मधून सर्व वॉर्डची माहिती लोड झाली.");
  } catch (error) {
    state.allComplaints = applyLocalActions(demoComplaints);
    showToast("Backend बंद आहे, नगरसेवक demo data दाखवत आहे.");
  }
}

async function loadAnnouncements() {
  try {
    const response = await fetch(ANNOUNCEMENTS_API);
    if (!response.ok) throw new Error("Announcements API not available");
    state.announcements = await response.json();
  } catch (error) {
    state.announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY) || "[]");
  }
}
// # DATA END

// # CALCULATIONS START
function filteredComplaints() {
  return state.allComplaints.filter((complaint) => {
    const wardMatch = state.selectedWard === "all" || normalizeWard(complaint.ward) === state.selectedWard;
    const categoryMatch = state.selectedCategory === "all" || complaintCategory(complaint) === state.selectedCategory;
    return wardMatch && categoryMatch;
  });
}

function wardStats(wardId) {
  const complaints = state.allComplaints.filter((item) => normalizeWard(item.ward) === wardId);
  const resolved = complaints.filter((item) => normalizeStatus(item.status) === "resolved").length;
  const pending = complaints.filter((item) => normalizeStatus(item.status) === "pending").length;
  const progress = complaints.filter((item) => normalizeStatus(item.status) === "progress").length;
  const score = complaints.length ? Math.round((resolved / complaints.length) * 100) : 100;
  return { total: complaints.length, resolved, pending, progress, score };
}

function cityStats() {
  const total = state.allComplaints.length;
  const pending = state.allComplaints.filter((item) => normalizeStatus(item.status) === "pending").length;
  const progress = state.allComplaints.filter((item) => normalizeStatus(item.status) === "progress").length;
  const resolved = state.allComplaints.filter((item) => normalizeStatus(item.status) === "resolved").length;
  const rate = total ? Math.round((resolved / total) * 100) : 0;
  return { total, pending, progress, resolved, rate };
}

function categoryCounts() {
  return state.allComplaints.reduce((counts, complaint) => {
    const key = complaintCategory(complaint);
    counts[key] = (counts[key] || 0) + 1;
    counts.all = (counts.all || 0) + 1;
    return counts;
  }, { all: state.allComplaints.length });
}

function bestWards() {
  return wards
    .map((ward) => ({ ...ward, stats: wardStats(ward.id) }))
    .sort((a, b) => b.stats.score - a.stats.score || b.stats.resolved - a.stats.resolved);
}
// # CALCULATIONS END

// # CARD RENDERERS START
function statCard(icon, color, label, value, subtext) {
  return `
    <article class="stat-card">
      <i class="fa-solid ${icon} ${color}"></i>
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${subtext}</small>
    </article>
  `;
}

function complaintCard(complaint) {
  const category = categoryInfo(complaintCategory(complaint));
  const statusKey = normalizeStatus(complaint.status);
  return `
    <article class="complaint-card">
      <div class="tile-icon ${category.className}"><i class="fa-solid ${category.icon}"></i></div>
      <div>
        <h3>${complaint.title || "Complaint"}</h3>
        <p>${complaint.description || ""}</p>
        <div class="meta-row">
          <span>#${complaintId(complaint)}</span>
          <span><i class="fa-regular fa-user"></i> ${complaint.citizen_name || "Citizen"}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${wardLabel(complaint.ward)}</span>
          <span>${category.label}</span>
          <span class="badge ${statusKey}">${statusLabel(complaint.status)}</span>
        </div>
      </div>
      <button class="icon-btn" type="button" data-page="categories" aria-label="तक्रार पहा">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </article>
  `;
}

function wardCard(ward) {
  const stats = wardStats(ward.id);
  return `
    <button class="ward-card" type="button" data-ward="${ward.id}">
      <div>
        <strong>${wardLabel(ward.id)}</strong>
        <span>नगरसेवक: ${ward.nagarsevak}</span>
        <small>${ward.focus} | ${stats.total} तक्रारी</small>
      </div>
      <b>${stats.score}%</b>
      <div class="progress"><span style="width:${stats.score}%"></span></div>
    </button>
  `;
}
// # CARD RENDERERS END

// # PAGE RENDERERS START
function renderOverview() {
  const stats = cityStats();
  const best = bestWards()[0];
  return `
    <!-- # OVERVIEW HERO START -->
    <section class="hero-panel">
      <div>
        <p>सकाळचा शहर आढावा</p>
        <h1>मालवणची प्रत्येक तक्रार, वॉर्ड आणि घोषणा एका ठिकाणी.</h1>
        <span>स्वच्छ किनारा, सक्षम नागरिक, सुंदर मालवण.</span>
      </div>
      <div class="hero-actions">
        <button class="primary-btn" type="button" data-page="wards"><i class="fa-solid fa-map-location-dot"></i>वॉर्ड पहा</button>
        <button class="secondary-btn" type="button" data-page="announcements"><i class="fa-solid fa-bullhorn"></i>घोषणा करा</button>
      </div>
    </section>
    <!-- # OVERVIEW HERO END -->

    <!-- # OVERVIEW STATS START -->
    <section class="stats-grid" aria-label="शहर सारांश">
      ${statCard("fa-file-lines", "blue", "एकूण तक्रारी", stats.total, "सर्व वॉर्डमधून आलेल्या")}
      ${statCard("fa-hourglass-half", "orange", "प्रलंबित", stats.pending, "तातडीने पाहण्यासारख्या")}
      ${statCard("fa-spinner", "purple", "कारवाई सुरू", stats.progress, "काम चालू आहे")}
      ${statCard("fa-check", "green", "निवारण दर", `${stats.rate}%`, `${stats.resolved} तक्रारी पूर्ण`)}
    </section>
    <!-- # OVERVIEW STATS END -->

    <!-- # OVERVIEW PANELS START -->
    <section class="content-grid">
      <div class="panel">
        <div class="panel-head">
          <div><h2>सर्व वॉर्डची झटपट स्थिती</h2><p>क्लिक केल्यावर त्या वॉर्डचे पेज उघडेल.</p></div>
          <button class="small-btn" type="button" data-page="wards">सर्व पहा</button>
        </div>
        <div class="ward-list">${wards.slice(0, 5).map(wardCard).join("")}</div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div><h2>सर्वोत्तम वॉर्ड</h2><p>या महिन्यातील कामगिरी.</p></div>
        </div>
        <div class="best-list">
          <article class="best-card">
            <div class="tile-icon green"><i class="fa-solid fa-trophy"></i></div>
            <h3>${wardLabel(best.id)}</h3>
            <p>${best.nagarsevak} यांनी ${best.stats.score}% निवारण दर राखला आहे.</p>
          </article>
        </div>
      </div>
    </section>
    <!-- # OVERVIEW PANELS END -->
  `;
}

function renderWards() {
  return `
    <!-- # WARDS PAGE START -->
    <section class="page-heading">
      <div><h1>वॉर्ड विभाग</h1><p>सर्व १० वॉर्डचे काम, तक्रारी आणि निवारण दर.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>आढाव्याकडे</button>
    </section>
    <section class="panel">
      <div class="ward-list">${wards.map(wardCard).join("")}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2 id="wardDetailTitle">${state.selectedWard === "all" ? "वॉर्ड निवडा" : wardLabel(state.selectedWard)}</h2><p>वॉर्ड कार्ड क्लिक केल्यावर येथे माहिती बदलेल.</p></div></div>
      <div id="wardDetail">${renderWardDetail()}</div>
    </section>
    <!-- # WARDS PAGE END -->
  `;
}

function renderWardDetail() {
  const selected = state.selectedWard === "all" ? wards[0].id : state.selectedWard;
  const ward = wardInfo(selected);
  const stats = wardStats(selected);
  const complaints = state.allComplaints.filter((item) => normalizeWard(item.ward) === selected);
  return `
    <section class="stats-grid">
      ${statCard("fa-file-lines", "blue", "तक्रारी", stats.total, ward.focus)}
      ${statCard("fa-hourglass-half", "orange", "प्रलंबित", stats.pending, "नगरसेवक फॉलोअप")}
      ${statCard("fa-spinner", "purple", "कारवाई सुरू", stats.progress, "काम सुरू")}
      ${statCard("fa-check", "green", "पूर्ण", stats.resolved, `${stats.score}% दर`)}
    </section>
    <div class="complaints-list">
      ${complaints.length ? complaints.map(complaintCard).join("") : `<div class="empty-state">या वॉर्डमध्ये तक्रारी नाहीत.</div>`}
    </div>
  `;
}

function renderCategories() {
  const counts = categoryCounts();
  const complaints = filteredComplaints();
  return `
    <!-- # CATEGORY PAGE START -->
    <section class="page-heading">
      <div><h1>विभागनिहाय तक्रारी</h1><p>मॅडम विभाग निवडतील तेव्हा प्रत्येक तक्रारीखाली वॉर्ड क्रमांक दिसेल.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="panel">
      <div class="category-grid">
        ${categories.map((category) => `
          <button class="category-tile ${state.selectedCategory === category.key ? "active" : ""}" type="button" data-category="${category.key}">
            <i class="fa-solid ${category.icon}"></i>
            <strong>${category.label}</strong>
            <small>${counts[category.key] || 0}</small>
          </button>
        `).join("")}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><h2>${categoryInfo(state.selectedCategory).label} तक्रारी</h2><p>सर्व वॉर्डमधील निवडलेल्या विभागाच्या तक्रारी.</p></div>
        <select id="categoryWardFilter" aria-label="वॉर्ड फिल्टर">
          <option value="all">सर्व वॉर्ड</option>
          ${wards.map((ward) => `<option value="${ward.id}" ${state.selectedWard === ward.id ? "selected" : ""}>${wardLabel(ward.id)}</option>`).join("")}
        </select>
      </div>
      <div class="complaints-list">
        ${complaints.length ? complaints.map(complaintCard).join("") : `<div class="empty-state">या फिल्टरमध्ये तक्रारी नाहीत.</div>`}
      </div>
    </section>
    <!-- # CATEGORY PAGE END -->
  `;
}

function renderAnnouncements() {
  const announcements = getAnnouncements().filter((item) => (item.type || item.audience) === state.announcementAudience);
  return `
    <!-- # ANNOUNCEMENT PAGE START -->
    <section class="page-heading">
      <div><h1>घोषणा</h1><p>नागरिकांसाठी वॉर्डनिहाय किंवा नगरसेवकांसाठी स्वतंत्र घोषणा.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="content-grid">
      <div class="panel">
        <div class="panel-head">
          <div><h2>नवीन घोषणा</h2><p>दोन प्रकार: नागरिक वॉर्डनिहाय आणि नगरसेवक.</p></div>
          <div class="announcement-tabs">
            <button class="tab-btn ${state.announcementAudience === "citizen" ? "active" : ""}" type="button" data-audience="citizen">नागरिक</button>
            <button class="tab-btn ${state.announcementAudience === "nagarsevak" ? "active" : ""}" type="button" data-audience="nagarsevak">नगरसेवक</button>
          </div>
        </div>
        <form id="announcementForm">
          <div class="field-grid">
            <label>
              <span>वॉर्ड</span>
              <select id="announcementWard">
                <option value="all">सर्व वॉर्ड</option>
                ${wards.map((ward) => `<option value="${ward.id}">${wardLabel(ward.id)}</option>`).join("")}
              </select>
            </label>
            <label>
              <span>विषय</span>
              <input id="announcementSubject" type="text" placeholder="घोषणेचा विषय" required>
            </label>
          </div>
          <label>
            <span>संदेश</span>
            <textarea id="announcementMessage" placeholder="घोषणेचा संदेश लिहा" required></textarea>
          </label>
          <button class="primary-btn" type="submit"><i class="fa-solid fa-paper-plane"></i>घोषणा पाठवा</button>
        </form>
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>अलीकडील घोषणा</h2><p>${state.announcementAudience === "citizen" ? "नागरिकांसाठी" : "नगरसेवकांसाठी"}</p></div></div>
        <div class="announcement-list">
          ${announcements.map((item) => `
            <article class="announcement-card ${item.type || item.audience}">
              <strong>${item.subject}</strong>
              <span>${item.ward === "all" ? "सर्व वॉर्ड" : wardLabel(item.ward)} | ${item.message}</span>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    <!-- # ANNOUNCEMENT PAGE END -->
  `;
}

function renderBestWard() {
  const ranked = bestWards();
  return `
    <!-- # BEST WARD PAGE START -->
    <section class="page-heading">
      <div><h1>सर्वोत्तम वॉर्ड</h1><p>निवारण दर, पूर्ण तक्रारी आणि कमी प्रलंबित कामावर आधारित.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="panel">
      <div class="best-list">
        ${ranked.map((ward, index) => `
          <article class="best-card">
            <div class="meta-row"><span class="badge ${index === 0 ? "resolved" : "progress"}">क्रमांक ${index + 1}</span><span>${ward.nagarsevak}</span></div>
            <h2>${wardLabel(ward.id)}</h2>
            <p>${ward.stats.score}% निवारण दर | ${ward.stats.resolved} पूर्ण | ${ward.stats.pending} प्रलंबित</p>
            <div class="progress"><span style="width:${ward.stats.score}%"></span></div>
          </article>
        `).join("")}
      </div>
    </section>
    <!-- # BEST WARD PAGE END -->
  `;
}

function renderMonthly() {
  const counts = categoryCounts();
  const max = Math.max(...Object.values(counts), 1);
  const stats = cityStats();
  return `
    <!-- # MONTHLY ANALYTICS PAGE START -->
    <section class="page-heading">
      <div><h1>मासिक विश्लेषण</h1><p>शहरातील तक्रारी, विभाग आणि निवारण दर.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="stats-grid">
      ${statCard("fa-calendar-days", "blue", "या महिन्यात", stats.total, "तक्रारी")}
      ${statCard("fa-check-double", "green", "पूर्ण", stats.resolved, "निकाली तक्रारी")}
      ${statCard("fa-hourglass-half", "orange", "प्रलंबित", stats.pending, "फॉलोअप आवश्यक")}
      ${statCard("fa-gauge-high", "purple", "निवारण दर", `${stats.rate}%`, "सर्व वॉर्ड")}
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>विभागनिहाय मासिक अहवाल</h2><p>विभागावर क्लिक केल्यास त्या तक्रारी दिसतील.</p></div></div>
      <div class="analytics-list">
        ${categories.filter((item) => item.key !== "all").map((category) => `
          <button class="ward-card" type="button" data-category="${category.key}">
            <div><strong>${category.label}</strong><span>${counts[category.key] || 0} तक्रारी</span></div>
            <b>${counts[category.key] || 0}</b>
            <div class="progress"><span style="width:${((counts[category.key] || 0) / max) * 100}%"></span></div>
          </button>
        `).join("")}
      </div>
    </section>
    <!-- # MONTHLY ANALYTICS PAGE END -->
  `;
}

function renderProfile() {
  return `
    <!-- # PROFILE SETTINGS PAGE START -->
    <section class="page-heading">
      <div><h1>प्रोफाइल सेटिंग्ज</h1><p>नगराध्यक्ष खाते, सूचना आणि सुरक्षा सेटिंग्ज.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="profile-layout">
      <article class="panel profile-card">
        <img src="../../../uploads/WhatsApp Image 2026-04-24 at 5.11.03 PM.jpeg" alt="नगराध्यक्ष प्रोफाइल फोटो">
        <h2>सौ. माधुरा मॅडम</h2>
        <p>नगराध्यक्ष | मालवण नगरपरिषद</p>
      </article>
      <section class="panel">
        <div class="panel-head"><div><h2>सेटिंग्ज</h2><p>साइडबारमध्ये कायम दिसणारे प्रोफाइल सेटिंग्ज पेज.</p></div></div>
        <div class="settings-list">
          <article class="setting-row"><div class="tile-icon blue"><i class="fa-regular fa-user"></i></div><div><strong>पूर्ण नाव</strong><span>सौ. माधुरा मॅडम</span></div><button class="small-btn" type="button">बदला</button></article>
          <article class="setting-row"><div class="tile-icon green"><i class="fa-solid fa-phone"></i></div><div><strong>मोबाईल क्रमांक</strong><span>9876543210</span></div><button class="small-btn" type="button">बदला</button></article>
          <article class="setting-row"><div class="tile-icon orange"><i class="fa-regular fa-bell"></i></div><div><strong>घोषणा सूचना</strong><span>महत्त्वाच्या अपडेट्स दाखवा.</span></div><label class="switch"><input type="checkbox" checked><span></span></label></article>
          <article class="setting-row"><div class="tile-icon purple"><i class="fa-solid fa-shield-halved"></i></div><div><strong>सुरक्षा</strong><span>प्रोफाइल आणि शहर डेटा सुरक्षित.</span></div><button class="small-btn" type="button">तपासा</button></article>
        </div>
      </section>
    </section>
    <!-- # PROFILE SETTINGS PAGE END -->
  `;
}
// # PAGE RENDERERS END

// # NAVIGATION START
const pageTitles = {
  overview: "नगराध्यक्ष डॅशबोर्ड",
  wards: "वॉर्ड विभाग",
  categories: "विभागनिहाय तक्रारी",
  announcements: "घोषणा",
  best: "सर्वोत्तम वॉर्ड",
  monthly: "मासिक विश्लेषण",
  profile: "प्रोफाइल सेटिंग्ज"
};

const pageRenderers = {
  overview: renderOverview,
  wards: renderWards,
  categories: renderCategories,
  announcements: renderAnnouncements,
  best: renderBestWard,
  monthly: renderMonthly,
  profile: renderProfile
};

function openPage(page, options = {}) {
  if (!pageRenderers[page]) return;
  if (!options.skipPrevious) state.previousPage = state.currentPage;
  state.currentPage = page;
  pageTitle.textContent = pageTitles[page];
  viewContainer.innerHTML = pageRenderers[page]();
  document.querySelectorAll("[data-page]").forEach((node) => {
    if (node.closest(".side-nav")) node.classList.toggle("active", node.dataset.page === page);
  });
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
// # NAVIGATION END

// # EVENTS START
presidentLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("presidentUsername").value.trim().toLowerCase();
  const password = document.getElementById("presidentPassword").value.trim();
  if (username !== "nagaradhyaksha" || password !== "123456") {
    showToast("Please enter correct Nagaradhyaksha login details.");
    return;
  }
  presidentLogin.hidden = true;
  presidentPage.hidden = false;
  showToast("Nagaradhyaksha dashboard opened.");
});

menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

backButton.addEventListener("click", () => {
  if (state.currentPage !== "overview") {
    openPage(state.previousPage || "overview", { skipPrevious: true });
  } else {
    window.location.href = "../index.html";
  }
});

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    openPage(pageButton.dataset.page);
    return;
  }

  const profileShortcut = event.target.closest("[data-page-shortcut]");
  if (profileShortcut) {
    openPage(profileShortcut.dataset.pageShortcut);
    return;
  }

  const wardButton = event.target.closest("[data-ward]");
  if (wardButton) {
    state.selectedWard = wardButton.dataset.ward;
    state.selectedCategory = "all";
    openPage("wards");
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.selectedCategory = categoryButton.dataset.category;
    openPage("categories");
    return;
  }

  const audienceButton = event.target.closest("[data-audience]");
  if (audienceButton) {
    state.announcementAudience = audienceButton.dataset.audience;
    openPage("announcements", { skipPrevious: true });
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "categoryWardFilter") {
    state.selectedWard = event.target.value;
    openPage("categories", { skipPrevious: true });
  }
});

document.addEventListener("submit", async (event) => {
  if (event.target.id !== "announcementForm") return;
  event.preventDefault();

  const payload = {
    audience: state.announcementAudience,
    ward: document.getElementById("announcementWard").value,
    subject: document.getElementById("announcementSubject").value.trim(),
    message: document.getElementById("announcementMessage").value.trim(),
    created_by: "nagaradhyaksha"
  };

  try {
    const response = await fetch(ANNOUNCEMENTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Announcement save failed");
    const savedAnnouncement = await response.json();
    state.announcements.unshift(savedAnnouncement);
  } catch (error) {
    const saved = JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY) || "[]");
    saved.unshift({ ...payload, type: payload.audience });
    localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(saved));
    state.announcements = saved;
  }

  showToast("घोषणा सेव्ह झाली.");
  openPage("announcements", { skipPrevious: true });
});
// # EVENTS END

// # INITIALIZATION START
Promise.all([loadComplaints(), loadAnnouncements()]).then(() => openPage("overview", { skipPrevious: true }));
// # INITIALIZATION END
