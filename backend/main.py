from collections import Counter, defaultdict
from datetime import datetime
import os
from pathlib import Path
import shutil
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from models import Announcement, Complaint


# # APP SETUP START
app = FastAPI(title="Seva Setu Complaint System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = Path(__file__).resolve().parent.parent / "uploads"
Base.metadata.create_all(bind=engine)
# # APP SETUP END


# # MASTER DATA START
WARDS = [
    {"id": "1", "name": "बाजारपेठ", "nagarsevak": "सुरेश पाटील", "focus": "कचरा व पाणीपुरवठा"},
    {"id": "2", "name": "किनारपट्टी", "nagarsevak": "माधुरी सावंत", "focus": "स्वच्छता व रस्ते"},
    {"id": "3", "name": "मालवण मध्य", "nagarsevak": "अमित नाईक", "focus": "ड्रेनेज व वाहतूक"},
    {"id": "4", "name": "देऊळवाडा", "nagarsevak": "प्रिया परब", "focus": "स्ट्रीट लाईट"},
    {"id": "5", "name": "दांडी", "nagarsevak": "विकास कदम", "focus": "रस्ते व आरोग्य"},
    {"id": "6", "name": "चिवला", "nagarsevak": "निलेश चव्हाण", "focus": "पाणीगळती"},
    {"id": "7", "name": "मेढा", "nagarsevak": "स्नेहा रेडकर", "focus": "नागरिक सुरक्षा"},
    {"id": "8", "name": "भरड", "nagarsevak": "रोहित गावडे", "focus": "वाहतूक"},
    {"id": "9", "name": "तारकर्ली मार्ग", "nagarsevak": "किरण साळगावकर", "focus": "गटार"},
    {"id": "10", "name": "मुख्य रस्ता", "nagarsevak": "मेघा मोरे", "focus": "दिवे व रस्ते"},
]

CATEGORIES = [
    {"key": "all", "mr": "सर्व", "en": "All", "icon": "fa-table-cells-large"},
    {"key": "water", "mr": "पाणी", "en": "Water", "icon": "fa-droplet"},
    {"key": "garbage", "mr": "कचरा", "en": "Garbage", "icon": "fa-trash-can"},
    {"key": "street-lights", "mr": "रस्त्यावरील दिवे", "en": "Street Lights", "icon": "fa-lightbulb"},
    {"key": "road", "mr": "रस्ता", "en": "Road", "icon": "fa-road"},
    {"key": "gutter", "mr": "गटार", "en": "Gutter", "icon": "fa-water"},
    {"key": "animals", "mr": "भटकी जनावरे", "en": "Animals", "icon": "fa-shield-heart"},
    {"key": "traffic", "mr": "वाहतूक समस्या", "en": "Traffic", "icon": "fa-traffic-light"},
    {"key": "drainage", "mr": "नाले / पाणी साचणे", "en": "Drainage", "icon": "fa-person-digging"},
    {"key": "tree", "mr": "झाड समस्या", "en": "Tree", "icon": "fa-tree"},
    {"key": "other", "mr": "इतर", "en": "Other", "icon": "fa-circle-plus"},
]

CATEGORY_KEYWORDS = {
    "water": ["water", "paani", "पाणी"],
    "garbage": ["garbage", "waste", "trash", "कचरा"],
    "street-lights": ["light", "street light", "दिवे"],
    "road": ["road", "pothole", "रस्ता", "खड्ड"],
    "gutter": ["gutter", "drain", "गटार"],
    "animals": ["dog", "animal", "जनावरे"],
    "traffic": ["traffic", "वाहतूक"],
    "drainage": ["drainage", "overflow", "नाले"],
    "tree": ["tree", "branch", "झाड"],
}
# # MASTER DATA END


# # SCHEMAS START
class AnnouncementCreate(BaseModel):
    audience: str = "citizen"
    ward: str = "all"
    subject: str
    message: str
    created_by: str = "nagaradhyaksha"


class ComplaintStatusUpdate(BaseModel):
    status: str
# # SCHEMAS END


# # MIGRATION HELPERS START
def ensure_schema():
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)
    complaint_columns = {column["name"] for column in inspector.get_columns("complaints")}
    missing_columns = {
        "category": "ALTER TABLE complaints ADD COLUMN category VARCHAR DEFAULT 'other'",
        "created_at": "ALTER TABLE complaints ADD COLUMN created_at DATETIME",
        "updated_at": "ALTER TABLE complaints ADD COLUMN updated_at DATETIME",
    }

    with engine.begin() as connection:
        for column_name, sql in missing_columns.items():
            if column_name not in complaint_columns:
                connection.execute(text(sql))
        connection.execute(
            text("UPDATE complaints SET category = 'other' WHERE category IS NULL OR category = ''")
        )


ensure_schema()
# # MIGRATION HELPERS END


# # UTILS START
def normalize_ward(value):
    return "".join(ch for ch in str(value or "").lower().replace("ward", "").replace("वॉर्ड", "") if ch.isdigit())


def normalize_status(value):
    status = str(value or "Pending").lower()
    if "resolve" in status or "पूर्ण" in status:
        return "resolved"
    if "progress" in status or "कारवाई" in status:
        return "progress"
    return "pending"


def detect_category(complaint):
    if complaint.category:
        return complaint.category

    text_value = f"{complaint.title or ''} {complaint.description or ''}".lower()
    for key, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword.lower() in text_value for keyword in keywords):
            return key
    return "other"


def complaint_to_dict(complaint):
    category = detect_category(complaint)
    return {
        "id": complaint.id,
        "citizen_name": complaint.citizen_name,
        "ward": complaint.ward,
        "category": category,
        "title": complaint.title,
        "description": complaint.description,
        "image": complaint.image,
        "status": complaint.status or "Pending",
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }


def ward_label(ward_id):
    ward = next((item for item in WARDS if item["id"] == str(ward_id)), None)
    return f"वॉर्ड {ward['id']} - {ward['name']}" if ward else f"वॉर्ड {ward_id}"


def query_complaints(db, ward=None, category=None, status=None):
    complaints = db.query(Complaint).all()

    if ward and ward != "all":
        complaints = [item for item in complaints if normalize_ward(item.ward) == normalize_ward(ward)]
    if category and category != "all":
        complaints = [item for item in complaints if detect_category(item) == category]
    if status and status != "all":
        complaints = [item for item in complaints if normalize_status(item.status) == status]

    return complaints


def ward_stats(db, ward_id):
    complaints = query_complaints(db, ward=ward_id)
    total = len(complaints)
    resolved = len([item for item in complaints if normalize_status(item.status) == "resolved"])
    pending = len([item for item in complaints if normalize_status(item.status) == "pending"])
    progress = len([item for item in complaints if normalize_status(item.status) == "progress"])
    score = round((resolved / total) * 100) if total else 100
    return {
        "total": total,
        "resolved": resolved,
        "pending": pending,
        "progress": progress,
        "score": score,
    }
# # UTILS END


# # BASIC ROUTES START
@app.get("/")
def home():
    return {"message": "Complaint System Backend Running"}


@app.get("/wards")
def get_wards(db: Session = Depends(get_db)):
    return [{**ward, "label": ward_label(ward["id"]), "stats": ward_stats(db, ward["id"])} for ward in WARDS]


@app.get("/categories")
def get_categories():
    return CATEGORIES
# # BASIC ROUTES END


# # COMPLAINT ROUTES START
@app.get("/complaints")
def get_complaints(
    role: Optional[str] = None,
    ward: Optional[str] = None,
    department: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    selected_category = category or department
    selected_ward = ward

    if role == "nagarsevak" and selected_ward:
        selected_ward = normalize_ward(selected_ward)

    complaints = query_complaints(db, ward=selected_ward, category=selected_category, status=status)
    return [complaint_to_dict(complaint) for complaint in complaints]


@app.post("/submit-complaint")
async def submit_complaint(
    citizen_name: str = Form(...),
    ward: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form("other"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    image_name = ""
    if image and image.filename:
        UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
        image_name = image.filename
        image_path = UPLOAD_FOLDER / image_name
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    new_complaint = Complaint(
        citizen_name=citizen_name,
        ward=ward,
        category=category,
        title=title,
        description=description,
        image=image_name,
        status="Pending",
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return {
        "message": "Complaint Submitted Successfully",
        "complaint": complaint_to_dict(new_complaint),
    }


@app.patch("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = payload.status
    complaint.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint_to_dict(complaint)
# # COMPLAINT ROUTES END


# # ANNOUNCEMENT ROUTES START
@app.get("/announcements")
def get_announcements(
    audience: Optional[str] = None,
    ward: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Announcement)
    if audience:
        query = query.filter(Announcement.audience == audience)
    if ward and ward != "all":
        normalized = normalize_ward(ward)
        query = query.filter(Announcement.ward.in_(["all", normalized, ward]))

    announcements = query.order_by(Announcement.created_at.desc(), Announcement.id.desc()).all()
    return announcements


@app.post("/announcements")
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db)):
    if payload.audience not in {"citizen", "nagarsevak"}:
        raise HTTPException(status_code=400, detail="audience must be citizen or nagarsevak")

    announcement = Announcement(
        audience=payload.audience,
        ward=normalize_ward(payload.ward) if payload.ward != "all" else "all",
        subject=payload.subject,
        message=payload.message,
        created_by=payload.created_by,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement
# # ANNOUNCEMENT ROUTES END


# # ANALYTICS ROUTES START
@app.get("/analytics/summary")
def get_summary(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()
    total = len(complaints)
    pending = len([item for item in complaints if normalize_status(item.status) == "pending"])
    progress = len([item for item in complaints if normalize_status(item.status) == "progress"])
    resolved = len([item for item in complaints if normalize_status(item.status) == "resolved"])
    rate = round((resolved / total) * 100) if total else 0
    return {
        "total": total,
        "pending": pending,
        "progress": progress,
        "resolved": resolved,
        "resolution_rate": rate,
        "wards": [{**ward, "label": ward_label(ward["id"]), "stats": ward_stats(db, ward["id"])} for ward in WARDS],
    }


@app.get("/analytics/monthly")
def get_monthly_analytics(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()
    by_category = Counter(detect_category(item) for item in complaints)
    by_ward = defaultdict(int)
    for complaint in complaints:
        by_ward[normalize_ward(complaint.ward)] += 1

    total = len(complaints)
    resolved = len([item for item in complaints if normalize_status(item.status) == "resolved"])
    return {
        "total": total,
        "resolved": resolved,
        "pending": len([item for item in complaints if normalize_status(item.status) == "pending"]),
        "progress": len([item for item in complaints if normalize_status(item.status) == "progress"]),
        "resolution_rate": round((resolved / total) * 100) if total else 0,
        "by_category": dict(by_category),
        "by_ward": dict(by_ward),
    }


@app.get("/analytics/best-ward")
def get_best_ward(db: Session = Depends(get_db)):
    ranked = [{**ward, "label": ward_label(ward["id"]), "stats": ward_stats(db, ward["id"])} for ward in WARDS]
    ranked.sort(key=lambda item: (item["stats"]["score"], item["stats"]["resolved"]), reverse=True)
    return {
        "best": ranked[0] if ranked else None,
        "ranking": ranked,
    }
# # ANALYTICS ROUTES END
