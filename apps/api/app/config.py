"""Ortam değişkenlerinden okunan ayarlar. Gizli bilgiler koda yazılmaz."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

API_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = API_DIR.parent.parent


def _bool(name: str, default: bool) -> bool:
    v = os.environ.get(name)
    return default if v is None else v.strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class Settings:
    database_url: str = field(default_factory=lambda: os.environ.get("DATABASE_URL", f"sqlite:///{API_DIR / 'data' / 'academy.db'}"))
    backup_dir: Path = field(default_factory=lambda: Path(os.environ.get("BACKUP_DIR", str(API_DIR / "data" / "backups"))))
    backup_interval_hours: float = field(default_factory=lambda: float(os.environ.get("BACKUP_INTERVAL_HOURS", "24")))
    backup_keep: int = field(default_factory=lambda: int(os.environ.get("BACKUP_KEEP", "14")))
    allow_registration: bool = field(default_factory=lambda: _bool("ALLOW_REGISTRATION", True))
    token_ttl_days: int = field(default_factory=lambda: int(os.environ.get("TOKEN_TTL_DAYS", "90")))
    admin_token: str | None = field(default_factory=lambda: os.environ.get("ADMIN_TOKEN") or None)
    cors_origins: list[str] = field(default_factory=lambda: [o.strip() for o in os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173").split(",") if o.strip()])
    web_dist: Path = field(default_factory=lambda: Path(os.environ.get("WEB_DIST", str(REPO_DIR / "apps" / "web" / "dist"))))
    max_record_bytes: int = field(default_factory=lambda: int(os.environ.get("MAX_RECORD_BYTES", str(3 * 1024 * 1024))))


settings = Settings()

# Senkronize edilebilen koleksiyonlar. Yeni bir kişisel veri türü eklemek için buraya bir satır yeterlidir.
SYNC_COLLECTIONS = {"notes", "progress", "bookmarks", "settings", "attachments", "graph_feedback", "search_history"}
