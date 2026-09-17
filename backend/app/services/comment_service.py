from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.repositories import comment_repo
from app.utils.hashing import hash_anonymous_id
from app.schemas.comment import CommentCreate, CommentResponse


def add_comment(db: Session, experience_id: UUID, data: CommentCreate) -> CommentResponse:
    hashed = hash_anonymous_id(data.anonymous_id)
    comment = comment_repo.create(db, experience_id, hashed, data.content)
    return CommentResponse(
        id=comment.id,
        experience_id=comment.experience_id,
        content=comment.content,
        created_at=comment.created_at,
        status=comment.status,
    )


def get_comments(db: Session, experience_id: UUID, anonymous_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[CommentResponse]:
    comments = comment_repo.get_by_experience(db, experience_id, limit=limit, offset=offset)
    hashed = hash_anonymous_id(anonymous_id) if anonymous_id else None
    results = []
    for c in comments:
        upvotes, downvotes = comment_repo.get_vote_counts(db, c.id)
        user_vote = comment_repo.get_user_vote(db, c.id, hashed) if hashed else None
        results.append(CommentResponse(
            id=c.id,
            experience_id=c.experience_id,
            content=c.content,
            created_at=c.created_at,
            status=c.status,
            upvotes=upvotes,
            downvotes=downvotes,
            user_vote=user_vote,
        ))
    return results
