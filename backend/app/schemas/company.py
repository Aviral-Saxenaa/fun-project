from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    industry: Optional[str] = Field(None, max_length=255)


class CompanyResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    website: Optional[str]
    industry: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class CompanySearchResult(BaseModel):
    id: UUID
    name: str
    slug: str
    ghost_score: int
    report_count: int

    model_config = {"from_attributes": True}
