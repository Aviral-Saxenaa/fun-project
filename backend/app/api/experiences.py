from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.schemas.experience import ExperienceCreate, ExperienceResponse
from app.services import experience_service

router = APIRouter(prefix="/api/experiences", tags=["experiences"])


@router.post("", response_model=ExperienceResponse)
def submit_experience(data: ExperienceCreate, db: Session = Depends(get_db)):
    return experience_service.submit_experience(db, data)


@router.get("", response_model=List[ExperienceResponse])
def list_experiences(
    company_id: UUID = Query(...),
    anonymous_id: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return experience_service.get_experiences(db, company_id, anonymous_id, limit, offset)


@router.delete("/{experience_id}")
def delete_experience(experience_id: UUID, admin_secret: str = Query(...), db: Session = Depends(get_db)):
    from app.config import settings
    if admin_secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Unauthorized")
    from app.repositories.experience_repo import delete
    if not delete(db, experience_id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "deleted"}
