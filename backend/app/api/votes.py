from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.schemas.vote import VoteRequest
from app.services import vote_service
from app.models.vote import VoteType
from app.models.comment_vote import CommentVoteType

router = APIRouter(tags=["votes"])


@router.post("/api/experiences/{experience_id}/vote")
def vote_on_experience(experience_id: UUID, data: VoteRequest, db: Session = Depends(get_db)):
    return vote_service.vote_experience(db, experience_id, data.anonymous_id, data.vote_type)


@router.post("/api/comments/{comment_id}/vote")
def vote_on_comment(comment_id: UUID, data: VoteRequest, db: Session = Depends(get_db)):
    vote_type = CommentVoteType(data.vote_type.value)
    return vote_service.vote_comment(db, comment_id, data.anonymous_id, vote_type)
