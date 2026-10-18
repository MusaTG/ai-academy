import json

from sqlalchemy.orm import Session

from .models import AuditLog


def audit(session: Session, action: str, user_id: int | None = None, **detail) -> None:
    session.add(AuditLog(user_id=user_id, action=action, detail=json.dumps(detail, ensure_ascii=False, default=str)))
