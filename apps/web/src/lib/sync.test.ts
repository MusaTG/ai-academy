// Eşitleme motoru birim testleri: bellek içi sahte sunucu, sunucunun gerçek kurallarını (sürüm, çakışma, tombstone) taklit eder.
import { beforeEach, describe, expect, it } from 'vitest';
import { _resetForTests, setMeta } from './db';
import { _resetStoreForTests, getRecord, list, loadStore, put, remove } from './store';
import { _setFetchForTests, listConflicts, resolveConflict, syncNow } from './sync';

type Rec = { collection: string; id: string; version: number; deleted: boolean; data: any; seq: number; updated_at: string; device_id: string };

function fakeServer() {
  const recs = new Map<string, Rec>();
  let seq = 0;
  let down = false;
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    if (down) throw new TypeError('Failed to fetch');
    const u = new URL(url, 'http://x');
    if (u.pathname.endsWith('/sync/push')) {
      const body = JSON.parse(String(init!.body));
      const results = body.changes.map((ch: any) => {
        const k = `${ch.collection}/${ch.id}`;
        const cur = recs.get(k);
        if (cur && cur.version !== ch.base_version) return { collection: ch.collection, id: ch.id, status: 'conflict', server: cur };
        const next: Rec = { collection: ch.collection, id: ch.id, version: (cur?.version || 0) + 1, deleted: ch.deleted, data: ch.deleted ? cur?.data || {} : ch.data, seq: ++seq, updated_at: new Date().toISOString(), device_id: body.device_id };
        recs.set(k, next);
        return { collection: ch.collection, id: ch.id, status: 'ok', version: next.version, seq: next.seq };
      });
      return new Response(JSON.stringify({ results, cursor: seq }));
    }
    if (u.pathname.endsWith('/sync/pull')) {
      const since = Number(u.searchParams.get('since'));
      const changes = [...recs.values()].filter((r) => r.seq > since).sort((a, b) => a.seq - b.seq);
      return new Response(JSON.stringify({ changes, cursor: changes.at(-1)?.seq ?? since, has_more: false }));
    }
    return new Response('{}', { status: 404 });
  }) as unknown as typeof fetch;
  return {
    recs, fetchImpl, setDown: (v: boolean) => { down = v; },
    /** Başka bir cihazın yazması */
    otherDevice(collection: string, id: string, data: any, deleted = false) {
      const k = `${collection}/${id}`;
      const cur = recs.get(k);
      recs.set(k, { collection, id, version: (cur?.version || 0) + 1, deleted, data: deleted ? cur?.data : data, seq: ++seq, updated_at: new Date().toISOString(), device_id: 'other' });
    },
  };
}

let srv: ReturnType<typeof fakeServer>;

beforeEach(async () => {
  await _resetForTests();
  _resetStoreForTests();
  await loadStore();
  srv = fakeServer();
  _setFetchForTests(srv.fetchImpl);
  await setMeta('auth', { apiUrl: '', token: 't', username: 'u' });
  await setMeta('cursor', 0);
});

describe('eşitleme', () => {
  it('çevrimdışı yazılan not bağlantı gelince gönderilir', async () => {
    srv.setDown(true);
    await put('notes', 'n1', { title: 'offline', body: 'x' });
    await syncNow();
    expect(getRecord('notes', 'n1')!.dirty).toBe(true); // veri kaybolmadı, bekliyor
    srv.setDown(false);
    await syncNow();
    expect(getRecord('notes', 'n1')!.dirty).toBe(false);
    expect(srv.recs.get('notes/n1')!.data.body).toBe('x');
  });

  it('diğer cihazdaki değişiklik çekilir', async () => {
    srv.otherDevice('notes', 'n2', { title: 'telefondan', body: 'merhaba' });
    await syncNow();
    expect(list('notes').map((r) => r.data.title)).toContain('telefondan');
  });

  it('aynı not iki cihazda değişirse çakışma oluşur, yerel veri korunur ve birleştirilebilir', async () => {
    await put('notes', 'n3', { title: 't', body: 'v1', tags: [], links: [] });
    await syncNow();
    srv.otherDevice('notes', 'n3', { title: 't', body: 'TELEFON', tags: ['a'], links: [] });
    await put('notes', 'n3', { title: 't', body: 'LAPTOP', tags: ['b'], links: [] });
    await syncNow();
    const conflicts = await listConflicts();
    expect(conflicts).toHaveLength(1);
    expect(getRecord('notes', 'n3')!.data.body).toBe('LAPTOP'); // sessizce ezilmedi
    expect(srv.recs.get('notes/n3')!.data.body).toBe('TELEFON'); // sunucu da ezilmedi
    await resolveConflict(conflicts[0].key, 'merge');
    await syncNow();
    const merged = srv.recs.get('notes/n3')!.data;
    expect(merged.body).toContain('LAPTOP');
    expect(merged.body).toContain('TELEFON');
    expect(merged.tags.sort()).toEqual(['a', 'b']);
    expect(await listConflicts()).toHaveLength(0);
  });

  it('"diğer sürümü al" sunucu sürümünü uygular', async () => {
    await put('notes', 'n4', { body: 'v1' });
    await syncNow();
    srv.otherDevice('notes', 'n4', { body: 'sunucu' });
    await put('notes', 'n4', { body: 'yerel' });
    await syncNow();
    await resolveConflict((await listConflicts())[0].key, 'server');
    expect(getRecord('notes', 'n4')!.data.body).toBe('sunucu');
    expect(getRecord('notes', 'n4')!.dirty).toBe(false);
  });

  it('silme tombstone olarak iki yönde yayılır', async () => {
    await put('notes', 'n5', { body: 'sil' });
    await syncNow();
    await remove('notes', 'n5');
    await syncNow();
    expect(srv.recs.get('notes/n5')!.deleted).toBe(true);
    srv.otherDevice('notes', 'n6', { body: 'x' });
    await syncNow();
    srv.otherDevice('notes', 'n6', null, true);
    await syncNow();
    expect(getRecord('notes', 'n6')!.deleted).toBe(true);
    expect(list('notes').map((r) => r.id)).not.toContain('n6');
  });
});
