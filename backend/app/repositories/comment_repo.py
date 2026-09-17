from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from uuid import UUID

from app.models.comment import Comment
from app.models.comment_vote import CommentVote, CommentVoteType


def get_by_experience(db: Session, experience_id: UUID, limit: int = 50, offset: int = 0) -> List[Comment]:
    return (
        db.query(Comment)
        .filter(Comment.experience_id == experience_id, Comment.status == "active")
        .order_by(desc(Comment.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def create(db: Session, experience_id: UUID, anonymous_id_hash: str, content: str) -> Comment:
    comment = Comment(
        experience_id=experience_id,
        anonymous_id_hash=anonymous_id_hash,
        content=content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_vote_counts(db: Session, comment_id: UUID) -> tuple:
    upvotes = db.query(func.count(CommentVote.id)).filter(
        CommentVote.comment_id == comment_id, CommentVote.vote_type == CommentVoteType.up
    ).scalar() or 0
    downvotes = db.query(func.count(CommentVote.id)).filter(
        CommentVote.comment_id == comment_id, CommentVote.vote_type == CommentVoteType.down
    ).scalar() or 0
    return upvotes, downvotes


def get_user_vote(db: Session, comment_id: UUID, anonymous_id_hash: str) -> Optional[str]:
    vote = db.query(CommentVote).filter(
        CommentVote.comment_id == comment_id,
        CommentVote.anonymous_id_hash == anonymous_id_hash,
    ).first()
    return vote.vote_type.value if vote else None


def upsert_vote(db: Session, comment_id: UUID, anonymous_id_hash: str, vote_type: CommentVoteType) -> Optional[CommentVote]:
    existing = db.query(CommentVote).filter(
        CommentVote.comment_id == comment_id,
        CommentVote.anonymous_id_hash == anonymous_id_hash,
    ).first()
    if existing:
        if existing.vote_type == vote_type:
            db.delete(existing)
            db.commit()
            return None
        existing.vote_type = vote_type
        db.commit()
        db.refresh(existing)
        return existing
    vote = CommentVote(comment_id=comment_id, anonymous_id_hash=anonymous_id_hash, vote_type=vote_type)
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote


def delete(db: Session, comment_id: UUID) -> bool:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment:
        comment.status = "deleted"
        db.commit()
        return True
    return False
