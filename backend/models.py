from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from database import Base


class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    citizens = relationship("Citizen", back_populates="ward")
    nagarsevaks = relationship("Nagarsevak", back_populates="ward")
    complaints = relationship("Complaint", back_populates="ward")


class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    mobile_number = Column(String, unique=True, nullable=False, index=True)
    locality = Column(String, nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    ward = relationship("Ward", back_populates="citizens")
    complaints = relationship("Complaint", back_populates="citizen")


class Nagarsevak(Base):
    __tablename__ = "nagarsevaks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mobile_number = Column(String, unique=True, nullable=False, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False, index=True)
    password = Column(String, nullable=False)

    ward = relationship("Ward", back_populates="nagarsevaks")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    photo_filename = Column(String, nullable=True)
    status = Column(String, default="Pending", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    citizen = relationship("Citizen", back_populates="complaints")
    ward = relationship("Ward", back_populates="complaints")
