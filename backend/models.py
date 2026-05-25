from sqlalchemy import Column, Integer, String
from database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    citizen_name = Column(String)
    ward = Column(String)

    title = Column(String)
    description = Column(String)

    image = Column(String)

    status = Column(String, default="Pending")
    