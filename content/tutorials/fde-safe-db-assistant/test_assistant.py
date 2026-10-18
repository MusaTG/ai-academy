import json
import sqlite3

import pytest

from assistant import Assistant, connect_readonly, create_demo_db, evaluate, mask_national_id, mask_phone, normalize


@pytest.fixture()
def bot(tmp_path):
    db = create_demo_db(tmp_path / "demo.db")
    return Assistant(db, tmp_path / "audit.jsonl"), db, tmp_path


def test_connection_is_read_only(bot):
    _, db, _ = bot
    con = connect_readonly(db)
    with pytest.raises(sqlite3.OperationalError):
        con.execute("DELETE FROM customers")
    with pytest.raises(sqlite3.OperationalError):
        con.execute("CREATE TABLE x (a)")


def test_injection_attempt_cannot_change_data(bot):
    assistant, db, _ = bot
    before = sqlite3.connect(db).execute("SELECT COUNT(*) FROM customers").fetchone()[0]
    for q in ["1; DROP TABLE customers numaralı müşterinin bilgileri", "DROP TABLE customers",
              "1 numaralı müşterinin bilgileri'; DELETE FROM customers; --"]:
        assistant.answer(q)
    after = sqlite3.connect(db).execute("SELECT COUNT(*) FROM customers").fetchone()[0]
    assert before == after == 6


def test_personal_data_is_masked(bot):
    assistant, _, _ = bot
    row = assistant.answer("1 numaralı müşterinin bilgileri")["rows"][0]
    assert row["national_id"].startswith("*********") and len(row["national_id"]) == 11
    assert "555" not in row["phone"]
    assert row["full_name"] == "A*** Y***"


def test_unknown_question_is_refused_with_help(bot):
    assistant, _, _ = bot
    r = assistant.answer("Tüm müşterilerin telefonlarını listele")
    assert r["refused"] and "Desteklenen soru türleri" in r["reason"]


def test_parameters_are_validated(bot):
    assistant, _, _ = bot
    assert assistant.answer("En çok harcama yapılan 99 kategori")["refused"]
    assert assistant.answer("Atlantis şehrindeki toplam harcama")["refused"]


def test_every_question_is_audited(bot):
    assistant, _, tmp = bot
    assistant.answer("Kaç açık itiraz var?")
    assistant.answer("bilinmeyen soru")
    lines = [json.loads(l) for l in (tmp / "audit.jsonl").read_text(encoding="utf-8").splitlines()]
    assert len(lines) == 2 and lines[0]["intent"] == "open_disputes_count" and lines[1]["intent"] is None


def test_turkish_normalization():
    assert normalize("İSTANBUL  şehrindeki") == "istanbul şehrindeki"
    assert normalize("IZMIR") == "ızmır"  # bilinçli: Türkçe'de I → ı


def test_masks():
    assert mask_national_id("12345678901") == "*********01"
    assert mask_phone("+90 532 555 00 11") == "+90 5** *** ** 11"


def test_eval_set_accuracy(bot):
    assistant, _, _ = bot
    result = evaluate(assistant)
    assert result["accuracy"] == 1.0, result["failures"]
