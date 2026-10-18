// İçerik doğrulama: şema, kırık bağlantılar, ön koşul döngüleri, mükerrer içerik,
// yetim içerik, bozuk formül/kod blokları ve şablon kapsamı.
import { ITEM_TYPES, EDGE_TYPES, TEMPLATES, STATUSES, SOURCE_KINDS, REQUIRED_FIELDS, ID_RE } from './schema.mjs';
import { slugify } from './load-content.mjs';

let katex = null;
try {
  katex = (await import('katex')).default;
} catch {
  katex = null; // web bağımlılıkları kurulmadıysa formül kontrolü atlanır (uyarı verilir)
}

export function normTitle(s) {
  return slugify(s).replace(/-/g, '');
}

export function computeCoverage(item) {
  const tpl = TEMPLATES[item.type];
  if (item.status === 'planned') return { required: tpl ? tpl.length : 0, present: 0, missing: tpl ? tpl.map((t) => t[0]) : [], ratio: 0, computed: 'planned' };
  if (!tpl) {
    const ok = item.body && item.body.trim().length > 200;
    return { required: 0, present: 0, missing: [], ratio: ok ? 1 : 0, computed: ok ? 'complete' : 'stub' };
  }
  const ids = new Set(item.sections.map((s) => s.id));
  const missing = tpl.filter(([id]) => !ids.has(id)).map(([id]) => id);
  const present = tpl.length - missing.length;
  const ratio = present / tpl.length;
  const computed = ratio === 1 ? 'complete' : ratio >= 0.4 ? 'partial' : 'stub';
  return { required: tpl.length, present, missing, ratio, computed };
}

export function extractWikilinks(text) {
  const out = [];
  let inFence = false;
  for (const line of text.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const m of line.matchAll(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g)) {
      out.push({ target: m[1].trim().replace(/\\$/, ''), section: m[2]?.trim().replace(/\\$/, ''), alias: m[3]?.trim() });
    }
  }
  return out;
}

function checkMath(body, file, errors, warnings) {
  // Kod bloklarını çıkar, sonra $$...$$ ve $...$ ifadelerini KaTeX ile derle.
  const stripped = body.replace(/<!--[\s\S]*?-->/g, '').replace(/(```|~~~)[\s\S]*?\1/g, '').replace(/`[^`\n]*`/g, '');
  const fences = (body.replace(/<!--[\s\S]*?-->/g, '').match(/^\s*(```|~~~)/gm) || []).length;
  if (fences % 2 !== 0) errors.push(`${file}: kapanmamış kod bloğu (\`\`\`)`);
  const display = [...stripped.matchAll(/\$\$([\s\S]+?)\$\$/g)].map((m) => m[1]);
  const withoutDisplay = stripped.replace(/\$\$[\s\S]+?\$\$/g, '');
  if ((withoutDisplay.match(/\$\$/g) || []).length) errors.push(`${file}: kapanmamış $$ formül bloğu`);
  const inline = [...withoutDisplay.matchAll(/(?<![\\$\w])\$([^$\n]+?)\$(?!\w)/g)].map((m) => m[1]);
  if (!katex) {
    if (display.length + inline.length) warnings.push(`${file}: KaTeX yüklü değil, formüller derlenmeden geçti`);
    return;
  }
  for (const [expr, displayMode] of [...display.map((d) => [d, true]), ...inline.map((d) => [d, false])]) {
    try {
      katex.renderToString(expr, { displayMode, throwOnError: true });
    } catch (e) {
      errors.push(`${file}: bozuk formül "${expr.slice(0, 40)}": ${e.message.split('\n')[0]}`);
    }
  }
}

export function validate({ items, errors: loadErrors }, catalog = { sectors: [], careers: [] }) {
  const errors = [...loadErrors];
  const warnings = [];
  const byId = new Map();
  const titleIndex = new Map();

  for (const it of items) {
    for (const f of REQUIRED_FIELDS) if (!it[f]) errors.push(`${it.file}: zorunlu alan eksik: ${f}`);
    if (it.id && !ID_RE.test(it.id)) errors.push(`${it.file}: geçersiz id "${it.id}" (küçük harf, rakam ve tire)`);
    if (it.type && !ITEM_TYPES[it.type]) errors.push(`${it.file}: bilinmeyen tür "${it.type}"`);
    if (it.status && !STATUSES.includes(it.status)) errors.push(`${it.file}: geçersiz status "${it.status}"`);
    if (byId.has(it.id)) errors.push(`${it.file}: mükerrer id "${it.id}" (ayrıca ${byId.get(it.id).file})`);
    byId.set(it.id, it);
    for (const t of [it.title, it.title_en, ...(it.aliases || [])].filter(Boolean)) {
      const k = normTitle(t);
      if (titleIndex.has(k) && titleIndex.get(k) !== it.id) {
        warnings.push(`${it.file}: olası mükerrer kavram: "${t}" ayrıca "${titleIndex.get(k)}" içinde kullanılıyor`);
      } else titleIndex.set(k, it.id);
    }
    if (it.last_verified && !/^\d{4}-\d{2}-\d{2}$/.test(String(it.last_verified))) {
      errors.push(`${it.file}: last_verified YYYY-AA-GG biçiminde olmalı`);
    }
    for (const s of it.sources || []) {
      if (!s.url || !/^https:\/\//.test(s.url)) errors.push(`${it.file}: kaynak URL'si https ile başlamalı: ${s.title || '?'}`);
      if (s.kind && !SOURCE_KINDS.includes(s.kind)) errors.push(`${it.file}: bilinmeyen kaynak türü "${s.kind}"`);
    }
    for (const [i, q] of (it.quiz || []).entries()) {
      if (!Array.isArray(q.options) || typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
        errors.push(`${it.file}: quiz[${i}] geçersiz (options/answer)`);
      }
    }
    checkMath(it.body || '', it.file, errors, warnings);
  }

  const plannedIds = new Set([...(catalog.sectors || []), ...(catalog.careers || [])].map((c) => c.id));
  for (const c of [...(catalog.sectors || []), ...(catalog.careers || [])]) {
    if (byId.has(c.id)) warnings.push(`catalog.yaml: "${c.id}" artık içerik olarak mevcut; katalogdan kaldırılabilir`);
  }

  const resolve = (name) => {
    if (byId.has(name)) return name;
    const k = normTitle(name);
    return titleIndex.get(k) || null;
  };

  const inbound = new Map();
  const outbound = new Map();
  for (const it of items) {
    for (const [edge, targets] of Object.entries(it.relations || {})) {
      if (!EDGE_TYPES[edge]) { errors.push(`${it.file}: bilinmeyen ilişki türü "${edge}"`); continue; }
      if (!Array.isArray(targets)) { errors.push(`${it.file}: relations.${edge} bir liste olmalı`); continue; }
      for (const t of targets) {
        if (byId.has(t)) {
          outbound.set(it.id, (outbound.get(it.id) || 0) + 1);
          inbound.set(t, (inbound.get(t) || 0) + 1);
        } else if (plannedIds.has(t)) {
          warnings.push(`${it.file}: ${edge} → "${t}" henüz içeriği olmayan planlanmış bir alana işaret ediyor`);
        } else {
          errors.push(`${it.file}: ${edge} → var olmayan id "${t}"`);
        }
      }
    }
    for (const w of extractWikilinks(it.body || '')) {
      const id = resolve(w.target);
      if (!id) errors.push(`${it.file}: kırık iç bağlantı [[${w.target}]]`);
      else {
        if (w.section) {
          const target = byId.get(id);
          if (!target.sections.some((s) => s.id === w.section)) errors.push(`${it.file}: [[${w.target}#${w.section}]] bölümü bulunamadı`);
        }
        outbound.set(it.id, (outbound.get(it.id) || 0) + 1);
        inbound.set(id, (inbound.get(id) || 0) + 1);
      }
    }
  }

  // Ön koşul döngüsü: A prerequisite→B (A, B'nin ön koşulu)
  const graph = new Map(items.map((i) => [i.id, (i.relations?.prerequisite || []).filter((t) => byId.has(t))]));
  const state = new Map();
  const visit = (id, trail) => {
    if (state.get(id) === 1) { errors.push(`ön koşul döngüsü: ${[...trail, id].join(' → ')}`); return; }
    if (state.get(id) === 2) return;
    state.set(id, 1);
    for (const n of graph.get(id) || []) visit(n, [...trail, id]);
    state.set(id, 2);
  };
  for (const id of graph.keys()) visit(id, []);

  const coverage = [];
  for (const it of items) {
    if (!inbound.get(it.id) && !outbound.get(it.id)) warnings.push(`${it.file}: yetim içerik (hiçbir yere bağlı değil)`);
    const cov = computeCoverage(it);
    coverage.push({ id: it.id, type: it.type, ...cov, declared: it.status || null });
    if (it.status === 'complete' && cov.computed !== 'complete') {
      errors.push(`${it.file}: status "complete" ama şablon bölümleri eksik: ${cov.missing.join(', ')}`);
    }
    if (['sector', 'career', 'technology', 'case-study'].includes(it.type) && cov.computed !== 'stub' && !(it.sources || []).length) {
      warnings.push(`${it.file}: kaynak gösterilmemiş`);
    }
  }

  return { errors, warnings, coverage };
}
