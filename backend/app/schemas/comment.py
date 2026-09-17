from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    anonymous_id: str


class CommentResponse(BaseModel):
    id: UUID
    experience_id: UUID
    content: str
    created_at: datetime
    status: str
    upvotes: int = 0
    downvotes: int = 0
    user_vote: Optional[str] = None

    model_config = {"from_attributes": True}
