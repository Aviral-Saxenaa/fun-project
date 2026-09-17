from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from uuid import UUID

from app.models.company import Company
from app.models.experience import Experience, Outcome


def get_by_slug(db: Session, slug: str) -> Optional[Company]:
    return db.query(Company).filter(Company.slug == slug).first()


def get_by_id(db: Session, company_id: UUID) -> Optional[Company]:
    return db.query(Company).filter(Company.id == company_id).first()


def search(db: Session, query: str, limit: int = 20) -> List[Company]:
    pattern = f"%{query.lower()}%"
    return (
        db.query(Company)
        .filter(func.lower(Company.name).like(pattern))
        .limit(limit)
        .all()
    )


def create(db: Session, name: str, slug: str, website: Optional[str], industry: Optional[str]) -> Company:
    company = Company(name=name, slug=slug, website=website, industry=industry)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def get_company_stats(db: Session, company_id: UUID) -> dict:
    total = db.query(func.count(Experience.id)).filter(
        Experience.company_id == company_id, Experience.status == "active"
    ).scalar() or 0

    ghosted = db.query(func.count(Experience.id)).filter(
        Experience.company_id == company_id,
        Experience.outcome == Outcome.ghosted,
        Experience.status == "active",
    ).scalar() or 0

    avg_wait = db.query(func.avg(Experience.waiting_days)).filter(
        Experience.company_id == company_id,
        Experience.waiting_days.isnot(None),
        Experience.status == "active",
    ).scalar()

    max_wait = db.query(func.max(Experience.waiting_days)).filter(
        Experience.company_id == company_id,
        Experience.waiting_days.isnot(None),
        Experience.status == "active",
    ).scalar()

    unique_reporters = db.query(func.count(func.distinct(Experience.anonymous_id_hash))).filter(
        Experience.company_id == company_id, Experience.status == "active"
    ).scalar() or 0

    return {
        "total_reports": total,
        "ghost_reports": ghosted,
        "avg_waiting_days": round(avg_wait, 1) if avg_wait else 0,
        "longest_wait_days": max_wait or 0,
        "unique_reporters": unique_reporters,
    }


def get_all_with_stats(db: Session, limit: int = 50, offset: int = 0) -> List[dict]:
    companies = db.query(Company).offset(offset).limit(limit).all()
    results = []
    for c in companies:
        stats = get_company_stats(db, c.id)
        results.append({"company": c, "stats": stats})
    return results
