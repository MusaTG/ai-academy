#!/usr/bin/env node
// Şablondan yeni içerik oluşturur. Ana koda dokunmadan yeni sektör/meslek eklemenin yolu budur.
// Kullanım: npm run content:new -- <tür> <id> "<Türkçe başlık>" ["<English title>"]
// Örnek:   npm run content:new -- sector maritime "Denizcilik ve Limanlar" "Maritime & Ports"
import fs from 'node:fs';
import path from 'node:path';
import { ITEM_TYPES, TEMPLATES, ID_RE } from './lib/schema.mjs';
import { CONTENT_DIR } from './lib/load-content.mjs';

const [type, id, title, titleEn] = process.argv.slice(2);
if (!type || !id || !title) {
  console.error('Kullanım: npm run content:new -- <tür> <id> "<başlık>" ["<English title>"]');
  console.error('Türler: ' + Object.keys(ITEM_TYPES).join(', '));
  process.exit(1);
}
if (!ITEM_TYPES[type]) { console.error(`Bilinmeyen tür: ${type}`); process.exit(1); }
if (!ID_RE.test(id)) { console.error('id yalnızca küçük harf, rakam ve tire içermeli'); process.exit(1); }

const isTutorial = type === 'tutorial';
const dir = path.join(CONTENT_DIR, ITEM_TYPES[type].dir, isTutorial ? id : '');
const file = path.join(dir, isTutorial ? 'index.md' : `${id}.md`);
if (fs.existsSync(file)) { console.error(`Zaten var: ${file}`); process.exit(1); }

const today = new Date().toISOString().slice(0, 10);
const sections = (TEMPLATES[type] || [['overview', 'Genel bakış']])
  .map(([sid, heading]) => `## ${heading} {#${sid}}\n\n> TODO: Bu bölüm henüz yazılmadı. Kaynakla doğrulanmamış bilgi eklemeyin.\n`)
  .join('\n');

const fm = `---
id: ${id}
type: ${type}
title: ${JSON.stringify(title)}
title_en: ${JSON.stringify(titleEn || '')}
summary: "TODO: tek cümlelik özet"
status: stub
tags: []
relations: {}
sources: []
last_verified: ${today}
version: 1
---
`;
fs.mkdirSync(dir, { recursive: true });
// Taslak bölümler başlık içerdiği için kapsam hesabında "var" sayılmaması gerekir;
// bu yüzden şablon başlıkları yorum içinde tutulur ve yazar doldurdukça açılır.
const body = `\n<!-- Şablon bölümleri: doldurdukça yorumdan çıkarın.\n\n${sections}\n-->\n`;
fs.writeFileSync(file, fm + body);
console.log(`✓ Oluşturuldu: ${path.relative(process.cwd(), file)}`);
console.log('  İlişkileri relations: altına ekleyin, sonra: npm run content:validate && npm run content:build');
