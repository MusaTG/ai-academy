// Kişisel veri deposu: notlar, ilerleme, yer imleri, ayarlar, grafik geri bildirimi...
// Kayıtlar önce IndexedDB'ye yazılır (çevrimdışı çalışır), sonra arka planda sunucuya eşitlenir.
import { useSyncExternalStore } from 'react';
import { db } from './db';
import type { LocalRecord } from './types';

const cache = new Map<string, LocalRecord>();
const listeners = new Set<() => void>();
let snapshot = 0;
let loaded: Promise<void> | null = null;

export const keyOf = (collection: string, id: string) => `${collection}/${id}`;

function emit() {
  snapshot++;
  for (const l of listeners) l();
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function loadStore(): Promise<void> {
  if (!loaded) {
    loaded = (async () => {
      const all = await (await db()).getAll('records');
      for (const r of all) cache.set(r.key, r);
      emit();
    })();
  }
  return loaded;
}

export function _resetStoreForTests() {
  cache.clear();
  loaded = null;
}

export function getRecord<T = any>(collection: string, id: string): LocalRecord<T> | undefined {
  return cache.get(keyOf(collection, id));
}

export function getData<T = any>(collection: string, id: string): T | undefined {
  const r = cache.get(keyOf(collection, id));
  return r && !r.deleted ? (r.data as T) : undefined;
}

export function list<T = any>(collection: string, includeDeleted = false): LocalRecord<T>[] {
  const out: LocalRecord<T>[] = [];
  for (const r of cache.values()) if (r.collection === collection && (includeDeleted || !r.deleted)) out.push(r);
  return out;
}

export function allRecords(): LocalRecord[] {
  return [...cache.values()];
}

export function dirtyRecords(): LocalRecord[] {
  return [...cache.values()].filter((r) => r.dirty);
}

let onLocalChange: (() => void) | null = null;
export function setOnLocalChange(fn: () => void) {
  onLocalChange = fn;
}

const HISTORY_COLLECTIONS = new Set(['notes']);
const MAX_REVISIONS = 50;

async function writeRecord(rec: LocalRecord, revision: boolean) {
  const d = await db();
  const tx = d.transaction(['records', 'revisions'], 'readwrite');
  await tx.objectStore('records').put(rec);
  if (revision && HISTORY_COLLECTIONS.has(rec.collection)) {
    const store = tx.objectStore('revisions');
    await store.add({ key: rec.key, data: rec.data, deleted: rec.deleted, at: rec.updated_at });
    const keys = await store.index('by_key').getAllKeys(rec.key);
    for (const k of keys.slice(0, Math.max(0, keys.length - MAX_REVISIONS))) await store.delete(k);
  }
  await tx.done;
}

/** Yerel değişiklik: kaydı yazar ve "gönderilecek" olarak işaretler. */
export async function put<T = any>(collection: string, id: string, data: T): Promise<LocalRecord<T>> {
  await loadStore();
  const key = keyOf(collection, id);
  const prev = cache.get(key);
  const rec: LocalRecord<T> = {
    key, collection, id, data, version: prev?.version ?? 0, deleted: false, dirty: true, updated_at: new Date().toISOString(),
  };
  cache.set(key, rec);
  emit();
  await writeRecord(rec, true);
  onLocalChange?.();
  return rec;
}

export async function patch<T extends object>(collection: string, id: string, partial: Partial<T>, defaults: T): Promise<void> {
  const cur = getData<T>(collection, id) ?? defaults;
  await put(collection, id, { ...cur, ...partial });
}

/** Silme = tombstone. Kayıt "silindi" olarak eşitlenir; içerik sürüm geçmişinde kalır. */
export async function remove(collection: string, id: string): Promise<void> {
  await loadStore();
  const key = keyOf(collection, id);
  const prev = cache.get(key);
  if (!prev) return;
  const rec = { ...prev, deleted: true, dirty: true, updated_at: new Date().toISOString() };
  cache.set(key, rec);
  emit();
  await writeRecord(rec, true);
  onLocalChange?.();
}

/** Eşitleme motorunun kullandığı ham yazma (dirty bayrağını kendisi belirler). */
export async function putRaw(rec: LocalRecord, revision = false): Promise<void> {
  cache.set(rec.key, rec);
  emit();
  await writeRecord(rec, revision);
}

export async function revisionsOf(collection: string, id: string) {
  const d = await db();
  const rows = await d.getAllFromIndex('revisions', 'by_key', keyOf(collection, id));
  return rows.reverse();
}

/** React kancası: depo değiştikçe bileşeni yeniden çizer. */
export function useStore<T>(selector: () => T): T {
  const ver = useSyncExternalStore(subscribe, () => snapshot);
  // snapshot değiştiğinde seçici yeniden çalışır; seçiciler ucuzdur (bellek içi veri)
  void ver;
  return selector();
}

export function useCollection<T = any>(collection: string): LocalRecord<T>[] {
  return useStore(() => list<T>(collection));
}

export function useData<T = any>(collection: string, id: string): T | undefined {
  return useStore(() => getData<T>(collection, id));
}
