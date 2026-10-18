import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture()
def settings(tmp_path):
    return Settings(database_url=f"sqlite:///{tmp_path/'t.db'}", backup_dir=tmp_path / "bk", backup_interval_hours=0,
                    admin_token="admin-secret", web_dist=tmp_path / "nodist")


@pytest.fixture()
def client(settings):
    with TestClient(create_app(settings)) as c:
        yield c


def auth(client, username="ayse", password="parola123", device="laptop"):
    r = client.post("/api/auth/register", json={"username": username, "password": password, "device_name": device})
    if r.status_code == 409:
        r = client.post("/api/auth/login", json={"username": username, "password": password, "device_name": device})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}
