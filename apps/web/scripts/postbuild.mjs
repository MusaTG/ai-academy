// dist/ içindeki dosyalardan Service Worker ön-önbellek listesini üretir.
// Sürüm, dosya içeriklerinin özetidir: içerik veya kod değişince eski önbellek temizlenir.
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(path.relative(dist, p).split(path.sep).join('/'));
  }
};
walk(dist);
// Ders gövdeleri (content/items) ön-önbelleğe alınmaz: kullanıcı "indir" dediğinde IndexedDB'ye yazılır.
const precache = files.filter((f) => f !== 'sw.js' && !f.startsWith('content/items/') && !f.endsWith('.map'));
const hash = crypto.createHash('sha256');
for (const f of precache) hash.update(f).update(fs.readFileSync(path.join(dist, f)));
const version = hash.digest('hex').slice(0, 12);
const tpl = fs.readFileSync(path.resolve(dist, '..', 'src', 'sw-template.js'), 'utf8');
fs.writeFileSync(path.join(dist, 'sw.js'), tpl.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(['./', ...precache.filter((f) => f !== 'index.html')])));
console.log(`✓ sw.js: ${precache.length} dosya, sürüm ${version}`);
