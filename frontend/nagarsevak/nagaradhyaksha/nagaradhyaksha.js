// # CONFIG START
const API_URL = "https://seva-setu-complaint-app.onrender.com/api/v1";
const ADMIN_DATA_API = "https://seva-setu-complaint-app.onrender.com/api/v1/admin/data";
const ADMIN_LOGIN_API = "https://seva-setu-complaint-app.onrender.com/api/v1/admins/login";
const ANNOUNCEMENTS_API = "https://seva-setu-complaint-app.onrender.com/api/v1/announcements";
const ANNOUNCEMENT_KEY = "nagaradhyakshaAnnouncements";
// # CONFIG END

// # STATE START
const state = {
  currentPage: "overview",
  previousPage: "overview",
  selectedWard: "all",
  selectedCategory: "all",
  selectedStatus: "all",
  searchQuery: "",
  announcementAudience: "citizen",
  allComplaints: [],
  announcements: [],
  admin: null
};
// # STATE END

// # DOM REFERENCES START
const viewContainer  = document.getElementById("viewContainer");
const pageTitle      = document.getElementById("pageTitle");
const sidebar        = document.getElementById("sidebar");
const menuToggle     = document.getElementById("menuToggle");
const backButton     = document.getElementById("backButton");
const toast          = document.getElementById("toast");
const presidentLogin = document.getElementById("presidentLogin");
const presidentPage  = document.getElementById("presidentPage");
const presidentLoginForm = document.getElementById("presidentLoginForm");
const mobileBottomNav = document.getElementById("mobileBottomNav");
// # DOM REFERENCES END

// # WARD DATA START
let wards = [
  {
    id: "1",
    name: "बाजारपेठ",
    nagarsevak: "केणी मंदार, कोसवणकर दर्शना",
    phone: "9637778901, 9405497503",
    focus: "कचरा व पाणीपुरवठा"
  },
  {
    id: "2",
    name: "किनारपट्टी",
    nagarsevak: "चव्हाण ललित, गिरकर अनिता",
    phone: "9096728048, 9168206294",
    focus: "स्वच्छता व रस्ते"
  },
  {
    id: "3",
    name: "मालवण मध्य",
    nagarsevak: "पाटकर दिपक, मुंबरकर नीना",
    phone: "9422584073, 9422584790",
    focus: "ड्रेनेज व वाहतूक"
  },
  {
    id: "4",
    name: "देऊळवाडा",
    nagarsevak: "जाधव सिद्धार्थ, चव्हाण पूनम",
    phone: "9373616290, 9404689316",
    focus: "रस्त्यावरील दिवे"
  },
  {
    id: "5",
    name: "दांडी",
    nagarsevak: "म्हाडगुत महेंद्र, खानोलकर महानंदा",
    phone: "9404944446, 9423806158",
    focus: "रस्ते व आरोग्य"
  },
  {
    id: "6",
    name: "चिवला",
    nagarsevak: "बापडेकर सहदेव, कांदळकर अश्विनी",
    phone: "9422434962, 9405926438",
    focus: "पाणीगळती"
  },
  {
    id: "7",
    name: "मेढा",
    nagarsevak: "आचरेकर सुदेश, गावकर मेधा",
    phone: "9422394185, 9422379771",
    focus: "नागरिक सुरक्षा"
  },
  {
    id: "8",
    name: "भरड",
    nagarsevak: "औरसकर मंदार, पाटकर शर्वरी",
    phone: "9545807300, 9422584866",
    focus: "वाहतूक व स्वच्छता"
  }
];
// # WARD DATA END
// # WARD DATA END

// # CATEGORY DATA START
const categories = [
  { key: "all",           label: "सर्व",                icon: "fa-table-cells-large", className: "blue",   keywords: [] },
  { key: "water",         label: "पाणी",                icon: "fa-droplet",           className: "blue",   keywords: ["water", "paani", "पाणी", "गळती", "leakage"] },
  { key: "garbage",       label: "कचरा",                icon: "fa-trash-can",         className: "green",  keywords: ["garbage", "waste", "trash", "कचरा"] },
  { key: "street-lights", label: "रस्त्यावरील दिवे",    icon: "fa-lightbulb",         className: "orange", keywords: ["light", "street light", "दिवे", "बंद"] },
  { key: "road",          label: "रस्ता",               icon: "fa-road",              className: "teal",   keywords: ["road", "pothole", "रस्ता", "खड्डा", "साफ"] },
  { key: "gutter",        label: "गटार",                icon: "fa-water",             className: "teal",   keywords: ["gutter", "drain", "गटार", "झाकण", "तुंबले"] },
  { key: "animals",       label: "भटकी जनावरे",        icon: "fa-shield-heart",      className: "orange", keywords: ["dog", "animal", "जनावरे", "कुत्रे"] },
  { key: "traffic",       label: "वाहतूक कोंडी",       icon: "fa-traffic-light",     className: "red",    keywords: ["traffic", "वाहतूक", "कोंडी", "जंक्शन"] },
  { key: "drainage",      label: "नाले / पाणी साचणे",  icon: "fa-person-digging",    className: "green",  keywords: ["drainage", "overflow", "नाले", "साचणे"] },
  { key: "tree",          label: "झाड समस्या",         icon: "fa-tree",              className: "green",  keywords: ["tree", "branch", "झाड", "फांदी"] },
  { key: "other",         label: "इतर",                icon: "fa-circle-plus",       className: "purple", keywords: ["other", "इतर"] }
];
// # CATEGORY DATA END

// # UTILS START
function normalizeWard(value) {
  return String(value || "").toLowerCase()
    .replace("ward", "").replace("वॉर्ड", "")
    .replace(/[^0-9]/g, "");
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

function statusTone(status) {
  const key = normalizeStatus(status);
  if (key === "resolved") return { icon: "fa-circle-check", label: "पूर्ण",       className: "status-resolved" };
  if (key === "progress") return { icon: "fa-arrows-rotate",label: "कारवाई सुरू", className: "status-progress" };
  return                         { icon: "fa-clock",         label: "प्रलंबित",    className: "status-pending" };
}

function statusClass(status) { return statusTone(status).className; }

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "आज";
  return date.toLocaleDateString("mr-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function complaintDate(complaint) { return formatDate(complaint.created_at || complaint.updated_at); }
function announcementDate(item)   { return formatDate(item.created_at || item.createdAt); }
function complaintId(complaint)   { return String(complaint.id || complaint._id || "NA"); }

function wardInfo(wardId) {
  return wards.find((w) => w.id === normalizeWard(wardId)) || wards[0];
}

function wardLabel(wardId) {
  const w = wardInfo(wardId);
  return `वॉर्ड ${w.id}`;
}
function complaintCategory(complaint) {
  if (complaint.category && categories.some((c) => c.key === complaint.category)) return complaint.category;
  const text = `${complaint.title || ""} ${complaint.description || ""}`.toLowerCase();
  const match = categories.find(
    (c) => c.key !== "all" && c.key !== "other" &&
      c.keywords.some((kw) => text.includes(kw.toLowerCase()))
  );
  return match ? match.key : "other";
}

function categoryInfo(key) {
  return categories.find((c) => c.key === key) || categories[categories.length - 1];
}

function getAnnouncements() {
  return [
    {
      type: "citizen", ward: "1", priority: "high",
      created_at: new Date().toISOString(),
      subject: "बाजारपेठ स्वच्छता मोहीम",
      message: "शनिवारी सकाळी ७ ते १० बाजारपेठ स्वच्छता मोहीम राबवली जाईल."
    },
    {
      type: "citizen", ward: "all", priority: "medium",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      subject: "पाणीपुरवठा सूचना",
      message: "उद्या सकाळच्या पाणीपुरवठ्याच्या वेळेत बदल असेल."
    },
    {
      type: "nagarsevak", ward: "all", priority: "high",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      subject: "मासिक आढावा बैठक",
      message: "सर्व नगरसेवकांनी सोमवार सकाळी ११ वाजता आढावा बैठकीला उपस्थित राहावे."
    },
    ...state.announcements
  ];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}
// # UTILS END

// # DATA START
async function loadComplaints() {
  try {
    const response = await fetch(ADMIN_DATA_API);
    if (!response.ok) throw new Error("API not available");
    const data = await response.json();
    const nagarsevaksByWard = (data.nagarsevaks || []).reduce((acc, item) => {
      const key = normalizeWard(item.ward_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    wards = (data.wards || []).map((ward) => {
      const assigned = nagarsevaksByWard[normalizeWard(ward.id)] || [];
      return {
        id: String(ward.id),
        name: ward.name || `Ward ${ward.id}`,
        nagarsevak: assigned.length ? assigned.map((item) => item.name).join(", ") : "Not assigned",
        phone: assigned.map((item) => item.mobile_number).filter(Boolean).join(", "),
        focus: ""
      };
    });
    state.allComplaints = data.complaints || [];
    showToast("Backend मधून सर्व वॉर्डची माहिती लोड झाली.");
  } catch {
    state.allComplaints = [];
    showToast("Backend बंद आहे, सध्या तक्रारी लोड होत नाहीत.");
  }
}

async function loadAnnouncements() {
  try {
    const response = await fetch(ANNOUNCEMENTS_API);
    if (!response.ok) throw new Error("Announcements API not available");
    state.announcements = await response.json();
  } catch {
    state.announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY) || "[]");
  }
}
// # DATA END

// # CALCULATIONS START
function filteredComplaints() {
  return state.allComplaints.filter((c) => {
    const wardMatch     = state.selectedWard     === "all" || normalizeWard(c.ward)         === state.selectedWard;
    const categoryMatch = state.selectedCategory === "all" || complaintCategory(c)          === state.selectedCategory;
    const statusMatch   = state.selectedStatus   === "all" || normalizeStatus(c.status)     === state.selectedStatus;
    const searchable    = `${c.title || ""} ${c.description || ""} ${c.citizen_name || ""} ${complaintId(c)} ${wardLabel(c.ward)}`.toLowerCase();
    const searchMatch   = !state.searchQuery || searchable.includes(state.searchQuery.toLowerCase());
    return wardMatch && categoryMatch && statusMatch && searchMatch;
  });
}

function wardStats(wardId) {
  const list      = state.allComplaints.filter((c) => normalizeWard(c.ward) === wardId);
  const resolved  = list.filter((c) => normalizeStatus(c.status) === "resolved").length;
  const pending   = list.filter((c) => normalizeStatus(c.status) === "pending").length;
  const progress  = list.filter((c) => normalizeStatus(c.status) === "progress").length;
  const score     = list.length ? Math.round((resolved / list.length) * 100) : 100;
  return { total: list.length, resolved, pending, progress, score };
}

function cityStats() {
  const total    = state.allComplaints.length;
  const pending  = state.allComplaints.filter((c) => normalizeStatus(c.status) === "pending").length;
  const progress = state.allComplaints.filter((c) => normalizeStatus(c.status) === "progress").length;
  const resolved = state.allComplaints.filter((c) => normalizeStatus(c.status) === "resolved").length;
  const rate     = total ? Math.round((resolved / total) * 100) : 0;
  return { total, pending, progress, resolved, rate };
}

function categoryCounts() {
  return state.allComplaints.reduce((counts, c) => {
    const key = complaintCategory(c);
    counts[key] = (counts[key] || 0) + 1;
    counts.all  = (counts.all  || 0) + 1;
    return counts;
  }, { all: state.allComplaints.length });
}

function bestWards() {
  return wards
    .map((w)  => ({ ...w, stats: wardStats(w.id) }))
    .sort((a, b) => b.stats.score - a.stats.score || b.stats.resolved - a.stats.resolved);
}
// # CALCULATIONS END

// # CARD RENDERERS START
function statCard(icon, colorClass, label, value, subtext) {
  return `
    <article class="stat-card">
      <i class="fa-solid ${icon} stat-icon ${colorClass}"></i>
      <span class="stat-label">${label}</span>
      <strong class="stat-value">${value}</strong>
      <small class="stat-sub">${subtext}</small>
    </article>
  `;
}
function complaintCard(complaint) {
  const cat       = categoryInfo(complaintCategory(complaint));
  const tone      = statusTone(complaint.status);
  const statusKey = normalizeStatus(complaint.status);

  return `
    <article class="complaint-card ${statusKey}">

      <div class="tile-icon ${cat.className}">
        <i class="fa-solid ${cat.icon}"></i>
      </div>

      <div class="cc-body">
        <div class="cc-top">
          <h3>${complaint.title || "तक्रार"}</h3>
          <span class="badge ${tone.className}">
            <i class="fa-solid ${tone.icon}"></i>${tone.label}
          </span>
        </div>
        <p class="cc-desc">${complaint.description || ""}</p>
        <div class="meta-row">
          <span><i class="fa-solid fa-hashtag"></i>${complaintId(complaint)}</span>
          <span><i class="fa-regular fa-user"></i>${complaint.citizen_name || "नागरिक"}</span>
          <span><i class="fa-solid fa-location-dot"></i>${wardLabel(complaint.ward)}</span>
          <span><i class="fa-solid fa-tag"></i>${cat.label}</span>
          <span><i class="fa-regular fa-calendar"></i>${complaintDate(complaint)}</span>
        </div>
      </div>

      <button class="icon-btn" type="button" data-page="categories" aria-label="तक्रार उघडा">
        <i class="fa-solid fa-chevron-right"></i>
      </button>

    </article>
  `;
}

function complaintCard(complaint) {
  const cat       = categoryInfo(complaintCategory(complaint));
  const tone      = statusTone(complaint.status);
  const statusKey = normalizeStatus(complaint.status);

  return `
    <article class="complaint-card ${statusKey}">
      <div class="tile-icon ${cat.className}">
        <i class="fa-solid ${cat.icon}"></i>
      </div>

      <div class="complaint-content" style="min-width:0">
        <div class="complaint-head">
          <div class="complaint-title-wrap">
            <h3>${complaint.title || "तक्रार"}</h3>
            <p>${complaint.description || ""}</p>
          </div>

          <span class="badge ${tone.className}">
            <i class="fa-solid ${tone.icon}"></i>${tone.label}
          </span>
        </div>

        <div class="meta-row">
          <span title="तक्रार क्रमांक"><i class="fa-solid fa-hashtag"></i>${complaintId(complaint)}</span>
          <span><i class="fa-regular fa-user"></i>${complaint.citizen_name || "नागरिक"}</span>
          <span><i class="fa-solid fa-location-dot"></i>${wardLabel(complaint.ward)}</span>
          <span><i class="fa-solid fa-tag"></i>${cat.label}</span>
          <span><i class="fa-regular fa-calendar"></i>${complaintDate(complaint)}</span>
        </div>
      </div>

      <button class="icon-btn" type="button" data-page="categories" aria-label="तक्रार उघडा" title="तक्रार उघडा">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </article>
  `;
}


function wardCard(ward) {
  const stats = wardStats(ward.id);
  const scoreColor = stats.score >= 75 ? "color:var(--green)" : stats.score >= 40 ? "color:var(--orange)" : "color:var(--red)";
  return `
    <button class="ward-card" type="button" data-ward="${ward.id}">
      <div style="min-width:0">
        <strong>${wardLabel(ward.id)}</strong>
        <span>नगरसेवक: ${ward.nagarsevak}</span>
        <small>${ward.focus} &nbsp;·&nbsp; ${stats.total} तक्रारी &nbsp;·&nbsp; ${stats.pending} प्रलंबित</small>
      </div>
      <b style="${scoreColor}">${stats.score}%</b>
      <div class="progress">
        <span style="width:${stats.score}%"></span>
      </div>
    </button>
  `;
}
// # CARD RENDERERS END

// # PAGE RENDERERS START

// ── OVERVIEW ──────────────────────────────────────────────
function renderOverview() {
  const stats = cityStats();
  const best  = bestWards()[0];
  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow">सकाळचा शहर आढावा</p>
        <h1>मालवणची प्रत्येक तक्रार, वॉर्ड आणि घोषणा एका ठिकाणी.</h1>
        <span>स्वच्छ किनारा, सक्षम नागरिक, सुंदर मालवण.</span>
      </div>
      <div class="hero-actions">
        <button class="primary-btn" type="button" data-page="wards">
          <i class="fa-solid fa-map-location-dot"></i>वॉर्ड पहा
        </button>
        <button class="secondary-btn" type="button" data-page="announcements">
          <i class="fa-solid fa-bullhorn"></i>घोषणा करा
        </button>
      </div>
    </section>

    <section class="stats-grid" aria-label="शहर सारांश">
      ${statCard("fa-file-lines",     "blue",   "एकूण तक्रारी",  stats.total,          "सर्व वॉर्डमधून आलेल्या")}
      ${statCard("fa-hourglass-half", "orange", "प्रलंबित",      stats.pending,         "तातडीने पाहण्यासारख्या")}
      ${statCard("fa-arrows-rotate",  "purple", "कारवाई सुरू",   stats.progress,        "काम चालू आहे")}
      ${statCard("fa-circle-check",   "green",  "निवारण दर",     `${stats.rate}%`,      `${stats.resolved} तक्रारी पूर्ण`)}
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>सर्व वॉर्डची झटपट स्थिती</h2>
            <p>वॉर्डवर क्लिक केल्यास त्या वॉर्डच्या तक्रारी थेट दिसतील.</p>
          </div>
          <button class="small-btn" type="button" data-page="wards">सर्व पहा →</button>
        </div>
        <div class="ward-list">${wards.map(wardCard).join("")}</div>
      </div>

      <div>
        <div class="panel">
          <div class="panel-head">
            <div>
              <h2>🏆 सर्वोत्तम वॉर्ड</h2>
              <p>या महिन्यातील सर्वोच्च कामगिरी.</p>
            </div>
          </div>
          ${best ? `
            <div class="best-list">
              <article class="best-card" style="border-top:3px solid var(--green)">
                <div class="meta-row">
                  <span class="badge status-resolved"><i class="fa-solid fa-trophy"></i>अव्वल क्रमांक</span>
                </div>
                <h3 style="margin-top:10px">${wardLabel(best.id)}</h3>
                <p>${best.nagarsevak} — ${best.stats.score}% निवारण दर</p>
                <div class="progress" style="margin-top:10px">
                  <span style="width:${best.stats.score}%"></span>
                </div>
                <div class="meta-row" style="margin-top:10px">
                  <span><i class="fa-solid fa-circle-check" style="color:var(--green)"></i>${best.stats.resolved} पूर्ण</span>
                  <span><i class="fa-solid fa-clock" style="color:var(--orange)"></i>${best.stats.pending} प्रलंबित</span>
                </div>
              </article>
            </div>
          ` : ""}
        </div>

        <div class="panel">
          <div class="panel-head">
            <div>
              <h2>विभागनिहाय तक्रारी</h2>
              <p>विभाग निवडा.</p>
            </div>
          </div>
          <div class="category-grid" style="grid-template-columns:repeat(auto-fill,minmax(100px,1fr))">
            ${categories.slice(1, 7).map((cat) => {
              const count = state.allComplaints.filter((c) => complaintCategory(c) === cat.key).length;
              return `
                <button class="category-tile" type="button" data-category="${cat.key}">
                  <i class="fa-solid ${cat.icon} cat-icon ${cat.className}" style="width:42px;height:42px;border-radius:50%;display:grid;place-items:center"></i>
                  <strong>${cat.label}</strong>
                  <small>${count}</small>
                </button>
              `;
            }).join("")}
          </div>
          <div style="margin-top:12px">
            <button class="secondary-btn" style="width:100%" type="button" data-page="categories">
              सर्व विभाग पहा <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ── WARDS ──────────────────────────────────────────────────
function renderWards() {
  const all = wardStats;
  return `
    <section class="page-heading">
      <div>
        <h1>वॉर्ड विभाग</h1>
        <p>सर्व १० वॉर्डचे काम, तक्रारी आणि निवारण दर.</p>
      </div>
      <button class="small-btn" type="button" data-page="overview">
        <i class="fa-solid fa-arrow-left"></i>आढाव्याकडे
      </button>
    </section>
    <div class="panel">
      <div class="ward-list">${wards.map(wardCard).join("")}</div>
    </div>
  `;
}

// ── WARD COMPLAINTS ────────────────────────────────────────
function renderWardComplaints() {
  const selected   = state.selectedWard === "all" ? wards[0].id : state.selectedWard;
  const ward       = wardInfo(selected);
  const stats      = wardStats(selected);
  const complaints = filteredComplaints();
  return `
    <section class="page-heading ward-detail-heading">
      <div>
        <p class="eyebrow">थेट वॉर्ड तक्रारी</p>
        <h1>${wardLabel(selected)}</h1>
        <p>${ward.nagarsevak} &nbsp;|&nbsp; ${ward.focus}</p>
      </div>
      <button class="small-btn" type="button" data-page="wards">
        <i class="fa-solid fa-map-location-dot"></i>सर्व वॉर्ड
      </button>
    </section>

    <div class="stats-grid" style="margin-bottom:20px">
      ${statCard("fa-file-lines",     "blue",   "एकूण तक्रारी", stats.total,    ward.focus)}
      ${statCard("fa-hourglass-half", "orange", "प्रलंबित",     stats.pending,  "नगरसेवक फॉलोअप")}
      ${statCard("fa-arrows-rotate",  "purple", "कारवाई सुरू",  stats.progress, "काम सुरू")}
      ${statCard("fa-circle-check",   "green",  "पूर्ण",        stats.resolved, `${stats.score}% दर`)}
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>तक्रारी</h2>
          <p>स्थिती, नागरिक किंवा तक्रार क्रमांकाने शोधा.</p>
        </div>
        ${renderComplaintFilters("ward")}
      </div>
      <div class="complaints-list">
        ${complaints.length
          ? complaints.map(complaintCard).join("")
          : `<div class="empty-state"><i class="fa-regular fa-folder-open" style="font-size:32px;display:block;margin-bottom:10px"></i>या फिल्टरमध्ये तक्रारी नाहीत.</div>`
        }
      </div>
    </div>
  `;
}

// ── COMPLAINT FILTERS ──────────────────────────────────────
function renderComplaintFilters(scope) {
  return `
    <div class="filters complaint-filters">
      <label class="search-field">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input
          id="${scope}SearchFilter"
          type="search"
          value="${state.searchQuery}"
          placeholder="तक्रार शोधा…"
          autocomplete="off"
        >
      </label>
      <select id="${scope}StatusFilter" aria-label="स्थिती फिल्टर">
        <option value="all"      ${state.selectedStatus === "all"      ? "selected" : ""}>सर्व स्थिती</option>
        <option value="pending"  ${state.selectedStatus === "pending"  ? "selected" : ""}>प्रलंबित</option>
        <option value="progress" ${state.selectedStatus === "progress" ? "selected" : ""}>कारवाई सुरू</option>
        <option value="resolved" ${state.selectedStatus === "resolved" ? "selected" : ""}>पूर्ण</option>
      </select>
    </div>
  `;
}

// ── CATEGORIES ─────────────────────────────────────────────
function renderCategories() {
  const counts     = categoryCounts();
  const complaints = filteredComplaints();
  return `
    <section class="page-heading">
      <div>
        <h1>विभागनिहाय तक्रारी</h1>
        <p>विभाग निवडा — वॉर्ड आणि तक्रारी खालीं दिसतील.</p>
      </div>
      <button class="small-btn" type="button" data-page="overview">
        <i class="fa-solid fa-arrow-left"></i>मागे
      </button>
    </section>

    <div class="panel cat-panel">
      <div class="cat-scroll-outer">
        <div class="category-grid">
          ${categories.map((cat) => `
            <button
              class="category-tile ${state.selectedCategory === cat.key ? "active" : ""}"
              type="button"
              data-category="${cat.key}"
            >
              <i class="fa-solid ${cat.icon} cat-icon ${cat.className}"
                 style="width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-size:20px"
              ></i>
              <strong>${cat.label}</strong>
              <small>${counts[cat.key] || 0}</small>
            </button>
          `).join("")}
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>${categoryInfo(state.selectedCategory).label} तक्रारी</h2>
          <p>सर्व वॉर्डमधील निवडलेल्या विभागाच्या तक्रारी.</p>
        </div>
        <div class="filters">
          ${renderComplaintFilters("category")}
          <select id="categoryWardFilter" aria-label="वॉर्ड फिल्टर">
            <option value="all">सर्व वॉर्ड</option>
            ${wards.map((w) => `
              <option value="${w.id}" ${state.selectedWard === w.id ? "selected" : ""}>
                ${wardLabel(w.id)}
              </option>
            `).join("")}
          </select>
        </div>
      </div>
      <div class="complaints-list">
        ${complaints.length
          ? complaints.map(complaintCard).join("")
          : `<div class="empty-state"><i class="fa-regular fa-folder-open" style="font-size:32px;display:block;margin-bottom:10px"></i>या फिल्टरमध्ये तक्रारी नाहीत.</div>`
        }
      </div>
    </div>
  `;
}


// ── ANNOUNCEMENTS ──────────────────────────────────────────
function renderAnnouncements() {
  const announcements = getAnnouncements()
    .filter((item) => (item.type || item.audience) === state.announcementAudience);
  const latest = announcements[0];
  return `
    <section class="page-heading">
      <div>
        <h1>घोषणा</h1>
        <p>नागरिकांसाठी वॉर्डनिहाय किंवा नगरसेवकांसाठी स्वतंत्र घोषणा.</p>
      </div>
      <button class="small-btn" type="button" data-page="overview">
        <i class="fa-solid fa-arrow-left"></i>मागे
      </button>
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>नवीन घोषणा</h2>
            <p>प्रकार निवडा आणि घोषणा पाठवा.</p>
          </div>
          <div class="announcement-tabs">
            <button class="tab-btn ${state.announcementAudience === "citizen"    ? "active" : ""}" type="button" data-audience="citizen">
              <i class="fa-solid fa-users"></i> नागरिक
            </button>
            <button class="tab-btn ${state.announcementAudience === "nagarsevak" ? "active" : ""}" type="button" data-audience="nagarsevak">
              <i class="fa-solid fa-people-roof"></i> नगरसेवक
            </button>
          </div>
        </div>

        <form id="announcementForm">
          <div class="field-grid" style="margin-bottom:16px">
            <label>
              <span>वॉर्ड</span>
              <select id="announcementWard">
                <option value="all">सर्व वॉर्ड</option>
                ${wards.map((w) => `<option value="${w.id}">${wardLabel(w.id)}</option>`).join("")}
              </select>
            </label>
            <label>
              <span>विषय</span>
              <input id="announcementSubject" type="text" placeholder="घोषणेचा विषय लिहा" required>
            </label>
          </div>
          <label style="margin-bottom:16px">
            <span>संदेश</span>
            <textarea id="announcementMessage" placeholder="घोषणेचा संदेश लिहा…" required></textarea>
          </label>
          <button class="primary-btn" type="submit" style="width:100%">
            <i class="fa-solid fa-paper-plane"></i>घोषणा पाठवा
          </button>
        </form>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>अलीकडील घोषणा</h2>
            <p>${state.announcementAudience === "citizen" ? "नागरिकांसाठी" : "नगरसेवकांसाठी"}</p>
          </div>
        </div>
        <div class="announcement-list">
          ${latest ? `
            <article class="announcement-card featured ${latest.type || latest.audience}">
              <div class="announcement-meta">
                <span class="badge status-resolved"><i class="fa-solid fa-star"></i>नवीन</span>
                <span>${announcementDate(latest)}</span>
              </div>
              <strong>${latest.subject}</strong>
              <span>${latest.ward === "all" ? "सर्व वॉर्ड" : wardLabel(latest.ward)} — ${latest.message}</span>
            </article>
          ` : ""}
          ${announcements.slice(latest ? 1 : 0).map((item) => `
            <article class="announcement-card ${item.type || item.audience}">
              <div class="announcement-meta">
                <span>${item.ward === "all" ? "सर्व वॉर्ड" : wardLabel(item.ward)}</span>
                <span>${announcementDate(item)}</span>
              </div>
              <strong>${item.subject}</strong>
              <span>${item.message}</span>
            </article>
          `).join("")}
          ${!announcements.length ? `<div class="empty-state">अजून घोषणा नाहीत.</div>` : ""}
        </div>
      </div>
    </section>
  `;
}

// ── BEST WARD ──────────────────────────────────────────────
function renderBestWard() {
  const ranked = bestWards();
  const medals = ["🥇", "🥈", "🥉"];
  return `
    <section class="page-heading">
      <div>
        <h1>सर्वोत्तम वॉर्ड</h1>
        <p>निवारण दर, पूर्ण तक्रारी आणि कमी प्रलंबित कामावर आधारित.</p>
      </div>
      <button class="small-btn" type="button" data-page="overview">
        <i class="fa-solid fa-arrow-left"></i>मागे
      </button>
    </section>

    <div class="panel">
      <div class="best-list">
        ${ranked.map((ward, i) => `
          <article class="best-card" style="${i === 0 ? "border-top:3px solid var(--green);background:linear-gradient(135deg,#f0fff8,#fff)" : ""}">
            <div class="meta-row">
              <span class="badge ${i === 0 ? "status-resolved" : i === 1 ? "status-progress" : ""}">
                ${medals[i] || `#${i + 1}`} क्रमांक ${i + 1}
              </span>
              <span>${ward.nagarsevak}</span>
            </div>
            <h2>${wardLabel(ward.id)}</h2>
            <p>${ward.stats.score}% निवारण दर &nbsp;·&nbsp; ${ward.stats.resolved} पूर्ण &nbsp;·&nbsp; ${ward.stats.pending} प्रलंबित</p>
            <div class="progress" style="margin-top:10px">
              <span style="width:${ward.stats.score}%"></span>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

// ── MONTHLY ────────────────────────────────────────────────
function renderMonthly() {
  const counts = categoryCounts();
  const max    = Math.max(...Object.values(counts), 1);
  const stats  = cityStats();
  return `
    <section class="page-heading">
      <div>
        <h1>मासिक विश्लेषण</h1>
        <p>शहरातील तक्रारी, विभाग आणि निवारण दर.</p>
      </div>
      <button class="small-btn" type="button" data-page="overview">
        <i class="fa-solid fa-arrow-left"></i>मागे
      </button>
    </section>

    <div class="stats-grid">
      ${statCard("fa-calendar-days",  "blue",   "या महिन्यात",  stats.total,    "तक्रारी")}
      ${statCard("fa-circle-check",   "green",  "पूर्ण",        stats.resolved, "निकाली तक्रारी")}
      ${statCard("fa-hourglass-half", "orange", "प्रलंबित",     stats.pending,  "फॉलोअप आवश्यक")}
      ${statCard("fa-gauge-high",     "purple", "निवारण दर",    `${stats.rate}%`, "सर्व वॉर्ड")}
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>विभागनिहाय मासिक अहवाल</h2>
          <p>विभागावर क्लिक केल्यास त्या तक्रारी दिसतील.</p>
        </div>
      </div>
      <div class="analytics-list" style="display:grid;gap:12px">
        ${categories.filter((c) => c.key !== "all").map((cat) => {
          const cnt  = counts[cat.key] || 0;
          const pct  = Math.round((cnt / max) * 100);
          return `
            <button class="ward-card" type="button" data-category="${cat.key}" style="align-items:center">
              <div style="display:flex;align-items:center;gap:12px;min-width:0">
                <i class="fa-solid ${cat.icon} tile-icon ${cat.className}" style="flex-shrink:0"></i>
                <div style="min-width:0">
                  <strong>${cat.label}</strong>
                  <span>${cnt} तक्रारी</span>
                </div>
              </div>
              <b style="color:var(--blue)">${cnt}</b>
              <div class="progress">
                <span style="width:${pct}%"></span>
              </div>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

// ── PROFILE ────────────────────────────────────────────────
function renderProfile() {
  const adminName = state.admin?.name || "Admin";
  const adminUsername = state.admin?.username || "";
  const initials = adminName.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "A";
  return `
    <section class="page-heading">
      <div>
        <h1>प्रोफाइल सेटिंग्ज</h1>
        <p>नगराध्यक्ष खाते, सूचना आणि सुरक्षा सेटिंग्ज.</p>
      </div>
      <button class="small-btn" type="button" data-page="overview">
        <i class="fa-solid fa-arrow-left"></i>मागे
      </button>
    </section>

    <section class="profile-layout">
      <article class="panel profile-card">
        <img
          src="../../../uploads/WhatsApp Image 2026-04-24 at 5.11.03 PM.jpeg"
          alt="नगराध्यक्ष प्रोफाइल फोटो"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        >
        <div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--teal));display:none;align-items:center;justify-content:center;color:white;font-size:36px;font-weight:900;margin:0 auto 14px">${initials}</div>
        <h2>${adminName}</h2>
        <p>नगराध्यक्ष &nbsp;|&nbsp; मालवण नगरपरिषद</p>
        <p style="font-size:13px;color:var(--muted);margin-top:4px">${adminUsername}</p>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">
          <div class="meta-row" style="justify-content:center">
            <span class="badge status-resolved"><i class="fa-solid fa-shield-check"></i>अधिकृत</span>
          </div>
        </div>
      </article>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>सेटिंग्ज</h2>
            <p>खाते आणि सूचना व्यवस्थापन.</p>
          </div>
        </div>
        <div class="settings-list">
          <article class="setting-row">
            <div class="tile-icon blue"><i class="fa-regular fa-user"></i></div>
            <div><strong>पूर्ण नाव</strong><span>${adminName}</span></div>
            <button class="small-btn" type="button">बदला</button>
          </article>
          <article class="setting-row">
            <div class="tile-icon green"><i class="fa-solid fa-phone"></i></div>
            <div><strong>वापरकर्ता नाव</strong><span>${adminUsername}</span></div>
            <button class="small-btn" type="button">बदला</button>
          </article>
          <article class="setting-row">
            <div class="tile-icon teal"><i class="fa-solid fa-building-columns"></i></div>
            <div><strong>नगरपरिषद</strong><span>मालवण नगरपरिषद</span></div>
          </article>
          <article class="setting-row">
            <div class="tile-icon orange"><i class="fa-regular fa-bell"></i></div>
            <div><strong>घोषणा सूचना</strong><span>महत्त्वाच्या अपडेट्स दाखवा.</span></div>
            <label class="switch">
              <input type="checkbox" checked>
              <span></span>
            </label>
          </article>
          <article class="setting-row">
            <div class="tile-icon purple"><i class="fa-solid fa-lock"></i></div>
            <div><strong>संकेतशब्द</strong><span>शेवटचा बदल: ६ महिन्यांपूर्वी</span></div>
            <button class="small-btn" type="button">बदला</button>
          </article>
          <article class="setting-row">
            <div class="tile-icon red"><i class="fa-solid fa-shield-halved"></i></div>
            <div><strong>सुरक्षा</strong><span>प्रोफाइल आणि शहर डेटा सुरक्षित.</span></div>
            <button class="small-btn" type="button">तपासा</button>
          </article>
        </div>
      </section>
    </section>
  `;
}

// # PAGE RENDERERS END

// # NAVIGATION START
const pageTitles = {
  overview:       "नगराध्यक्ष डॅशबोर्ड",
  wards:          "वॉर्ड विभाग",
  wardComplaints: "वॉर्ड तक्रारी",
  categories:     "विभागनिहाय तक्रारी",
  announcements:  "घोषणा",
  best:           "सर्वोत्तम वॉर्ड",
  monthly:        "मासिक विश्लेषण",
  profile:        "प्रोफाइल सेटिंग्ज"
};

const pageRenderers = {
  overview:       renderOverview,
  wards:          renderWards,
  wardComplaints: renderWardComplaints,
  categories:     renderCategories,
  announcements:  renderAnnouncements,
  best:           renderBestWard,
  monthly:        renderMonthly,
  profile:        renderProfile
};

function openPage(page, options = {}) {
  if (!pageRenderers[page]) return;
  if (!options.skipPrevious) state.previousPage = state.currentPage;
  state.currentPage = page;
  pageTitle.textContent = pageTitles[page];
  viewContainer.innerHTML = pageRenderers[page]();

  // Update sidebar active state
  document.querySelectorAll(".side-nav [data-page]").forEach((node) => {
    const activePage = page === "wardComplaints" ? "wards" : page;
    node.classList.toggle("active", node.dataset.page === activePage);
  });

  // Update mobile bottom nav active state
  const activeMbnPage = page === "wardComplaints" ? "wards" : page;
  document.querySelectorAll(".mbn-btn[data-page]").forEach((node) => {
    node.classList.toggle("active", node.dataset.page === activeMbnPage);
  });

  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
// # NAVIGATION END

// # EVENTS START

// Login
presidentLoginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // .toLowerCase() hata diya hai taaki case-sensitive match ho sake
  const username = document.getElementById("presidentUsername").value.trim(); 
  const password = document.getElementById("presidentPassword").value.trim();
  
  try {
    const response = await fetch(ADMIN_LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        // Yaha server se aa raha real error dikhega
        throw new Error(data.detail || "Invalid login");
    }
    
    state.admin = data.admin;
    presidentLogin.hidden = true;
    presidentPage.hidden  = false;
    if (mobileBottomNav) mobileBottomNav.hidden = false;
    const adminChipName = document.getElementById("adminChipName");
    if (adminChipName) adminChipName.textContent = state.admin?.name || "Admin";
    showToast(`स्वागत आहे, ${state.admin?.name || "Admin"}! डॅशबोर्ड उघडत आहे...`);

  } catch (error) {
    // Yaha hum exact error message dikhayenge jo server se aa raha hai
    console.error("Login Error:", error.message);
    showToast(error.message); // UI par error message dikha do
    return;
  }
});
  
  presidentLogin.hidden = true;
  presidentPage.hidden  = false;
  if (mobileBottomNav) mobileBottomNav.hidden = false;
  const adminChipName = document.getElementById("adminChipName");
  if (adminChipName) adminChipName.textContent = state.admin?.name || "Admin";
  showToast(`स्वागत आहे, ${state.admin?.name || "Admin"}! डॅशबोर्ड उघडत आहे...`);


// Sidebar toggle
menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(e.target) &&
    e.target !== menuToggle
  ) {
    sidebar.classList.remove("open");
  }
});

// Back button
backButton.addEventListener("click", () => {
  if (state.currentPage !== "overview") {
    openPage(state.previousPage || "overview", { skipPrevious: true });
  } else {
    window.location.href = "../index.html";
  }
});

// Delegation — page buttons, ward, category, audience
document.addEventListener("click", (e) => {
  const pageBtn = e.target.closest("[data-page]");
  if (pageBtn && !pageBtn.closest(".side-nav") || (pageBtn && pageBtn.closest(".side-nav"))) {
    if (pageBtn) { openPage(pageBtn.dataset.page); return; }
  }

  const profileShortcut = e.target.closest("[data-page-shortcut]");
  if (profileShortcut) { openPage(profileShortcut.dataset.pageShortcut); return; }

  const wardBtn = e.target.closest("[data-ward]");
  if (wardBtn) {
    state.selectedWard     = wardBtn.dataset.ward;
    state.selectedCategory = "all";
    state.selectedStatus   = "all";
    state.searchQuery      = "";
    openPage("wardComplaints");
    return;
  }

  const catBtn = e.target.closest("[data-category]");
  if (catBtn) {
    state.selectedCategory = catBtn.dataset.category;
    openPage("categories");
    return;
  }

  const audienceBtn = e.target.closest("[data-audience]");
  if (audienceBtn) {
    state.announcementAudience = audienceBtn.dataset.audience;
    openPage("announcements", { skipPrevious: true });
  }
});

// Select filters
document.addEventListener("change", (e) => {
  if (e.target.id === "categoryWardFilter") {
    state.selectedWard = e.target.value;
    openPage("categories", { skipPrevious: true });
  }
  if (e.target.id === "wardStatusFilter") {
    state.selectedStatus = e.target.value;
    openPage("wardComplaints", { skipPrevious: true });
  }
  if (e.target.id === "categoryStatusFilter") {
    state.selectedStatus = e.target.value;
    openPage("categories", { skipPrevious: true });
  }
});

// Live search
document.addEventListener("input", (e) => {
  if (e.target.id === "wardSearchFilter" || e.target.id === "categorySearchFilter") {
    state.searchQuery = e.target.value.trim();
    window.clearTimeout(document.searchTimer);
    const targetPage = e.target.id === "wardSearchFilter" ? "wardComplaints" : "categories";
    document.searchTimer = window.setTimeout(() => {
      openPage(targetPage, { skipPrevious: true });
      const input = document.getElementById(e.target.id);
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    }, 180);
  }
});

// Announcement form submit
document.addEventListener("submit", async (e) => {
  if (e.target.id !== "announcementForm") return;
  e.preventDefault();

  const payload = {
    audience:    state.announcementAudience,
    ward:        document.getElementById("announcementWard").value,
    subject:     document.getElementById("announcementSubject").value.trim(),
    message:     document.getElementById("announcementMessage").value.trim(),
    created_by:  state.admin?.username || "admin",
    created_at:  new Date().toISOString(),
    priority:    "medium"
  };

  try {
    const resp = await fetch(ANNOUNCEMENTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error("Save failed");
    const saved = await resp.json();
    state.announcements.unshift(saved);
  } catch {
    const stored = JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY) || "[]");
    stored.unshift({ ...payload, type: payload.audience });
    localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(stored));
    state.announcements = stored;
  }

  showToast("घोषणा यशस्वीपणे सेव्ह झाली! ✓");
  openPage("announcements", { skipPrevious: true });
});
// # EVENTS END

// # INITIALIZATION START
Promise.all([loadComplaints(), loadAnnouncements()])
  .then(() => openPage("overview", { skipPrevious: true }));
// # INITIALIZATION END
