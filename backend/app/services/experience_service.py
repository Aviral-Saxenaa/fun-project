from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.repositories import experience_repo
from app.utils.hashing import hash_anonymous_id
from app.schemas.experience import ExperienceCreate, ExperienceResponse


def submit_experience(db: Session, data: ExperienceCreate) -> ExperienceResponse:
    hashed = hash_anonymous_id(data.anonymous_id)
    exp = experience_repo.create(
        db=db,
        company_id=data.company_id,
        anonymous_id_hash=hashed,
        interview_stage=data.interview_stage.value,
        outcome=data.outcome.value,
        content=data.content,
        waiting_days=data.waiting_days,
        interview_rounds=data.interview_rounds,
        category=data.category.value if data.category else None,
    )
    return ExperienceResponse(
        id=exp.id,
        company_id=exp.company_id,
        interview_stage=exp.interview_stage,
        outcome=exp.outcome,
        content=exp.content,
        waiting_days=exp.waiting_days,
        interview_rounds=exp.interview_rounds,
        category=exp.category,
        created_at=exp.created_at,
        status=exp.status,
    )


def get_experiences(db: Session, company_id: UUID, anonymous_id: Optional[str] = None, limit: int = 20, offset: int = 0) -> List[ExperienceResponse]:
    experiences = experience_repo.get_by_company(db, company_id, limit=limit, offset=offset)
    hashed = hash_anonymous_id(anonymous_id) if anonymous_id else None
    results = []
    for exp in experiences:
        upvotes, downvotes = experience_repo.get_vote_counts(db, exp.id)
        comment_count = experience_repo.get_comment_count(db, exp.id)
        user_vote = experience_repo.get_user_vote(db, exp.id, hashed) if hashed else None
        results.append(ExperienceResponse(
            id=exp.id,
            company_id=exp.company_id,
            interview_stage=exp.interview_stage,
            outcome=exp.outcome,
            content=exp.content,
            waiting_days=exp.waiting_days,
            interview_rounds=exp.interview_rounds,
            category=exp.category,
            created_at=exp.created_at,
            status=exp.status,
            upvotes=upvotes,
            downvotes=downvotes,
            comment_count=comment_count,
            user_vote=user_vote,
        ))
    return results
