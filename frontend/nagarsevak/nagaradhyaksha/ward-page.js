// # WARD PAGE SPECIFIC LOGIC
// This script handles the ward details page (ward.html)
// It shows complaints specific to a single ward with category filtering

// # WARD PAGE STATE START
const wardPageState = {
  currentWardId: null,
  wardComplaints: [],
  selectedCategory: "all",
  filteredComplaints: []
};
// # WARD PAGE STATE END

// # WARD PAGE UTILITIES START
/**
 * Extract ward ID from URL parameter
 * Example: ward.html?ward=1 returns "1"
 */
function getWardIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ward") || "1";
}

/**
 * Get ward information by ID
 * Returns ward object with name, nagarsevak, focus area
 */
function getWardInfo(wardId) {
  const wards = [
    { id: "1", name: "", nagarsevak: "सुरेश पाटील", focus: "कचरा व पाणीपुरवठा" },
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
  return wards.find(w => w.id === String(wardId)) || wards[0];
}

/**
 * Get all categories for filtering
 */
function getCategories() {
  return [
    { key: "all", label: "सर्व", icon: "fa-table-cells-large", className: "blue" },
    { key: "water", label: "पाणी", icon: "fa-droplet", className: "blue" },
    { key: "garbage", label: "कचरा", icon: "fa-trash-can", className: "green" },
    { key: "street-lights", label: "दिवे", icon: "fa-lightbulb", className: "orange" },
    { key: "road", label: "रस्ता", icon: "fa-road", className: "blue" },
    { key: "gutter", label: "गटार", icon: "fa-water", className: "green" },
    { key: "animals", label: "जनावरे", icon: "fa-shield-heart", className: "orange" },
    { key: "traffic", label: "वाहतूक", icon: "fa-traffic-light", className: "red" },
    { key: "drainage", label: "नाले", icon: "fa-person-digging", className: "green" },
    { key: "tree", label: "झाड", icon: "fa-tree", className: "green" },
    { key: "other", label: "इतर", icon: "fa-circle-plus", className: "purple" }
  ];
}

/**
 * Get category info by key
 */
function getCategoryInfo(key) {
  return getCategories().find(c => c.key === key) || getCategories()[getCategories().length - 1];
}

/**
 * Filter complaints by ward and category
 */
function filterComplaintsByCategory(wardId, selectedCategory) {
  // Get all complaints from main state
  let complaints = state.allComplaints || [];
  
  // Filter by ward
  complaints = complaints.filter(c => String(c.ward) === String(wardId));
  
  // Filter by category if not "all"
  if (selectedCategory && selectedCategory !== "all") {
    complaints = complaints.filter(c => {
      const complaintCategory = c.category || "other";
      return complaintCategory === selectedCategory;
    });
  }
  
  return complaints;
}

/**
 * Calculate complaint statistics for a ward
 */
function getWardStatistics(wardId) {
  const complaints = state.allComplaints.filter(c => String(c.ward) === String(wardId));
  
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status.toLowerCase().includes("pending") || c.status.toLowerCase().includes("प्रलंबित")).length,
    progress: complaints.filter(c => c.status.toLowerCase().includes("progress") || c.status.toLowerCase().includes("कारवाई")).length,
    resolved: complaints.filter(c => c.status.toLowerCase().includes("resolve") || c.status.toLowerCase().includes("पूर्ण")).length
  };
  
  return stats;
}

/**
 * Format status in Marathi
 */
function formatStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("resolve") || normalized.includes("पूर्ण")) return "पूर्ण";
  if (normalized.includes("progress") || normalized.includes("कारवाई")) return "कारवाई सुरू";
  return "प्रलंबित";
}

/**
 * Get badge class based on status
 */
function getStatusBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("resolve") || normalized.includes("पूर्ण")) return "badge resolved";
  if (normalized.includes("progress") || normalized.includes("कारवाई")) return "badge progress";
  return "badge pending";
}
// # WARD PAGE UTILITIES END

// # WARD PAGE RENDERERS START
/**
 * Render ward header with basic information and statistics
 */
function renderWardHeader(wardId) {
  const ward = getWardInfo(wardId);
  const stats = getWardStatistics(wardId);
  
  return `
    <!-- # WARD HEADER START -->
    <section class="page-heading">
      <div>
        <h1>वॉर्ड ${ward.id} - ${ward.name}</h1>
        <p>नगरसेवक: ${ward.nagarsevak} | मुख्य लक्ष्य: ${ward.focus}</p>
      </div>
      <button class="small-btn" onclick="window.history.back()" type="button">
        <i class="fa-solid fa-arrow-left"></i>मागे
      </button>
    </section>
    
    <!-- # STATISTICS CARDS START -->
    <section class="stats-grid">
      <article class="stat-card">
        <div class="tile-icon blue"><i class="fa-solid fa-list-check"></i></div>
        <strong>${stats.total}</strong>
        <span>एकूण तक्रारी</span>
      </article>
      <article class="stat-card">
        <div class="tile-icon orange"><i class="fa-solid fa-hourglass-end"></i></div>
        <strong>${stats.pending}</strong>
        <span>प्रलंबित</span>
      </article>
      <article class="stat-card">
        <div class="tile-icon teal"><i class="fa-solid fa-spinner"></i></div>
        <strong>${stats.progress}</strong>
        <span>कारवाई सुरू</span>
      </article>
      <article class="stat-card">
        <div class="tile-icon green"><i class="fa-solid fa-check-circle"></i></div>
        <strong>${stats.resolved}</strong>
        <span>पूर्ण</span>
      </article>
    </section>
    <!-- # STATISTICS CARDS END -->
  `;
}

/**
 * Render category filter buttons
 */
function renderCategoryFilters(wardId) {
  const categories = getCategories();
  const selectedCategory = wardPageState.selectedCategory;
  
  return `
    <!-- # CATEGORY FILTERS START -->
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>विभागनिहाय फिल्टर करा</h2>
          <p>तक्रारी प्रकार नुसार फिल्टर करण्यासाठी खाली क्लिक करा</p>
        </div>
      </div>
      <div class="category-grid">
        ${categories.map(category => `
          <button 
            class="category-tile ${selectedCategory === category.key ? 'active' : ''}" 
            onclick="filterWardByCategory('${wardId}', '${category.key}')"
            type="button"
            title="${category.label}"
          >
            <i class="fa-solid ${category.icon}"></i>
            <span>${category.label}</span>
            <small>${wardPageState.filteredComplaints.filter(c => (c.category || 'other') === category.key).length}</small>
          </button>
        `).join('')}
      </div>
    </section>
    <!-- # CATEGORY FILTERS END -->
  `;
}

/**
 * Render complaints list for the ward
 */
function renderWardComplaints(wardId) {
  const complaints = wardPageState.filteredComplaints;
  
  if (complaints.length === 0) {
    return `
      <!-- # EMPTY STATE START -->
      <div class="empty-state">
        <i class="fa-solid fa-inbox" style="font-size: 32px; margin-bottom: 12px;"></i>
        <p>या वॉर्डमध्ये निवडलेल्या प्रकारची कोणतीही तक्रारी नाही.</p>
      </div>
      <!-- # EMPTY STATE END -->
    `;
  }
  
  return `
    <!-- # COMPLAINTS LIST START -->
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>तक्रारी</h2>
          <p>एकूण ${complaints.length} तक्रारी</p>
        </div>
      </div>
      <div class="complaints-list">
        ${complaints.map(complaint => `
          <article class="complaint-card">
            <div class="tile-icon blue">
              <i class="fa-solid fa-exclamation"></i>
            </div>
            <div>
              <h3>${complaint.title || 'तक्रारी'}</h3>
              <p>${complaint.description || 'विवरण उपलब्ध नाही'}</p>
              <div class="meta-row">
                <span><strong>नागरिक:</strong> ${complaint.citizen_name || 'अज्ञात'}</span>
                <span class="${getStatusBadgeClass(complaint.status)}">${formatStatus(complaint.status)}</span>
                <span><strong>ID:</strong> ${complaint.id || 'N/A'}</span>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
    <!-- # COMPLAINTS LIST END -->
  `;
}

/**
 * Main render function for ward page
 */
function renderWardPage(wardId) {
  return `
    ${renderWardHeader(wardId)}
    ${renderCategoryFilters(wardId)}
    ${renderWardComplaints(wardId)}
  `;
}
// # WARD PAGE RENDERERS END

// # WARD PAGE FUNCTIONS START
/**
 * Load ward details and display page
 * Called when ward.html is loaded
 */
async function loadWardPage() {
  const wardId = getWardIdFromURL();
  wardPageState.currentWardId = wardId;
  wardPageState.selectedCategory = "all";
  
  // Wait for complaints to load from main nagaradhyaksha.js
  const maxAttempts = 50;
  let attempts = 0;
  
  while (!state.allComplaints || state.allComplaints.length === 0) {
    if (attempts >= maxAttempts) {
      console.warn("Complaints failed to load");
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  // Apply filters
  wardPageState.filteredComplaints = filterComplaintsByCategory(wardId, "all");
  
  // Update page title
  const ward = getWardInfo(wardId);
  document.getElementById("pageTitle").textContent = `वॉर्ड ${ward.id} - ${ward.name}`;
  
  // Render page
  const viewContainer = document.getElementById("viewContainer");
  if (viewContainer) {
    viewContainer.innerHTML = renderWardPage(wardId);
  }
}

/**
 * Filter complaints by category and re-render
 * Called when user clicks category filter
 */
function filterWardByCategory(wardId, categoryKey) {
  wardPageState.selectedCategory = categoryKey;
  wardPageState.filteredComplaints = filterComplaintsByCategory(wardId, categoryKey);
  
  const viewContainer = document.getElementById("viewContainer");
  if (viewContainer) {
    viewContainer.innerHTML = renderWardPage(wardId);
  }
}

/**
 * Navigate to ward page from dashboard
 * Call this from main nagaradhyaksha.js when clicking a ward card
 */
function openWardDetails(wardId) {
  window.location.href = `ward.html?ward=${wardId}`;
}
// # WARD PAGE FUNCTIONS END

// # LOGIN AND INITIALIZATION START
// This section handles login for ward.html (same login as nagaradhyaksha.js)
const presidentLogin = document.getElementById("presidentLogin");
const presidentPage = document.getElementById("presidentPage");
const presidentLoginForm = document.getElementById("presidentLoginForm");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const backButton = document.getElementById("backButton");

// Login form handler
presidentLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("presidentUsername").value.trim().toLowerCase();
  const password = document.getElementById("presidentPassword").value.trim();
  
  if (username !== "nagaradhyaksha" || password !== "123456") {
    showToastWard("कृपया योग्य लॉगिन तपशील प्रविष्ट करा.");
    return;
  }
  
  presidentLogin.hidden = true;
  presidentPage.hidden = false;
  showToastWard("नगराध्यक्ष डॅशबोर्ड उघडले.");
  
  // Load ward page after login
  setTimeout(loadWardPage, 300);
});

// Menu toggle
menuToggle?.addEventListener("click", () => sidebar?.classList.toggle("open"));

// Back button
backButton?.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Toast helper for ward page
function showToastWard(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToastWard.timer);
  showToastWard.timer = window.setTimeout(() => toast.classList.remove("show"), 2300);
}

// Check if user is on ward.html (not main index.html)
if (window.location.pathname.includes("ward.html")) {
  // Wait for main nagaradhyaksha.js to load, then load ward page
  Promise.all([
    new Promise(resolve => {
      const checkState = setInterval(() => {
        if (state && state.allComplaints) {
          clearInterval(checkState);
          resolve();
        }
      }, 100);
      setTimeout(() => clearInterval(checkState), 5000);
    })
  ]).then(() => loadWardPage());
}
// # LOGIN AND INITIALIZATION END
