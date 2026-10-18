"""Senaryo 6 (senkronizasyon) ve Senaryo 8 (kalıcı veri, yedek/geri yükleme) için API testleri."""
from pathlib import Path

from fastapi.testclient import TestClient

from app.backup import create_backup, load_file, restore_into, verify_file
from app.db import Database
from app.main import create_app

from .conftest import auth


def push(client, h, changes, device="d1"):
    r = client.post("/api/sync/push", json={"device_id": device, "changes": changes}, headers=h)
    assert r.status_code == 200, r.text
    return r.json()


def note(id_, body, base=0, deleted=False):
    return {"collection": "notes", "id": id_, "base_version": base, "deleted": deleted, "data": {"title": id_, "body": body}}


def test_health_and_auth(client):
    assert client.get("/api/health").json()["ok"]
    h = auth(client)
    assert client.get("/api/auth/me", headers=h).json()["username"] == "ayse"
    assert client.get("/api/auth/me").status_code == 401
    assert client.post("/api/auth/login", json={"username": "ayse", "password": "yanlisparola"}).status_code == 401
    assert client.post("/api/auth/register", json={"username": "ayse", "password": "parola123"}).status_code == 409


def test_push_pull_roundtrip_between_devices(client):
    h1 = auth(client, device="laptop")
    h2 = auth(client, device="telefon")
    res = push(client, h1, [note("n1", "offline yazıldı")])["results"][0]
    assert res["status"] == "ok" and res["version"] == 1
    pulled = client.get("/api/sync/pull?since=0", headers=h2).json()
    assert [c["id"] for c in pulled["changes"]] == ["n1"]
    assert pulled["changes"][0]["data"]["body"] == "offline yazıldı"
    again = client.get(f"/api/sync/pull?since={pulled['cursor']}", headers=h2).json()
    assert again["changes"] == []


def test_concurrent_edit_is_conflict_not_silent_overwrite(client):
    h = auth(client)
    push(client, h, [note("n1", "v1")])
    # İki cihaz da sürüm 1'i biliyor. A önce yazar:
    a = push(client, h, [note("n1", "A cihazı", base=1)], device="A")["results"][0]
    assert a["status"] == "ok" and a["version"] == 2
    # B eski sürüme göre yazar -> çakışma; sunucu verisi korunur ve B'ye gönderilir
    b = push(client, h, [note("n1", "B cihazı", base=1)], device="B")["results"][0]
    assert b["status"] == "conflict"
    assert b["server"]["data"]["body"] == "A cihazı" and b["server"]["version"] == 2
    # Kullanıcı seçim yaptıktan sonra B doğru base ile tekrar gönderir
    c = push(client, h, [note("n1", "birleştirilmiş", base=2)], device="B")["results"][0]
    assert c["status"] == "ok" and c["version"] == 3
    revs = client.get("/api/records/notes/n1/revisions", headers=h).json()
    assert [r["data"]["body"] for r in revs] == ["birleştirilmiş", "A cihazı", "v1"]


def test_delete_is_tombstone_and_propagates(client):
    h = auth(client)
    push(client, h, [note("n1", "silinecek")])
    r = push(client, h, [note("n1", "", base=1, deleted=True)])["results"][0]
    assert r["status"] == "ok"
    pulled = client.get("/api/sync/pull?since=0", headers=h).json()["changes"]
    assert pulled[0]["deleted"] is True
    assert pulled[0]["data"]["body"] == "silinecek"  # içerik kurtarılabilir kalır


def test_users_are_isolated(client):
    h1 = auth(client, "ayse")
    h2 = auth(client, "mehmet")
    push(client, h1, [note("gizli", "ayşe'nin notu")])
    assert client.get("/api/sync/pull?since=0", headers=h2).json()["changes"] == []
    assert client.get("/api/records/notes/gizli/revisions", headers=h2).status_code == 404


def test_unknown_collection_rejected_without_breaking_batch(client):
    h = auth(client)
    out = push(client, h, [{"collection": "hack", "id": "x", "base_version": 0, "data": {}}, note("ok", "x")])
    assert [r["status"] for r in out["results"]] == ["rejected", "ok"]


def test_export_import_merges_without_overwriting_newer(client):
    h = auth(client)
    push(client, h, [note("n1", "v1"), {"collection": "progress", "id": "banking", "base_version": 0, "data": {"done": True}}])
    exp = client.get("/api/export", headers=h).json()
    assert exp["format"] == "academy-export" and len(exp["records"]) == 2
    h2 = auth(client, "yeni")
    stats = client.post("/api/import", json={"format": "academy-export", "records": exp["records"]}, headers=h2).json()
    assert stats["created"] == 2
    again = client.post("/api/import", json={"format": "academy-export", "records": exp["records"]}, headers=h2).json()
    assert again["skipped"] == 2 and again["created"] == 0


def test_data_survives_restart(settings):
    with TestClient(create_app(settings)) as c:
        h = auth(c)
        push(c, h, [note("kalici", "kapatıp açınca da burada")])
    with TestClient(create_app(settings)) as c:  # yeni süreç, aynı veritabanı
        h = auth(c)
        changes = c.get("/api/sync/pull?since=0", headers=h).json()["changes"]
        assert changes[0]["data"]["body"] == "kapatıp açınca da burada"


def test_backup_is_verified_and_restorable(client, settings, tmp_path):
    h = auth(client)
    push(client, h, [note(f"n{i}", f"not {i}") for i in range(5)])
    r = client.post("/api/admin/backup", headers={"X-Admin-Token": "admin-secret"}).json()
    assert r["status"] == "ok" and r["verified"] is True
    assert client.post("/api/admin/backup", headers={"X-Admin-Token": "yanlis"}).status_code == 403
    status = client.get("/api/backups/status", headers=h).json()
    assert status["last_ok"]["verified"] is True
    path = next(Path(settings.backup_dir).glob("*.json.gz"))
    assert verify_file(path)["records"] == 5
    # Boş yeni bir veritabanına geri yükle ve uygulamayla oku
    target = Database(f"sqlite:///{tmp_path/'restored.db'}")
    counts = restore_into(target, load_file(path))
    assert counts["records"] == 5 and counts["users"] == 1


def test_restore_refuses_to_overwrite_without_force(client, settings, tmp_path):
    h = auth(client)
    push(client, h, [note("n1", "x")])
    db = client.app.state.db
    log = create_backup(db, settings.backup_dir)
    try:
        restore_into(db, load_file(Path(log.path)))
        raise AssertionError("üzerine yazmamalıydı")
    except RuntimeError:
        pass
    assert restore_into(db, load_file(Path(log.path)), force=True)["records"] == 1


def test_corrupt_backup_fails_verification(tmp_path):
    import gzip, json
    p = tmp_path / "bad.json.gz"
    with gzip.open(p, "wt") as f:
        json.dump({"format": "academy-db-backup", "tables": {"records": [{"id": 1, "user_id": 99}]}}, f)
    try:
        verify_file(p)
        raise AssertionError("bozuk yedek doğrulanmamalı")
    except Exception as e:  # yabancı anahtar ihlali veya eksik alan
        assert "doğrulanmamalı" not in str(e)
