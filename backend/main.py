from contextlib import contextmanager
from typing import Optional
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

import models
from database import Base, SessionLocal, engine


# ============================================================================
# CONSTANTS
# ============================================================================

DEMO_OTP = "123456"
DEMO_PASSWORD = "123456"
VALID_STATUSES = {"Pending", "In Progress", "Resolved"}
VALID_WARD_IDS = set(range(1, 11))


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class NagarsevakLoginRequest(BaseModel):
    identifier: str
    password: str
    ward_id: int | str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class CitizenLoginRequest(BaseModel):
    mobile_number: str
    otp: str
    ward_id: int | str


class ComplaintRequest(BaseModel):
    category: str
    description: str
    ward_id: int | str


class ComplaintUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


# ============================================================================
# REAL NAGARSEVAK DATA - ALL 23 PEOPLE (English Transliteration)
# ============================================================================

REAL_NAGARSEVAKS = [
    # Ward 1 (3 people)
    {"name": "Vandkar Mamata Mohan", "mobile": "8208454975", "ward_id": 1},
    {"name": "Keni Mandar Mohan", "mobile": "9637778901", "ward_id": 1},
    {"name": "Kosavkar Darshana Namdev", "mobile": "9405497503", "ward_id": 1},
    
    # Ward 2 (2 people)
    {"name": "Chavan Lalit Hari", "mobile": "9096728048", "ward_id": 2},
    {"name": "Girkar Anita Pali", "mobile": "9168206294", "ward_id": 2},
    
    # Ward 3 (2 people)
    {"name": "Patkar Deepak Ganpat", "mobile": "9422584073", "ward_id": 3},
    {"name": "Mumbarkar Neena Govind", "mobile": "9422584790", "ward_id": 3},
    
    # Ward 4 (2 people)
    {"name": "Jadhav Siddharth Manohar", "mobile": "9373616290", "ward_id": 4},
    {"name": "Chavan Punam Nagesh", "mobile": "9404689316", "ward_id": 4},
    
    # Ward 5 (2 people)
    {"name": "Mhadgut Mahendra Sutam", "mobile": "9404944446", "ward_id": 5},
    {"name": "Khanolkar Mahananda Kishor", "mobile": "9423806158", "ward_id": 5},
    
    # Ward 6 (2 people)
    {"name": "Bapardekar Sahadev Nilkanth", "mobile": "9422434962", "ward_id": 6},
    {"name": "Kandalkar Ashwini Anil", "mobile": "9405926438", "ward_id": 6},
    
    # Ward 7 (2 people)
    {"name": "Aacharekar Sudesh Subhash", "mobile": "9422394185", "ward_id": 7},
    {"name": "Gavkar Medha Upendra", "mobile": "9422379771", "ward_id": 7},
    
    # Ward 8 (2 people)
    {"name": "Aroskar Mandar Sudham", "mobile": "9545807300", "ward_id": 8},
    {"name": "Patkar Sharvari Shailendra", "mobile": "9422584866", "ward_id": 8},
    
    # Ward 9 (2 people)
    {"name": "Koyande Mahesh Ashok", "mobile": "9823240054", "ward_id": 9},
    {"name": "Aacharekar Anvesha Ajit", "mobile": "8180966833", "ward_id": 9},
    
    # Ward 10 (4 people)
    {"name": "Mayekar Tapaswi Tulsidas", "mobile": "9404598281", "ward_id": 10},
    {"name": "Mayekar Bhagyashree Suresh", "mobile": "7738768702", "ward_id": 10},
    {"name": "Kandalagavkar Mahesh Chandrakant", "mobile": "9823856769", "ward_id": 10},
    {"name": "Torskar Ravikirn Chittamani", "mobile": "9422633518", "ward_id": 10},
]


# ============================================================================
# FASTAPI APP SETUP
# ============================================================================

app = FastAPI(title="Seva Setu Complaint System - Malvan Municipality")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# SESSION MANAGEMENT
# ============================================================================

@contextmanager
def session_scope():
    """Session context manager"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db():
    """Get database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# DATABASE INITIALIZATION FUNCTIONS
# ============================================================================

def initialize_database():
    """Initialize database schema"""
    inspector = inspect(engine)
    legacy_schema = False
    
    if "complaints" in inspector.get_table_names():
        complaint_columns = {column["name"] for column in inspector.get_columns("complaints")}
        legacy_schema = "photo_filename" not in complaint_columns or "created_at" not in complaint_columns

    if legacy_schema:
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)
    ensure_wards()


def ensure_wards():
    """Ensure all 10 wards exist"""
    with session_scope() as db:
        existing = {ward.id: ward for ward in db.query(models.Ward).all()}
        for ward_id in range(1, 11):
            name = f"Ward {ward_id}"
            if ward_id in existing:
                if existing[ward_id].name != name:
                    existing[ward_id].name = name
            else:
                db.add(models.Ward(id=ward_id, name=name))


def seed_real_nagarsevaks(force_reset=False):
    """Seed real Nagarsevak data from official document"""
    with session_scope() as db:
        existing_count = db.query(models.Nagarsevak).count()
        
        if force_reset or existing_count == 0:
            if force_reset:
                print("🔄 Force resetting Nagarsevak table...")
                db.query(models.Nagarsevak).delete()
            else:
                print("🌱 Seeding real Nagarsevak data from official document...")
            
            for nagarsevak_data in REAL_NAGARSEVAKS:
                nagarsevak = models.Nagarsevak(
                    name=nagarsevak_data["name"],
                    mobile_number=nagarsevak_data["mobile"],
                    password=DEMO_PASSWORD,
                    ward_id=nagarsevak_data["ward_id"],
                )
                db.add(nagarsevak)
            print(f"✅ Successfully added {len(REAL_NAGARSEVAKS)} Nagarsevaks")
        else:
            print(f"✅ Nagarsevaks already exist ({existing_count} records)")


def seed_admin(force_reset=False):
    """Seed admin user for demo"""
    with session_scope() as db:
        existing_admin = db.query(models.Admin).filter(
            models.Admin.username == "admin"
        ).first()
        
        if force_reset:
            print("🔄 Force resetting Admin...")
            db.query(models.Admin).delete()
            existing_admin = None
        
        if not existing_admin:
            print("🌱 Seeding Admin user...")
            admin = models.Admin(
                name="Malvan Municipal Admin",
                username="admin",
                password=DEMO_PASSWORD,
            )
            db.add(admin)
            print("✅ Admin user created")
        else:
            print("✅ Admin user already exists")


# ============================================================================
# VALIDATION & HELPER FUNCTIONS
# ============================================================================

def normalize_ward_id(value) -> int:
    """Extract and validate ward ID"""
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    if not digits:
        raise HTTPException(status_code=422, detail="Ward is required")
    ward_id = int(digits)
    if ward_id not in VALID_WARD_IDS:
        raise HTTPException(status_code=422, detail="Ward must be between 1 and 10")
    return ward_id


def ensure_ward(db: Session, ward_id: int) -> models.Ward:
    """Verify ward exists"""
    ward = db.query(models.Ward).filter(models.Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    return ward


def complaint_response(complaint: models.Complaint) -> dict:
    """Format complaint response"""
    citizen = complaint.citizen
    return {
        "id": complaint.id,
        "complaint_id": complaint.id,
        "citizen_id": complaint.citizen_id,
        "citizen_name": citizen.full_name,
        "citizenName": citizen.full_name,
        "mobile_number": citizen.mobile_number,
        "mobileNumber": citizen.mobile_number,
        "ward_id": complaint.ward_id,
        "ward": str(complaint.ward_id),
        "category": complaint.category,
        "description": complaint.description,
        "photo_filename": complaint.photo_filename,
        "photo_url": f"/complaints/{complaint.id}/photo" if complaint.photo_filename else None,
        "status": complaint.status,
        "notes": complaint.notes,
        "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
        "createdAt": complaint.created_at.isoformat() if complaint.created_at else None,
        "updated_at": complaint.updated_at.isoformat() if complaint.updated_at else None,
        "updatedAt": complaint.updated_at.isoformat() if complaint.updated_at else None,
    }


# ============================================================================
# STARTUP EVENT
# ============================================================================

@app.on_event("startup")
def startup_event():
    """Initialize database on startup"""
    print("🚀 Initializing database...")
    initialize_database()
    seed_real_nagarsevaks()
    seed_admin()
    print("✅ Database initialization complete")


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Seva Setu Complaint System is running"
    }


# ============================================================================
# CITIZEN ENDPOINTS
# ============================================================================

@app.post("/citizens/login")
def citizen_login(data: CitizenLoginRequest, db: Session = Depends(get_db)):
    """Citizen login endpoint - OTP: 123456 (demo)"""
    if data.otp != DEMO_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    ward_id = normalize_ward_id(data.ward_id)
    ensure_ward(db, ward_id)
    
    mobile = data.mobile_number.strip()
    
    citizen = db.query(models.Citizen).filter(
        models.Citizen.mobile_number == mobile,
        models.Citizen.ward_id == ward_id
    ).first()
    
    if not citizen:
        citizen = models.Citizen(
            full_name=f"Citizen {mobile}",
            mobile_number=mobile,
            locality="Demo Locality",
            ward_id=ward_id
        )
        db.add(citizen)
        db.commit()
        db.refresh(citizen)
    
    return {
        "message": "Login successful",
        "citizen_id": citizen.id,
        "name": citizen.full_name,
        "mobile_number": citizen.mobile_number,
        "ward_id": citizen.ward_id,
        "citizen": {
            "id": citizen.id,
            "citizen_id": citizen.id,
            "full_name": citizen.full_name,
            "mobile_number": citizen.mobile_number,
            "ward_id": citizen.ward_id,
        },
    }


@app.post("/complaints")
def submit_complaint(data: ComplaintRequest, db: Session = Depends(get_db)):
    """Citizen submits complaint"""
    ward_id = normalize_ward_id(data.ward_id)
    ensure_ward(db, ward_id)
    
    citizen = db.query(models.Citizen).filter(
        models.Citizen.ward_id == ward_id
    ).first()
    
    if not citizen:
        citizen = models.Citizen(
            full_name="Demo Citizen",
            mobile_number="9999999999",
            locality="Demo Locality",
            ward_id=ward_id
        )
        db.add(citizen)
        db.commit()
        db.refresh(citizen)
    
    complaint = models.Complaint(
        citizen_id=citizen.id,
        ward_id=ward_id,
        category=data.category.strip(),
        description=data.description.strip(),
        status="Pending"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    return {
        "message": "Complaint submitted successfully",
        "complaint": complaint_response(complaint)
    }


@app.get("/citizens/{citizen_id}/complaints")
def get_citizen_complaints(citizen_id: int, db: Session = Depends(get_db)):
    """Get all complaints for a citizen"""
    citizen = db.query(models.Citizen).filter(
        models.Citizen.id == citizen_id
    ).first()
    
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    
    complaints = db.query(models.Complaint).filter(
        models.Complaint.citizen_id == citizen.id
    ).order_by(models.Complaint.created_at.desc()).all()
    
    return [complaint_response(complaint) for complaint in complaints]


# ============================================================================
# NAGARSEVAK ENDPOINTS
# ============================================================================

@app.post("/nagarsevaks/login")
def nagarsevak_login(data: NagarsevakLoginRequest, db: Session = Depends(get_db)):
    """
    Nagarsevak login endpoint
    Password: 123456 (demo)
    Use name or mobile number as identifier
    """
    ward_id = normalize_ward_id(data.ward_id)
    ensure_ward(db, ward_id)
    identifier = data.identifier.strip()

    nagarsevak = db.query(models.Nagarsevak).filter(
        (models.Nagarsevak.name == identifier) | (models.Nagarsevak.mobile_number == identifier),
        models.Nagarsevak.password == data.password,
        models.Nagarsevak.ward_id == ward_id,
    ).first()

    if not nagarsevak:
        raise HTTPException(status_code=401, detail="Invalid nagarsevak credentials")

    return {
        "message": "Login successful",
        "nagarsevak_id": nagarsevak.id,
        "name": nagarsevak.name,
        "mobile_number": nagarsevak.mobile_number,
        "ward_id": nagarsevak.ward_id,
        "nagarsevak": {
            "id": nagarsevak.id,
            "nagarsevak_id": nagarsevak.id,
            "name": nagarsevak.name,
            "mobile_number": nagarsevak.mobile_number,
            "ward_id": nagarsevak.ward_id,
        },
    }


@app.get("/complaints/ward/{ward_id}")
def get_ward_complaints(ward_id: int, db: Session = Depends(get_db)):
    """Nagarsevak views all complaints in their ward"""
    ward_id = normalize_ward_id(ward_id)
    ensure_ward(db, ward_id)
    
    complaints = db.query(models.Complaint).filter(
        models.Complaint.ward_id == ward_id
    ).order_by(models.Complaint.created_at.desc()).all()
    
    return [complaint_response(complaint) for complaint in complaints]


@app.get("/nagarsevaks/{nagarsevak_id}/complaints")
def get_nagarsevak_complaints(nagarsevak_id: int, db: Session = Depends(get_db)):
    """Get all complaints for a specific Nagarsevak's ward"""
    nagarsevak = db.query(models.Nagarsevak).filter(
        models.Nagarsevak.id == nagarsevak_id
    ).first()
    
    if not nagarsevak:
        raise HTTPException(status_code=404, detail="Nagarsevak not found")
    
    return get_ward_complaints(nagarsevak.ward_id, db)


@app.put("/nagarsevaks/{nagarsevak_id}/complaints/{complaint_id}")
def update_nagarsevak_complaint(
    nagarsevak_id: int,
    complaint_id: int,
    data: ComplaintUpdateRequest,
    db: Session = Depends(get_db),
):
    """Nagarsevak updates complaint status and adds action notes"""
    nagarsevak = db.query(models.Nagarsevak).filter(
        models.Nagarsevak.id == nagarsevak_id
    ).first()
    
    if not nagarsevak:
        raise HTTPException(status_code=404, detail="Nagarsevak not found")

    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id,
        models.Complaint.ward_id == nagarsevak.ward_id,
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found in your ward")

    if data.status is not None:
        if data.status not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail="Invalid complaint status")
        complaint.status = data.status
    
    if data.notes is not None:
        complaint.notes = data.notes.strip()

    db.commit()
    db.refresh(complaint)
    
    return {
        "message": "Complaint updated",
        "complaint": complaint_response(complaint)
    }


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.post("/admins/login")
def admin_login(data: AdminLoginRequest, db: Session = Depends(get_db)):
    """
    Admin login endpoint
    Username: admin
    Password: 123456 (demo)
    """
    admin = db.query(models.Admin).filter(
        models.Admin.username == data.username.strip(),
        models.Admin.password == data.password,
    ).first()
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    return {
        "message": "Login successful",
        "admin_id": admin.id,
        "name": admin.name,
        "username": admin.username,
        "admin": {
            "id": admin.id,
            "admin_id": admin.id,
            "name": admin.name,
            "username": admin.username
        },
    }


@app.get("/admin/summary")
def admin_summary(db: Session = Depends(get_db)):
    """Admin dashboard summary statistics"""
    complaints = db.query(models.Complaint).all()
    
    return {
        "wards": db.query(models.Ward).count(),
        "citizens": db.query(models.Citizen).count(),
        "nagarsevaks": db.query(models.Nagarsevak).count(),
        "admins": db.query(models.Admin).count(),
        "complaints": len(complaints),
        "pending": sum(1 for c in complaints if c.status == "Pending"),
        "in_progress": sum(1 for c in complaints if c.status == "In Progress"),
        "resolved": sum(1 for c in complaints if c.status == "Resolved"),
    }


@app.get("/admin/data")
def admin_data(db: Session = Depends(get_db)):
    """Admin dashboard - get all system data"""
    return {
        "wards": [
            {"id": w.id, "name": w.name} 
            for w in db.query(models.Ward).order_by(models.Ward.id).all()
        ],
        "citizens": [
            {
                "id": c.id,
                "full_name": c.full_name,
                "mobile_number": c.mobile_number,
                "ward_id": c.ward_id,
                "locality": c.locality,
            }
            for c in db.query(models.Citizen).order_by(models.Citizen.id).all()
        ],
        "nagarsevaks": [
            {
                "id": n.id,
                "name": n.name,
                "mobile_number": n.mobile_number,
                "ward_id": n.ward_id,
            }
            for n in db.query(models.Nagarsevak).order_by(models.Nagarsevak.ward_id).all()
        ],
        "complaints": [
            complaint_response(c) 
            for c in db.query(models.Complaint).order_by(models.Complaint.created_at.desc()).all()
        ],
    }


@app.get("/complaints")
def get_all_complaints(db: Session = Depends(get_db)):
    """Get all complaints (admin view)"""
    complaints = db.query(models.Complaint).order_by(
        models.Complaint.created_at.desc()
    ).all()
    
    return [complaint_response(complaint) for complaint in complaints]


@app.put("/complaints/{complaint_id}")
def update_complaint(
    complaint_id: int,
    data: ComplaintUpdateRequest,
    db: Session = Depends(get_db)
):
    """Admin updates complaint"""
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if data.status is not None:
        if data.status not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail="Invalid complaint status")
        complaint.status = data.status
    
    if data.notes is not None:
        complaint.notes = data.notes.strip()

    db.commit()
    db.refresh(complaint)
    
    return {
        "message": "Complaint updated",
        "complaint": complaint_response(complaint)
    }


# ============================================================================
# EMERGENCY DEMO ENDPOINTS
# ============================================================================

@app.post("/demo/reset-database")
def demo_reset_database(force: bool = False):
    """
    EMERGENCY ONLY: Reset database and reseed demo data
    Usage: POST /demo/reset-database?force=true
    """
    if not force:
        raise HTTPException(
            status_code=422,
            detail="Must pass ?force=true to confirm database reset"
        )
    
    print("\n" + "="*60)
    print("🚨 EMERGENCY: Resetting entire database")
    print("="*60)
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    ensure_wards()
    seed_real_nagarsevaks(force_reset=True)
    seed_admin(force_reset=True)
    
    print("✅ Database reset complete\n")
    
    return {
        "message": "Database reset successfully",
        "nagarsevaks_created": len(REAL_NAGARSEVAKS),
        "admin_created": True,
        "wards_created": 10
    }


@app.get("/demo/credentials")
def demo_credentials():
    """DEMO ONLY: Get all login credentials for testing"""
    return {
        "admin": {
            "username": "admin",
            "password": DEMO_PASSWORD,
        },
        "demo_password_all": DEMO_PASSWORD,
        "demo_otp": DEMO_OTP,
        "nagarsevaks_by_ward": {
            ward_id: [
                {
                    "name": n["name"],
                    "mobile": n["mobile"],
                    "password": DEMO_PASSWORD
                }
                for n in REAL_NAGARSEVAKS if n["ward_id"] == ward_id
            ]
            for ward_id in range(1, 11)
        }
    }


@app.get("/demo/test-nagarsevak-login/{ward_id}")
def demo_test_nagarsevak_login(ward_id: int, db: Session = Depends(get_db)):
    """DEMO ONLY: Test Nagarsevak login with first nagarsevak in ward"""
    ward_id = normalize_ward_id(ward_id)
    
    nagarsevak = db.query(models.Nagarsevak).filter(
        models.Nagarsevak.ward_id == ward_id
    ).first()
    
    if not nagarsevak:
        raise HTTPException(
            status_code=404,
            detail=f"No Nagarsevak found in Ward {ward_id}"
        )
    
    return {
        "message": "Use this data to test login",
        "test_request": {
            "identifier": nagarsevak.name,
            "password": DEMO_PASSWORD,
            "ward_id": ward_id,
        },
        "nagarsevak": {
            "id": nagarsevak.id,
            "name": nagarsevak.name,
            "mobile_number": nagarsevak.mobile_number,
            "ward_id": nagarsevak.ward_id,
        }
    }