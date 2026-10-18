#!/usr/bin/env node
// Kaynak URL'lerinin erişilebilirliğini kontrollü biçimde (sıralı, zaman aşımlı) denetler.
// İçeriği DEĞİŞTİRMEZ; yalnızca rapor üretir. Haftalık GitHub Actions iş akışı bu raporu
// artifact olarak saklar ve sorun varsa bir issue açar.
import fs from 'node:fs';
import { loadContent } from './lib/load-content.mjs';

const out = process.argv[2] || 'link-report.json';
const { items } = loadContent();
const urls = new Map();
for (const it of items) for (const s of it.sources || []) {
  if (!urls.has(s.url)) urls.set(s.url, []);
  urls.get(s.url).push(it.id);
}

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'engineering-academy-linkcheck/1.0' } });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'engineering-academy-linkcheck/1.0' } });
    }
    return { status: res.status, ok: res.ok };
  } catch (e) {
    return { status: 0, ok: false, error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const [url, usedBy] of urls) {
  const r = await check(url);
  results.push({ url, usedBy, ...r });
  console.log(`${r.ok ? '✓' : '✗'} ${r.status || r.error} ${url}`);
  await new Promise((res) => setTimeout(res, 300)); // kibar tarama
}
const broken = results.filter((r) => !r.ok);
fs.writeFileSync(out, JSON.stringify({ checked_at: new Date().toISOString(), total: results.length, broken: broken.length, results }, null, 2));
console.log(`${results.length} URL kontrol edildi, ${broken.length} sorunlu → ${out}`);
// Bazı siteler bot isteklerini reddeder; bu yüzden çıkış kodu yalnızca bilgi amaçlıdır.
process.exit(0);
