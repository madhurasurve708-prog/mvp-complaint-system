from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from database import Base


# # COMPLAINT MODEL START
class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    citizen_name = Column(String)
    ward = Column(String)
    category = Column(String, default="other")
    title = Column(String)
    description = Column(Text)
    image = Column(String)
    status = Column(String, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
# # COMPLAINT MODEL END


# # ANNOUNCEMENT MODEL START
class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    audience = Column(String, default="citizen")
    ward = Column(String, default="all")
    subject = Column(String)
    message = Column(Text)
    created_by = Column(String, default="nagaradhyaksha")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
# # ANNOUNCEMENT MODEL END
