from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil
import os

from database import engine, Base, SessionLocal
from models import Complaint

app = FastAPI()

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload Folder
UPLOAD_FOLDER = "../uploads"

# Home Route
@app.get("/")
def home():
    return {
        "message": "Complaint System Backend Running"
    }

# Submit Complaint API
# Get All Complaints
@app.get("/complaints")
def get_complaints():

    db: Session = SessionLocal()

    complaints = db.query(Complaint).all()

    return complaints
@app.post("/submit-complaint")
async def submit_complaint(
    citizen_name: str = Form(...),
    ward: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...)
):

    # Create uploads folder if not exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Save Image
    image_path = f"{UPLOAD_FOLDER}/{image.filename}"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Database session
    db: Session = SessionLocal()

    # Create complaint object
    new_complaint = Complaint(
        citizen_name=citizen_name,
        ward=ward,
        title=title,
        description=description,
        image=image.filename,
        status="Pending"
    )

    # Save to DB
    db.add(new_complaint)
    db.commit()

    return {
        "message": "Complaint Submitted Successfully"
    }

# Get All Complaints
@app.get("/complaints")
def get_complaints():

    db: Session = SessionLocal()

    complaints = db.query(Complaint).all()

    return complaints