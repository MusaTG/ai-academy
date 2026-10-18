"""Veritabanı yedekleme, doğrulama ve geri yükleme.

Yedek biçimi veritabanından bağımsızdır (gzip'li JSON, tablo tablo satırlar). Böylece
SQLite'tan alınan yedek PostgreSQL'e, PostgreSQL'den alınan yedek SQLite'a geri yüklenebilir.

Her yedek alındıktan hemen sonra DOĞRULANIR: dosya geçici bir bellek-içi SQLite
veritabanına gerçekten geri yüklenir ve tablo satır sayıları kaynağınkiyle karşılaştırılır.
Yalnızca yedek dosyası oluşturmak yetmez; geri dönülebildiği de kanıtlanır.

Komut satırı:
  python -m app.backup create                 # yedek al + doğrula
  python -m app.backup verify  <dosya>        # var olan yedeği doğrula
  python -m app.backup restore <dosya> [--force]   # DATABASE_URL'e geri yükle
  python -m app.backup list
"""
from __future__ import annotations

import gzip
import hashlib
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

from sqlalchemy import delete, func, insert, select
from sqlalchemy.orm import Session

from .db import Base, Database
from .models import BackupLog

FORMAT = "academy-db-backup"
# Geri yükleme sırası yabancı anahtarlara uygun olmalı (önce ebeveyn tablolar).
TABLE_ORDER = ["users", "auth_tokens", "counters", "records", "record_revisions", "audit_log"]


def _ser(v):
    if isinstance(v, (datetime, date)):
        return {"__dt__": v.isoformat()}
    return v


def _de(v):
    if isinstance(v, dict) and "__dt__" in v:
        dt = datetime.fromisoformat(v["__dt__"])
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    return v


def dump(db: Database) -> dict:
    tables = {}
    with db.engine.connect() as conn:
        for name in TABLE_ORDER:
            t = Base.metadata.tables[name]
            rows = conn.execute(select(t).order_by(*t.primary_key.columns)).mappings().all()
            tables[name] = [{k: _ser(v) for k, v in r.items()} for r in rows]
    return {"format": FORMAT, "schema_version": 1, "created_at": datetime.now(timezone.utc).isoformat(), "tables": tables}


def counts(db: Database) -> dict[str, int]:
    with db.engine.connect() as conn:
        return {n: conn.execute(select(func.count()).select_from(Base.metadata.tables[n])).scalar_one() for n in TABLE_ORDER}


def load_file(path: Path) -> dict:
    with gzip.open(path, "rt", encoding="utf-8") as f:
        data = json.load(f)
    if data.get("format") != FORMAT:
        raise ValueError("Bu dosya bir Academy veritabanı yedeği değil")
    return data


def restore_into(db: Database, data: dict, force: bool = False) -> dict[str, int]:
    Base.metadata.create_all(db.engine)
    existing = counts(db)
    if any(existing[n] for n in ("users", "records")) and not force:
        raise RuntimeError("Hedef veritabanı boş değil. Üzerine yazmak için --force kullanın (önce yedek alın!).")
    with db.engine.begin() as conn:
        for name in reversed(TABLE_ORDER):
            conn.execute(delete(Base.metadata.tables[name]))
        for name in TABLE_ORDER:
            rows = [{k: _de(v) for k, v in r.items()} for r in data["tables"].get(name, [])]
            if rows:
                conn.execute(insert(Base.metadata.tables[name]), rows)
        if db.engine.dialect.name == "postgresql":
            from sqlalchemy import text
            for name in TABLE_ORDER:
                if "id" in Base.metadata.tables[name].c:
                    conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{name}','id'), COALESCE((SELECT MAX(id) FROM {name}), 1))"))
    return counts(db)


def verify_file(path: Path, expected: dict[str, int] | None = None) -> dict[str, int]:
    data = load_file(path)
    tmp = Database("sqlite://")
    got = restore_into(tmp, data)
    want = expected or {n: len(data["tables"].get(n, [])) for n in TABLE_ORDER}
    if got != want:
        raise RuntimeError(f"Doğrulama başarısız: beklenen {want}, geri yüklenen {got}")
    return got


def create_backup(db: Database, backup_dir: Path, keep: int = 14) -> BackupLog:
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = backup_dir / f"academy-{stamp}.json.gz"
    log = BackupLog(path=str(path), status="failed", verified=False)
    try:
        data = dump(db)
        expected = {n: len(data["tables"][n]) for n in TABLE_ORDER}
        raw = json.dumps(data, ensure_ascii=False).encode()
        with gzip.open(path, "wb") as f:
            f.write(raw)
        verify_file(path, expected)
        log.size_bytes = path.stat().st_size
        log.status = "ok"
        log.verified = True
        log.error = json.dumps({"sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "counts": expected})
        # Eski yedekleri döndür (yalnızca doğrulanmış yeni yedek varken)
        old = sorted(backup_dir.glob("academy-*.json.gz"))[:-keep] if keep > 0 else []
        for p in old:
            p.unlink(missing_ok=True)
    except Exception as e:  # noqa: BLE001 — hata kaydedilir ve arayüzde gösterilir
        log.error = f"{type(e).__name__}: {e}"
    with Session(db.engine) as s:
        s.add(log)
        s.commit()
        s.refresh(log)
    return log


def _main(argv: list[str]) -> int:
    from .config import settings
    db = Database(settings.database_url)
    cmd = argv[0] if argv else "help"
    if cmd == "create":
        Base.metadata.create_all(db.engine)
        log = create_backup(db, settings.backup_dir, settings.backup_keep)
        print(("✓ " if log.status == "ok" else "✗ ") + f"{log.path} {log.status} {log.error}")
        return 0 if log.status == "ok" else 1
    if cmd == "verify" and len(argv) > 1:
        print("✓ doğrulandı:", verify_file(Path(argv[1])))
        return 0
    if cmd == "restore" and len(argv) > 1:
        got = restore_into(db, load_file(Path(argv[1])), force="--force" in argv)
        print("✓ geri yüklendi:", got)
        return 0
    if cmd == "list":
        for p in sorted(settings.backup_dir.glob("academy-*.json.gz")):
            print(p, p.stat().st_size, "bayt")
        return 0
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(_main(sys.argv[1:]))
