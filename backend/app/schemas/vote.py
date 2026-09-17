from pydantic import BaseModel

from app.models.vote import VoteType


class VoteRequest(BaseModel):
    vote_type: VoteType
    anonymous_id: str
