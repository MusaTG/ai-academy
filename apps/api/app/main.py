"""Engineering Academy API.

Uç noktalar
  GET  /api/health
  POST /api/auth/register | /api/auth/login | /api/auth/logout      GET /api/auth/me
  POST /api/sync/push          GET /api/sync/pull?since=&limit=
  GET  /api/records/{collection}/{id}/revisions
  GET  /api/export             POST /api/import
  GET  /api/backups/status     (oturum açmış kullanıcı: son yedek zamanı ve durumu)
  POST /api/admin/backup       GET /api/admin/backups   (X-Admin-Token gerekir)

Derlenmiş web uygulaması (apps/web/dist) varsa aynı süreç onu da sunar.
"""
from __future__ import annotations

import json
import threading
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import __version__
from .audit import audit
from .backup import create_backup
from .config import SYNC_COLLECTIONS, Settings, settings as default_settings
from .db import Database
from .deps import current_user, get_db, require_admin
from .migrate import upgrade
from .models import AuthToken, BackupLog, Record, RecordRevision, User
from .schemas import Change, Credentials, ImportIn, PullOut, PushIn, PushOut, TokenOut
from .security import hash_password, new_token, token_hash, verify_password
from .sync import apply_change, pull as pull_changes, record_out


class LoginLimiter:
    """Basit bellek içi deneme sınırlayıcı: IP başına 10 dakikada 20 başarısız giriş."""

    def __init__(self, limit: int = 20, window: int = 600):
        self.limit, self.window, self.hits = limit, window, defaultdict(deque)

    def check(self, key: str) -> None:
        q, now = self.hits[key], time.time()
        while q and q[0] < now - self.window:
            q.popleft()
        if len(q) >= self.limit:
            raise HTTPException(429, "Çok fazla deneme. Biraz sonra tekrar deneyin.")

    def fail(self, key: str) -> None:
        self.hits[key].append(time.time())


def _backup_loop(app: FastAPI, stop: threading.Event) -> None:
    s: Settings = app.state.settings
    if s.backup_interval_hours <= 0:
        return
    while not stop.wait(5):
        with app.state.db.Session() as session:
            last = session.scalar(select(BackupLog).where(BackupLog.status == "ok").order_by(BackupLog.id.desc()))
        due = last is None or (datetime.now(timezone.utc) - _aware(last.created_at)) > timedelta(hours=s.backup_interval_hours)
        if due:
            create_backup(app.state.db, s.backup_dir, s.backup_keep)
        stop.wait(min(3600, s.backup_interval_hours * 3600))


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def create_app(settings: Settings | None = None) -> FastAPI:
    s = settings or default_settings

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        upgrade(app.state.db)
        stop = threading.Event()
        t = threading.Thread(target=_backup_loop, args=(app, stop), daemon=True)
        t.start()
        yield
        stop.set()

    app = FastAPI(title="Engineering Academy API", version=__version__, lifespan=lifespan)
    app.state.settings = s
    app.state.db = Database(s.database_url)
    app.state.limiter = LoginLimiter()
    app.add_middleware(CORSMiddleware, allow_origins=s.cors_origins, allow_methods=["*"], allow_headers=["*"])

    @app.get("/api/health")
    def health(session: Session = Depends(get_db)):
        session.execute(select(1))
        return {"ok": True, "version": __version__, "database": app.state.db.engine.dialect.name,
                "registration": s.allow_registration, "collections": sorted(SYNC_COLLECTIONS)}

    # ---- hesaplar ----------------------------------------------------------------
    def _issue(session: Session, user: User, device: str) -> TokenOut:
        tok = new_token()
        exp = datetime.now(timezone.utc) + timedelta(days=s.token_ttl_days)
        session.add(AuthToken(user_id=user.id, token_hash=token_hash(tok), device_name=device, expires_at=exp))
        session.commit()
        return TokenOut(token=tok, username=user.username, expires_at=exp.isoformat())

    @app.post("/api/auth/register", response_model=TokenOut)
    def register(body: Credentials, session: Session = Depends(get_db)):
        if not s.allow_registration:
            raise HTTPException(403, "Yeni hesap oluşturma kapalı")
        user = User(username=body.username.lower(), password_hash=hash_password(body.password))
        session.add(user)
        try:
            session.flush()
        except IntegrityError:
            session.rollback()
            raise HTTPException(409, "Bu kullanıcı adı alınmış")
        audit(session, "register", user.id)
        return _issue(session, user, body.device_name)

    @app.post("/api/auth/login", response_model=TokenOut)
    def login(body: Credentials, request: Request, session: Session = Depends(get_db)):
        key = request.client.host if request.client else "?"
        app.state.limiter.check(key)
        user = session.scalar(select(User).where(User.username == body.username.lower()))
        if not user or not verify_password(body.password, user.password_hash):
            app.state.limiter.fail(key)
            raise HTTPException(401, "Kullanıcı adı veya parola hatalı")
        audit(session, "login", user.id, device=body.device_name)
        return _issue(session, user, body.device_name)

    @app.post("/api/auth/logout")
    def logout(request: Request, user: User = Depends(current_user), session: Session = Depends(get_db)):
        tok = request.headers.get("authorization", "")[7:].strip()
        row = session.scalar(select(AuthToken).where(AuthToken.token_hash == token_hash(tok)))
        if row:
            session.delete(row)
        session.commit()
        return {"ok": True}

    @app.get("/api/auth/me")
    def me(user: User = Depends(current_user), session: Session = Depends(get_db)):
        n = session.query(Record).filter(Record.user_id == user.id, Record.deleted.is_(False)).count()
        return {"username": user.username, "created_at": user.created_at.isoformat(), "records": n}

    # ---- senkronizasyon ---------------------------------------------------------------
    @app.post("/api/sync/push", response_model=PushOut)
    def push(body: PushIn, user: User = Depends(current_user), session: Session = Depends(get_db)):
        results = []
        for ch in body.changes:
            sp = session.begin_nested()
            try:
                r = apply_change(session, user.id, ch, body.device_id)
                sp.commit()
            except Exception as e:  # noqa: BLE001 — tek kaydın hatası diğerlerini etkilemesin
                sp.rollback()
                from .schemas import PushResult
                r = PushResult(collection=ch.collection, id=ch.id, status="rejected", error=str(e)[:200])
            results.append(r)
        session.commit()
        from .sync import current_cursor
        return PushOut(results=results, cursor=current_cursor(session))

    @app.get("/api/sync/pull", response_model=PullOut)
    def pull(since: int = 0, limit: int = 500, user: User = Depends(current_user), session: Session = Depends(get_db)):
        changes, cursor, more = pull_changes(session, user.id, since, max(1, min(limit, 1000)))
        return PullOut(changes=changes, cursor=cursor, has_more=more)

    @app.get("/api/records/{collection}/{record_id}/revisions")
    def revisions(collection: str, record_id: str, user: User = Depends(current_user), session: Session = Depends(get_db)):
        rec = session.scalar(select(Record).where(Record.user_id == user.id, Record.collection == collection, Record.record_id == record_id))
        if not rec:
            raise HTTPException(404, "Kayıt bulunamadı")
        revs = session.scalars(select(RecordRevision).where(RecordRevision.record_pk == rec.id).order_by(RecordRevision.version.desc()).limit(100)).all()
        return [{"version": r.version, "deleted": r.deleted, "device_id": r.device_id, "created_at": _aware(r.created_at).isoformat(),
                 "data": json.loads(r.data)} for r in revs]

    # ---- dışa / içe aktarma -----------------------------------------------------------------
    @app.get("/api/export")
    def export(user: User = Depends(current_user), session: Session = Depends(get_db)):
        rows = session.scalars(select(Record).where(Record.user_id == user.id).order_by(Record.collection, Record.record_id)).all()
        audit(session, "export", user.id, count=len(rows))
        session.commit()
        return {"format": "academy-export", "schema_version": 1, "exported_at": datetime.now(timezone.utc).isoformat(),
                "username": user.username, "records": [record_out(r).model_dump() for r in rows]}

    @app.post("/api/import")
    def import_(body: ImportIn, user: User = Depends(current_user), session: Session = Depends(get_db)):
        """İçe aktarma birleştirir: yalnızca sunucuda olmayan veya daha eski olan kayıtları yazar,
        çakışanları atlar ve sayısını bildirir. Var olan veriyi asla sessizce ezmez."""
        stats = {"created": 0, "updated": 0, "skipped": 0, "rejected": 0}
        for raw in body.records:
            try:
                col, rid = raw["collection"], raw["id"]
                existing = session.scalar(select(Record).where(Record.user_id == user.id, Record.collection == col, Record.record_id == rid))
                incoming_updated = str(raw.get("updated_at") or "")
                if existing and _aware(existing.updated_at).isoformat() >= incoming_updated:
                    stats["skipped"] += 1
                    continue
                ch = Change(collection=col, id=rid, base_version=existing.version if existing else 0,
                            deleted=bool(raw.get("deleted")), data=raw.get("data") or {})
                r = apply_change(session, user.id, ch, "import")
                stats["created" if not existing and r.status == "ok" else "updated" if r.status == "ok" else "rejected"] += 1
            except (KeyError, ValueError):
                stats["rejected"] += 1
        audit(session, "import", user.id, **stats)
        session.commit()
        return stats

    # ---- yedekler -----------------------------------------------------------------
    def _log_out(l: BackupLog) -> dict:
        return {"id": l.id, "created_at": _aware(l.created_at).isoformat(), "status": l.status, "verified": l.verified,
                "size_bytes": l.size_bytes, "file": l.path.rsplit("/", 1)[-1], "detail": l.error}

    @app.get("/api/backups/status")
    def backup_status(user: User = Depends(current_user), session: Session = Depends(get_db)):
        last_ok = session.scalar(select(BackupLog).where(BackupLog.status == "ok").order_by(BackupLog.id.desc()))
        last = session.scalar(select(BackupLog).order_by(BackupLog.id.desc()))
        return {"interval_hours": s.backup_interval_hours, "last_ok": _log_out(last_ok) if last_ok else None,
                "last_attempt": _log_out(last) if last else None}

    @app.post("/api/admin/backup", dependencies=[Depends(require_admin)])
    def admin_backup():
        return _log_out(create_backup(app.state.db, s.backup_dir, s.backup_keep))

    @app.get("/api/admin/backups", dependencies=[Depends(require_admin)])
    def admin_backups(session: Session = Depends(get_db)):
        return [_log_out(l) for l in session.scalars(select(BackupLog).order_by(BackupLog.id.desc()).limit(50))]

    # ---- web uygulaması ------------------------------------------------------------
    dist = s.web_dist
    if dist.is_dir() and (dist / "index.html").exists():
        app.mount("/assets", StaticFiles(directory=dist / "assets"), name="assets")

        @app.get("/{path:path}", include_in_schema=False)
        def spa(path: str):
            if path.startswith("api/"):
                raise HTTPException(404)
            f = (dist / path).resolve()
            if path and f.is_file() and dist.resolve() in f.parents:
                headers = {"Cache-Control": "no-cache"} if f.name in ("sw.js", "index.json", "index.html") else None
                return FileResponse(f, headers=headers)
            return FileResponse(dist / "index.html", headers={"Cache-Control": "no-cache"})

    return app


app = create_app()
