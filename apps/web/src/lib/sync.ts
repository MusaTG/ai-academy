// Eşitleme motoru (Senaryo 6).
//
// Akış: yerel değişiklikleri gönder (push) → sunucudaki yenileri çek (pull).
// - Her kayıt, bildiği son sunucu sürümüyle (version) gönderilir. Sunucu farklı bir sürümde
//   ise "conflict" döner; yerel veri DEĞİŞTİRİLMEZ, iki sürüm çakışma listesine yazılır ve
//   kullanıcı seçer (benimki / sunucudaki / ikisini birleştir). Hiçbir veri sessizce kaybolmaz.
// - Çekilen bir değişiklik, yerelde gönderilmemiş bir değişikliğin üzerine yazılmaz; çakışma olur.
// - Silme bir tombstone'dur ve diğer cihazlara "silindi" olarak ulaşır.
// - Ağ hatasında veri yerelde kalır; üstel bekleme ile tekrar denenir, bağlantı gelince hemen denenir.
import { db, getMeta, setMeta } from './db';
import { allRecords, getRecord, keyOf, putRaw, setOnLocalChange } from './store';
import type { Conflict, LocalRecord } from './types';

export interface Auth { apiUrl: string; token: string; username: string }
export type SyncState = {
  status: 'local-only' | 'idle' | 'syncing' | 'offline' | 'error';
  lastSync: string | null; lastError: string | null; pending: number; conflicts: number; nextRetryAt: number | null;
};

let state: SyncState = { status: 'local-only', lastSync: null, lastError: null, pending: 0, conflicts: 0, nextRetryAt: null };
const listeners = new Set<(s: SyncState) => void>();
let running: Promise<void> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let debounce: ReturnType<typeof setTimeout> | null = null;
let failures = 0;
let fetchImpl: typeof fetch = (...a) => fetch(...a);

export function _setFetchForTests(f: typeof fetch) { fetchImpl = f; }
export function getSyncState() { return state; }
export function onSyncState(l: (s: SyncState) => void) { listeners.add(l); l(state); return () => { listeners.delete(l); }; }

function setState(p: Partial<SyncState>) {
  state = { ...state, ...p };
  for (const l of listeners) l(state);
}

export async function getAuth(): Promise<Auth | null> { return getMeta<Auth | null>('auth', null); }

export async function deviceId(): Promise<string> {
  let id = await getMeta<string | null>('deviceId', null);
  if (!id) {
    id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
    await setMeta('deviceId', id);
  }
  return id;
}

export function apiBase(apiUrl: string) {
  return (apiUrl || '').replace(/\/$/, '') + '/api';
}

async function call(auth: Auth | null, apiUrl: string, path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) headers.authorization = `Bearer ${auth.token}`;
  const res = await fetchImpl(apiBase(apiUrl) + path, { ...init, headers: { ...headers, ...(init.headers as any) } });
  if (!res.ok) {
    let msg = `${res.status}`;
    try { msg = (await res.json()).detail || msg; } catch { /* yanıt JSON değil */ }
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function checkServer(apiUrl: string) {
  return call(null, apiUrl, '/health');
}

export async function login(apiUrl: string, username: string, password: string, register: boolean): Promise<Auth> {
  const out = await call(null, apiUrl, register ? '/auth/register' : '/auth/login', {
    method: 'POST', body: JSON.stringify({ username, password, device_name: navigator.userAgent.slice(0, 100) }),
  });
  const auth = { apiUrl, token: out.token, username: out.username };
  await setMeta('auth', auth);
  // Yeni hesapta tüm yerel kayıtlar gönderilir; imleç sıfırdan başlar
  await setMeta('cursor', 0);
  setState({ status: 'idle', lastError: null });
  void syncNow();
  return auth;
}

export async function logout(keepLocal = true) {
  const auth = await getAuth();
  if (auth) await call(auth, auth.apiUrl, '/auth/logout', { method: 'POST' }).catch(() => undefined);
  await setMeta('auth', null);
  if (!keepLocal) {
    /* yerel veri bilinçli olarak silinmez; kullanıcı Veri Koruma sayfasından dışa aktarabilir */
  }
  // Sunucu sürümleri bu cihazda artık anlamsız: kayıtlar bir sonraki hesapta yeni gibi gönderilir
  for (const r of allRecords()) await putRaw({ ...r, version: 0, dirty: !r.deleted || r.dirty });
  setState({ status: 'local-only', lastSync: null });
}

export async function listConflicts(): Promise<Conflict[]> {
  return (await db()).getAll('conflicts');
}

async function refreshCounts() {
  const conflicts = (await listConflicts()).length;
  setState({ pending: allRecords().filter((r) => r.dirty).length, conflicts });
}

const sameData = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

async function recordConflict(local: LocalRecord, server: Conflict['server']) {
  await (await db()).put('conflicts', { key: local.key, collection: local.collection, id: local.id, local, server });
}

async function push(auth: Auth) {
  const dirty = allRecords().filter((r) => r.dirty);
  const conflictKeys = new Set((await listConflicts()).map((c) => c.key));
  const toSend = dirty.filter((r) => !conflictKeys.has(r.key));
  const dev = await deviceId();
  for (let i = 0; i < toSend.length; i += 200) {
    const batch = toSend.slice(i, i + 200);
    const out = await call(auth, auth.apiUrl, '/sync/push', {
      method: 'POST',
      body: JSON.stringify({ device_id: dev, changes: batch.map((r) => ({ collection: r.collection, id: r.id, base_version: r.version, deleted: r.deleted, data: r.deleted ? {} : r.data })) }),
    });
    for (const res of out.results as any[]) {
      const sent = batch.find((r) => r.collection === res.collection && r.id === res.id)!;
      const now = getRecord(res.collection, res.id)!;
      if (res.status === 'ok') {
        // Gönderim sırasında kullanıcı tekrar düzenlediyse dirty kalır (yeni sürümle tekrar gönderilir)
        const unchanged = now.updated_at === sent.updated_at;
        await putRaw({ ...now, version: res.version, dirty: !unchanged });
      } else if (res.status === 'conflict') {
        const srv = res.server;
        if (sameData(srv.data, sent.data) && srv.deleted === sent.deleted) {
          await putRaw({ ...now, version: srv.version, dirty: now.updated_at !== sent.updated_at });
        } else {
          await recordConflict(now, { version: srv.version, deleted: srv.deleted, data: srv.data, updated_at: srv.updated_at, device_id: srv.device_id });
        }
      } else {
        setState({ lastError: `${res.collection}/${res.id}: ${res.error}` });
      }
    }
  }
}

async function pull(auth: Auth) {
  let cursor = await getMeta<number>('cursor', 0);
  for (let guard = 0; guard < 1000; guard++) {
    const out = await call(auth, auth.apiUrl, `/sync/pull?since=${cursor}&limit=500`);
    for (const ch of out.changes as any[]) {
      const key = keyOf(ch.collection, ch.id);
      const local = getRecord(ch.collection, ch.id);
      const incoming: LocalRecord = { key, collection: ch.collection, id: ch.id, data: ch.deleted && local ? local.data : ch.data, version: ch.version, deleted: ch.deleted, dirty: false, updated_at: ch.updated_at };
      if (!local) { await putRaw(incoming, true); continue; }
      if (ch.version <= local.version) continue; // zaten biliniyor (kendi yazdığımız)
      if (local.dirty) {
        if (sameData(local.data, ch.data) && local.deleted === ch.deleted) { await putRaw({ ...local, version: ch.version, dirty: false }); continue; }
        await recordConflict(local, { version: ch.version, deleted: ch.deleted, data: ch.data, updated_at: ch.updated_at, device_id: ch.device_id });
        continue;
      }
      await putRaw(incoming, true);
    }
    cursor = out.cursor;
    await setMeta('cursor', cursor);
    if (!out.has_more) break;
  }
}

let again = false;

export async function syncNow(): Promise<void> {
  // Eşitleme sürerken gelen istek kaybolmaz: mevcut tur bitince bir tur daha çalışır
  if (running) { again = true; return running.then(() => (again ? syncNow() : undefined)); }
  again = false;
  running = (async () => {
    const auth = await getAuth();
    await refreshCounts();
    if (!auth) { setState({ status: 'local-only' }); return; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { setState({ status: 'offline' }); return; }
    setState({ status: 'syncing' });
    try {
      await push(auth);
      await pull(auth);
      await push(auth); // çekme sırasında çözülen kayıtlar için
      failures = 0;
      setState({ status: 'idle', lastSync: new Date().toISOString(), lastError: null, nextRetryAt: null });
      await setMeta('lastSync', new Date().toISOString());
    } catch (e: any) {
      if (e?.status === 401) {
        await setMeta('auth', null);
        setState({ status: 'local-only', lastError: 'Oturum süresi doldu; tekrar giriş yapın. Yerel verileriniz korunuyor.' });
      } else {
        failures++;
        const delay = Math.min(5 * 60_000, 2000 * 2 ** Math.min(failures, 8));
        const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
        setState({ status: offline ? 'offline' : 'error', lastError: offline ? null : String(e?.message || e), nextRetryAt: Date.now() + delay });
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => void syncNow(), delay);
      }
    } finally {
      await refreshCounts();
    }
  })().finally(() => { running = null; });
  return running;
}

export type Resolution = 'local' | 'server' | 'merge';

/** Çakışma çözümü. 'merge' notlarda iki metni işaretli biçimde birleştirir; kullanıcı sonra düzenler. */
export async function resolveConflict(key: string, how: Resolution): Promise<void> {
  const d = await db();
  const c = await d.get('conflicts', key);
  if (!c) return;
  const cur = getRecord(c.collection, c.id) ?? c.local;
  if (how === 'server') {
    await putRaw({ ...cur, data: c.server.deleted ? cur.data : c.server.data, deleted: c.server.deleted, version: c.server.version, dirty: false, updated_at: c.server.updated_at }, true);
  } else if (how === 'local') {
    await putRaw({ ...cur, version: c.server.version, dirty: true, updated_at: new Date().toISOString() }, true);
  } else {
    const a = cur.data || {};
    const b = c.server.data || {};
    const merged = typeof a.body === 'string' && typeof b.body === 'string'
      ? { ...b, ...a, body: `${a.body}\n\n---\n> **Diğer cihazdaki sürüm (birleştirildi):**\n\n${b.body}`, tags: [...new Set([...(a.tags || []), ...(b.tags || [])])], links: [...new Set([...(a.links || []), ...(b.links || [])])] }
      : { ...b, ...a };
    await putRaw({ ...cur, data: merged, deleted: false, version: c.server.version, dirty: true, updated_at: new Date().toISOString() }, true);
  }
  await d.delete('conflicts', key);
  await refreshCounts();
  void syncNow();
}

export function startSync() {
  setOnLocalChange(() => {
    void refreshCounts();
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => void syncNow(), 1500);
  });
  window.addEventListener('online', () => { failures = 0; void syncNow(); });
  window.addEventListener('offline', () => setState({ status: 'offline' }));
  setInterval(() => void syncNow(), 60_000);
  void getMeta<string | null>('lastSync', null).then((ls) => setState({ lastSync: ls }));
  void syncNow();
}
