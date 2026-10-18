import { beforeEach, describe, expect, it } from 'vitest';
import index from '../../public/content/index.json';
import { buildContent } from './content';
import { _resetForTests } from './db';
import { buildGraph, neighborhood } from './graph';
import { backlinks, emptyNote, parseWikilinks, resolveLink, suggestRelations } from './notes';
import { search } from './search';
import { _resetStoreForTests, list, loadStore, put } from './store';
import type { ContentBundle, Note } from './types';

const c = buildContent(index as unknown as ContentBundle, 'network');

beforeEach(async () => {
  await _resetForTests();
  _resetStoreForTests();
  await loadStore();
});

describe('notlar ve bağlantılar', () => {
  it('[[wikilink]] sözdizimi: hedef, bölüm ve takma ad', () => {
    expect(parseWikilinks('a [[IoU#math|kesişim]] b [[Object Detection]]\n```\n[[kod içinde]]\n```')).toEqual([
      { target: 'IoU', section: 'math', alias: 'kesişim' }, { target: 'Object Detection', section: undefined, alias: undefined },
    ]);
  });

  it('bağlantılar Türkçe karakter ve büyük/küçük harf duyarsız çözülür; yoksa boş bağlantıdır', () => {
    expect(resolveLink(c, 'anomali tespiti', [])).toEqual({ kind: 'item', id: 'anomaly-detection' });
    expect(resolveLink(c, 'Bankacılık', [])).toEqual({ kind: 'item', id: 'banking' });
    expect(resolveLink(c, 'Yok Böyle Bir Şey', [])).toEqual({ kind: 'missing', title: 'Yok Böyle Bir Şey' });
  });

  it('backlink: nottaki bağlantı hedef sayfada görünür (Senaryo 4)', async () => {
    await put('notes', 'n1', emptyNote({ title: 'Deney', body: 'Bkz. [[Object Detection]] ve [[Benim notum]]' }));
    await put('notes', 'n2', emptyNote({ title: 'Benim notum', body: '' }));
    expect(backlinks(c, { kind: 'item', id: 'object-detection' }).map((n) => n.id)).toEqual(['n1']);
    expect(backlinks(c, { kind: 'note', id: 'n2' }).map((n) => n.id)).toEqual(['n1']);
  });

  it('Focal Loss notu için ilişki önerileri (onay bekler, otomatik eklenmez)', async () => {
    const note: Note = emptyNote({ title: 'Focal Loss', body: 'Sınıf dengesizliğinde kullanılır.', links: ['focal-loss'] });
    await put('notes', 'f', note);
    const ids = suggestRelations(c, 'f', note).map((s) => s.id);
    for (const id of ['class-imbalance', 'object-detection', 'cross-entropy']) expect(ids).toContain(id);
    expect(list<Note>('notes')[0].data.links).toEqual(['focal-loss']);
  });
});

describe('grafik ve arama', () => {
  it('Anomaly Detection düğümü sektörlerle bağlı (Senaryo 3)', () => {
    const g = buildGraph(c, []);
    const n = neighborhood(g, 'anomaly-detection', 1);
    for (const s of ['banking', 'manufacturing', 'cybersecurity', 'healthcare']) expect(n.has(s)).toBe(true);
  });

  it('yerel arama Türkçe karakterden bağımsız çalışır', () => {
    const hits = search(c, [], 'bankacilik');
    expect(hits[0].id).toBe('banking');
  });
});
