from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.schemas.comment import CommentCreate, CommentResponse
from app.services import comment_service

router = APIRouter(tags=["comments"])


@router.get("/api/experiences/{experience_id}/comments", response_model=List[CommentResponse])
def list_comments(
    experience_id: UUID,
    anonymous_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return comment_service.get_comments(db, experience_id, anonymous_id, limit, offset)


@router.post("/api/experiences/{experience_id}/comments", response_model=CommentResponse)
def add_comment(experience_id: UUID, data: CommentCreate, db: Session = Depends(get_db)):
    return comment_service.add_comment(db, experience_id, data)


@router.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: UUID, admin_secret: str = Query(...), db: Session = Depends(get_db)):
    from app.config import settings
    if admin_secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Unauthorized")
    from app.repositories.comment_repo import delete
    if not delete(db, comment_id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "deleted"}
