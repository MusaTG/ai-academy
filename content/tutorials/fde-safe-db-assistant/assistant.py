"""Müşteri veritabanına GÜVENLİ bağlanan soru-cevap prototipi (FDE vakası).

Tasarım kararları (vaka çalışmasındaki güvenlik ilkelerinin kod karşılığı):
1. Veritabanına okuma-yalnız bağlanılır (SQLite URI mode=ro + PRAGMA query_only).
2. Serbest SQL üretilmez/çalıştırılmaz. Soru bir "niyet"e (intent) eşlenir; her niyetin
   önceden yazılmış, parametreli bir sorgusu vardır (izin listesi).
3. Parametreler tip ve izin listesiyle doğrulanır.
4. Kişisel veriler (kimlik no, telefon, ad soyad) sonuçlarda maskelenir.
5. Her soru denetim kaydına (audit log) yazılır.
6. Eşleşmeyen sorular reddedilir ve desteklenen soru türleri listelenir.

Üretimde niyet sınıflandırması bir LLM'e bırakılabilir; ancak LLM yalnızca niyet adını
ve parametreleri SEÇER, SQL yazmaz. Bu dosya ücretli bir API gerektirmemesi için kural tabanlıdır.

Çalıştırma:  python assistant.py
"""
from __future__ import annotations

import json
import re
import sqlite3
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

HERE = Path(__file__).resolve().parent

# region: demo_db
def create_demo_db(path: Path) -> Path:
    """Deterministik, tamamen uydurma demo verisi. Gerçek kişi veya kurum verisi içermez."""
    path = Path(path)
    if path.exists():
        path.unlink()
    con = sqlite3.connect(path)
    con.executescript(
        """
        CREATE TABLE customers (id INTEGER PRIMARY KEY, full_name TEXT, national_id TEXT, phone TEXT, city TEXT, segment TEXT);
        CREATE TABLE transactions (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), amount REAL,
                                   merchant_category TEXT, created_at TEXT, status TEXT);
        CREATE TABLE disputes (id INTEGER PRIMARY KEY, transaction_id INTEGER REFERENCES transactions(id), reason TEXT,
                               status TEXT, opened_at TEXT);
        """
    )
    names = ["Ayşe Yılmaz", "Mehmet Demir", "Zeynep Kaya", "Ali Çelik", "Elif Şahin", "Can Aydın"]
    cities = ["Ankara", "İstanbul", "İzmir", "Ankara", "Bursa", "İstanbul"]
    for i, (name, city) in enumerate(zip(names, cities), start=1):
        con.execute("INSERT INTO customers VALUES (?,?,?,?,?,?)",
                    (i, name, f"{10000000000 + i * 1234567:011d}", f"+90 5{30 + i} 555 00 {10 + i}", city,
                     "bireysel" if i % 2 else "ticari"))
    cats = ["market", "akaryakıt", "elektronik", "seyahat", "restoran"]
    tid = 0
    for cid in range(1, 7):
        for k in range(5):
            tid += 1
            con.execute("INSERT INTO transactions VALUES (?,?,?,?,?,?)",
                        (tid, cid, round(50 + (cid * 37 + k * 91) % 900, 2), cats[(cid + k) % 5],
                         f"2026-09-{1 + (tid % 28):02d}", "onaylandı"))
    disputes = [(1, 3, "tanımadığım işlem", "open"), (2, 7, "ürün teslim edilmedi", "open"),
                (3, 12, "çift çekim", "closed"), (4, 18, "tanımadığım işlem", "open"), (5, 22, "iade yapılmadı", "closed")]
    for did, t, reason, status in disputes:
        con.execute("INSERT INTO disputes VALUES (?,?,?,?,?)", (did, t, reason, status, "2026-10-01"))
    con.commit()
    con.close()
    return path
# endregion

# region: readonly
def connect_readonly(path: Path) -> sqlite3.Connection:
    """İki katmanlı okuma-yalnız bağlantı: dosya kipi (mode=ro) + PRAGMA query_only."""
    con = sqlite3.connect(f"file:{Path(path).as_posix()}?mode=ro", uri=True)
    con.execute("PRAGMA query_only = ON")
    return con
# endregion

# region: masking
def mask_national_id(v: str) -> str:
    return "*" * (len(v) - 2) + v[-2:]


def mask_phone(v: str) -> str:
    digits = re.sub(r"\D", "", v)
    return f"+{digits[:2]} {digits[2]}** *** ** {digits[-2:]}"


def mask_name(v: str) -> str:
    return " ".join(p[0] + "***" for p in v.split())


MASKERS: dict[str, Callable[[str], str]] = {"national_id": mask_national_id, "phone": mask_phone, "full_name": mask_name}
# endregion

# region: intents
def normalize(text: str) -> str:
    """Türkçe'ye uygun küçük harfe çevirme (İ→i, I→ı) ve boşluk sadeleştirme."""
    text = text.replace("İ", "i").replace("I", "ı").lower()
    return re.sub(r"\s+", " ", text).strip()


@dataclass(frozen=True)
class Intent:
    name: str
    description: str
    pattern: re.Pattern
    sql: str
    params: Callable[[re.Match, sqlite3.Connection], tuple] = lambda m, con: ()


def _customer_id(m: re.Match, con: sqlite3.Connection) -> tuple:
    return (int(m.group("cid")),)


def _top_n(m: re.Match, con: sqlite3.Connection) -> tuple:
    n = int(m.group("n") or 3)
    if not 1 <= n <= 20:
        raise ValueError("n 1 ile 20 arasında olmalı")
    return (n,)


def _city(m: re.Match, con: sqlite3.Connection) -> tuple:
    allowed = {normalize(r[0]): r[0] for r in con.execute("SELECT DISTINCT city FROM customers")}
    city = normalize(m.group("city"))
    if city not in allowed:
        raise ValueError(f"bilinmeyen şehir: {m.group('city')}")
    return (allowed[city],)


INTENTS = [
    Intent("open_disputes_count", "Açık itiraz sayısı",
           re.compile(r"kaç (tane )?açık itiraz"),
           "SELECT COUNT(*) AS acik_itiraz FROM disputes WHERE status = 'open'"),
    Intent("customer_disputes", "Bir müşterinin itirazları",
           re.compile(r"^(?P<cid>\d{1,6}) numaralı müşterinin itirazları"),
           "SELECT d.id, d.reason, d.status, t.amount FROM disputes d JOIN transactions t ON t.id = d.transaction_id "
           "WHERE t.customer_id = ? ORDER BY d.id", _customer_id),
    Intent("customer_profile", "Müşteri bilgileri (maskeli)",
           re.compile(r"^(?P<cid>\d{1,6}) numaralı müşterinin bilgileri"),
           "SELECT id, full_name, national_id, phone, city, segment FROM customers WHERE id = ?", _customer_id),
    Intent("top_categories", "En çok harcama yapılan kategoriler",
           re.compile(r"en çok harcama yapılan (?P<n>\d{1,2} )?kategori"),
           "SELECT merchant_category, ROUND(SUM(amount), 2) AS toplam FROM transactions "
           "GROUP BY merchant_category ORDER BY toplam DESC LIMIT ?", _top_n),
    Intent("city_total", "Bir şehirdeki toplam harcama",
           re.compile(r"^(?P<city>[a-zçğıöşü]+) şehrindeki toplam harcama"),
           "SELECT c.city, ROUND(SUM(t.amount), 2) AS toplam FROM transactions t JOIN customers c ON c.id = t.customer_id "
           "WHERE c.city = ? GROUP BY c.city", _city),
]
# endregion

# region: answer
class Assistant:
    def __init__(self, db_path: Path, audit_path: Path):
        self.con = connect_readonly(db_path)
        self.audit_path = Path(audit_path)

    def _audit(self, record: dict) -> None:
        record["ts"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        with self.audit_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    def answer(self, question: str) -> dict:
        q = normalize(question)
        for intent in INTENTS:
            m = intent.pattern.search(q)
            if not m:
                continue
            try:
                params = intent.params(m, self.con)
            except ValueError as e:
                result = {"intent": intent.name, "refused": True, "reason": str(e)}
                self._audit({"question": question, **result})
                return result
            cur = self.con.execute(intent.sql, params)
            cols = [d[0] for d in cur.description]
            rows = [{c: (MASKERS[c](v) if c in MASKERS and isinstance(v, str) else v) for c, v in zip(cols, r)}
                    for r in cur.fetchall()]
            result = {"intent": intent.name, "sql": intent.sql, "params": list(params), "rows": rows, "refused": False}
            self._audit({"question": question, "intent": intent.name, "params": list(params), "row_count": len(rows)})
            return result
        supported = [i.description for i in INTENTS]
        result = {"intent": None, "refused": True,
                  "reason": "Bu soruyu güvenle yanıtlayamıyorum. Desteklenen soru türleri: " + "; ".join(supported)}
        self._audit({"question": question, "intent": None, "refused": True})
        return result
# endregion

# region: evaluate
def evaluate(assistant: Assistant, eval_path: Path = HERE / "eval_set.json") -> dict:
    """Niyet doğruluğu: değerlendirme setindeki her soru beklenen niyete eşleniyor mu?"""
    cases = json.loads(Path(eval_path).read_text(encoding="utf-8"))
    correct = 0
    failures = []
    for case in cases:
        got = assistant.answer(case["question"])
        ok = got["intent"] == case["expected_intent"] and got["refused"] == case.get("expected_refused", False)
        correct += ok
        if not ok:
            failures.append({"question": case["question"], "expected": case["expected_intent"], "got": got["intent"]})
    return {"accuracy": correct / len(cases), "n": len(cases), "failures": failures}
# endregion


if __name__ == "__main__":
    import tempfile

    tmp = Path(tempfile.mkdtemp())
    db = create_demo_db(tmp / "demo.db")
    bot = Assistant(db, tmp / "audit.jsonl")
    for question in ["Kaç açık itiraz var?", "1 numaralı müşterinin bilgileri", "En çok harcama yapılan 3 kategori",
                     "Ankara şehrindeki toplam harcama", "Tüm müşterilerin telefonlarını listele"]:
        print(f"\n? {question}\n→ {json.dumps(bot.answer(question), ensure_ascii=False)}")
    print("\nDeğerlendirme:", evaluate(bot))
