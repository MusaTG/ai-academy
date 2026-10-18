"""Şema göçleri (Alembic). Uygulama açılışında otomatik olarak `upgrade head` çalışır.

Yeni bir şema değişikliği için:
  cd apps/api && alembic revision --autogenerate -m "açıklama" && alembic upgrade head
"""
from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config

from .db import Database

API_DIR = Path(__file__).resolve().parent.parent


def alembic_config(url: str) -> Config:
    cfg = Config(str(API_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(API_DIR / "migrations"))
    cfg.set_main_option("sqlalchemy.url", url.replace("%", "%%"))
    return cfg


def upgrade(db: Database) -> None:
    if db.url in ("sqlite://", "sqlite:///:memory:"):
        from .db import Base
        from . import models  # noqa: F401
        Base.metadata.create_all(db.engine)
        return
    with db.engine.begin() as conn:
        cfg = alembic_config(db.url)
        cfg.attributes["connection"] = conn
        command.upgrade(cfg, "head")
