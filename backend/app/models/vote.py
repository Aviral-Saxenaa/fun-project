import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class VoteType(str, enum.Enum):
    up = "up"
    down = "down"


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint("experience_id", "anonymous_id_hash", name="uq_experience_vote"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(UUID(as_uuid=True), ForeignKey("experiences.id"), nullable=False, index=True)
    anonymous_id_hash = Column(String(255), nullable=False)
    vote_type = Column(SAEnum(VoteType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    experience = relationship("Experience", back_populates="votes")
