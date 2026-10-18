// IndexedDB katmanı. Tüm kişisel veri ve indirilen içerik cihazda burada tutulur;
// tarayıcı kapanıp açıldığında korunur. Sunucu (varsa) yalnızca eşitleme ve yedek içindir.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Conflict, ItemBody, LocalRecord } from './types';

interface AcademyDB extends DBSchema {
  records: { key: string; value: LocalRecord; indexes: { by_collection: string } };
  conflicts: { key: string; value: Conflict };
  content: { key: string; value: { id: string; hash: string; body: ItemBody; downloaded: boolean; saved_at: string } };
  revisions: { key: number; value: { key: string; data: any; deleted: boolean; at: string }; indexes: { by_key: string } };
  meta: { key: string; value: any };
}

let dbp: Promise<IDBPDatabase<AcademyDB>> | null = null;

export function db(): Promise<IDBPDatabase<AcademyDB>> {
  if (!dbp) {
    dbp = openDB<AcademyDB>('engineering-academy', 1, {
      upgrade(d) {
        const r = d.createObjectStore('records', { keyPath: 'key' });
        r.createIndex('by_collection', 'collection');
        d.createObjectStore('conflicts', { keyPath: 'key' });
        d.createObjectStore('content', { keyPath: 'id' });
        const rev = d.createObjectStore('revisions', { autoIncrement: true });
        rev.createIndex('by_key', 'key');
        d.createObjectStore('meta');
      },
    });
  }
  return dbp;
}

export async function getMeta<T = any>(key: string, fallback: T): Promise<T> {
  const v = await (await db()).get('meta', key);
  return v === undefined ? fallback : (v as T);
}

export async function setMeta(key: string, value: any): Promise<void> {
  await (await db()).put('meta', value, key);
}

/** Tarayıcıdan verinin kendiliğinden silinmemesini ister (destekleniyorsa). */
export async function requestPersistence(): Promise<{ persisted: boolean | null; usage?: number; quota?: number }> {
  if (!navigator.storage) return { persisted: null };
  let persisted: boolean | null = null;
  try {
    persisted = (await navigator.storage.persisted?.()) ?? null;
    if (persisted === false) persisted = (await navigator.storage.persist?.()) ?? false;
  } catch { persisted = null; }
  const est = await navigator.storage.estimate?.().catch(() => undefined);
  return { persisted, usage: est?.usage, quota: est?.quota };
}

// Testlerde temiz başlangıç için
export async function _resetForTests() {
  if (dbp) (await dbp).close();
  dbp = null;
  await new Promise<void>((res) => { const r = indexedDB.deleteDatabase('engineering-academy'); r.onsuccess = r.onerror = r.onblocked = () => res(); });
}
