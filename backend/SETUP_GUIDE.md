# Seva Setu - Smart Public Complaint System
## Complete Setup and Integration Guide

---

## 📋 Table of Contents
1. [Overview of Changes](#overview-of-changes)
2. [File Structure](#file-structure)
3. [Installation & Setup](#installation--setup)
4. [Frontend Integration](#frontend-integration)
5. [Backend Setup](#backend-setup)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [URL Navigation Guide](#url-navigation-guide)
9. [Testing](#testing)
10. [PostgreSQL Migration](#postgresql-migration)
11. [Scalability Recommendations](#scalability-recommendations)

---

## Overview of Changes

### What's New

#### 1. **Ward Details Page (NEW)**
- **File**: `ward.html`
- **Feature**: Displays all complaints for a specific ward
- Shows statistics: Total, Pending, In Progress, Resolved complaints
- Category filtering on the ward page
- Navigation using URL parameters: `ward.html?ward=1`

#### 2. **Ward-Specific JavaScript Logic (NEW)**
- **File**: `ward-page.js`
- **Features**:
  - Load ward complaints from API
  - Filter complaints by category
  - Calculate ward statistics
  - Responsive ward details view

#### 3. **Enhanced Main Dashboard**
- **File**: `nagaradhyaksha-modified.js` (Replace your existing file)
- **Changes**:
  - Ward cards are now **clickable** → navigate to `ward.html?ward={id}`
  - Added `getWardStatistics()` function
  - Integrated ward-specific API endpoint
  - Better error handling

#### 4. **FastAPI Backend (NEW)**
- **File**: `fastapi_backend.py`
- **Features**:
  - RESTful API for complaints
  - Ward-specific endpoints
  - Category filtering
  - Announcement management
  - Analytics endpoints
  - SQLite database (upgradeable to PostgreSQL)

#### 5. **CSS (NO CHANGES NEEDED)**
- Your existing `nagaradhyaksha.css` works perfectly
- All new elements use existing classes
- Responsive design maintained

---

## File Structure

```
your-project/
├── index.html                          (Main dashboard - existing)
├── ward.html                           (NEW - Ward details page)
├── nagaradhyaksha.css                  (Existing - no changes)
├── nagaradhyaksha-modified.js          (MODIFIED - Replace your current file)
├── ward-page.js                        (NEW - Ward page logic)
├── fastapi_backend.py                  (NEW - Python backend)
├── seva_setu.db                        (SQLite database - auto-created)
└── requirements.txt                    (Dependencies for backend)
```

---

## Installation & Setup

### Step 1: Backup Your Current Files
```bash
cp nagaradhyaksha.js nagaradhyaksha.js.backup
cp index.html index.html.backup
```

### Step 2: Add New Files to Your Project
```bash
# Copy these files to your project directory
cp ward.html your-project/
cp ward-page.js your-project/
cp nagaradhyaksha-modified.js your-project/nagaradhyaksha.js
cp fastapi_backend.py your-project/
```

### Step 3: Create requirements.txt
```bash
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
EOF

pip install -r requirements.txt
```

### Step 4: Start the Backend
```bash
# From your project directory
python fastapi_backend.py

# OR using uvicorn directly
uvicorn fastapi_backend:app --reload --port 8000
```

Expected output:
```
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 5: Test Backend
Open your browser and visit:
- http://127.0.0.1:8000/docs (Swagger documentation)
- http://127.0.0.1:8000/health (Health check)

### Step 6: Open Frontend
Open `index.html` in your browser and login with:
- Username: `nagaradhyaksha`
- Password: `123456`

---

## Frontend Integration

### How Ward Navigation Works

#### **Before (Old Way)**
Ward cards were static, clicking them just filtered the categories page.

#### **After (New Way)**
Clicking a ward card navigates to a dedicated ward details page:

```html
<!-- In index.html, renderWards() function -->
<article class="ward-card" 
         onclick="window.location.href='ward.html?ward=${ward.id}'">
  <!-- Ward card content -->
</article>
```

### Step-by-Step Navigation Flow

```
User opens index.html
       ↓
Logs in with nagaradhyaksha/123456
       ↓
Clicks "वॉर्ड विभाग" (Wards) in sidebar
       ↓
Sees all 10 ward cards with stats
       ↓
Clicks on Ward 1 (or any ward)
       ↓
Browser navigates to: ward.html?ward=1
       ↓
Ward page loads with:
  - Ward header with nagarsevak info
  - Statistics cards (Total, Pending, In Progress, Resolved)
  - Category filter buttons
  - List of complaints for that ward
       ↓
User selects a category (e.g., "कचरा" - Garbage)
       ↓
Complaints list updates to show only garbage complaints
```

### Key Changes in nagaradhyaksha.js

#### Change 1: Ward Card Click Handler
**Location**: Line ~180 in renderOverview()
```javascript
// BEFORE:
<article class="ward-card" data-ward="${ward.id}">

// AFTER:
<article class="ward-card" onclick="window.location.href='ward.html?ward=${ward.id}'">
```

#### Change 2: New getWardStatistics() Function
**Location**: Line ~142
```javascript
/**
 * Get ward statistics (total, pending, in-progress, resolved)
 * Used for displaying ward overview cards
 */
function getWardStatistics(wardId) {
  const complaints = state.allComplaints.filter(c => String(c.ward) === String(wardId));
  return {
    total: complaints.length,
    pending: complaints.filter(c => c.status.toLowerCase().includes("pending")).length,
    progress: complaints.filter(c => c.status.toLowerCase().includes("progress")).length,
    resolved: complaints.filter(c => c.status.toLowerCase().includes("resolve")).length
  };
}
```

#### Change 3: Updated renderWards()
**Location**: Line ~180-220
Shows statistics for each ward in the sidebar display.

### How to Integrate with Your Current Code

If you want to manually merge instead of replacing:

1. **Copy the new `getWardStatistics()` function** (after line 142)
2. **Replace ward card rendering** in `renderOverview()` and `renderWards()` functions
3. **Replace `renderWards()` completely** with the new version
4. **Keep everything else the same**

---

## Backend Setup

### FastAPI Server

The backend provides REST API endpoints for:
- CRUD operations on complaints
- Ward-specific data
- Category filtering
- Announcements
- Analytics

### Running the Backend

```bash
# Development (with auto-reload)
python fastapi_backend.py

# Or explicit uvicorn command
uvicorn fastapi_backend:app --reload --port 8000

# Production (with workers)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker fastapi_backend:app
```

### Database Initialization

The database is **automatically created** when you run the backend:
- `seva_setu.db` file is created in the same directory
- All tables are initialized
- Demo ward data is inserted

### Checking Database Content

```bash
# Using sqlite3 CLI
sqlite3 seva_setu.db

# SQL commands
.tables                    # Show all tables
SELECT * FROM complaints;  # View all complaints
SELECT * FROM wards;       # View all wards
SELECT * FROM announcements; # View announcements
```

---

## Database Schema

### Complaints Table
```sql
CREATE TABLE complaints (
    id TEXT PRIMARY KEY,           -- "D001", "D002", etc.
    citizen_name TEXT NOT NULL,    -- Citizen's full name
    citizen_phone TEXT,            -- Contact number
    ward INTEGER NOT NULL,         -- Ward ID (1-10)
    category TEXT NOT NULL,        -- water, garbage, road, etc.
    title TEXT NOT NULL,           -- Short title
    description TEXT NOT NULL,     -- Detailed description
    image TEXT,                    -- Image filename/URL
    status TEXT DEFAULT 'Pending', -- Pending, In Progress, Resolved
    created_at TIMESTAMP,          -- Creation time
    updated_at TIMESTAMP,          -- Last update time
    assigned_to TEXT,              -- Assigned officer
    action_note TEXT               -- Action taken
);
```

### Wards Table
```sql
CREATE TABLE wards (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    nagarsevak TEXT NOT NULL,
    focus TEXT NOT NULL
);
```

### Announcements Table
```sql
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,           -- citizen, nagarsevak
    ward TEXT NOT NULL,           -- Ward ID or "all"
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP
);
```

### Action Log Table
```sql
CREATE TABLE action_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);
```

---

## API Endpoints

### Complaints

#### Get All Complaints
```
GET /complaints
GET /complaints?ward=1
GET /complaints?ward=1&category=garbage
GET /complaints?status=Pending
```

**Response**:
```json
[
  {
    "id": "D101",
    "citizen_name": "Aarav Naik",
    "ward": 1,
    "category": "garbage",
    "title": "Garbage not collected",
    "description": "...",
    "status": "Pending",
    "created_at": "2024-01-15T10:30:00"
  }
]
```

#### Get Single Complaint
```
GET /complaints/D101
```

#### Create Complaint
```
POST /complaints
Content-Type: application/json

{
  "citizen_name": "John Doe",
  "citizen_phone": "9876543210",
  "ward": 1,
  "category": "road",
  "title": "Pothole near market",
  "description": "Large pothole affecting traffic",
  "image": "photo.jpg"
}
```

#### Update Complaint
```
PUT /complaints/D101
Content-Type: application/json

{
  "status": "In Progress",
  "assigned_to": "Officer Name",
  "action_note": "Repair work started"
}
```

#### Delete Complaint
```
DELETE /complaints/D101
```

### Wards

#### Get All Wards
```
GET /wards
```

#### Get Ward Statistics
```
GET /wards/1/statistics
```

**Response**:
```json
{
  "ward_id": 1,
  "total": 5,
  "pending": 2,
  "progress": 1,
  "resolved": 2
}
```

#### Get Ward Complaints
```
GET /wards/1/complaints
GET /wards/1/complaints?category=garbage
```

### Announcements

#### Get All Announcements
```
GET /announcements
GET /announcements?audience_type=citizen
```

#### Create Announcement
```
POST /announcements
Content-Type: application/json

{
  "type": "citizen",
  "ward": "all",
  "subject": "Water supply notice",
  "message": "Water supply will be disrupted on...",
  "created_by": "nagaradhyaksha"
}
```

### Analytics

#### Category Distribution
```
GET /analytics/category-distribution
GET /analytics/category-distribution?ward=1
```

#### Status Distribution
```
GET /analytics/status-distribution
GET /analytics/status-distribution?ward=1
```

#### Resolution Rate
```
GET /analytics/resolution-rate
GET /analytics/resolution-rate?ward=1
```

---

## URL Navigation Guide

### Main Dashboard
```
index.html              → Overview page
index.html?page=wards   → Wards page
index.html?page=categories → Categories page
```

### Ward Details (NEW)
```
ward.html?ward=1        → Ward 1 details
ward.html?ward=2        → Ward 2 details
ward.html?ward=3        → Ward 3 details
...
ward.html?ward=10       → Ward 10 details
```

### How URL Parameters Work in JavaScript

```javascript
// In ward-page.js, line ~58
function getWardIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ward") || "1";
}

// Usage:
const wardId = getWardIdFromURL();
// If URL is ward.html?ward=3, wardId = "3"
```

---

## Testing

### Test 1: Backend Health Check
```bash
curl http://127.0.0.1:8000/health
# Expected: {"status":"online","service":"Seva Setu API"}
```

### Test 2: Get All Complaints
```bash
curl http://127.0.0.1:8000/complaints
# Expected: Array of complaint objects
```

### Test 3: Get Ward Statistics
```bash
curl http://127.0.0.1:8000/wards/1/statistics
# Expected: {"ward_id":1,"total":3,"pending":1,"progress":1,"resolved":1}
```

### Test 4: Create a Complaint
```bash
curl -X POST http://127.0.0.1:8000/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "citizen_name": "Test User",
    "ward": 1,
    "category": "water",
    "title": "Water leak",
    "description": "Pipeline leakage"
  }'
```

### Test 5: Frontend Navigation
1. Open `index.html` in browser
2. Login with nagaradhyaksha / 123456
3. Click "वॉर्ड विभाग" (Wards)
4. Click on Ward 1 card
5. Should navigate to `ward.html?ward=1`
6. See ward statistics and complaints
7. Click category filter
8. Complaints should update

---

## PostgreSQL Migration

### When to Migrate?

Migrate to PostgreSQL when:
- Expected users: > 1,000
- Concurrent requests: > 100
- Data size: > 500MB
- Need replication/backup

### Migration Steps

#### Step 1: Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Step 2: Create Database
```bash
# Create database
createdb seva_setu

# Create user (optional but recommended)
createuser seva_setu_user
```

#### Step 3: Modify Backend Code
Replace the database initialization in `fastapi_backend.py`:

```python
# OLD (SQLite):
DATABASE_PATH = "seva_setu.db"

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# NEW (PostgreSQL):
import psycopg2
from psycopg2.pool import SimpleConnectionPool

DATABASE_URL = "postgresql://seva_setu_user:password@localhost:5432/seva_setu"

connection_pool = SimpleConnectionPool(1, 20, DATABASE_URL)

def get_db():
    return connection_pool.getconn()

# At the end of request, return connection:
# connection_pool.putconn(conn)
```

#### Step 4: Create Tables in PostgreSQL
```bash
psql -U seva_setu_user -d seva_setu -f schema.sql
```

Create `schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(10) PRIMARY KEY,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(20),
    ward INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to VARCHAR(255),
    action_note TEXT
);

CREATE INDEX idx_complaints_ward ON complaints(ward);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);

-- Similar for other tables...
```

#### Step 5: Migrate Data (if existing SQLite data)
```python
import sqlite3
import psycopg2

# Read from SQLite
sqlite_conn = sqlite3.connect('seva_setu.db')
sqlite_cursor = sqlite_conn.cursor()
sqlite_cursor.execute("SELECT * FROM complaints")
complaints = sqlite_cursor.fetchall()

# Write to PostgreSQL
pg_conn = psycopg2.connect("dbname=seva_setu user=seva_setu_user")
pg_cursor = pg_conn.cursor()

for complaint in complaints:
    pg_cursor.execute("""
        INSERT INTO complaints VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, complaint)

pg_conn.commit()
```

#### Step 6: Update Connection String
```python
# Update in fastapi_backend.py
DB_URL = "postgresql://seva_setu_user:password@localhost:5432/seva_setu"
```

#### Step 7: Test with PostgreSQL
```bash
python fastapi_backend.py
# Should work exactly the same as SQLite
```

---

## Scalability Recommendations

### For 10,000+ Users

#### 1. Database Optimization
```sql
-- Add indexes for frequently accessed queries
CREATE INDEX idx_complaints_ward_status ON complaints(ward, status);
CREATE INDEX idx_complaints_category_status ON complaints(category, status);
CREATE INDEX idx_announcements_type_ward ON announcements(type, ward);
CREATE INDEX idx_action_log_complaint_id_date ON action_log(complaint_id, changed_at);

-- Partition large tables by date
CREATE TABLE complaints_2024_q1 PARTITION OF complaints
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

#### 2. Backend Optimization
```python
# Add caching with Redis
from redis import Redis
redis_client = Redis(host='localhost', port=6379, db=0)

# Cache ward statistics for 5 minutes
@app.get("/wards/{ward_id}/statistics")
async def get_ward_statistics(ward_id: int):
    cache_key = f"ward_stats_{ward_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    # ... fetch from DB
    redis_client.setex(cache_key, 300, json.dumps(result))
    return result
```

#### 3. API Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/complaints")
@limiter.limit("100/minute")
async def get_complaints(request: Request):
    # ... endpoint logic
```

#### 4. Load Balancing
```nginx
# nginx configuration for load balancing
upstream fastapi_backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    listen 80;
    location /api {
        proxy_pass http://fastapi_backend;
    }
}
```

#### 5. Deployment Architecture
```
┌─────────────────────────────────────┐
│      Frontend (Nginx)               │
│   - Static files                    │
│   - CORS headers                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Load Balancer (HAProxy/Nginx)      │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼──┐  ┌───▼──┐  ┌───▼──┐
│FastAPI 1│  │FastAPI 2│  │FastAPI 3│
└───┬──┘  └───┬──┘  └───┬──┘
    │          │          │
    └──────────┼──────────┘
               │
         ┌─────▼─────┐
         │PostgreSQL │
         │  Cluster  │
         └───────────┘
```

#### 6. Monitoring & Logging
```python
from prometheus_client import Counter, Histogram
import logging

# Prometheus metrics
complaint_create_counter = Counter('complaints_created_total', 'Total complaints created')
api_request_duration = Histogram('api_request_duration_seconds', 'API request duration')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/complaints")
async def create_complaint(complaint: ComplaintCreate):
    complaint_create_counter.inc()
    logger.info(f"New complaint created: {complaint.id}")
```

#### 7. Recommended Tech Stack for Scale
- **Database**: PostgreSQL with replication
- **Cache**: Redis
- **Message Queue**: RabbitMQ/Kafka
- **API Gateway**: Kong/Tyk
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Container**: Docker
- **Orchestration**: Kubernetes

---

## Troubleshooting

### Issue: Backend not connecting
```
Error: Failed to connect to http://127.0.0.1:8000
```

**Solution**:
1. Ensure backend is running: `python fastapi_backend.py`
2. Check port 8000 is not in use: `lsof -i :8000`
3. Verify API_URL in nagaradhyaksha.js matches your backend URL

### Issue: Ward.html not loading
```
Error: Cannot find ward.html
```

**Solution**:
1. Ensure `ward.html` is in the same directory as `index.html`
2. Check file path is correct: `ward.html` (not `./ward.html` or `/ward.html`)
3. Verify browser console for errors (F12)

### Issue: Complaints not showing in ward details
```
Ward page loads but no complaints displayed
```

**Solution**:
1. Check backend has loaded demo data
2. Open browser console (F12) and check for JavaScript errors
3. Verify `state.allComplaints` is populated
4. Check Network tab to see API responses

### Issue: Database file not created
```
Error: Database file not found
```

**Solution**:
1. Run backend at least once: `python fastapi_backend.py`
2. Check you have write permissions in the directory
3. Look for `seva_setu.db` in the same directory as `fastapi_backend.py`

---

## Summary of Changes

| File | Change | Type |
|------|--------|------|
| index.html | Minor - ward card onclick added | Existing |
| ward.html | Complete new file | NEW |
| nagaradhyaksha.css | No changes | Existing |
| nagaradhyaksha.js | Multiple functions updated | MODIFIED |
| ward-page.js | Complete new file | NEW |
| fastapi_backend.py | Complete new file | NEW |

---

## Next Steps

1. ✅ **Install**: Set up backend and database
2. ✅ **Test**: Run health checks
3. ✅ **Integrate**: Update frontend files
4. ✅ **Deploy**: Host on production server
5. ✅ **Monitor**: Set up logging and analytics
6. ✅ **Scale**: Migrate to PostgreSQL when needed

---

## Support & Documentation

- FastAPI Docs: http://127.0.0.1:8000/docs
- API Schema: http://127.0.0.1:8000/openapi.json
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Uvicorn Docs: https://www.uvicorn.org/

---

**Version**: 1.0.0  
**Last Updated**: June 2024  
**Status**: Production Ready ✅
