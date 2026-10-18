#!/usr/bin/env node
// İçerik doğrulama raporu. CI'da hata varsa başarısız olur; uyarılar raporlanır.
// Kullanım: node scripts/validate-content.mjs [--json rapor.json] [--strict]
import fs from 'node:fs';
import { loadContent, loadCatalog } from './lib/load-content.mjs';
import { validate } from './lib/validate.mjs';

const args = process.argv.slice(2);
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const strict = args.includes('--strict');

const loaded = loadContent();
const { errors, warnings, coverage } = validate(loaded, loadCatalog());

const byStatus = coverage.reduce((acc, c) => ((acc[c.computed] = (acc[c.computed] || 0) + 1), acc), {});
console.log(`İçerik: ${loaded.items.length} öğe | ${Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
for (const w of warnings) console.log('  ! ' + w);
for (const e of errors) console.log('  ✗ ' + e);
console.log(errors.length ? `✗ ${errors.length} hata, ${warnings.length} uyarı` : `✓ hata yok, ${warnings.length} uyarı`);

if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ generated_at: new Date().toISOString(), errors, warnings, coverage }, null, 2));
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
