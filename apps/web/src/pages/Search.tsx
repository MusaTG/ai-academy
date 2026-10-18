import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { itemHref, StatusBadge, TypeBadge } from '../components/common';
import { typeLabel, useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';
import { externalSearches, search } from '../lib/search';
import { list, put, remove, useCollection } from '../lib/store';
import type { Note } from '../lib/types';

const PAGE = 20;

export function SearchPage() {
  const c = useContent();
  const { lang } = usePrefs();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const notes = useCollection<Note>('notes');
  const history = useCollection<{ q: string; at: string }>('search_history').sort((a, b) => b.data.at.localeCompare(a.data.at)).slice(0, 10);
  const hits = useMemo(() => search(c, notes, q, types), [c, notes, q, types]);
  useEffect(() => { setInput(q); setPage(1); }, [q]);
  useEffect(() => {
    if (q.trim().length < 2) return;
    const id = q.trim().toLowerCase().slice(0, 100).replace(/[^\p{L}\p{N}]+/gu, '-');
    if (!id) return;
    // Arama geçmişi (son 30 kayıt) — kişisel veri olarak eşitlenir
    void put('search_history', id, { q: q.trim(), at: new Date().toISOString() });
    const old = list<{ at: string }>('search_history').sort((a, b) => b.data.at.localeCompare(a.data.at)).slice(30);
    void Promise.all(old.map((o) => remove('search_history', o.id)));
  }, [q]);
  const allTypes = [...new Set(c.items.map((i) => i.type)), 'note'];

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Search Center</div>
        <h1>{lang === 'en' ? 'Search' : 'Arama'}</h1>
        <form onSubmit={(e) => { e.preventDefault(); setParams(input.trim() ? { q: input.trim() } : {}); }} className="row">
          <input className="input" style={{ flex: 1, minWidth: 200 }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="ör. fraud, Kalman, mAP, FDE" aria-label="Arama" autoFocus />
          <button className="btn primary">Ara</button>
        </form>
        <p className="small muted">Yerel arama çevrimdışı da çalışır: içerik dizini ve notlarınızda Türkçe karakter duyarsız arar.</p>
      </div>
      <div className="row small" style={{ marginBottom: '1rem' }}>
        {allTypes.map((t) => <button key={t} className={`btn sm${types.has(t) ? ' on' : ''}`} onClick={() => { const n = new Set(types); if (n.has(t)) n.delete(t); else n.add(t); setTypes(n); setPage(1); }}>{t === 'note' ? 'Notlar' : typeLabel(c, t, lang)}</button>)}
      </div>
      {q && <p className="small muted">“{q}” için {hits.length} sonuç</p>}
      <div className="stack">
        {hits.slice(0, page * PAGE).map((h) => (
          <div key={h.kind + h.id} className="card" style={{ padding: '.7rem 1rem' }}>
            <div className="row">{h.kind === 'note' ? <TypeBadge type="note" /> : <><TypeBadge type={h.item!.type} /><StatusBadge item={h.item!} /></>}
              <Link to={h.kind === 'note' ? `/notes/${h.id}` : itemHref(h.id, h.section?.id)}><b>{h.title}</b></Link>
              {h.section && <Link className="chip" to={itemHref(h.id, h.section.id)}>§ {h.section.title}</Link>}</div>
            <p className="small muted" style={{ margin: '.3rem 0 0' }}>{h.snippet}</p>
          </div>
        ))}
      </div>
      {hits.length > page * PAGE && <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setPage(page + 1)}>Daha fazla göster</button>}
      {q && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Harici kaynaklarda ara</h3>
          <p className="small muted">Bu bağlantılar ilgili sitenin arama sayfasını açar; sonuçları uygulama üretmez. Çevrimdışıyken çalışmaz.</p>
          <div className="row">{externalSearches(q).map((e) => <a key={e.name} className="btn sm" href={e.url} target="_blank" rel="noopener noreferrer">{e.name} ↗</a>)}</div>
        </div>
      )}
      {!q && history.length > 0 && <div className="card"><h3>Son aramalar</h3><div className="row">{history.map((h) => <Link key={h.id} className="chip" to={`/search?q=${encodeURIComponent(h.data.q)}`}>{h.data.q}</Link>)}</div></div>}
    </div>
  );
}
