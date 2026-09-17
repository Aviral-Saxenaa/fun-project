from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.company import CompanyCreate, CompanyResponse, CompanySearchResult
from app.services import company_service

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("", response_model=List[CompanySearchResult])
def search_companies(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    return company_service.search_companies(db, q)


@router.get("/leaderboard")
def leaderboard(limit: int = Query(50, le=100), db: Session = Depends(get_db)):
    return company_service.get_leaderboard(db, limit)


@router.get("/{slug}")
def get_company(slug: str, db: Session = Depends(get_db)):
    result = company_service.get_company_detail(db, slug)
    if not result:
        raise HTTPException(status_code=404, detail="Company not found")
    return result


@router.post("", response_model=CompanyResponse)
def create_company(data: CompanyCreate, db: Session = Depends(get_db)):
    return company_service.add_company(db, data.name, data.website, data.industry)
