import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { itemHref, Tabs, TypeBadge } from '../components/common';
import { GraphView, KIND_STYLE, styleOf } from '../components/GraphView';
import { displayTitle, edgeLabel, normTitle, useContent } from '../lib/content';
import { buildGraph, duplicates, neighborhood, NOTE_PREFIX, orphans, type GEdge } from '../lib/graph';
import { usePrefs } from '../lib/prefs';
import { useCollection } from '../lib/store';
import type { Note } from '../lib/types';

const MAX_NODES = 260;

export function GraphPage() {
  const c = useContent();
  const { lang } = usePrefs();
  const notes = useCollection<Note>('notes');
  const [params, setParams] = useSearchParams();
  const focus = params.get('focus');
  const [selected, setSelected] = useState<string | null>(focus);
  const [depth, setDepth] = useState(focus ? 1 : 2);
  const [sector, setSector] = useState('');
  const [career, setCareer] = useState('');
  const [showNotes, setShowNotes] = useState(true);
  const [showPlanned, setShowPlanned] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const [labels, setLabels] = useState(true);
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState<'node' | 'orphans' | 'dupes'>('node');
  const edgeTypes = useMemo(() => [...Object.keys(c.bundle.edgeTypes), 'links'], [c]);
  const [allowed, setAllowed] = useState<Set<string>>(() => new Set([...Object.keys(c.bundle.edgeTypes), 'links']));

  const g = useMemo(() => buildGraph(c, showNotes ? notes : [], { includeLessons: showLessons, includePlanned: showPlanned }), [c, notes, showNotes, showLessons, showPlanned]);

  const { nodes, edges } = useMemo(() => {
    const centers = [focus, sector, career].filter(Boolean) as string[];
    let visible: Set<string>;
    if (centers.length) {
      visible = neighborhood(g, centers[0], depth, allowed);
      for (const cId of centers.slice(1)) {
        const other = neighborhood(g, cId, depth, allowed);
        visible = new Set([...visible].filter((x) => other.has(x) || centers.includes(x)));
      }
    } else {
      // Büyük grafikte her şeyi aynı anda çizmek yerine en bağlantılı düğümler (ve odak seçilince çevresi)
      const ranked = [...g.nodes].sort((a, b) => (g.adj.get(b.id)!.length - g.adj.get(a.id)!.length));
      visible = new Set(ranked.slice(0, MAX_NODES).map((n) => n.id));
    }
    const es: GEdge[] = g.edges.filter((e) => allowed.has(e.type) && visible.has(e.source) && visible.has(e.target));
    return { nodes: g.nodes.filter((n) => visible.has(n.id)), edges: es };
  }, [g, focus, sector, career, depth, allowed]);

  const highlight = useMemo(() => (selected && g.adj.has(selected) ? new Set([selected, ...g.adj.get(selected)!.filter((a) => allowed.has(a.type)).map((a) => a.other)]) : null), [selected, g, allowed]);

  const setFocus = (id: string | null) => {
    setSelected(id);
    if (id) setParams({ focus: id }); else setParams({});
  };
  const searchHits = query.trim().length > 1 ? g.nodes.filter((n) => normTitle(n.label).includes(normTitle(query)) || n.id.includes(query.toLowerCase())).slice(0, 8) : [];

  const sel = selected ? g.nodes.find((n) => n.id === selected) : null;
  const selItem = sel && !sel.note ? c.byId.get(sel.id) : null;
  const selRelations = useMemo(() => {
    if (!selected) return [] as [string, string[]][];
    const m = new Map<string, string[]>();
    for (const a of g.adj.get(selected) || []) {
      const label = a.type === 'mentioned_in_note' ? (a.dir === 'in' ? 'Notlarda bahsediliyor' : 'Bahsettiği içerik') : edgeLabel(c, a.type, lang, a.dir === 'in');
      m.set(label, [...(m.get(label) || []), a.other]);
    }
    return [...m.entries()];
  }, [selected, g, c, lang]);
  const orph = useMemo(() => orphans(g), [g]);
  const dupes = useMemo(() => duplicates(c, g), [c, g]);

  const nodeLink = (id: string) => {
    const n = g.nodes.find((x) => x.id === id);
    if (!n) return id;
    if (n.note) return <Link to={`/notes/${id.slice(NOTE_PREFIX.length)}`}>✎ {n.label}</Link>;
    if (n.planned) return <span className="muted">{n.label} <span className="badge planned">planlandı</span></span>;
    return <Link to={itemHref(id)}>{n.label}</Link>;
  };

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Knowledge Graph</div>
        <h1>{lang === 'en' ? 'Knowledge Graph' : 'Bilgi Grafiği'}</h1>
        <p className="lede">Kavramlar, sektörler, meslekler, tutorial'lar ve notlarınız arasındaki ilişkiler. Bir düğüme tıklayın: ilişkileri sağ panelde görünür; “Odakla” ile çevresini inceleyin.</p>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <label className="field" style={{ position: 'relative', minWidth: 220 }}>Düğüm ara
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ör. Anomaly Detection" data-testid="graph-search" />
            {searchHits.length > 0 && (
              <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 5, padding: '.3rem' }}>
                {searchHits.map((n) => <button key={n.id} className="btn ghost sm" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => { setFocus(n.id); setQuery(''); }}>{n.label}</button>)}
              </div>
            )}
          </label>
          <label className="field">Sektör
            <select value={sector} onChange={(e) => setSector(e.target.value)}><option value="">Tümü</option>{c.items.filter((i) => i.type === 'sector').map((s) => <option key={s.id} value={s.id}>{displayTitle(s, lang)}</option>)}</select>
          </label>
          <label className="field">Meslek
            <select value={career} onChange={(e) => setCareer(e.target.value)}><option value="">Tümü</option>{c.items.filter((i) => i.type === 'career').map((s) => <option key={s.id} value={s.id}>{displayTitle(s, lang)}</option>)}</select>
          </label>
          <label className="field">Derinlik
            <select value={depth} onChange={(e) => setDepth(Number(e.target.value))}>{[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d}</option>)}</select>
          </label>
          {focus && <button className="btn" onClick={() => setFocus(null)}>Odağı kaldır</button>}
        </div>
        <div className="row small" style={{ marginTop: '.6rem' }}>
          <label><input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} /> Notlar</label>
          <label><input type="checkbox" checked={showPlanned} onChange={(e) => setShowPlanned(e.target.checked)} /> Planlanmış alanlar</label>
          <label><input type="checkbox" checked={showLessons} onChange={(e) => setShowLessons(e.target.checked)} /> Dersler</label>
          <label><input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} /> Etiketler</label>
          <details>
            <summary>Bağlantı türleri ({allowed.size}/{edgeTypes.length})</summary>
            <div className="row" style={{ marginTop: '.4rem' }}>
              {edgeTypes.map((t) => (
                <label key={t} className="chip"><input type="checkbox" checked={allowed.has(t)} onChange={(e) => { const n = new Set(allowed); if (e.target.checked) n.add(t); else n.delete(t); setAllowed(n); }} /> {edgeLabel(c, t, lang)}</label>
              ))}
            </div>
          </details>
          <span className="muted">· {nodes.length} düğüm, {edges.length} bağlantı{!focus && !sector && !career && g.nodes.length > MAX_NODES ? ` (en bağlantılı ${MAX_NODES} gösteriliyor)` : ''}</span>
        </div>
      </div>
      <div className="graph-layout">
        <div className="graph-wrap">
          <GraphView nodes={nodes} edges={edges} focus={focus} highlight={highlight} onSelect={(id) => { setSelected(id); setPanel('node'); }} showLabels={labels} />
          <div className="graph-legend">
            {Object.entries(KIND_STYLE).map(([k, s]) => <span key={k}><svg width="12" height="12"><rect width="12" height="12" rx={s.shape === 'circle' ? 6 : 1} fill={s.color} transform={s.shape === 'diamond' ? 'rotate(45 6 6) scale(.8) translate(1.5 1.5)' : undefined} /></svg> {s.label}</span>)}
            <span><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill={styleOf('x').color} /></svg> {styleOf('x').label}</span>
            <span>┄ bahsetme · — tipli ilişki</span>
          </div>
        </div>
        <aside className="card" style={{ alignSelf: 'start' }} data-testid="graph-panel">
          <Tabs value={panel} onChange={setPanel} options={[['node', 'Düğüm'], ['orphans', `Yetim (${orph.length})`], ['dupes', `Benzer (${dupes.length})`]]} />
          {panel === 'node' && (sel ? (
            <div>
              <TypeBadge type={sel.kind} />
              <h3 style={{ margin: '.4rem 0' }}>{sel.label}</h3>
              {selItem && <p className="small muted">{selItem.summary}</p>}
              {sel.planned && <p className="small">Bu alan planlandı; içerik henüz yok.</p>}
              <div className="row" style={{ marginBottom: '.8rem' }}>
                {!sel.planned && (sel.note ? <Link className="btn sm primary" to={`/notes/${sel.id.slice(NOTE_PREFIX.length)}`}>Notu aç</Link> : <Link className="btn sm primary" to={itemHref(sel.id)}>İçeriği aç</Link>)}
                {focus !== sel.id && <button className="btn sm" onClick={() => setFocus(sel.id)}>Odakla</button>}
              </div>
              {selRelations.length === 0 && <p className="small muted">Bağlantısı yok.</p>}
              {selRelations.map(([label, ids]) => (
                <div className="rel-group" key={label}><span>{label}</span>
                  <ul className="rel-list">{ids.map((i) => <li key={i}>{nodeLink(i)}</li>)}</ul></div>
              ))}
            </div>
          ) : <p className="small muted">Bir düğüme tıklayın.</p>)}
          {panel === 'orphans' && (
            <div><p className="small muted">Hiçbir yere bağlanmayan düğümler. Notlarınıza [[bağlantı]] ekleyerek veya ilişki önerilerini onaylayarak bağlayın.</p>
              <ul className="rel-list">{orph.map((n) => <li key={n.id}>{nodeLink(n.id)}</li>)}</ul>{!orph.length && <p className="small">Yetim düğüm yok.</p>}</div>
          )}
          {panel === 'dupes' && (
            <div><p className="small muted">Başlığı veya takma adı aynı olan farklı düğümler. Birleştirmek veya birini diğerine bağlamak isteyebilirsiniz.</p>
              {dupes.map((grp, i) => <div key={i} className="rel-group"><ul className="rel-list">{grp.map((n) => <li key={n.id}>{nodeLink(n.id)} <span className="small muted">({n.note ? 'not' : n.kind})</span></li>)}</ul><hr /></div>)}
              {!dupes.length && <p className="small">Olası mükerrer bulunamadı.</p>}</div>
          )}
        </aside>
      </div>
    </div>
  );
}
