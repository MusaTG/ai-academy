// content/ klasöründeki Markdown + YAML frontmatter dosyalarını okur.
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';
import { ITEM_TYPES } from './schema.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CONTENT_DIR = path.join(ROOT, 'content');

export function slugify(s) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return String(s)
    .toLowerCase()
    .replace(/[çğıİöşüâîû]/g, (c) => map[c] || c)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseFrontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: frontmatter (--- ... ---) bulunamadı`);
  let data;
  try {
    data = YAML.parse(m[1]) || {};
  } catch (e) {
    throw new Error(`${file}: YAML hatası: ${e.message}`);
  }
  return { data, body: m[2] };
}

// Kod blokları dışındaki ## / ### başlıklarını çıkarır. "## Başlık {#id}" sözdizimi desteklenir.
export function extractSections(body) {
  const sections = [];
  let inFence = false;
  const seen = new Set();
  let inComment = false;
  for (const line of body.split('\n')) {
    if (!inFence && line.includes('<!--') && !line.includes('-->')) { inComment = true; continue; }
    if (inComment) { if (line.includes('-->')) inComment = false; continue; }
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = line.match(/^(#{2,4})\s+(.+?)\s*(?:\{#([a-z0-9-]+)\})?\s*$/);
    if (!m) continue;
    let id = m[3] || slugify(m[2]);
    let n = 2;
    while (seen.has(id)) id = `${m[3] || slugify(m[2])}-${n++}`;
    seen.add(id);
    sections.push({ id, title: m[2].trim(), level: m[1].length });
  }
  return sections;
}

// Kod dosyasındaki "# region: ad" ... "# endregion" işaretlerinden gerçek satır aralıklarını çıkarır.
export function extractRegions(source) {
  const regions = [];
  const stack = [];
  source.split('\n').forEach((line, i) => {
    const open = line.match(/#\s*region:\s*([\w-]+)/);
    if (open) stack.push({ name: open[1], start: i + 2 });
    else if (/#\s*endregion\b/.test(line) && stack.length) {
      const r = stack.pop();
      regions.push({ name: r.name, start: r.start, end: i });
    }
  });
  return regions;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.md') && entry.name !== 'README.md') out.push(p);
  }
  return out;
}

export function loadCatalog() {
  const p = path.join(CONTENT_DIR, 'catalog.yaml');
  if (!fs.existsSync(p)) return { sectors: [], careers: [] };
  return YAML.parse(fs.readFileSync(p, 'utf8')) || { sectors: [], careers: [] };
}

export function loadContent() {
  const items = [];
  const errors = [];
  for (const file of walk(CONTENT_DIR)) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    let parsed;
    try {
      parsed = parseFrontmatter(fs.readFileSync(file, 'utf8'), rel);
    } catch (e) {
      errors.push(e.message);
      continue;
    }
    const { data, body } = parsed;
    const item = {
      ...data,
      relations: data.relations || {},
      tags: data.tags || [],
      aliases: data.aliases || [],
      sources: data.sources || [],
      body,
      file: rel,
      dir: path.dirname(rel),
      sections: extractSections(body),
    };
    // Tutorial kod dosyaları: gerçek dosyadan okunur, satır sayıları ve bölgeler hesaplanır.
    item.code = (data.code || []).map((c) => {
      const abs = path.join(path.dirname(file), c.file);
      const repoPath = path.relative(ROOT, abs).split(path.sep).join('/');
      if (!fs.existsSync(abs)) {
        errors.push(`${rel}: kod dosyası bulunamadı: ${c.file}`);
        return { ...c, path: repoPath, missing: true };
      }
      const source = fs.readFileSync(abs, 'utf8');
      return {
        ...c,
        path: repoPath,
        source,
        lines: source.split('\n').length,
        sha: crypto.createHash('sha256').update(source).digest('hex').slice(0, 12),
        regions: extractRegions(source),
      };
    });
    if (ITEM_TYPES[item.type]) item.typeDir = ITEM_TYPES[item.type].dir;
    items.push(item);
  }
  return { items, errors };
}

export function hashOf(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 12);
}
