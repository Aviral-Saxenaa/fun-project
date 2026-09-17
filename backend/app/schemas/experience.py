from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID

from app.models.experience import InterviewStage, Outcome, Category


class ExperienceCreate(BaseModel):
    company_id: UUID
    interview_stage: InterviewStage
    outcome: Outcome
    content: str = Field(..., min_length=10, max_length=5000)
    waiting_days: Optional[int] = Field(None, ge=0)
    interview_rounds: Optional[int] = Field(None, ge=1)
    category: Optional[Category] = None
    anonymous_id: str


class ExperienceResponse(BaseModel):
    id: UUID
    company_id: UUID
    interview_stage: InterviewStage
    outcome: Outcome
    content: str
    waiting_days: Optional[int]
    interview_rounds: Optional[int]
    category: Optional[Category]
    created_at: datetime
    status: str
    upvotes: int = 0
    downvotes: int = 0
    comment_count: int = 0
    user_vote: Optional[str] = None

    model_config = {"from_attributes": True}
