// # CONFIG START
const API_URL = "http://127.0.0.1:8000/complaints";
const ANNOUNCEMENTS_API = "http://127.0.0.1:8000/announcements";
const WARD_API = "http://127.0.0.1:8000/wards"; // New endpoint for ward-specific complaints
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

/**
 * ADDED: Get ward statistics (total, pending, in-progress, resolved)
 * Used for displaying ward overview cards
 */
function getWardStatistics(wardId) {
  const complaints = state.allComplaints.filter(c => String(c.ward) === String(wardId));
  return {
    total: complaints.length,
    pending: complaints.filter(c => c.status.toLowerCase().includes("pending") || c.status.toLowerCase().includes("प्रलंबित")).length,
    progress: complaints.filter(c => c.status.toLowerCase().includes("progress") || c.status.toLowerCase().includes("कारवाई")).length,
    resolved: complaints.filter(c => c.status.toLowerCase().includes("resolve") || c.status.toLowerCase().includes("पूर्ण")).length
  };
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

// # PAGE RENDERERS START
function renderOverview() {
  const totalComplaints = state.allComplaints.length;
  const pendingComplaints = state.allComplaints.filter(c => normalizeStatus(c.status) === "pending").length;
  const progressComplaints = state.allComplaints.filter(c => normalizeStatus(c.status) === "progress").length;
  const resolvedComplaints = state.allComplaints.filter(c => normalizeStatus(c.status) === "resolved").length;

  const announcementCount = getAnnouncements().length;

  return `
    <!-- # OVERVIEW PAGE START -->
    <section class="hero-panel">
      <div>
        <p>स्वच्छ किनारा, सक्षम नागरिक, सुंदर मालवण</p>
        <h1>मालवण नगरपरिषद</h1>
        <span>Smart Public Complaint System</span>
      </div>
      <div style="font-size: 80px;"><i class="fa-solid fa-chart-pie"></i></div>
    </section>
    <section class="stats-grid">
      <article class="stat-card">
        <div class="tile-icon blue"><i class="fa-solid fa-list-check"></i></div>
        <strong>${totalComplaints}</strong>
        <span>एकूण तक्रारी</span>
      </article>
      <article class="stat-card">
        <div class="tile-icon orange"><i class="fa-solid fa-hourglass-end"></i></div>
        <strong>${pendingComplaints}</strong>
        <span>प्रलंबित</span>
      </article>
      <article class="stat-card">
        <div class="tile-icon teal"><i class="fa-solid fa-spinner"></i></div>
        <strong>${progressComplaints}</strong>
        <span>कारवाई सुरू</span>
      </article>
      <article class="stat-card">
        <div class="tile-icon green"><i class="fa-solid fa-check-circle"></i></div>
        <strong>${resolvedComplaints}</strong>
        <span>पूर्ण</span>
      </article>
    </section>
    <section class="content-grid">
      <article class="panel">
        <div class="panel-head"><div><h2>वॉर्ड विभाग</h2><p>सर्व १० वॉर्डचा आढावा आणि तक्रारीची माहिती.</p></div></div>
        <div class="ward-list">
          ${wards.map(ward => {
            const stats = getWardStatistics(ward.id);
            const progressPercent = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
            return `
            <!-- MODIFIED: Added onclick handler to navigate to ward.html with ward ID parameter -->
            <article class="ward-card" onclick="window.location.href='ward.html?ward=${ward.id}'" style="cursor: pointer;">
              <div>
                <strong>${ward.name}</strong>
                <span>वॉर्ड ${ward.id}</span>
                <small>नगरसेवक: ${ward.nagarsevak}</small>
              </div>
              <div style="text-align: right;">
                <strong style="color: var(--blue); font-size: 24px;">${stats.total}</strong>
                <span style="display: block; font-size: 12px;">तक्रारी</span>
              </div>
              <div class="progress"><span style="width: ${progressPercent}%"></span></div>
            </article>
            `;
          }).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>घोषणा</h2><p>नागरिकांसाठी महत्त्वाच्या अपडेट्स.</p></div></div>
        <div class="announcement-list">
          ${getAnnouncements().slice(0, 5).map(announcement => `
          <article class="announcement-card">
            <strong>${announcement.subject}</strong>
            <span>${announcement.message}</span>
          </article>
          `).join("")}
        </div>
      </article>
    </section>
    <!-- # OVERVIEW PAGE END -->
  `;
}

function renderWards() {
  return `
    <!-- # WARDS PAGE START -->
    <section class="page-heading">
      <div><h1>वॉर्ड विभाग</h1><p>सर्व वॉर्डचा तपशीलवार आढावा.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <div class="ward-list">
      ${wards.map(ward => {
        const stats = getWardStatistics(ward.id);
        const progressPercent = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
        return `
        <!-- MODIFIED: Added onclick handler for navigation -->
        <article class="ward-card" onclick="window.location.href='ward.html?ward=${ward.id}'" style="cursor: pointer;">
          <div>
            <strong>${ward.name}</strong>
            <span>वॉर्ड ${ward.id}</span>
            <small>नगरसेवक: ${ward.nagarsevak}</small>
            <small style="margin-top: 4px;">लक्ष्य: ${ward.focus}</small>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 8px;">
              <div style="font-size: 14px; color: var(--muted); margin-bottom: 2px;">
                <i class="fa-solid fa-list-check"></i> ${stats.total}
              </div>
              <div style="font-size: 12px; color: var(--muted);">
                <i class="fa-solid fa-check" style="color: var(--green);"></i> ${stats.resolved} पूर्ण
              </div>
            </div>
          </div>
          <div class="progress"><span style="width: ${progressPercent}%"></span></div>
        </article>
        `;
      }).join("")}
    </div>
    <!-- # WARDS PAGE END -->
  `;
}

function renderCategories() {
  const filteredByCategory = state.selectedCategory === "all" 
    ? state.allComplaints 
    : state.allComplaints.filter(c => complaintCategory(c) === state.selectedCategory);

  const wardFilter = state.selectedWard && state.selectedWard !== "all" 
    ? filteredByCategory.filter(c => String(c.ward) === String(state.selectedWard))
    : filteredByCategory;

  return `
    <!-- # CATEGORIES PAGE START -->
    <section class="page-heading">
      <div><h1>विभागनिहाय तक्रारी</h1><p>तक्रारी प्रकार नुसार फिल्टर करा.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>विभाग निवडा</h2><p>आपल्या इच्छेचे विभाग निवडा.</p></div></div>
      <div class="category-grid">
        ${categories.map(category => {
          const count = state.allComplaints.filter(c => complaintCategory(c) === category.key || (category.key === "all" && true)).length;
          return `
          <button class="category-tile ${state.selectedCategory === category.key ? 'active' : ''}" type="button" data-category="${category.key}">
            <i class="fa-solid ${category.icon}"></i>
            <span>${category.label}</span>
            <small>${category.key === "all" ? state.allComplaints.length : state.allComplaints.filter(c => complaintCategory(c) === category.key).length}</small>
          </button>
          `;
        }).join("")}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>तक्रारी</h2><p>निवडलेल्या प्रकारची ${wardFilter.length} तक्रारी.</p></div></div>
      <div class="complaints-list">
        ${wardFilter.length > 0 ? wardFilter.map(complaint => `
        <article class="complaint-card">
          <div class="tile-icon blue"><i class="fa-solid fa-exclamation"></i></div>
          <div>
            <h3>${complaint.title || 'तक्रारी'}</h3>
            <p>${complaint.description || 'विवरण उपलब्ध नाही'}</p>
            <div class="meta-row">
              <span class="badge ${normalizeStatus(complaint.status)}">${statusLabel(complaint.status)}</span>
              <span>${wardLabel(complaint.ward)}</span>
              <span>${complaintId(complaint)}</span>
            </div>
          </div>
        </article>
        `).join("") : `<div class="empty-state"><p>कोणतीही तक्रारी नाही.</p></div>`}
      </div>
    </section>
    <!-- # CATEGORIES PAGE END -->
  `;
}

function renderAnnouncements() {
  const filteredAnnouncements = state.announcementAudience === "citizen" 
    ? getAnnouncements().filter(a => a.type === "citizen" || a.type === "all")
    : getAnnouncements().filter(a => a.type === "nagarsevak" || a.type === "all");

  return `
    <!-- # ANNOUNCEMENTS PAGE START -->
    <section class="page-heading">
      <div><h1>घोषणा</h1><p>नागरिकांसाठी आणि नगरसेवकांसाठी महत्त्वाच्या सूचना.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>श्रोता निवडा</h2><p>कोणाला घोषणा दाखवायची हे निवडा.</p></div></div>
      <div class="announcement-tabs">
        <button class="tab-btn ${state.announcementAudience === "citizen" ? 'active' : ''}" type="button" data-audience="citizen">नागरिकांसाठी</button>
        <button class="tab-btn ${state.announcementAudience === "nagarsevak" ? 'active' : ''}" type="button" data-audience="nagarsevak">नगरसेवकांसाठी</button>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>घोषणा यादी</h2><p>एकूण ${filteredAnnouncements.length} घोषणा.</p></div></div>
      <div class="announcement-list">
        ${filteredAnnouncements.map(announcement => `
        <article class="announcement-card">
          <strong>${announcement.subject}</strong>
          <span>${announcement.message}</span>
        </article>
        `).join("")}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>नई घोषणा जोडा</h2><p>नई घोषणा लिहा आणि सेव्ह करा.</p></div></div>
      <form id="announcementForm">
        <label>
          <span>वॉर्ड</span>
          <select id="announcementWard" required>
            <option value="all">सर्व वॉर्ड</option>
            ${wards.map(w => `<option value="${w.id}">वॉर्ड ${w.id} - ${w.name}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>विषय</span>
          <input id="announcementSubject" type="text" placeholder="घोषणेचा विषय" required>
        </label>
        <label>
          <span>संदेश</span>
          <textarea id="announcementMessage" placeholder="घोषणेचा विस्तृत संदेश" required></textarea>
        </label>
        <button class="primary-btn" type="submit"><i class="fa-solid fa-check"></i>सेव्ह करा</button>
      </form>
    </section>
    <!-- # ANNOUNCEMENTS PAGE END -->
  `;
}

function renderBestWard() {
  const wardStats = wards.map(ward => ({
    ...ward,
    stats: getWardStatistics(ward.id)
  }));

  const sortedWards = wardStats.sort((a, b) => {
    const aResolved = a.stats.resolved;
    const bResolved = b.stats.resolved;
    return bResolved - aResolved;
  });

  return `
    <!-- # BEST WARD PAGE START -->
    <section class="page-heading">
      <div><h1>सर्वोत्तम वॉर्ड</h1><p>सर्वाधिक तक्रारी सोडविलेले वॉर्ड.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <div class="best-list">
      ${sortedWards.map((ward, index) => `
      <article class="best-card">
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="font-size: 24px; font-weight: 900; color: var(--muted); min-width: 40px;">
            ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
          </div>
          <div>
            <strong style="display: block;">${ward.name}</strong>
            <span style="display: block; color: var(--muted); font-weight: 800; font-size: 13px;">वॉर्ड ${ward.id}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <strong style="display: block; font-size: 18px; color: var(--green);">${ward.stats.resolved} / ${ward.stats.total}</strong>
          <span style="display: block; color: var(--muted); font-weight: 800; font-size: 13px;">सोडविलेली</span>
        </div>
      </article>
      `).join("")}
    </div>
    <!-- # BEST WARD PAGE END -->
  `;
}

function renderMonthly() {
  const monthlyCounts = {};
  categories.forEach(cat => {
    if (cat.key !== "all") {
      monthlyCounts[cat.key] = state.allComplaints.filter(c => complaintCategory(c) === cat.key).length;
    }
  });

  const max = Math.max(...Object.values(monthlyCounts), 1);

  return `
    <!-- # MONTHLY ANALYTICS PAGE START -->
    <section class="page-heading">
      <div><h1>मासिक विश्लेषण</h1><p>विभाग नुसार तक्रारी विश्लेषण.</p></div>
      <button class="small-btn" type="button" data-page="overview"><i class="fa-solid fa-arrow-left"></i>मागे</button>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>विभागनिहाय तक्रारी</h2><p>प्रत्येक विभागात किती तक्रारी आली आहेत.</p></div></div>
      <div class="category-grid">
        ${categories.filter(cat => cat.key !== "all").map(category => `
          <button class="category-tile" type="button">
            <i class="fa-solid ${category.icon}"></i>
            <span>${category.label}</span>
            <b>${monthlyCounts[category.key] || 0}</b>
            <div class="progress"><span style="width:${((monthlyCounts[category.key] || 0) / max) * 100}%"></span></div>
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
