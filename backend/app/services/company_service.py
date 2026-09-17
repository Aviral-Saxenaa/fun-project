from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.repositories import company_repo
from app.utils.slug import generate_slug
from app.utils.ghost_score import calculate_ghost_score, get_ghost_label, get_ghost_emoji
from app.schemas.company import CompanyResponse, CompanySearchResult


def search_companies(db: Session, query: str) -> List[CompanySearchResult]:
    companies = company_repo.search(db, query)
    results = []
    for c in companies:
        stats = company_repo.get_company_stats(db, c.id)
        score = calculate_ghost_score(
            stats["ghost_reports"],
            stats["total_reports"],
            0,
            stats["unique_reporters"],
        )
        results.append(CompanySearchResult(
            id=c.id,
            name=c.name,
            slug=c.slug,
            ghost_score=score,
            report_count=stats["total_reports"],
        ))
    return results


def get_company_detail(db: Session, slug: str) -> Optional[dict]:
    company = company_repo.get_by_slug(db, slug)
    if not company:
        return None
    stats = company_repo.get_company_stats(db, company.id)
    score = calculate_ghost_score(
        stats["ghost_reports"],
        stats["total_reports"],
        0,
        stats["unique_reporters"],
    )
    return {
        "company": CompanyResponse.model_validate(company),
        "ghost_score": score,
        "ghost_label": get_ghost_label(score),
        "ghost_emoji": get_ghost_emoji(score),
        "stats": stats,
    }


def add_company(db: Session, name: str, website: Optional[str], industry: Optional[str]) -> CompanyResponse:
    slug = generate_slug(name)
    existing = company_repo.get_by_slug(db, slug)
    if existing:
        return CompanyResponse.model_validate(existing)
    company = company_repo.create(db, name=name, slug=slug, website=website, industry=industry)
    return CompanyResponse.model_validate(company)


def get_leaderboard(db: Session, limit: int = 50) -> List[dict]:
    entries = company_repo.get_all_with_stats(db, limit=limit)
    board = []
    for entry in entries:
        c = entry["company"]
        s = entry["stats"]
        if s["total_reports"] == 0:
            continue
        score = calculate_ghost_score(
            s["ghost_reports"], s["total_reports"], 0, s["unique_reporters"]
        )
        board.append({
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "ghost_score": score,
            "ghost_label": get_ghost_label(score),
            "ghost_emoji": get_ghost_emoji(score),
            "report_count": s["total_reports"],
        })
    board.sort(key=lambda x: x["ghost_score"], reverse=True)
    return board[:limit]
