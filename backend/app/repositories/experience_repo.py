from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from uuid import UUID

from app.models.experience import Experience
from app.models.vote import Vote, VoteType
from app.models.comment import Comment


def get_by_id(db: Session, experience_id: UUID) -> Optional[Experience]:
    return db.query(Experience).filter(Experience.id == experience_id).first()


def get_by_company(db: Session, company_id: UUID, limit: int = 20, offset: int = 0) -> List[Experience]:
    return (
        db.query(Experience)
        .filter(Experience.company_id == company_id, Experience.status == "active")
        .order_by(desc(Experience.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def create(
    db: Session,
    company_id: UUID,
    anonymous_id_hash: str,
    interview_stage: str,
    outcome: str,
    content: str,
    waiting_days: Optional[int],
    interview_rounds: Optional[int],
    category: Optional[str],
) -> Experience:
    exp = Experience(
        company_id=company_id,
        anonymous_id_hash=anonymous_id_hash,
        interview_stage=interview_stage,
        outcome=outcome,
        content=content,
        waiting_days=waiting_days,
        interview_rounds=interview_rounds,
        category=category,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


def get_vote_counts(db: Session, experience_id: UUID) -> tuple:
    upvotes = db.query(func.count(Vote.id)).filter(
        Vote.experience_id == experience_id, Vote.vote_type == VoteType.up
    ).scalar() or 0
    downvotes = db.query(func.count(Vote.id)).filter(
        Vote.experience_id == experience_id, Vote.vote_type == VoteType.down
    ).scalar() or 0
    return upvotes, downvotes


def get_user_vote(db: Session, experience_id: UUID, anonymous_id_hash: str) -> Optional[str]:
    vote = db.query(Vote).filter(
        Vote.experience_id == experience_id,
        Vote.anonymous_id_hash == anonymous_id_hash,
    ).first()
    return vote.vote_type.value if vote else None


def get_comment_count(db: Session, experience_id: UUID) -> int:
    return db.query(func.count(Comment.id)).filter(
        Comment.experience_id == experience_id, Comment.status == "active"
    ).scalar() or 0


def delete(db: Session, experience_id: UUID) -> bool:
    exp = get_by_id(db, experience_id)
    if exp:
        exp.status = "deleted"
        db.commit()
        return True
    return False
