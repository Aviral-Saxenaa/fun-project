from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.models.report import Report, ReportReason


def create(
    db: Session,
    anonymous_id_hash: str,
    reason: ReportReason,
    experience_id: Optional[UUID] = None,
    comment_id: Optional[UUID] = None,
) -> Report:
    report = Report(
        experience_id=experience_id,
        comment_id=comment_id,
        anonymous_id_hash=anonymous_id_hash,
        reason=reason,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
