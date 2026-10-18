// İçerik hattı testleri (Senaryo 10 dahil). Çalıştırma: node --test scripts/tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from '../lib/load-content.mjs';
import { TEMPLATES } from '../lib/schema.mjs';

const run = (args, env = {}) => execFileSync('node', args, { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function withTempFile(rel, content, fn) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  try { return fn(); } finally { fs.rmSync(abs, { force: true }); }
}

test('mevcut içerik hatasız doğrulanır', () => {
  const out = run(['scripts/validate-content.mjs']);
  assert.match(out, /✓ hata yok/);
});

test('Senaryo 10: yeni sektör yalnızca bir Markdown dosyasıyla eklenir ve grafiğe bağlanır', () => {
  const sections = TEMPLATES.sector.map(([id, title]) => `## ${title} {#${id}}\n\nTest içeriği: ${title}. Bağlantı: [[Anomaly Detection]].\n`).join('\n');
  const md = `---\nid: e2e-maritime\ntype: sector\ntitle: Denizcilik ve Limanlar\ntitle_en: Maritime & Ports\nsummary: Gemi, liman ve tedarik zinciri operasyonları.\nstatus: complete\nrelations:\n  used_with: [banking]\nsources:\n  - { title: "IMO", url: "https://www.imo.org", kind: standard }\nlast_verified: 2026-10-18\n---\n\n${sections}`;
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'academy-content-'));
  withTempFile('content/sectors/e2e-maritime.md', md, () => {
    run(['scripts/build-content.mjs'], { CONTENT_OUT: out });
  });
  const idx = JSON.parse(fs.readFileSync(path.join(out, 'index.json'), 'utf8'));
  const it = idx.items.find((i) => i.id === 'e2e-maritime');
  assert.ok(it, 'yeni sektör dizinde yok');
  assert.equal(it.status, 'complete');
  assert.equal(it.coverage.present, TEMPLATES.sector.length);
  assert.deepEqual(it.relations.used_with, ['banking']);
  assert.ok(it.links.includes('anomaly-detection'), 'gövde bağlantısı çözülmedi');
  assert.ok(fs.existsSync(path.join(out, 'items', 'e2e-maritime.json')), 'gövde dosyası yok');
});

test('yarım içerik "complete" ilan edilemez; kırık bağlantı yakalanır', () => {
  const md = `---\nid: e2e-broken\ntype: sector\ntitle: Bozuk Sektör\nsummary: test\nstatus: complete\nrelations:\n  used_with: [olmayan-id]\n---\n\n## Sektörün temel işleyişi {#overview}\n\n[[Var Olmayan Kavram]]\n`;
  withTempFile('content/sectors/e2e-broken.md', md, () => {
    let failed = null;
    try { run(['scripts/validate-content.mjs']); } catch (e) { failed = e.stdout; }
    assert.ok(failed, 'doğrulama başarısız olmalıydı');
    assert.match(failed, /şablon bölümleri eksik/);
    assert.match(failed, /var olmayan id "olmayan-id"/);
    assert.match(failed, /kırık iç bağlantı \[\[Var Olmayan Kavram\]\]/);
  });
});

test('content:new şablonu taslak üretir ve taslak "stub" sayılır', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'academy-content-'));
  try {
    run(['scripts/new-item.mjs', 'career', 'e2e-port-engineer', 'Liman Mühendisi']);
    run(['scripts/build-content.mjs'], { CONTENT_OUT: out });
    const idx = JSON.parse(fs.readFileSync(path.join(out, 'index.json'), 'utf8'));
    assert.equal(idx.items.find((i) => i.id === 'e2e-port-engineer').status, 'stub');
  } finally {
    fs.rmSync(path.join(ROOT, 'content/careers/e2e-port-engineer.md'), { force: true });
  }
});

test('planlanmış alanlar dizinde dolu gibi görünmez', () => {
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/web/public/content/index.json'), 'utf8'));
  const plannedIds = [...idx.catalog.sectors, ...idx.catalog.careers].map((c) => c.id);
  assert.ok(plannedIds.length > 0);
  for (const id of plannedIds) assert.ok(!idx.items.some((i) => i.id === id), `${id} hem planlı hem içerik`);
});
