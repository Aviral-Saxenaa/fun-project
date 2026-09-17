import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base


class ReportReason(str, enum.Enum):
    spam = "Spam"
    harassment = "Harassment"
    personal_info = "Personal Information"
    hate_speech = "Hate Speech"
    misleading = "Misleading"
    other = "Other"


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(UUID(as_uuid=True), ForeignKey("experiences.id"), nullable=True)
    comment_id = Column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True)
    anonymous_id_hash = Column(String(255), nullable=False)
    reason = Column(SAEnum(ReportReason), nullable=False)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
