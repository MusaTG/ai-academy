#!/usr/bin/env node
// content/ → apps/web/public/content/{index.json, items/<id>.json}
// index.json çevrimdışı aramayı ve bilgi grafiğini besler; gövdeler ayrı dosyalarda
// tutulur ve kullanıcı "indir" dediğinde cihaza kaydedilir.
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { loadContent, loadCatalog, hashOf, ROOT, CONTENT_DIR } from './lib/load-content.mjs';
import { validate, computeCoverage, extractWikilinks, normTitle } from './lib/validate.mjs';
import { EDGE_TYPES, ITEM_TYPES, TEMPLATES } from './lib/schema.mjs';

const OUT = process.env.CONTENT_OUT || path.join(ROOT, 'apps', 'web', 'public', 'content');

function plainText(md) {
  return md
    .replace(/(```|~~~)[\s\S]*?\1/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\{#[a-z0-9-]+\}/g, '')
    .replace(/[#>*_`|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function repoInfo() {
  // Önce açık ayar, sonra GitHub Actions ortam değişkenleri. Hiçbiri yoksa null:
  // arayüz sahte bağlantı üretmek yerine "repo ayarlanmadı" der.
  let url = process.env.ACADEMY_REPO_URL || null;
  if (!url && process.env.GITHUB_REPOSITORY) {
    url = `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${process.env.GITHUB_REPOSITORY}`;
  }
  const ref = process.env.ACADEMY_REPO_REF || process.env.GITHUB_SHA || 'main';
  return url ? { url: url.replace(/\/$/, ''), ref } : null;
}

function scriptReport() {
  const p = path.join(CONTENT_DIR, '_generated', 'script-report.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function build({ quiet = false } = {}) {
  const loaded = loadContent();
  const catalog = loadCatalog();
  const { errors, warnings } = validate(loaded, catalog);
  if (errors.length) {
    console.error(`İçerik derlenemedi: ${errors.length} hata`);
    for (const e of errors) console.error('  ✗ ' + e);
    process.exit(1);
  }
  if (!quiet) for (const w of warnings) console.warn('  ! ' + w);

  const report = scriptReport();
  // İçerik gövdelerindeki [[bağlantıları]] çöz: bilgi grafiği ve backlink'ler için.
  const titleIdx = new Map();
  for (const it of loaded.items) for (const t of [it.id, it.title, it.title_en, ...(it.aliases || [])].filter(Boolean)) {
    if (!titleIdx.has(normTitle(t))) titleIdx.set(normTitle(t), it.id);
  }
  const ids = new Set(loaded.items.map((i) => i.id));
  const linksOf = (body) => [...new Set(extractWikilinks(body || '').map((w) => (ids.has(w.target) ? w.target : titleIdx.get(normTitle(w.target)))).filter(Boolean))];
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'items'), { recursive: true });

  const index = [];
  for (const it of loaded.items) {
    const bodyFile = {
      id: it.id,
      body: it.body,
      body_en: it.body_en || null,
      quiz: it.quiz || [],
      code: it.code.map(({ title, file, path: p, source, lines, sha, regions, deps, run }) => ({ title, file, path: p, source, lines, sha, regions, deps: deps || [], run: run || null })),
    };
    const hash = hashOf(bodyFile);
    bodyFile.hash = hash;
    fs.writeFileSync(path.join(OUT, 'items', `${it.id}.json`), JSON.stringify(bodyFile));
    const cov = computeCoverage(it);
    index.push({
      id: it.id,
      type: it.type,
      title: it.title,
      title_en: it.title_en || null,
      summary: it.summary,
      summary_en: it.summary_en || null,
      status: it.status === 'planned' ? 'planned' : cov.computed,
      declaredStatus: it.status || null,
      coverage: { required: cov.required, present: cov.present, missing: cov.missing },
      level: it.level || null,
      duration: it.duration || null,
      group: it.group || null,
      order: it.order ?? null,
      tags: it.tags,
      aliases: it.aliases,
      alt_titles: it.alt_titles || [],
      relations: it.relations,
      links: linksOf(it.body).filter((l) => l !== it.id),
      sources: it.sources,
      last_verified: it.last_verified ? String(it.last_verified) : null,
      version: it.version || 1,
      hash,
      file: it.file,
      sections: it.sections,
      code: it.code.map(({ title, file, path: p, lines, sha, regions, deps, run }) => ({ title, file, path: p, lines, sha, regions, deps: deps || [], run: run || null })),
      hasQuiz: (it.quiz || []).length > 0,
      steps: it.steps || null,
      tests: it.type === 'tutorial' && report ? report.results?.[it.id] || null : null,
      text: plainText(it.body).slice(0, 6000),
      bytes: Buffer.byteLength(JSON.stringify(bodyFile)),
    });
  }
  index.sort((a, b) => (a.type + a.title).localeCompare(b.type + b.title, 'tr'));

  const bundle = {
    schema: 1,
    generated_at: new Date().toISOString(),
    version: hashOf(index.map((i) => i.hash)),
    repo: repoInfo(),
    scriptReport: report ? { generated_at: report.generated_at, python: report.python, platform: report.platform } : null,
    edgeTypes: EDGE_TYPES,
    itemTypes: ITEM_TYPES,
    templates: TEMPLATES,
    catalog,
    items: index,
  };
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(bundle));
  if (!quiet) {
    const kb = Math.round(fs.statSync(path.join(OUT, 'index.json')).size / 1024);
    console.log(`✓ ${index.length} içerik derlendi (index.json ${kb} KB, sürüm ${bundle.version}) → ${path.relative(ROOT, OUT)}`);
  }
  return bundle;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) build();
