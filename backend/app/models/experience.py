import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class InterviewStage(str, enum.Enum):
    applied = "Applied"
    recruiter_call = "Recruiter Call"
    hr = "HR"
    technical = "Technical"
    manager = "Manager"
    final_round = "Final Round"
    offer_stage = "Offer Stage"


class Outcome(str, enum.Enum):
    ghosted = "Ghosted"
    rejected = "Rejected"
    got_offer = "Got Offer"
    still_waiting = "Still Waiting"
    withdrew = "Withdrew"


class Category(str, enum.Enum):
    ghosting = "Ghosting"
    zombie_interview = "Zombie Interview"
    infinite_waiting = "Infinite Waiting"
    hr_circus = "HR Circus"
    unpaid_assignment = "Unpaid Assignment"
    red_flag = "Red Flag"


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    anonymous_id_hash = Column(String(255), nullable=False)
    interview_stage = Column(SAEnum(InterviewStage), nullable=False)
    outcome = Column(SAEnum(Outcome), nullable=False)
    content = Column(Text, nullable=False)
    waiting_days = Column(Integer, nullable=True)
    interview_rounds = Column(Integer, nullable=True)
    category = Column(SAEnum(Category), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(50), default="active")

    company = relationship("Company", back_populates="experiences")
    votes = relationship("Vote", back_populates="experience")
    comments = relationship("Comment", back_populates="experience")
