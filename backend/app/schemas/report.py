from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.models.report import ReportReason


class ReportCreate(BaseModel):
    experience_id: Optional[UUID] = None
    comment_id: Optional[UUID] = None
    reason: ReportReason
    anonymous_id: str
