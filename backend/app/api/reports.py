from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report import ReportCreate
from app.repositories import report_repo
from app.utils.hashing import hash_anonymous_id

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("")
def submit_report(data: ReportCreate, db: Session = Depends(get_db)):
    hashed = hash_anonymous_id(data.anonymous_id)
    report = report_repo.create(
        db=db,
        anonymous_id_hash=hashed,
        reason=data.reason,
        experience_id=data.experience_id,
        comment_id=data.comment_id,
    )
    return {"id": str(report.id), "status": "submitted"}
