// İçerik katmanı: content/index.json (katalog + arama + grafik) ve ders gövdeleri.
// Çevrimdışı: dizin IndexedDB'ye kopyalanır; indirilen dersler IndexedDB'de saklanır.
// Uygulamanın açılması için hiçbir API çağrısı gerekmez.
import { useEffect, useState } from 'react';
import { db, getMeta, setMeta } from './db';
import type { ContentBundle, Item, ItemBody } from './types';

export function slugify(s: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return String(s).toLowerCase().replace(/[çğıİöşüâîû]/g, (c) => map[c] || c)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export const normTitle = (s: string) => slugify(s).replace(/-/g, '');

export interface Content {
  bundle: ContentBundle;
  items: Item[]; // gerçek içerik
  planned: Item[]; // catalog.yaml: kapsamda ama içeriği yok
  byId: Map<string, Item>;
  titleIndex: Map<string, string>;
  incoming: Map<string, { from: string; edge: string }[]>;
  linkedFrom: Map<string, string[]>; // içerik gövdelerindeki [[bağlantı]]ların tersi
  source: 'network' | 'cache';
}

let current: Content | null = null;
const subs = new Set<(c: Content) => void>();

function plannedItem(e: { id: string; title: string; title_en?: string; group?: string }, type: string): Item {
  return {
    id: e.id, type, title: e.title, title_en: e.title_en || null, summary: 'Kapsamda — içerik henüz yazılmadı.', summary_en: 'In scope — content not written yet.',
    status: 'planned', declaredStatus: 'planned', coverage: { required: 0, present: 0, missing: [] }, level: null, duration: null, group: e.group || null,
    order: null, tags: [], aliases: [], alt_titles: [], relations: {}, links: [], sources: [], last_verified: null, version: 0, hash: '', file: 'content/catalog.yaml',
    sections: [], code: [], hasQuiz: false, steps: null, tests: null, text: '', bytes: 0, planned: true,
  };
}

export function buildContent(bundle: ContentBundle, source: Content['source']): Content {
  const items = bundle.items;
  const byId = new Map(items.map((i) => [i.id, i]));
  const planned = [
    ...(bundle.catalog?.sectors || []).filter((e) => !byId.has(e.id)).map((e) => plannedItem(e, 'sector')),
    ...(bundle.catalog?.careers || []).filter((e) => !byId.has(e.id)).map((e) => plannedItem(e, 'career')),
  ];
  for (const p of planned) byId.set(p.id, p);
  const titleIndex = new Map<string, string>();
  for (const it of items) for (const t of [it.id, it.title, it.title_en, ...it.aliases].filter(Boolean) as string[]) {
    const k = normTitle(t);
    if (!titleIndex.has(k)) titleIndex.set(k, it.id);
  }
  const incoming = new Map<string, { from: string; edge: string }[]>();
  const linkedFrom = new Map<string, string[]>();
  for (const it of items) {
    for (const [edge, targets] of Object.entries(it.relations || {})) for (const t of targets) {
      if (!incoming.has(t)) incoming.set(t, []);
      incoming.get(t)!.push({ from: it.id, edge });
    }
    for (const t of it.links || []) {
      if (!linkedFrom.has(t)) linkedFrom.set(t, []);
      linkedFrom.get(t)!.push(it.id);
    }
  }
  return { bundle, items, planned, byId, titleIndex, incoming, linkedFrom, source };
}

function indexUrl() { return new URL('content/index.json', document.baseURI).toString(); }
function itemUrl(id: string) { return new URL(`content/items/${encodeURIComponent(id)}.json`, document.baseURI).toString(); }

export async function loadContent(): Promise<Content> {
  try {
    const res = await fetch(indexUrl(), { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    const bundle = (await res.json()) as ContentBundle;
    await setMeta('contentIndex', bundle);
    current = buildContent(bundle, 'network');
  } catch (e) {
    const cached = await getMeta<ContentBundle | null>('contentIndex', null);
    if (!cached) throw new Error('İçerik dizini yüklenemedi ve cihazda kayıtlı bir kopya yok. İlk açılış için internet bağlantısı gerekir.');
    current = buildContent(cached, 'cache');
  }
  for (const s of subs) s(current);
  return current;
}

export function getContent(): Content {
  if (!current) throw new Error('içerik yüklenmedi');
  return current;
}

export function useContent(): Content {
  const [c, setC] = useState(current);
  useEffect(() => { subs.add(setC); return () => { subs.delete(setC); }; }, []);
  return c!;
}

/** [[Hedef]] adını içerik id'sine çevirir: önce id, sonra başlık/takma ad (Türkçe karakter duyarsız). */
export function resolveItem(c: Content, target: string): string | null {
  const t = target.trim();
  if (c.byId.has(t)) return t;
  return c.titleIndex.get(normTitle(t)) || null;
}

export type BodyResult = { body: ItemBody; outdated: boolean; from: 'network' | 'device' };

export async function getItemBody(id: string): Promise<BodyResult> {
  const c = getContent();
  const it = c.byId.get(id);
  const d = await db();
  const stored = await d.get('content', id);
  if (stored && it && stored.hash === it.hash) return { body: stored.body, outdated: false, from: 'device' };
  try {
    const res = await fetch(itemUrl(id), { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    const body = (await res.json()) as ItemBody;
    // Açılan her ders cihazda önbelleğe alınır; "indirildi" bayrağı yalnızca kullanıcı isteğiyle konur
    await d.put('content', { id, hash: body.hash, body, downloaded: stored?.downloaded ?? false, saved_at: new Date().toISOString() });
    return { body, outdated: false, from: 'network' };
  } catch {
    if (stored) return { body: stored.body, outdated: !!it && stored.hash !== it.hash, from: 'device' };
    throw new Error('Bu ders cihaza indirilmemiş ve şu an internet bağlantısı yok.');
  }
}

export async function downloadItems(ids: string[], onProgress?: (done: number, total: number) => void) {
  const d = await db();
  let done = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      const res = await fetch(itemUrl(id), { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as ItemBody;
      await d.put('content', { id, hash: body.hash, body, downloaded: true, saved_at: new Date().toISOString() });
    } catch {
      failed.push(id);
    }
    onProgress?.(++done, ids.length);
  }
  return { failed };
}

export async function removeDownload(id: string) {
  await (await db()).delete('content', id);
}

export async function downloadState(): Promise<Map<string, { hash: string; downloaded: boolean; saved_at: string }>> {
  const all = await (await db()).getAll('content');
  return new Map(all.map((r) => [r.id, { hash: r.hash, downloaded: r.downloaded, saved_at: r.saved_at }]));
}

export function displayTitle(it: Item, lang: 'tr' | 'en') {
  return lang === 'en' && it.title_en ? it.title_en : it.title;
}
export function displaySummary(it: Item, lang: 'tr' | 'en') {
  return lang === 'en' && it.summary_en ? it.summary_en : it.summary;
}

export function typeLabel(c: Content, type: string, lang: 'tr' | 'en') {
  const t = c.bundle.itemTypes[type];
  return t ? (lang === 'en' ? t.label_en : t.label) : type;
}

export function edgeLabel(c: Content, edge: string, lang: 'tr' | 'en', inverse = false) {
  if (edge === 'links') return inverse ? (lang === 'en' ? 'Mentioned in' : 'Şurada bahsediliyor') : lang === 'en' ? 'Mentions' : 'Bahseder';
  if (edge === 'note') return lang === 'en' ? 'Mentioned in note' : 'Bu notta bahsedilir';
  const e = c.bundle.edgeTypes[edge];
  if (!e) return edge;
  return inverse ? e.inverse : lang === 'en' ? e.label_en : e.label;
}
