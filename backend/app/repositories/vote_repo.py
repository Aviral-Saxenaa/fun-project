from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.models.vote import Vote, VoteType


def get_vote(db: Session, experience_id: UUID, anonymous_id_hash: str) -> Optional[Vote]:
    return db.query(Vote).filter(
        Vote.experience_id == experience_id,
        Vote.anonymous_id_hash == anonymous_id_hash,
    ).first()


def upsert_vote(db: Session, experience_id: UUID, anonymous_id_hash: str, vote_type: VoteType) -> Vote:
    existing = get_vote(db, experience_id, anonymous_id_hash)
    if existing:
        if existing.vote_type == vote_type:
            db.delete(existing)
            db.commit()
            return None
        existing.vote_type = vote_type
        db.commit()
        db.refresh(existing)
        return existing

    vote = Vote(
        experience_id=experience_id,
        anonymous_id_hash=anonymous_id_hash,
        vote_type=vote_type,
    )
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote
