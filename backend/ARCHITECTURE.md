# System Architecture & Data Flow Diagrams

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ index.html   │  │  ward.html   │  │ CSS/Images  │          │
│  │ Dashboard    │  │ Ward Details │  │             │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                 │
│  ┌──────▼──────────────────▼──────────────────▼───────┐         │
│  │  JavaScript Layer                                  │         │
│  │  ┌─────────────────────────────────────────────┐   │         │
│  │  │ nagaradhyaksha.js  (Main App Logic)        │   │         │
│  │  │ - Page navigation                          │   │         │
│  │  │ - Complaint state management               │   │         │
│  │  │ - API communication                        │   │         │
│  │  └─────────────────────────────────────────────┘   │         │
│  │  ┌─────────────────────────────────────────────┐   │         │
│  │  │ ward-page.js  (Ward-Specific Logic)        │   │         │
│  │  │ - Ward details rendering                   │   │         │
│  │  │ - Category filtering                       │   │         │
│  │  │ - URL parameter parsing                    │   │         │
│  │  └─────────────────────────────────────────────┘   │         │
│  └──────┬──────────────────────────────────────────────┘         │
│         │                                                        │
│         │ HTTP/JSON Requests                                    │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │ (http://127.0.0.1:8000)
          │
┌─────────▼────────────────────────────────────────────────────────┐
│                     FASTAPI SERVER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  REST API Endpoints                                 │      │
│  │  GET  /complaints                                   │      │
│  │  GET  /complaints/{id}                              │      │
│  │  POST /complaints                                   │      │
│  │  PUT  /complaints/{id}                              │      │
│  │  GET  /wards                                        │      │
│  │  GET  /wards/{id}/complaints                        │      │
│  │  GET  /wards/{id}/statistics                        │      │
│  │  GET  /announcements                                │      │
│  │  ... (more endpoints)                              │      │
│  └──────────────────┬───────────────────────────────────┘      │
│                     │ Query/Insert/Update/Delete               │
│  ┌──────────────────▼───────────────────────────────────┐      │
│  │  Database Layer (SQLite)                            │      │
│  │  ┌────────────────────────────────────────────────┐  │      │
│  │  │ complaints       - All citizen complaints     │  │      │
│  │  │ wards            - Ward master data          │  │      │
│  │  │ announcements    - Public notices            │  │      │
│  │  │ action_log       - Status change history     │  │      │
│  │  └────────────────────────────────────────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│                     ▲                                          │
│                     │ (File: seva_setu.db)                     │
└─────────────────────┼──────────────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │  Storage Device│
              │ seva_setu.db   │
              └────────────────┘
```

---

## 📊 Data Flow: User Navigation

### 1. Dashboard to Ward Details Flow

```
START
  ↓
User opens index.html
  ↓
nagaradhyaksha.js loads
  ├─ Initializes state
  ├─ Loads complaints from API
  ├─ Loads announcements from API
  └─ Renders overview page
  ↓
[DASHBOARD DISPLAYED]
  ├─ Hero panel with stats
  ├─ Ward cards (clickable)
  └─ Recent announcements
  ↓
User clicks "वॉर्ड विभाग" button
  ├─ sidebar nav handler triggers
  ├─ openPage("wards") called
  └─ renderWards() shows all 10 wards
  ↓
[WARDS PAGE DISPLAYED]
  ├─ All 10 ward cards with statistics
  ├─ Progress bars showing resolution rate
  └─ Each card is clickable
  ↓
User clicks Ward 1 card
  ├─ onclick="window.location.href='ward.html?ward=1'"
  ├─ Browser navigates to new URL
  └─ URL: ward.html?ward=1
  ↓
ward.html loads
  ├─ Runs presidentLoginForm (same login page)
  └─ User already logged in? Skip to app
  ↓
ward-page.js executes
  ├─ Checks if user is on ward.html
  ├─ Waits for state.allComplaints to load
  │   (nagaradhyaksha.js still running in background)
  └─ loadWardPage() is called
  ↓
loadWardPage() function
  ├─ getWardIdFromURL() → extracts "1" from ?ward=1
  ├─ Waits for state.allComplaints (max 5 seconds)
  ├─ filterComplaintsByCategory(1, "all") gets Ward 1 complaints
  ├─ getWardStatistics(1) calculates stats
  ├─ renderWardPage(1) generates HTML
  └─ Updates DOM with viewContainer.innerHTML
  ↓
[WARD 1 DETAILS PAGE DISPLAYED]
  ├─ Header: Ward 1 - बाजारपेठ
  ├─ Nagarsevak: सुरेश पाटील
  ├─ Stats: Total=3, Pending=1, Progress=1, Resolved=1
  ├─ Category filters (water, garbage, road, etc)
  └─ Complaints list for Ward 1
  ↓
User clicks "कचरा" (Garbage) filter
  ├─ Category button click handler fires
  ├─ filterWardByCategory(1, "garbage") called
  ├─ Updates wardPageState.selectedCategory
  ├─ Filters complaints: only garbage complaints for Ward 1
  └─ Re-renders complaint list
  ↓
[FILTERED COMPLAINTS DISPLAYED]
  ├─ Only garbage complaints shown
  ├─ Count updates in category filters
  └─ Other categories show 0 count
  ↓
User clicks back button
  ├─ backButton click handler fires
  ├─ window.location.href = "index.html"
  └─ Returns to main dashboard
  ↓
END
```

---

## 🔄 API Request/Response Flow

### Example 1: Get Ward Complaints

```javascript
// FRONTEND CODE (nagaradhyaksha.js)
async function loadComplaints() {
  try {
    const response = await fetch("http://127.0.0.1:8000/complaints");
    // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
    // Network Request Sent
    // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
    
    if (!response.ok) throw new Error("API not available");
    state.allComplaints = applyLocalActions(await response.json());
    // ↑ ↑ ↑ Response data stored in state
  } catch (error) {
    state.allComplaints = applyLocalActions(demoComplaints);
    // Fallback to demo data if API fails
  }
}
```

```
BROWSER                              FASTAPI SERVER
   │                                      │
   │ GET /complaints                      │
   ├────────────────────────────────────► │
   │                                      │
   │                              [Process Request]
   │                                      │
   │                              SELECT * FROM complaints
   │                                      │
   │                              [Query SQLite DB]
   │                                      │
   │                                      │
   │ HTTP 200 + JSON Response             │
   │ [                                    │
   │   {id: "D101", ward: 1, ...},    ◄──┤
   │   {id: "D102", ward: 1, ...},       │
   │   {id: "D201", ward: 2, ...},       │
   │   ...                                │
   │ ]                                    │
   │ ◄────────────────────────────────────┤
   │                                      │
[Store in state.allComplaints]
```

### Example 2: Get Ward Statistics

```javascript
// FRONTEND CODE (ward-page.js)
function getWardStatistics(wardId) {
  const complaints = state.allComplaints.filter(c => String(c.ward) === String(wardId));
  
  return {
    total: complaints.length,
    pending: complaints.filter(c => c.status.includes("pending")).length,
    progress: complaints.filter(c => c.status.includes("progress")).length,
    resolved: complaints.filter(c => c.status.includes("resolve")).length
  };
}

// Or get from API:
fetch(`/wards/1/statistics`)
  .then(r => r.json())
  .then(stats => {
    // stats = {ward_id: 1, total: 3, pending: 1, progress: 1, resolved: 1}
    displayStats(stats);
  });
```

```
REQUEST:  GET /wards/1/statistics
RESPONSE:
{
  "ward_id": 1,
  "total": 3,
  "pending": 1,
  "progress": 1,
  "resolved": 1
}

SQL QUERY:
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as progress,
  SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
FROM complaints WHERE ward = 1
```

### Example 3: Filter Complaints by Category

```javascript
// FRONTEND CODE (ward-page.js)
function filterComplaintsByCategory(wardId, selectedCategory) {
  let complaints = state.allComplaints || [];
  
  // Step 1: Filter by ward
  complaints = complaints.filter(c => String(c.ward) === String(wardId));
  
  // Step 2: Filter by category if not "all"
  if (selectedCategory && selectedCategory !== "all") {
    complaints = complaints.filter(c => {
      const complaintCategory = c.category || "other";
      return complaintCategory === selectedCategory;
    });
  }
  
  return complaints;
  // Returns only complaints matching BOTH ward AND category
}

// Example call:
filterComplaintsByCategory("1", "garbage")
// Returns: [{id: "D101", ward: "1", category: "garbage", ...}]
```

```
Data in Memory:
allComplaints = [
  {id: "D101", ward: "1", category: "garbage", status: "Pending"},
  {id: "D102", ward: "1", category: "water", status: "In Progress"},
  {id: "D103", ward: "1", category: "garbage", status: "Resolved"},
  {id: "D201", ward: "2", category: "garbage", status: "Pending"}
]

Step 1: Filter by ward=1
  → [{id: "D101", category: "garbage"}, {id: "D102", category: "water"}, {id: "D103", category: "garbage"}]

Step 2: Filter by category=garbage
  → [{id: "D101", category: "garbage"}, {id: "D103", category: "garbage"}]

Rendered as 2 complaint cards
```

---

## 📱 State Management

### Global State (in nagaradhyaksha.js)

```javascript
const state = {
  currentPage: "overview",        // Which page is currently displayed
  previousPage: "overview",       // For back button navigation
  selectedWard: "all",            // Filter for categories page
  selectedCategory: "all",        // Filter for categories page
  announcementAudience: "citizen",// Filter for announcements page
  allComplaints: [],              // ALL complaints from backend
  announcements: []               // ALL announcements from backend
};
```

### Ward Page State (in ward-page.js)

```javascript
const wardPageState = {
  currentWardId: null,            // Current ward being displayed (1-10)
  wardComplaints: [],             // All complaints for this ward
  selectedCategory: "all",        // Selected category filter
  filteredComplaints: []          // Complaints after filtering
};
```

### State Flow

```
┌─────────────────────────────────────┐
│ App Starts                          │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ loadComplaints() & loadAnnouncements()
│ ├─ Fetch from API                   │
│ └─ Store in state.allComplaints     │
│              & state.announcements  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ openPage("overview")                │
│ ├─ renderOverview() uses            │
│ │  state.allComplaints              │
│ └─ Display dashboard                │
└────────────────┬────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
   [Dashboard]    [Ward Page]
        │                 │
        │                 ▼
        │         ┌──────────────────┐
        │         │ loadWardPage()   │
        │         ├─ Wait for state. │
        │         │  allComplaints   │
        │         ├─ Filter by ward  │
        │         └─ Display ward    │
        │                 │
        │    ┌────────────┴────────────┐
        │    ▼                         ▼
        │ [No Filter]         [Category Filter]
        │    │                         │
        │    ▼                         ▼
        └─[All Complaints]  [Filtered Complaints]
```

---

## 🗄️ Database Query Examples

### Query 1: Get All Complaints for a Ward

```sql
SELECT * FROM complaints 
WHERE ward = 1 
ORDER BY created_at DESC;
```

**Result**:
```
id      | citizen_name | ward | category | status    | created_at
--------|--------------|------|----------|-----------|-------------------
D101    | Aarav Naik   | 1    | garbage  | Pending   | 2024-01-15 10:30:00
D102    | Meera Sawant | 1    | water    | In Progress | 2024-01-14 09:15:00
D103    | Rohan Parab  | 1    | road     | Resolved  | 2024-01-13 14:45:00
```

### Query 2: Get Ward Statistics

```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as progress,
  SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
FROM complaints 
WHERE ward = 1;
```

**Result**:
```
total | pending | progress | resolved
------|---------|----------|----------
3     | 1       | 1        | 1
```

### Query 3: Get Category Distribution

```sql
SELECT category, COUNT(*) as count
FROM complaints 
WHERE ward = 1
GROUP BY category;
```

**Result**:
```
category | count
---------|-------
garbage  | 1
water    | 1
road     | 1
```

### Query 4: Get Resolution Rate

```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
  ROUND(100.0 * SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) / COUNT(*), 2) as rate
FROM complaints 
WHERE ward = 1;
```

**Result**:
```
total | resolved | rate
------|----------|-------
3     | 1        | 33.33
```

---

## 🎨 UI Component Hierarchy

### index.html Structure

```
<body>
  <main class="president-login-page">
    [LOGIN FORM]
  </main>
  
  <main class="president-page" hidden>
    <aside class="sidebar">
      [NAVIGATION MENU]
    </aside>
    
    <section class="main-area">
      <header class="topbar">
        [TOP BAR WITH BUTTONS & PROFILE]
      </header>
      
      <section id="viewContainer" class="view-container">
        [DYNAMIC CONTENT INJECTED HERE]
        [Rendered by nagaradhyaksha.js]
      </section>
    </section>
  </main>
  
  <div id="toast">
    [NOTIFICATIONS]
  </div>
</body>
```

### ward.html Structure

```
<body>
  <main class="president-login-page">
    [SAME LOGIN FORM]
  </main>
  
  <main class="president-page" hidden>
    <aside class="sidebar">
      [SAME NAVIGATION, LINKS BACK TO index.html]
    </aside>
    
    <section class="main-area">
      <header class="topbar">
        [SAME TOP BAR]
      </header>
      
      <section id="viewContainer" class="view-container">
        [WARD DETAILS INJECTED HERE]
        [Rendered by ward-page.js]
      </section>
    </section>
  </main>
  
  <div id="toast">
    [NOTIFICATIONS]
  </div>
</body>
```

---

## 📈 Scalability Architecture

### Current (SQLite - 1 Server)

```
┌─────────────────┐
│  Single Server  │
├─────────────────┤
│ App + DB        │
│ (index.html)    │
│ (ward.html)     │
│ (FastAPI)       │
│ (SQLite DB)     │
└─────────────────┘
```

### Future (PostgreSQL - Multiple Servers)

```
┌──────────────────────────────────────────────┐
│            Load Balancer (Nginx)             │
└────────┬──────────────────────────┬──────────┘
         │                          │
    ┌────▼─────┐              ┌────▼─────┐
    │ App 1    │              │ App 2    │
    │ FastAPI  │              │ FastAPI  │
    │ Port 8000│              │ Port 8001│
    └────┬─────┘              └────┬─────┘
         │                          │
         └────────────┬─────────────┘
                      │
         ┌────────────▼────────────┐
         │   PostgreSQL Cluster    │
         │  (Master-Slave with     │
         │   Replication & Backup) │
         └─────────────────────────┘
```

---

## 🔐 Authentication Flow

### Current (Demo)

```
User Input
  ↓
username = "nagaradhyaksha"
password = "123456"
  ↓
if (username === "nagaradhyaksha" && password === "123456")
  ├─ YES: Hide login, show dashboard
  └─ NO: Show error toast
```

### Future (Production)

```
User Input
  ↓
POST /auth/login
  ├─ username: "nagaradhyaksha"
  ├─ password: "actualpassword123"
  └─ 2fa_code: "123456" (optional)
  ↓
Backend
  ├─ Hash password with bcrypt
  ├─ Check against database
  ├─ Generate JWT token
  └─ Return {token: "eyJhbG..."}
  ↓
Store in localStorage/sessionStorage
  ↓
All subsequent requests
  ├─ Authorization: "Bearer eyJhbG..."
  └─ Backend validates token
```

---

## 📊 Complete Data Flow Diagram

```
User Interaction
       │
       ▼
HTML Event Handler
       │
       ├─→ Click handler
       ├─→ Change handler
       └─→ Submit handler
       │
       ▼
JavaScript Function
       │
       ├─→ state.selectedCategory = "garbage"
       ├─→ renderPage()
       └─→ fetch() API call
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
   API Call            DOM Update
   (async)            (immediate)
       │                     │
       │         ┌───────────┘
       │         │
       ▼         ▼
   FastAPI    HTML Rendered
   (Python)        │
       │           ▼
       │       User Sees
   SQLite       New Content
       │
       └──────────┬─────────┘
                  │
                  ▼
            Response JSON
                  │
                  ▼
            state.updated
                  │
                  ▼
            Re-render Page
```

---

## ✨ Key Integration Points

1. **index.html** → **nagaradhyaksha.js**
   - HTML provides structure
   - JS provides interactivity
   - CSS provides styling

2. **nagaradhyaksha.js** → **FastAPI Backend**
   - `fetch()` sends HTTP requests
   - Backend returns JSON
   - JS processes and renders

3. **ward.html** → **ward-page.js**
   - Same structure as index.html
   - Different rendering logic
   - URL parameters for state

4. **FastAPI** → **SQLite**
   - ORM-like SQL queries
   - CRUD operations
   - Transaction management

---

This architecture is designed to be:
- **Modular**: Each component has a single responsibility
- **Scalable**: Easy to add more features
- **Maintainable**: Clear separation of concerns
- **Testable**: Each layer can be tested independently
