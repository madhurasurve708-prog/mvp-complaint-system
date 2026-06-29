"""
Seva Setu - Smart Public Complaint System
FastAPI Backend for Nagaradhyaksha Dashboard

This backend handles:
- Complaint management (CRUD operations)
- Ward-specific complaint filtering
- Category-based filtering
- Announcement management
- Database operations with SQLite (upgradeable to PostgreSQL)

Installation:
pip install fastapi uvicorn sqlite3

Run:
uvicorn app:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import json
from enum import Enum

# # INITIALIZATION START
app = FastAPI(title="Seva Setu API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

# Use environment variable, fall back to persistent volume
import os

# SQLite file location
DATABASE_PATH = "complaint.db"

# Database schema is created by init_db() at startup.

def init_db():
    """Initialize database with tables if they don't exist"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            citizen_name TEXT NOT NULL,
            citizen_phone TEXT,
            ward INTEGER NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            image TEXT,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            assigned_to TEXT,
            action_note TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wards (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            nagarsevak TEXT NOT NULL,
            focus TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            ward TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS action_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            changed_by TEXT NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id)
        )
    """)
    
    # Insert demo wards if not exists
    cursor.execute("SELECT COUNT(*) FROM wards")
    if cursor.fetchone()[0] == 0:
        wards_data = [
            (1, "बाजारपेठ", "सुरेश पाटील", "कचरा व पाणीपुरवठा"),
            (2, "किनारपट्टी", "माधुरी सावंत", "स्वच्छता व रस्ते"),
            (3, "मालवण मध्य", "अमित नाईक", "ड्रेनेज व वाहतूक"),
            (4, "देऊळवाडा", "प्रिया परब", "स्ट्रीट लाईट"),
            (5, "दांडी", "विकास कदम", "रस्ते व आरोग्य"),
            (6, "चिवला", "निलेश चव्हाण", "पाणीगळती"),
            (7, "मेढा", "स्नेहा रेडकर", "नागरिक सुरक्षा"),
            (8, "भरड", "रोहित गावडे", "वाहतूक"),
            (9, "तारकर्ली मार्ग", "किरण साळगावकर", "गटार"),
            (10, "मुख्य रस्ता", "मेघा मोरे", "दिवे व रस्ते"),
        ]
        cursor.executemany(
            "INSERT INTO wards (id, name, nagarsevak, focus) VALUES (?, ?, ?, ?)",
            wards_data
        )
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# # DATABASE SCHEMA END

# # MODELS START
class ComplaintStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"

class Complaint(BaseModel):
    id: str
    citizen_name: str
    citizen_phone: Optional[str] = None
    ward: int
    category: str
    title: str
    description: str
    image: Optional[str] = None
    status: str = "Pending"
    assigned_to: Optional[str] = None
    action_note: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ComplaintCreate(BaseModel):
    citizen_name: str
    citizen_phone: Optional[str] = None
    ward: int
    category: str
    title: str
    description: str
    image: Optional[str] = None

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    action_note: Optional[str] = None

class Announcement(BaseModel):
    id: Optional[str] = None
    type: str
    ward: str
    subject: str
    message: str
    created_by: str
    created_at: Optional[str] = None

class Ward(BaseModel):
    id: int
    name: str
    nagarsevak: str
    focus: str

class WardStatistics(BaseModel):
    ward_id: int
    total: int
    pending: int
    progress: int
    resolved: int

# # MODELS END

# # UTILITY FUNCTIONS START
def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def dict_from_row(row):
    """Convert sqlite3.Row to dictionary"""
    return dict(row) if row else None

# # UTILITY FUNCTIONS END

# # COMPLAINTS ENDPOINTS START

@app.get("/complaints", response_model=List[Complaint])
async def get_complaints(
    ward: Optional[int] = Query(None, description="Filter by ward ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """
    Get all complaints with optional filtering.
    
    Query Parameters:
    - ward: Ward ID (1-10)
    - category: Category (water, garbage, road, etc.)
    - status: Status (Pending, In Progress, Resolved)
    """
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM complaints WHERE 1=1"
    params = []
    
    if ward:
        query += " AND ward = ?"
        params.append(ward)
    
    if category:
        query += " AND category = ?"
        params.append(category)
    
    if status:
        query += " AND status = ?"
        params.append(status)
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    complaints = [dict_from_row(row) for row in cursor.fetchall()]
    conn.close()
    
    return complaints

@app.get("/complaints/{complaint_id}", response_model=Complaint)
async def get_complaint(complaint_id: str):
    """Get a specific complaint by ID"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    complaint = dict_from_row(cursor.fetchone())
    conn.close()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return complaint

@app.post("/complaints", response_model=Complaint)
async def create_complaint(complaint: ComplaintCreate):
    """Create a new complaint"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Generate complaint ID (e.g., D001, D002)
    cursor.execute("SELECT COUNT(*) as count FROM complaints")
    complaint_count = cursor.fetchone()["count"]
    complaint_id = f"D{complaint_count + 1:03d}"
    
    cursor.execute("""
        INSERT INTO complaints (
            id, citizen_name, citizen_phone, ward, category, 
            title, description, image, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        complaint_id,
        complaint.citizen_name,
        complaint.citizen_phone,
        complaint.ward,
        complaint.category,
        complaint.title,
        complaint.description,
        complaint.image,
        "Pending",
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    conn.commit()
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    new_complaint = dict_from_row(cursor.fetchone())
    conn.close()
    
    return new_complaint

@app.put("/complaints/{complaint_id}", response_model=Complaint)
async def update_complaint(complaint_id: str, update: ComplaintUpdate):
    """Update a complaint status or notes"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get old status for logging
    cursor.execute("SELECT status FROM complaints WHERE id = ?", (complaint_id,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    old_status = result["status"]
    
    # Update complaint
    update_fields = []
    update_params = []
    
    if update.status:
        update_fields.append("status = ?")
        update_params.append(update.status)
    
    if update.assigned_to:
        update_fields.append("assigned_to = ?")
        update_params.append(update.assigned_to)
    
    if update.action_note:
        update_fields.append("action_note = ?")
        update_params.append(update.action_note)
    
    update_fields.append("updated_at = ?")
    update_params.append(datetime.now().isoformat())
    update_params.append(complaint_id)
    
    if update_fields:
        query = f"UPDATE complaints SET {', '.join(update_fields)} WHERE id = ?"
        cursor.execute(query, update_params)
        
        # Log action if status changed
        if update.status and update.status != old_status:
            cursor.execute("""
                INSERT INTO action_log (complaint_id, old_status, new_status, changed_by, changed_at)
                VALUES (?, ?, ?, ?, ?)
            """, (complaint_id, old_status, update.status, "nagaradhyaksha", datetime.now().isoformat()))
    
    conn.commit()
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    updated_complaint = dict_from_row(cursor.fetchone())
    conn.close()
    
    return updated_complaint

@app.delete("/complaints/{complaint_id}")
async def delete_complaint(complaint_id: str):
    """Delete a complaint (admin only)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM complaints WHERE id = ?", (complaint_id,))
    conn.commit()
    conn.close()
    
    return {"status": "deleted", "id": complaint_id}

# # COMPLAINTS ENDPOINTS END

# # WARD ENDPOINTS START

@app.get("/wards", response_model=List[Ward])
async def get_wards():
    """Get all wards"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards ORDER BY id")
    wards = [dict_from_row(row) for row in cursor.fetchall()]
    conn.close()
    return wards

@app.get("/wards/{ward_id}/statistics", response_model=WardStatistics)
async def get_ward_statistics(ward_id: int):
    """Get complaint statistics for a specific ward"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as progress,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
        FROM complaints WHERE ward = ?
    """, (ward_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    return {
        "ward_id": ward_id,
        "total": result["total"] or 0,
        "pending": result["pending"] or 0,
        "progress": result["progress"] or 0,
        "resolved": result["resolved"] or 0
    }

@app.get("/wards/{ward_id}/complaints", response_model=List[Complaint])
async def get_ward_complaints(
    ward_id: int,
    category: Optional[str] = Query(None, description="Filter by category")
):
    """Get all complaints for a specific ward with optional category filter"""
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM complaints WHERE ward = ?"
    params = [ward_id]
    
    if category:
        query += " AND category = ?"
        params.append(category)
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    complaints = [dict_from_row(row) for row in cursor.fetchall()]
    conn.close()
    
    return complaints

# # WARD ENDPOINTS END

# # ANNOUNCEMENT ENDPOINTS START

@app.get("/announcements", response_model=List[Announcement])
async def get_announcements(
    audience_type: Optional[str] = Query(None, description="Filter by type (citizen, nagarsevak)")
):
    """Get all announcements with optional type filter"""
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM announcements WHERE 1=1"
    params = []
    
    if audience_type:
        query += " AND type = ?"
        params.append(audience_type)
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    announcements = [dict_from_row(row) for row in cursor.fetchall()]
    conn.close()
    
    return announcements

@app.post("/announcements", response_model=Announcement)
async def create_announcement(announcement: Announcement):
    """Create a new announcement"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Generate announcement ID
    import uuid
    announcement_id = str(uuid.uuid4())[:8]
    
    cursor.execute("""
        INSERT INTO announcements (
            id, type, ward, subject, message, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        announcement_id,
        announcement.type,
        announcement.ward,
        announcement.subject,
        announcement.message,
        announcement.created_by,
        datetime.now().isoformat()
    ))
    
    conn.commit()
    cursor.execute("SELECT * FROM announcements WHERE id = ?", (announcement_id,))
    new_announcement = dict_from_row(cursor.fetchone())
    conn.close()
    
    return new_announcement

# # ANNOUNCEMENT ENDPOINTS END

# # ANALYTICS ENDPOINTS START

@app.get("/analytics/category-distribution")
async def get_category_distribution(ward: Optional[int] = Query(None)):
    """Get distribution of complaints by category"""
    conn = get_db()
    cursor = conn.cursor()
    
    query = """
        SELECT category, COUNT(*) as count 
        FROM complaints 
        WHERE 1=1
    """
    params = []
    
    if ward:
        query += " AND ward = ?"
        params.append(ward)
    
    query += " GROUP BY category"
    
    cursor.execute(query, params)
    distribution = {row["category"]: row["count"] for row in cursor.fetchall()}
    conn.close()
    
    return distribution

@app.get("/analytics/status-distribution")
async def get_status_distribution(ward: Optional[int] = Query(None)):
    """Get distribution of complaints by status"""
    conn = get_db()
    cursor = conn.cursor()
    
    query = """
        SELECT status, COUNT(*) as count 
        FROM complaints 
        WHERE 1=1
    """
    params = []
    
    if ward:
        query += " AND ward = ?"
        params.append(ward)
    
    query += " GROUP BY status"
    
    cursor.execute(query, params)
    distribution = {row["status"]: row["count"] for row in cursor.fetchall()}
    conn.close()
    
    return distribution

@app.get("/analytics/resolution-rate")
async def get_resolution_rate(ward: Optional[int] = Query(None)):
    """Get complaint resolution rate"""
    conn = get_db()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
        FROM complaints
        WHERE 1=1
    """
    params = []
    
    if ward:
        query += " AND ward = ?"
        params.append(ward)
    
    cursor.execute(query, params)
    result = cursor.fetchone()
    conn.close()
    
    total = result["total"] or 0
    resolved = result["resolved"] or 0
    rate = (resolved / total * 100) if total > 0 else 0
    
    return {"total": total, "resolved": resolved, "rate": round(rate, 2)}

# # ANALYTICS ENDPOINTS END

# # HEALTH CHECK START

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "online", "service": "Seva Setu API"}

# # HEALTH CHECK END

"""
DATABASE MIGRATION GUIDE FOR POSTGRESQL:

When migrating from SQLite to PostgreSQL, follow these steps:

1. Install PostgreSQL dependencies:
   pip install psycopg2-binary sqlalchemy

2. Create a new database in PostgreSQL:
   createdb seva_setu

3. Modify the database connection in the code:
   
   Old (SQLite):
   DATABASE_PATH = "seva_setu.db"
   
   New (PostgreSQL):
   from sqlalchemy import create_engine
   DATABASE_URL = "postgresql://user:password@localhost/seva_setu"
   engine = create_engine(DATABASE_URL)

4. The same SQL schema will work with minor modifications:
   - Change AUTOINCREMENT to SERIAL
   - Change TEXT PRIMARY KEY to UUID/VARCHAR with SERIAL
   - Timestamp functions are compatible

5. For production PostgreSQL setup:
   - Use connection pooling with pgBouncer
   - Add indexes on frequently queried columns (ward, category, status)
   - Set up automated backups
   - Enable replication for high availability

6. Sample PostgreSQL connection string:
   postgresql://nagaradhyaksha:secure_password@db.server.com:5432/seva_setu

7. Add indexes for better performance:
   
   CREATE INDEX idx_complaints_ward ON complaints(ward);
   CREATE INDEX idx_complaints_category ON complaints(category);
   CREATE INDEX idx_complaints_status ON complaints(status);
   CREATE INDEX idx_complaints_created_at ON complaints(created_at);
   CREATE INDEX idx_announcements_type ON announcements(type);
   CREATE INDEX idx_action_log_complaint_id ON action_log(complaint_id);
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
