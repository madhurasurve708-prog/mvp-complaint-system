from sqlalchemy import Column, Integer, String
from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True)
    otp = Column(String)
    role = Column(String)
    ward_id = Column(Integer)


    from sqlalchemy import Column, Integer, String
from database import Base


class Complaint(Base):

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    category = Column(String)

    description = Column(String)

    photo = Column(String, nullable=True)

    status = Column(String, default="Pending")

    citizen_id = Column(Integer)

    ward_id = Column(Integer)