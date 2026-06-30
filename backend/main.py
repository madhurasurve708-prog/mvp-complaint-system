from contextlib import contextmanager
from typing import Optional
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

import models
from database import Base, SessionLocal, engine


DEMO_OTP = "123456"
VALID_STATUSES = {"Pending", "In Progress", "Resolved"}
VALID_WARD_IDS = set(range(1, 11))

app = FastAPI(title="Seva Setu Complaint System - Malvan Municipality")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# REAL NAGARSEVAK DATA FROM OFFICIAL DOCUMENT (All 23 people)
# ============================================================================
REAL_NAGARSEVAKS = [
    # Ward 1
    {"name": "वणडकर ममता मोहन", "mobile": "8208454975", "ward_id": 1},
    {"name": "केणी मंदार मोहन", "mobile": "9637778901", "ward_id": 1},
    {"name": "कासेकर दश्ना नामदेव", "mobile": "9405497503", "ward_id": 1},
    
    # Ward 2
    {"name": "चव्हाण लसित हरी", "mobile": "9096728048", "ward_id": 2},
    {"name": "गिरकर अनिता पाली", "mobile": "9168206294", "ward_id": 2},
    
    # Ward 3
    {"name": "पाटकर दिपक गणपत", "mobile": "9422584073", "ward_id": 3},
    {"name": "मुंबरकर नीना गोविंद", "mobile": "9422584790", "ward_id": 3},
    
    # Ward 4
    {"name": "जाधव सिद्धार्थ मनोहर", "mobile": "9373616290", "ward_id": 4},
    {"name": "चव्हाण पृणम नागेश", "mobile": "9404689316", "ward_id": 4},
    
    # Ward 5
    {"name": "महाडगुत महेंद्र सुदाम", "mobile": "9404944446", "ward_id": 5},
    {"name": "खानोलकर महानंदा किशोर", "mobile": "9423806158", "ward_id": 5},
    
    # Ward 6
    {"name": "बापडेकर सहदेव नीलकंठ", "mobile": "9422434962", "ward_id": 6},
    {"name": "कांडलकर अंशेनी अनिल", "mobile": "9405926438", "ward_id": 6},
    
    # Ward 7
    {"name": "आचरेकर सुदेश सुबोध", "mobile": "9422394185", "ward_id": 7},
    {"name": "गावकर मेधा उपेंद्र", "mobile": "9422379771", "ward_id": 7},
    
    # Ward 8
    {"name": "और्सकर मंदार सुहास", "mobile": "9545807300", "ward_id": 8},
    {"name": "पाटकर शरीरी शेलंद", "mobile": "9422584866", "ward_id": 8},
    
    # Ward 9
    {"name": "कोयंडे महेश असोक", "mobile": "9823240054", "ward_id": 9},
    {"name": "आचरेकर अन्चषा अजित", "mobile": "8180966833", "ward_id": 9},
    
    # Ward 10
    {"name": "मयेकर तपस्वी तुळशिदास", "mobile": "9404598281", "ward_id": 10},
    {"name": "मयेकर भारयश्री सुरेश", "mobile": "7738768702", "ward_id": 10},
    {"name": "कांदलगावकर महेश चंद्रकांत", "mobile": "9823856769", "ward_id": 10},
    {"name": "तोरसकर रविकिरण चित्तामणी", "mobile": "9422633518", "ward_id": 10},
]


# ============================================================================
# DATABASE INITIALIZATION
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
    migrate_nagarsevak_table()
    ensure_wards()


def migrate_nagarsevak_table():
    """Migrate old nagarsevak table schema if it exists"""
    inspector = inspect(engine)
    if "nagarsevaks_legacy" in inspector.get_table_names():
        return

    if "nagarsevaks" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("nagarsevaks")}
    if "username" not in columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE nagarsevaks RENAME TO nagarsevaks_legacy"))
        models.Nagarsevak.__table__.create(bind=connection, checkfirst=True)
        connection.execute(text(
            """
            INSERT INTO nagarsevaks (id, name, mobile_number, ward_id, password)
            SELECT id, name, COALESCE(NULLIF(mobile_number, ''), username), ward_id, password
            FROM nagarsevaks_legacy
            """
        ))
        connection.execute(text("DROP TABLE nagarsevaks_legacy"))


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


def seed_real_nagarsevaks():
    """Seed real Nagarsevak data from official document"""
    with session_scope() as db:
        existing_count = db.query(models.Nagarsevak).count()
        
        if existing_count == 0:
            print("🌱 Seeding real Nagarsevak data from official document...")
            for nagarsevak_data in REAL_NAGARSEVAKS:
                nagarsevak = models.Nagarsevak(
                    name=nagarsevak_data["name"],
                    mobile_number=nagarsevak_data["mobile"],
                    password="123456",  # Demo password
                    ward_id=nagarsevak_data["ward_id"],
                )
                db.add(nagarsevak)
            print(f"✅ Successfully added {len(REAL_NAGARSEVAKS)} Nagarsevaks")
        else:
            print(f"✅ Nagarsevaks already exist ({existing_count} records)")


def seed_admin():
    """Seed admin user for demo"""
    with session_scope() as db:
        existing_admin = db.query(models.Admin).filter(
            models.Admin.username == "admin"
        ).first()
        
        if not existing_admin:
            print("🌱 Seeding Admin user...")
            admin = models.Admin(
                name="मालवण नगर परिषद प्रशासन",
                username="admin",
                password="123456",
            )
            db.add(admin)
            print("✅ Admin user created")


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
        "locality": citizen.locality,
        "category": complaint.category,
        "title": complaint.category.replace("-", " ").title(),
        "description": complaint.description,
        "photo_filename": complaint.photo_filename,
        "photo": complaint.photo_filename,
        "image": complaint.photo_filename or "",
        "status": complaint.status,
        "notes": complaint.notes or "",
        "actionNote": complaint.notes or "",
        "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
        "updated_at": complaint.updated_at.isoformat() if complaint.updated_at else None,
    }


# ============================================================================
# PYDANTIC MODELS (Request/Response)
# ============================================================================

class CitizenLoginRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    mobile_number: str = Field(..., min_length=10, max_length=10)
    locality: str = Field(..., min_length=2)
    ward_id: int | str
    otp: str = Field(..., min_length=6, max_length=6)


class NagarsevakLoginRequest(BaseModel):
    identifier: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)
    ward_id: int | str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class ComplaintCreateRequest(BaseModel):
    category: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    photo: Optional[str] = None
    photo_filename: Optional[str] = None
    citizen_id: int


class ComplaintUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


# ============================================================================
# APP STARTUP
# ============================================================================

@app.on_event("startup")
def startup():
    """Initialize app on startup"""
    print("\n" + "="*60)
    print("🚀 Seva Setu Backend Starting...")
    print("="*60)
    initialize_database()
    seed_real_nagarsevaks()
    seed_admin()
    print("✅ Backend Ready for Demo")
    print("="*60 + "\n")


# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.get("/")
def home():
    """Health check endpoint"""
    return {
        "message": "Backend Working",
        "otp_mode": "enabled",
        "demo": True,
        "status": "Ready for Demo"
    }


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ============================================================================
# WARD ENDPOINTS
# ============================================================================

@app.get("/wards")
def list_wards(db: Session = Depends(get_db)):
    """Get all wards"""
    wards = db.query(models.Ward).order_by(models.Ward.id).all()
    return [{"id": ward.id, "name": ward.name} for ward in wards]


# ============================================================================
# CITIZEN ENDPOINTS
# ============================================================================

@app.post("/citizens/login")
def citizen_login(data: CitizenLoginRequest, db: Session = Depends(get_db)):
    """
    Citizen login endpoint
    OTP: 123456 (demo)
    """
    # Validate OTP
    if data.otp != DEMO_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Validate ward
    ward_id = normalize_ward_id(data.ward_id)
    ensure_ward(db, ward_id)

    # Find or create citizen
    existing = db.query(models.Citizen).filter(
        models.Citizen.mobile_number == data.mobile_number
    ).first()
    
    if existing:
        existing.full_name = data.full_name.strip()
        existing.ward_id = ward_id
        existing.locality = data.locality.strip()
        citizen = existing
    else:
        citizen = models.Citizen(
            full_name=data.full_name.strip(),
            mobile_number=data.mobile_number,
            ward_id=ward_id,
            locality=data.locality.strip(),
        )
        db.add(citizen)

    db.commit()
    db.refresh(citizen)
    
    return {
        "message": "Login successful",
        "citizen_id": citizen.id,
        "full_name": citizen.full_name,
        "mobile_number": citizen.mobile_number,
        "ward_id": citizen.ward_id,
        "locality": citizen.locality,
        "citizen": {
            "id": citizen.id,
            "citizen_id": citizen.id,
            "full_name": citizen.full_name,
            "mobile_number": citizen.mobile_number,
            "ward_id": citizen.ward_id,
            "locality": citizen.locality,
        },
    }


@app.post("/complaints")
def create_complaint(data: ComplaintCreateRequest, db: Session = Depends(get_db)):
    """Citizen submits a complaint"""
    citizen = db.query(models.Citizen).filter(
        models.Citizen.id == data.citizen_id
    ).first()
    
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")

    complaint = models.Complaint(
        citizen_id=citizen.id,
        ward_id=citizen.ward_id,
        category=data.category,
        description=data.description.strip(),
        photo_filename=data.photo_filename or data.photo,
        status="Pending",
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
    """Get complaints filed by a specific citizen"""
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

    # Search by name or mobile number
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