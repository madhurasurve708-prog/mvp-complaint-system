from contextlib import contextmanager
from typing import Optional

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

app = FastAPI(title="Seva Setu Complaint Pilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def initialize_database():
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
    inspector = inspect(engine)
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
    with session_scope() as db:
        existing = {ward.id: ward for ward in db.query(models.Ward).all()}
        for ward_id in range(1, 11):
            name = f"Ward {ward_id}"
            if ward_id in existing:
                existing[ward_id].name = name
            else:
                db.add(models.Ward(id=ward_id, name=name))


@contextmanager
def session_scope():
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
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_ward_id(value) -> int:
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    if not digits:
        raise HTTPException(status_code=422, detail="Ward is required")
    ward_id = int(digits)
    if ward_id not in VALID_WARD_IDS:
        raise HTTPException(status_code=422, detail="Ward must be between 1 and 10")
    return ward_id


def ensure_ward(db: Session, ward_id: int) -> models.Ward:
    ward = db.query(models.Ward).filter(models.Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    return ward


def complaint_response(complaint: models.Complaint) -> dict:
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


@app.on_event("startup")
def startup():
    initialize_database()


@app.get("/")
def home():
    return {"message": "Backend Working", "otp_mode": "enabled"}


@app.get("/wards")
def list_wards(db: Session = Depends(get_db)):
    return [{"id": ward.id, "name": ward.name} for ward in db.query(models.Ward).order_by(models.Ward.id).all()]


@app.post("/citizens/login")
def citizen_login(data: CitizenLoginRequest, db: Session = Depends(get_db)):
    if data.otp != DEMO_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    ward_id = normalize_ward_id(data.ward_id)
    ensure_ward(db, ward_id)

    existing = db.query(models.Citizen).filter(models.Citizen.mobile_number == data.mobile_number).first()
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


@app.post("/nagarsevaks/login")
def nagarsevak_login(data: NagarsevakLoginRequest, db: Session = Depends(get_db)):
    ward_id = normalize_ward_id(data.ward_id)
    ensure_ward(db, ward_id)
    identifier = data.identifier.strip()

    nagarsevak = db.query(models.Nagarsevak).filter(
        (models.Nagarsevak.name == identifier) | (models.Nagarsevak.mobile_number == identifier),
        models.Nagarsevak.password == data.password,
    ).first()

    if not nagarsevak:
        raise HTTPException(status_code=401, detail="Invalid nagarsevak credentials")

    if nagarsevak.ward_id != ward_id:
        raise HTTPException(status_code=403, detail="Selected ward does not match assigned ward")

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


@app.post("/admins/login")
def admin_login(data: AdminLoginRequest, db: Session = Depends(get_db)):
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
        "admin": {"id": admin.id, "admin_id": admin.id, "name": admin.name, "username": admin.username},
    }


@app.post("/complaints")
def create_complaint(data: ComplaintCreateRequest, db: Session = Depends(get_db)):
    citizen = db.query(models.Citizen).filter(models.Citizen.id == data.citizen_id).first()
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

    return {"message": "Complaint submitted", "complaint": complaint_response(complaint)}


@app.get("/complaints")
def get_all_complaints(db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).order_by(models.Complaint.created_at.desc()).all()
    return [complaint_response(complaint) for complaint in complaints]


@app.get("/complaints/ward/{ward_id}")
def get_ward_complaints(ward_id: int, db: Session = Depends(get_db)):
    ward_id = normalize_ward_id(ward_id)
    ensure_ward(db, ward_id)
    complaints = db.query(models.Complaint).filter(models.Complaint.ward_id == ward_id).order_by(models.Complaint.created_at.desc()).all()
    return [complaint_response(complaint) for complaint in complaints]


@app.get("/nagarsevaks/{nagarsevak_id}/complaints")
def get_nagarsevak_complaints(nagarsevak_id: int, db: Session = Depends(get_db)):
    nagarsevak = db.query(models.Nagarsevak).filter(models.Nagarsevak.id == nagarsevak_id).first()
    if not nagarsevak:
        raise HTTPException(status_code=404, detail="Nagarsevak not found")
    return get_ward_complaints(nagarsevak.ward_id, db)


@app.get("/citizens/{citizen_id}/complaints")
def get_citizen_complaints(citizen_id: int, db: Session = Depends(get_db)):
    citizen = db.query(models.Citizen).filter(models.Citizen.id == citizen_id).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    complaints = db.query(models.Complaint).filter(
        models.Complaint.citizen_id == citizen.id,
        models.Complaint.ward_id == citizen.ward_id,
    ).order_by(models.Complaint.created_at.desc()).all()
    return [complaint_response(complaint) for complaint in complaints]


@app.put("/nagarsevaks/{nagarsevak_id}/complaints/{complaint_id}")
def update_nagarsevak_complaint(
    nagarsevak_id: int,
    complaint_id: int,
    data: ComplaintUpdateRequest,
    db: Session = Depends(get_db),
):
    nagarsevak = db.query(models.Nagarsevak).filter(models.Nagarsevak.id == nagarsevak_id).first()
    if not nagarsevak:
        raise HTTPException(status_code=404, detail="Nagarsevak not found")

    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id,
        models.Complaint.ward_id == nagarsevak.ward_id,
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found for assigned ward")

    if data.status is not None:
        if data.status not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail="Invalid complaint status")
        complaint.status = data.status
    if data.notes is not None:
        complaint.notes = data.notes.strip()

    db.commit()
    db.refresh(complaint)
    return {"message": "Complaint updated", "complaint": complaint_response(complaint)}


@app.put("/complaints/{complaint_id}")
def update_complaint(complaint_id: int, data: ComplaintUpdateRequest, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
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
    return {"message": "Complaint updated", "complaint": complaint_response(complaint)}


@app.get("/admin/summary")
def admin_summary(db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).all()
    return {
        "wards": db.query(models.Ward).count(),
        "citizens": db.query(models.Citizen).count(),
        "nagarsevaks": db.query(models.Nagarsevak).count(),
        "complaints": len(complaints),
        "pending": sum(1 for item in complaints if item.status == "Pending"),
        "in_progress": sum(1 for item in complaints if item.status == "In Progress"),
        "resolved": sum(1 for item in complaints if item.status == "Resolved"),
    }


@app.get("/admin/data")
def admin_data(db: Session = Depends(get_db)):
    return {
        "wards": [{"id": w.id, "name": w.name} for w in db.query(models.Ward).order_by(models.Ward.id).all()],
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
        "complaints": get_all_complaints(db),
    }
