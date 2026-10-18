from __future__ import annotations

from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import AuthToken, User
from .security import token_hash


def get_db(request: Request):
    db = request.app.state.db
    with db.Session() as session:
        yield session


def current_user(authorization: str | None = Header(default=None), session: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Oturum gerekli")
    tok = session.scalar(select(AuthToken).where(AuthToken.token_hash == token_hash(authorization[7:].strip())))
    now = datetime.now(timezone.utc)
    if tok is None:
        raise HTTPException(401, "Geçersiz oturum")
    expires = tok.expires_at if tok.expires_at.tzinfo else tok.expires_at.replace(tzinfo=timezone.utc)
    if expires < now:
        raise HTTPException(401, "Oturumun süresi doldu")
    tok.last_used_at = now
    session.commit()
    return session.get(User, tok.user_id)


def require_admin(request: Request, x_admin_token: str | None = Header(default=None)) -> None:
    expected = request.app.state.settings.admin_token
    if not expected:
        raise HTTPException(403, "Yönetici uç noktaları kapalı (ADMIN_TOKEN tanımlı değil)")
    import hmac
    if not x_admin_token or not hmac.compare_digest(x_admin_token, expected):
        raise HTTPException(403, "Yetkisiz")
