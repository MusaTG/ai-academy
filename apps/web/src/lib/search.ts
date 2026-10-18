// Yerel (çevrimdışı) arama: içerik dizini + kişisel notlar. Türkçe karakter ve büyük/küçük harf duyarsız.
import { normTitle, slugify, type Content } from './content';
import type { Item, LocalRecord, Note } from './types';

export interface Hit { kind: 'item' | 'note'; id: string; title: string; snippet: string; score: number; section?: { id: string; title: string }; item?: Item }

const fold = (s: string) => slugify(s).replace(/-/g, ' ');

function snippetOf(text: string, terms: string[]) {
  const f = fold(text);
  let pos = -1;
  for (const t of terms) { pos = f.indexOf(t); if (pos >= 0) break; }
  if (pos < 0) return text.slice(0, 160);
  // fold() uzunluğu korumaz; yaklaşık konum yeterli
  const ratio = text.length / Math.max(1, f.length);
  const start = Math.max(0, Math.floor(pos * ratio) - 60);
  return (start ? '…' : '') + text.slice(start, start + 200) + '…';
}

export function search(c: Content, notes: LocalRecord<Note>[], q: string, types?: Set<string>): Hit[] {
  const terms = fold(q).split(' ').filter((t) => t.length > 1);
  if (!terms.length) return [];
  const hits: Hit[] = [];
  const qn = normTitle(q);
  for (const it of [...c.items, ...c.planned]) {
    if (types && types.size && !types.has(it.type)) continue;
    const title = fold([it.title, it.title_en || '', ...it.aliases].join(' '));
    const tags = fold(it.tags.join(' '));
    const body = fold(it.summary + ' ' + it.text);
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 10;
      if (tags.includes(t)) score += 4;
      if (body.includes(t)) score += 1 + Math.min(4, body.split(t).length - 1) * 0.5;
      else if (!title.includes(t) && !tags.includes(t)) { score = 0; break; } // tüm terimler geçmeli
    }
    if ([it.title, it.title_en, ...it.aliases].some((x) => x && normTitle(x) === qn)) score += 30;
    if (!score) continue;
    if (it.planned) score *= 0.3;
    const section = it.sections.find((s) => terms.every((t) => fold(s.title).includes(t)));
    hits.push({ kind: 'item', id: it.id, title: it.title, snippet: snippetOf(it.summary + ' ' + it.text, terms), score, section, item: it });
  }
  if (!types || !types.size || types.has('note')) {
    for (const n of notes) {
      const t = fold(n.data.title || '');
      const b = fold(n.data.body + ' ' + (n.data.tags || []).join(' '));
      let score = 0;
      for (const term of terms) {
        if (t.includes(term)) score += 10;
        else if (b.includes(term)) score += 2;
        else { score = 0; break; }
      }
      if (score) hits.push({ kind: 'note', id: n.id, title: n.data.title || '(başlıksız)', snippet: snippetOf(n.data.body, terms), score });
    }
  }
  return hits.sort((a, b) => b.score - a.score);
}

/** Harici arama kaynakları: yalnızca arama sayfası bağlantıları üretilir; sonuç uydurulmaz. */
export function externalSearches(q: string) {
  const e = encodeURIComponent(q);
  return [
    { name: 'arXiv', url: `https://arxiv.org/search/?query=${e}&searchtype=all` },
    { name: 'Semantic Scholar', url: `https://www.semanticscholar.org/search?q=${e}` },
    { name: 'Google Scholar', url: `https://scholar.google.com/scholar?q=${e}` },
    { name: 'Hugging Face', url: `https://huggingface.co/search/full-text?q=${e}` },
    { name: 'GitHub', url: `https://github.com/search?q=${e}&type=repositories` },
    { name: 'Stack Overflow', url: `https://stackoverflow.com/search?q=${e}` },
    { name: 'Web', url: `https://duckduckgo.com/?q=${e}` },
  ];
}
