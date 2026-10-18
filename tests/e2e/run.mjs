#!/usr/bin/env node
// Uçtan uca kabul testleri: 10 senaryonun tamamı gerçek bir tarayıcıda (Playwright/Chromium),
// gerçek API + SQLite veritabanıyla çalıştırılır.
//
// Önkoşul: `ACADEMY_REPO_URL=https://github.com/<kullanıcı>/<repo> npm run build` ve API bağımlılıkları.
// Kullanım: node tests/e2e/run.mjs   (PYTHON ortam değişkeniyle Python yolu değiştirilebilir)
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PY = process.env.PYTHON || 'python3';
const PORT = Number(process.env.E2E_PORT || 8765);
const BASE = `http://127.0.0.1:${PORT}/`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'academy-e2e-'));
const results = [];
let api;

function startApi() {
  api = spawn(PY, ['-m', 'uvicorn', 'app.main:app', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: path.join(ROOT, 'apps', 'api'),
    env: { ...process.env, DATABASE_URL: `sqlite:///${tmp}/e2e.db`, BACKUP_DIR: `${tmp}/backups`, ADMIN_TOKEN: 'e2e-admin', BACKUP_INTERVAL_HOURS: '0', CORS_ORIGINS: BASE },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  api.stderr.on('data', (d) => process.env.E2E_VERBOSE && process.stderr.write(d));
  return waitFor(async () => (await fetch(BASE + 'api/health')).ok, 20000, 'API açılmadı');
}
async function stopApi() {
  if (!api) return;
  api.kill('SIGTERM');
  await new Promise((r) => api.once('exit', r));
  api = null;
}
async function waitFor(fn, ms = 10000, msg = 'zaman aşımı') {
  const t0 = Date.now();
  for (;;) {
    try { if (await fn()) return; } catch { /* tekrar dene */ }
    if (Date.now() - t0 > ms) throw new Error(msg);
    await new Promise((r) => setTimeout(r, 200));
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function scenario(n, title, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ n, title, ok: true, ms: Date.now() - t0 });
    console.log(`✓ Senaryo ${n}: ${title}`);
  } catch (e) {
    results.push({ n, title, ok: false, error: e.message });
    console.log(`✗ Senaryo ${n}: ${title}\n    ${e.message}`);
  }
}

// Bir "cihaz" = kalıcı profilli ayrı bir tarayıcı (kapatıp açınca IndexedDB korunur)
const externalHosts = new Set();
async function device(name) {
  const ctx = await chromium.launchPersistentContext(path.join(tmp, `profile-${name}`), { viewport: { width: 1280, height: 860 }, serviceWorkers: 'allow' });
  ctx.on('request', (r) => { const h = new URL(r.url()).host; if (!h.startsWith('127.0.0.1')) externalHosts.add(h); });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.on('pageerror', (e) => console.log(`  [${name} sayfa hatası] ${e.message}`));
  return { ctx, page };
}
const go = async (page, hash) => { await page.goto(BASE + '#' + hash); await page.waitForLoadState('networkidle').catch(() => {}); };
const pending = (page) => page.locator('[data-testid=pending-count]').innerText();

async function syncAndSettle(page) {
  await go(page, '/offline');
  const before = await page.locator('[data-testid=last-sync]').getAttribute('data-value');
  await page.click('[data-testid=sync-now]');
  await waitFor(async () => (await page.locator('[data-testid=last-sync]').getAttribute('data-value')) !== before, 15000, 'eşitleme turu bitmedi');
  await waitFor(async () => (await page.locator('[data-testid=sync-status]').innerText()) === 'idle' && (await pending(page)) === '0', 15000, 'eşitleme tamamlanmadı');
}

async function main() {
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/web/dist/content/index.json'), 'utf8'));
  assert(index.repo?.url, 'Derleme repo bilgisi içermiyor: ACADEMY_REPO_URL ile derleyin');
  await startApi();
  let A = await device('A');
  const B = await device('B');
  const user = `e2e${Date.now() % 100000}`;
  let noteId = null;

  await scenario(1, 'Bankacılık sektörüne geçiş', async () => {
    const p = A.page;
    await go(p, '/industry');
    await p.click('[data-testid=card-banking]');
    await p.waitForSelector('#overview');
    for (const s of ['overview', 'roles', 'data', 'problems', 'metrics']) assert(await p.locator(`#${s}`).count() === 1, `bölüm yok: ${s}`);
    const panel = p.locator('[data-testid=sector-panel]');
    for (const role of ['Forward Deployed Engineer', 'Data Engineer', 'Security Engineer', 'Risk Analyst']) assert(await panel.getByText(role).count() > 0, `meslek yok: ${role}`);
    await panel.getByRole('link', { name: /Bankacılık sektörüne geçiş yolu/ }).click();
    await p.waitForSelector('text=Adımlar');
    assert(p.url().includes('/item/banking-path'), 'öğrenme yoluna gidilmedi');
  });

  await scenario(2, 'Meslekten sektöre: FDE', async () => {
    const p = A.page;
    await go(p, '/careers');
    await p.click('[data-testid=card-forward-deployed-engineer]');
    await p.waitForSelector('#daily');
    for (const s of ['daily', 'tech-skills', 'soft-skills', 'levels']) assert(await p.locator(`#${s}`).count() === 1, `bölüm yok: ${s}`);
    const panel = p.locator('[data-testid=career-panel]');
    for (const s of ['Bankacılık', 'Sağlık', 'Üretim']) assert(await panel.getByText(new RegExp(s)).count() > 0, `sektör yok: ${s}`);
    await panel.getByRole('link', { name: /FDE öğrenme yolu/ }).click();
    await p.getByRole('link', { name: /Gerçekçi bir FDE vaka çalışması|vaka/i }).first().click();
    await p.waitForSelector('h1');
    assert(/fde-20|fde-customer|vaka/i.test(p.url() + (await p.locator('h1').innerText())), 'vaka çalışmasına ulaşılamadı');
  });

  await scenario(3, 'Bilgi grafiği: Anomaly Detection', async () => {
    const p = A.page;
    await go(p, '/graph');
    await p.fill('[data-testid=graph-search]', 'Anomaly Det');
    await p.locator('.card button', { hasText: 'Anomaly Detection' }).first().click();
    await p.waitForSelector('[data-node="anomaly-detection"]');
    await p.locator('[data-node="anomaly-detection"]').dispatchEvent('click');
    const panel = p.locator('[data-testid=graph-panel]');
    await panel.getByRole('heading', { name: 'Anomaly Detection' }).waitFor();
    for (const s of ['Bankacılık', 'Üretim', 'Siber Güvenlik', 'Sağlık']) assert(await panel.getByRole('link', { name: new RegExp(s) }).count() > 0, `ilişki yok: ${s}`);
    await panel.getByRole('link', { name: /Siber Güvenlik/ }).first().click();
    await p.waitForSelector('#overview');
    assert(p.url().includes('/item/cybersecurity'), 'ilgili içeriğe gidilmedi');
  });

  await scenario(4, 'Tutorial içinden kişisel not + backlink', async () => {
    const p = A.page;
    await go(p, '/item/iou-dice-metrics');
    await p.click('[data-testid=take-note]');
    await p.waitForSelector('[data-testid=note-body]');
    await p.fill('[data-testid=note-title]', 'IoU deney notlarım');
    await p.fill('[data-testid=note-body]', 'Kaynak: [[iou-dice-metrics|IoU ve Dice]]\n\nKüçük nesnelerde [[Object Detection]] için IoU eşiği kritik. Focal loss da denenebilir.\n\n[[Henüz yazılmamış bir not]]');
    await p.waitForTimeout(1200);
    noteId = decodeURIComponent(p.url().split('/notes/')[1]);
    assert(noteId && noteId.startsWith('n-'), 'not kimliği yok');
    // Öneri onayı
    const sug = p.locator('[data-testid=suggestions]');
    await sug.getByRole('button', { name: /Focal Loss onayla/ }).click();
    await go(p, '/item/object-detection');
    await p.locator('[data-testid=backlinks]').getByText('IoU deney notlarım').waitFor({ timeout: 5000 });
    await go(p, '/item/focal-loss');
    await p.locator('[data-testid=backlinks]').getByText('IoU deney notlarım').waitFor({ timeout: 5000 });
    await go(p, '/item/iou-dice-metrics');
    await p.locator('[data-testid=backlinks]').getByText('IoU deney notlarım').waitFor({ timeout: 5000 });
    // Boş bağlantı → yeni not oluşturulabilir
    await go(p, `/notes/${noteId}`);
    await p.locator('.preview a.wikilink.missing').click();
    await p.waitForSelector('[data-testid=note-title]');
    assert((await p.inputValue('[data-testid=note-title]')) === 'Henüz yazılmamış bir not', 'boş bağlantıdan not oluşmadı');
  });

  await scenario('ön adım', 'Hesap oluştur', async () => {
    const p = A.page;
    await go(p, '/offline');
    await p.fill('[data-testid=username]', user);
    await p.fill('[data-testid=password]', 'gizli-parola-123');
    await p.click('[data-testid=register]');
    await p.locator('[data-testid=logged-in-user]').waitFor();
    await syncAndSettle(p);
  });
  results.pop(); // ön adım (raporda sayılmaz)

  await scenario(5, 'Offline kullanım: indirilen ders + yeni not', async () => {
    const p = A.page;
    await go(p, '/');
    await p.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await go(p, '/item/fde-01-what-is-fde');
    await p.click('[data-testid=download-btn]');
    await p.getByText('Cihazda').first().waitFor();
    await p.reload(); // Service Worker sayfayı kontrol etsin
    await p.evaluate(() => navigator.serviceWorker.ready);
    await waitFor(() => p.evaluate(() => !!navigator.serviceWorker.controller), 10000, 'Service Worker devreye girmedi');
    await A.ctx.setOffline(true);
    await p.reload();
    await p.waitForSelector('h1');
    await p.locator('[data-testid=offline-banner]').waitFor();
    assert((await p.locator('h1').innerText()).length > 3, 'ders çevrimdışı açılmadı');
    assert(await p.locator('.prose h2').count() > 0, 'ders gövdesi çevrimdışı yok');
    await go(p, '/notes/new');
    await p.waitForSelector('[data-testid=note-body]');
    await p.fill('[data-testid=note-title]', 'Uçakta yazılan not');
    await p.fill('[data-testid=note-body]', 'İnternet yokken [[forward-deployed-engineer|FDE]] hakkında not.');
    await p.waitForTimeout(1000);
    await go(p, '/notes');
    await p.locator('[data-testid=note-list]').getByText('Uçakta yazılan not').waitFor();
  });

  await scenario(6, 'Senkronizasyon ve çakışma (veri kaybı yok)', async () => {
    const pa = A.page, pb = B.page;
    // A tekrar çevrimiçi → çevrimdışı not otomatik gönderilir
    await A.ctx.setOffline(false);
    await go(pa, '/offline');
    await waitFor(async () => (await pending(pa)) === '0', 15000, 'çevrimdışı not gönderilmedi');
    // B aynı hesapla giriş yapar → notları alır
    await go(pb, '/offline');
    await pb.fill('[data-testid=username]', user);
    await pb.fill('[data-testid=password]', 'gizli-parola-123');
    await pb.getByRole('button', { name: 'Giriş yap' }).click();
    await pb.locator('[data-testid=logged-in-user]').waitFor();
    await syncAndSettle(pb);
    await go(pb, '/notes');
    await pb.locator('[data-testid=note-list]').getByText('Uçakta yazılan not').waitFor();
    await pb.locator('[data-testid=note-list]').getByText('IoU deney notlarım').waitFor();
    // Çakışma: A çevrimdışıyken düzenler, B çevrimiçi düzenler
    await A.ctx.setOffline(true);
    await go(pa, `/notes/${noteId}`);
    await pa.fill('[data-testid=note-body]', 'A CİHAZI: offline düzenleme');
    await pa.waitForTimeout(1000);
    await go(pb, `/notes/${noteId}`);
    await pb.fill('[data-testid=note-body]', 'B CİHAZI: online düzenleme');
    await pb.waitForTimeout(1000);
    await syncAndSettle(pb);
    await A.ctx.setOffline(false);
    await go(pa, '/offline');
    await pa.click('[data-testid=sync-now]');
    await pa.locator('[data-testid=conflict]').waitFor({ timeout: 15000 });
    const txt = await pa.locator('[data-testid=conflict]').innerText();
    assert(txt.includes('A CİHAZI') && txt.includes('B CİHAZI'), 'çakışmada iki sürüm de gösterilmeli');
    await pa.getByRole('button', { name: 'İkisini birleştir' }).click();
    await waitFor(async () => (await pa.locator('[data-testid=conflict]').count()) === 0, 5000, 'çakışma çözülmedi');
    await syncAndSettle(pa);
    await syncAndSettle(pb);
    await go(pb, `/notes/${noteId}`);
    const body = await pb.inputValue('[data-testid=note-body]');
    assert(body.includes('A CİHAZI') && body.includes('B CİHAZI'), 'birleştirilmiş metin diğer cihaza ulaşmadı');
    // Silme (tombstone) diğer cihaza yayılır
    await go(pb, '/notes');
    const extra = await pb.locator('[data-testid=note-list] a', { hasText: 'Henüz yazılmamış bir not' }).getAttribute('href');
    const extraId = extra.split('/notes/')[1];
    await go(pb, `/notes/${extraId}`);
    pb.once('dialog', (d) => d.accept());
    await pb.getByRole('button', { name: 'Sil' }).click();
    await syncAndSettle(pb);
    await syncAndSettle(pa);
    await go(pa, '/notes');
    assert(await pa.locator('[data-testid=note-list]').getByText('Henüz yazılmamış bir not').count() === 0, 'silme diğer cihaza yansımadı');
  });

  await scenario(7, 'GitHub script bağlantısı gerçek dosyaya gidiyor', async () => {
    const p = A.page;
    await go(p, '/item/iou-dice-metrics');
    const block = p.locator('[data-testid="code-metrics.py"]');
    const href = await block.locator('[data-testid=github-file-link]').getAttribute('href');
    const m = href.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)$/);
    assert(m, `beklenmeyen bağlantı: ${href}`);
    assert(m[1] === index.repo.url && m[2] === encodeURIComponent(index.repo.ref), 'repo/ref derleme bilgisiyle eşleşmiyor');
    const file = path.join(ROOT, decodeURIComponent(m[3]));
    assert(fs.existsSync(file), `bağlantıdaki dosya repoda yok: ${m[3]}`);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const regionLinks = await block.locator('[data-testid=github-region-link]').evaluateAll((as) => as.map((a) => [a.textContent, a.getAttribute('href')]));
    assert(regionLinks.length > 0, 'satır aralığı bağlantısı yok');
    for (const [label, h] of regionLinks) {
      const [, s, e] = h.match(/#L(\d+)-L(\d+)$/).map(Number);
      const name = label.split(' · ')[0];
      assert(/#\s*region:\s*/.test(lines[s - 2]) && lines[s - 2].includes(name), `L${s} bölgesinin başı değil (${name})`);
      assert(/#\s*endregion/.test(lines[e]), `L${e} bölgesinin sonu değil (${name})`);
    }
    await block.getByText('Nasıl çalıştırılır?').click();
    assert(await block.getByText(/pip install "numpy>=1.24"/).count() > 0, 'kurulum bilgisi yok');
    assert((await p.locator('[data-testid=test-badge]').innerText()).includes('geçti'), 'test sonucu gösterilmiyor');
  });

  await scenario(8, 'Kalıcı veri: kapat-aç, sunucu yeniden başlatma, doğrulanmış yedek', async () => {
    await A.ctx.close();
    A = await device('A'); // aynı profil = tarayıcıyı kapatıp açmak
    await go(A.page, '/notes');
    await A.page.locator('[data-testid=note-list]').getByText('Uçakta yazılan not').waitFor();
    await stopApi();
    await startApi(); // sunucu yeniden başlatıldı, veriler veritabanında
    const login = await (await fetch(BASE + 'api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: user, password: 'gizli-parola-123' }) })).json();
    const exp = await (await fetch(BASE + 'api/export', { headers: { authorization: `Bearer ${login.token}` } })).json();
    assert(exp.records.some((r) => r.collection === 'notes' && r.data.title === 'Uçakta yazılan not'), 'not sunucuda kalıcı değil');
    const bk = await (await fetch(BASE + 'api/admin/backup', { method: 'POST', headers: { 'x-admin-token': 'e2e-admin' } })).json();
    assert(bk.status === 'ok' && bk.verified, `yedek doğrulanmadı: ${JSON.stringify(bk)}`);
    const file = path.join(tmp, 'backups', bk.file);
    const out = execFileSync(PY, ['-m', 'app.backup', 'verify', file], { cwd: path.join(ROOT, 'apps/api'), env: { ...process.env, DATABASE_URL: `sqlite:///${tmp}/restore-target.db` } }).toString();
    assert(out.includes('doğrulandı'), 'komut satırı doğrulaması başarısız');
    execFileSync(PY, ['-m', 'app.backup', 'restore', file], { cwd: path.join(ROOT, 'apps/api'), env: { ...process.env, DATABASE_URL: `sqlite:///${tmp}/restore-target.db` } });
    assert(fs.existsSync(path.join(ROOT, 'docs/backup-restore.md')), 'geri yükleme belgesi yok');
  });

  await scenario(9, 'Ücretsiz çalışma: ücretli API / dış servis çağrısı yok', async () => {
    assert(externalHosts.size === 0, `uygulama dış sunuculara istek attı: ${[...externalHosts].join(', ')}`);
    const src = fs.readdirSync(path.join(ROOT, 'apps/web/dist/assets')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(ROOT, 'apps/web/dist/assets', f), 'utf8')).join('\n');
    for (const bad of ['api.openai.com', 'api.anthropic.com', 'newsapi.org', 'serpapi.com', 'googleapis.com/customsearch']) assert(!src.includes(bad), `ücretli servis referansı: ${bad}`);
    assert(fs.readFileSync(path.join(ROOT, 'docs/free-hosting.md'), 'utf8').includes('sınır'), 'servis sınırları belgelenmemiş');
  });

  await scenario(10, 'Yeni alan ekleme: kod değişmeden içerik şemasıyla', async () => {
    const out = execFileSync('node', ['--test', 'scripts/tests/content.test.mjs'], { cwd: ROOT }).toString();
    assert(/# fail 0/.test(out), out.slice(-600));
  });

  await A.ctx.close();
  await B.ctx.close();
}

try {
  await main();
} catch (e) {
  console.error('Beklenmeyen hata:', e);
  results.push({ n: 0, title: 'çalıştırıcı', ok: false, error: e.message });
} finally {
  await stopApi();
}
const failed = results.filter((r) => !r.ok);
fs.mkdirSync(path.join(ROOT, 'tests', 'e2e', 'out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tests', 'e2e', 'out', 'report.json'), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} senaryo geçti`);
process.exit(failed.length ? 1 : 0);
