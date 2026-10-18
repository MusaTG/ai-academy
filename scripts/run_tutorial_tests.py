#!/usr/bin/env python3
"""Tutorial scriptlerini küçük verilerle CPU üzerinde test eder ve rapor üretir.

Her tutorial klasöründeki test_*.py dosyaları ayrı bir pytest sürecinde çalıştırılır.
Frontmatter'da `requires_gpu: true` olan tutorial'lar çalıştırılmaz, rapora
"gpu-skipped" olarak yazılır. Rapor content/_generated/script-report.json dosyasına
yazılır ve içerik derlemesine (arayüzdeki "Test sonucu" rozetine) eklenir.

Kullanım: python3 scripts/run_tutorial_tests.py [--fail]
"""
from __future__ import annotations

import json
import platform
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TUTORIALS = ROOT / "content" / "tutorials"
OUT = ROOT / "content" / "_generated" / "script-report.json"


def frontmatter_value(text: str, key: str) -> str | None:
    m = re.search(r"^---\n(.*?)\n---", text, re.S)
    if not m:
        return None
    km = re.search(rf"^{key}:\s*(.+)$", m.group(1), re.M)
    return km.group(1).strip().strip('"\'') if km else None


def run(dir_: Path) -> dict:
    index = dir_ / "index.md"
    text = index.read_text(encoding="utf-8")
    tid = frontmatter_value(text, "id") or dir_.name
    if (frontmatter_value(text, "requires_gpu") or "").lower() == "true":
        return {"id": tid, "status": "gpu-skipped", "passed": 0, "failed": 0, "duration": 0.0}
    tests = sorted(dir_.glob("test_*.py"))
    if not tests:
        return {"id": tid, "status": "no-tests", "passed": 0, "failed": 0, "duration": 0.0}
    junit = ROOT / "content" / "_generated" / f"junit-{tid}.xml"
    t0 = time.time()
    proc = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", f"--junitxml={junit}", *map(str, tests)],
        cwd=dir_, capture_output=True, text=True, timeout=600,
    )
    duration = round(time.time() - t0, 2)
    passed = failed = 0
    cases = []
    if junit.exists():
        root = ET.parse(junit).getroot()
        for case in root.iter("testcase"):
            bad = case.find("failure") is not None or case.find("error") is not None
            skipped = case.find("skipped") is not None
            if bad:
                failed += 1
            elif not skipped:
                passed += 1
            cases.append({"name": case.get("name"), "status": "failed" if bad else "skipped" if skipped else "passed"})
        junit.unlink()
    status = "passed" if proc.returncode == 0 and failed == 0 else "failed"
    result = {"id": tid, "status": status, "passed": passed, "failed": failed, "duration": duration, "cases": cases}
    if status == "failed":
        result["output"] = (proc.stdout + proc.stderr)[-3000:]
    return result


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    results = {}
    for d in sorted(p for p in TUTORIALS.iterdir() if (p / "index.md").exists()):
        r = run(d)
        results[r["id"]] = r
        mark = {"passed": "✓", "failed": "✗"}.get(r["status"], "–")
        print(f"{mark} {r['id']}: {r['status']} ({r['passed']} geçti, {r['failed']} başarısız, {r['duration']} sn)")
    import numpy  # noqa: F401  (sürüm bilgisini rapora yazmak için)

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "python": platform.python_version(),
        "platform": f"{platform.system()} {platform.machine()} (CPU)",
        "numpy": numpy.__version__,
        "results": results,
    }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Rapor: {OUT.relative_to(ROOT)}")
    failed = [r for r in results.values() if r["status"] == "failed"]
    return 1 if failed and "--fail" in sys.argv else 0


if __name__ == "__main__":
    sys.exit(main())
