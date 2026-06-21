from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import engine, SessionLocal
import models


app = FastAPI()


# create database tables
models.Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Backend Working"}


@app.post("/create-users")
def create_users():

    db = SessionLocal()

    users = [

    # CITIZENS

    models.User(
        name="Citizen Ward 1",
        phone="9000000001",
        otp="123456",
        role="citizen",
        ward_id=1
    ),

    models.User(
        name="Citizen Ward 2",
        phone="9000000002",
        otp="123456",
        role="citizen",
        ward_id=2
    ),

    models.User(
        name="Citizen Ward 3",
        phone="9000000003",
        otp="123456",
        role="citizen",
        ward_id=3
    ),

    models.User(
        name="Citizen Ward 4",
        phone="9000000004",
        otp="123456",
        role="citizen",
        ward_id=4
    ),



    # NAGARSEVAKS

    models.User(
        name="केणी मंदार मोहन",
        phone="9000000011",
        otp="123456",
        role="nagarsevak",
        ward_id=1
    ),

    models.User(
        name="Ward 2 Nagarsevak",
        phone="9000000012",
        otp="123456",
        role="nagarsevak",
        ward_id=2
    ),

    models.User(
        name="Ward 3 Nagarsevak",
        phone="9000000013",
        otp="123456",
        role="nagarsevak",
        ward_id=3
    ),

    models.User(
        name="Ward 4 Nagarsevak",
        phone="9000000014",
        otp="123456",
        role="nagarsevak",
        ward_id=4
    )
]

    db.add_all(users)
    db.commit()
    db.close()

    return {"message": "Users created"}


class LoginData(BaseModel):
    phone: str
    otp: str


@app.post("/login")
def login(data: LoginData):
    db = SessionLocal()

    user = db.query(models.User).filter(
        models.User.phone == data.phone,
        models.User.otp == data.otp
    ).first()

    db.close()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid phone or OTP"
        )

    return {
        "message": "Login successful",
        "name": user.name,
        "role": user.role,
        "ward_id": user.ward_id
    }


class ComplaintData(BaseModel):
    category: str
    description: str
    photo: str | None = None
    citizen_id: int
    ward_id: int | None = None


@app.post("/complaints")
def create_complaint(data: ComplaintData):

    db = SessionLocal()
    citizen = db.query(models.User).filter(models.User.id == data.citizen_id).first()

    if citizen is None:
        db.close()
        raise HTTPException(status_code=404, detail="Citizen not found")

    complaint = models.Complaint(
        category=data.category,
        description=data.description,
        photo=data.photo,
        status="Pending",
        citizen_id=data.citizen_id,
        ward_id=data.ward_id if data.ward_id is not None else citizen.ward_id
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    db.close()

    return {
        "message": "Complaint submitted",
        "complaint_id": complaint.id,
        "status": complaint.status
    }


@app.get("/complaints/{ward_id}")
def get_complaints(ward_id: int):

    db = SessionLocal()

    complaints = db.query(models.Complaint).filter(
        models.Complaint.ward_id == ward_id
    ).all()

    db.close()

    return complaints

class StatusData(BaseModel):
    status: str


@app.put("/complaints/{complaint_id}")
def update_status(complaint_id: int, data: StatusData):

    db = SessionLocal()

    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()


    if complaint is None:
        db.close()
        return {"message": "Complaint not found"}


    complaint.status = data.status

    db.commit()
    db.refresh(complaint)

    db.close()

    return {
        "message": "Status updated",
        "complaint_id": complaint.id,
        "status": complaint.status
    }
@app.get("/all-complaints")
def get_all_complaints():

    db = SessionLocal()

    complaints = db.query(models.Complaint).all()

    db.close()

    return complaints

from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/my-complaints/{ward_id}")
def my_complaints(ward_id: int):

    db = SessionLocal()

    complaints = db.query(models.Complaint).filter(
        models.Complaint.ward_id == ward_id
    ).all()

    db.close()

    return complaints