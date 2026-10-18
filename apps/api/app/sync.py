"""Senkronizasyon çekirdeği: iyimser kilitleme, tombstone ve artan imleç (seq).

Kurallar
- İstemci her değişikliği, bildiği son sunucu sürümüyle (base_version) gönderir.
- base_version sunucudaki sürümle aynıysa yazma kabul edilir, sürüm +1 olur.
- Farklıysa yazma REDDEDİLMEZ ama uygulanmaz da: "conflict" döner ve sunucudaki güncel
  kayıt istemciye gönderilir. İstemci iki sürümü kullanıcıya gösterir; kullanıcı seçtikten
  sonra yeni base_version ile tekrar gönderir. Böylece hiçbir veri sessizce kaybolmaz.
- Silme bir tombstone'dur (deleted=True); kayıt satırı ve sürüm geçmişi korunur.
- Her kabul edilen yazma record_revisions tablosuna kopyalanır (not sürüm geçmişi).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import SYNC_COLLECTIONS, settings
from .models import Counter, Record, RecordRevision
from .schemas import Change, PushResult, RecordOut


def _iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def record_out(r: Record) -> RecordOut:
    return RecordOut(collection=r.collection, id=r.record_id, version=r.version, deleted=r.deleted,
                     seq=r.seq, data=json.loads(r.data or "{}"), updated_at=_iso(r.updated_at), device_id=r.device_id)


def next_seq(session: Session) -> int:
    c = session.execute(select(Counter).where(Counter.name == "seq").with_for_update()).scalar_one_or_none()
    if c is None:
        c = Counter(name="seq", value=0)
        session.add(c)
    c.value += 1
    session.flush()
    return c.value


def current_cursor(session: Session) -> int:
    c = session.get(Counter, "seq")
    return c.value if c else 0


def apply_change(session: Session, user_id: int, ch: Change, device_id: str) -> PushResult:
    if ch.collection not in SYNC_COLLECTIONS:
        return PushResult(collection=ch.collection, id=ch.id, status="rejected", error="bilinmeyen koleksiyon")
    payload = json.dumps(ch.data, ensure_ascii=False)
    if len(payload.encode()) > settings.max_record_bytes:
        return PushResult(collection=ch.collection, id=ch.id, status="rejected", error="kayıt çok büyük")
    rec = session.scalar(select(Record).where(Record.user_id == user_id, Record.collection == ch.collection,
                                              Record.record_id == ch.id).with_for_update())
    now = datetime.now(timezone.utc)
    if rec is None:
        if ch.base_version != 0:
            # İstemci bu kaydı sunucuda var sanıyor ama yok (ör. veritabanı geri yüklendi):
            # yine de kaydı oluştur; veri kaybetmektense yeniden yaratmak güvenlidir.
            pass
        rec = Record(user_id=user_id, collection=ch.collection, record_id=ch.id, data=payload, version=1,
                     deleted=ch.deleted, seq=next_seq(session), device_id=device_id, updated_at=now)
        session.add(rec)
        session.flush()
    elif rec.version != ch.base_version:
        return PushResult(collection=ch.collection, id=ch.id, status="conflict", server=record_out(rec))
    else:
        if not ch.deleted:  # silmede son içerik korunur (kurtarma için); yalnızca bayrak değişir
            rec.data = payload
        rec.deleted = ch.deleted
        rec.version += 1
        rec.seq = next_seq(session)
        rec.device_id = device_id
        rec.updated_at = now
        session.flush()
    session.add(RecordRevision(record_pk=rec.id, version=rec.version, data=rec.data, deleted=rec.deleted, device_id=device_id))
    return PushResult(collection=ch.collection, id=ch.id, status="ok", version=rec.version, seq=rec.seq)


def pull(session: Session, user_id: int, since: int, limit: int) -> tuple[list[RecordOut], int, bool]:
    rows = session.scalars(select(Record).where(Record.user_id == user_id, Record.seq > since)
                           .order_by(Record.seq).limit(limit + 1)).all()
    has_more = len(rows) > limit
    rows = rows[:limit]
    cursor = rows[-1].seq if rows else max(since, 0)
    return [record_out(r) for r in rows], cursor, has_more
