from sqlalchemy.orm import Session
from uuid import UUID

from app.repositories import vote_repo, comment_repo
from app.utils.hashing import hash_anonymous_id
from app.models.vote import VoteType
from app.models.comment_vote import CommentVoteType


def vote_experience(db: Session, experience_id: UUID, anonymous_id: str, vote_type: VoteType) -> dict:
    hashed = hash_anonymous_id(anonymous_id)
    vote_repo.upsert_vote(db, experience_id, hashed, vote_type)
    upvotes, downvotes = vote_repo.get_vote_counts_for_experience(db, experience_id) if hasattr(vote_repo, 'get_vote_counts_for_experience') else (0, 0)
    from app.repositories.experience_repo import get_vote_counts
    upvotes, downvotes = get_vote_counts(db, experience_id)
    return {"upvotes": upvotes, "downvotes": downvotes}


def vote_comment(db: Session, comment_id: UUID, anonymous_id: str, vote_type: CommentVoteType) -> dict:
    hashed = hash_anonymous_id(anonymous_id)
    comment_repo.upsert_vote(db, comment_id, hashed, vote_type)
    upvotes, downvotes = comment_repo.get_vote_counts(db, comment_id)
    return {"upvotes": upvotes, "downvotes": downvotes}
