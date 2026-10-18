import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fmtDate, ItemChip, ItemLink, StatusBadge, toast, TypeBadge } from '../components/common';
import { CodeFiles } from '../components/CodeFiles';
import { Markdown } from '../components/Markdown';
import { downloadItems, downloadState, displaySummary, displayTitle, edgeLabel, getItemBody, removeDownload, typeLabel, useContent, type BodyResult, type Content } from '../lib/content';
import { backlinks } from '../lib/notes';
import { usePrefs, useT } from '../lib/prefs';
import { getProgress, markDone, markUndone, markViewed, PASS_RATIO, recordQuiz, stepsDone } from '../lib/progress';
import { put, remove, useData, useStore } from '../lib/store';
import type { Item, ItemBody } from '../lib/types';

/** Bir öğeyle iki yönlü ilişkili (tipli ilişki veya gövde bağlantısı) belirli türdeki öğeler. */
export function relatedOfType(c: Content, id: string, types: string[]): Item[] {
  const it = c.byId.get(id);
  const out = new Set<string>();
  if (it) {
    for (const ts of Object.values(it.relations)) ts.forEach((t) => out.add(t));
    it.links.forEach((t) => out.add(t));
  }
  (c.incoming.get(id) || []).forEach((e) => out.add(e.from));
  (c.linkedFrom.get(id) || []).forEach((f) => out.add(f));
  return [...out].map((x) => c.byId.get(x)).filter((x): x is Item => !!x && types.includes(x.type) && x.id !== id)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title, 'tr'));
}

function Toc({ item }: { item: Item }) {
  const [active, setActive] = useState<string | null>(null);
  const [, setParams] = useSearchParams();
  useEffect(() => {
    const els = item.sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: '-70px 0px -70% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
  if (!item.sections.length) return null;
  return (
    <nav className="toc" aria-label="İçindekiler">
      {item.sections.filter((s) => s.level <= 3).map((s) => (
        <a key={s.id} href={`#${s.id}`} className={`l${s.level}${active === s.id ? ' active' : ''}`}
          onClick={(e) => { e.preventDefault(); setParams({ s: s.id }, { replace: true }); document.getElementById(s.id)?.scrollIntoView(); }}>{s.title}</a>
      ))}
    </nav>
  );
}

function Relations({ item }: { item: Item }) {
  const c = useContent();
  const { lang } = usePrefs();
  const groups: [string, string[]][] = Object.entries(item.relations).map(([e, ts]) => [edgeLabel(c, e, lang), ts]);
  const inc = new Map<string, string[]>();
  for (const e of c.incoming.get(item.id) || []) {
    const l = edgeLabel(c, e.edge, lang, true);
    inc.set(l, [...(inc.get(l) || []), e.from]);
  }
  const mentioned = (c.linkedFrom.get(item.id) || []).filter((f) => !(c.incoming.get(item.id) || []).some((e) => e.from === f));
  if (mentioned.length) inc.set(edgeLabel(c, 'links', lang, true), mentioned);
  const all = [...groups, ...inc.entries()];
  if (!all.length) return <p className="small muted">İlişki tanımlanmamış.</p>;
  return (
    <div data-testid="relations">
      {all.map(([label, ids]) => (
        <div className="rel-group" key={label}>
          <span>{label}</span>
          <ul className="rel-list">{ids.map((i) => <li key={i}><ItemLink id={i} /></li>)}</ul>
        </div>
      ))}
    </div>
  );
}

function Backlinks({ item }: { item: Item }) {
  const c = useContent();
  const t = useT();
  const bl = useStore(() => backlinks(c, { kind: 'item', id: item.id }));
  return (
    <div className="card" data-testid="backlinks">
      <h4>{t('backlinks')} ({bl.length})</h4>
      {bl.length ? <ul className="rel-list">{bl.map((n) => <li key={n.id}><Link to={`/notes/${n.id}`}>✎ {n.data.title || '(başlıksız)'}</Link></li>)}</ul>
        : <p className="small muted" style={{ margin: 0 }}>Henüz bu sayfaya bağlanan bir notunuz yok.</p>}
    </div>
  );
}

function Quiz({ item, body }: { item: Item; body: ItemBody }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const qs = body.quiz;
  const score = qs.filter((q, i) => answers[i] === q.answer).length;
  const submit = async () => {
    setSubmitted(true);
    const passed = await recordQuiz(item.id, score, qs.length, qs.map((q, i) => (answers[i] === q.answer ? -1 : i)).filter((i) => i >= 0));
    toast(passed ? `Tebrikler: ${score}/${qs.length} — konu tamamlandı` : `${score}/${qs.length} — tamamlamak için en az %${PASS_RATIO * 100}`);
  };
  return (
    <section className="card" id="quiz" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginTop: 0 }}>Kavrama soruları</h2>
      {qs.map((q, i) => (
        <div key={i} style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '.3rem' }}>{i + 1}. {q.q}</p>
          {q.options.map((o, j) => {
            const cls = submitted ? (j === q.answer ? ' right' : answers[i] === j ? ' wrong' : '') : answers[i] === j ? ' on' : '';
            return <button key={j} className={`btn quiz-opt${cls}`} disabled={submitted} onClick={() => setAnswers({ ...answers, [i]: j })}>{o}</button>;
          })}
          {submitted && q.explain && <p className="small muted">{q.explain}</p>}
        </div>
      ))}
      <div className="row">
        {!submitted ? <button className="btn primary" disabled={Object.keys(answers).length < qs.length} onClick={submit}>Cevapları kontrol et</button>
          : <><b>{score}/{qs.length}</b><button className="btn" onClick={() => { setAnswers({}); setSubmitted(false); }}>Tekrar dene</button></>}
      </div>
    </section>
  );
}

function CompletePanel({ item, body }: { item: Item; body: ItemBody | null }) {
  const t = useT();
  const prog = useData<any>('progress', item.id);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  if (prog?.status === 'done') return <button className="btn on" onClick={() => void markUndone(item.id)} title="Tamamlandı işaretini kaldır">✓ {t('done')}</button>;
  if (body?.quiz.length) return <a className="btn" href="#quiz" onClick={(e) => { e.preventDefault(); document.getElementById('quiz')?.scrollIntoView(); }}>{t('markDone')} (quiz)</a>;
  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>{t('markDone')}</button>
      {open && (
        <div className="dialog-backdrop" onClick={() => setOpen(false)}>
          <div className="dialog" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Öz değerlendirme">
            <h3 style={{ marginTop: 0 }}>Öz değerlendirme</h3>
            <p className="small">Bu içeriğin quiz'i yok. Tamamlandı saymak için öğrendiğiniz en önemli fikri veya yaptığınız uygulamayı kısaca yazın.</p>
            <textarea className="input" style={{ width: '100%', minHeight: 100 }} value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="row" style={{ marginTop: '.75rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setOpen(false)}>Vazgeç</button>
              <button className="btn primary" disabled={note.trim().length < 15} onClick={() => { void markDone(item.id, note.trim()); setOpen(false); toast('Tamamlandı olarak işaretlendi'); }}>Tamamlandı</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SectorPanel({ item }: { item: Item }) {
  const c = useContent();
  const careers = relatedOfType(c, item.id, ['career']);
  const tech = relatedOfType(c, item.id, ['technology']);
  const cases = relatedOfType(c, item.id, ['case-study']);
  const paths = relatedOfType(c, item.id, ['path']);
  const tutorials = relatedOfType(c, item.id, ['tutorial']);
  const plannedCareers = c.planned.filter((p) => p.type === 'career' && item.text.toLowerCase().includes(p.title.toLowerCase())).slice(0, 6);
  return (
    <div className="grid two" style={{ margin: '1.25rem 0' }} data-testid="sector-panel">
      <div className="card"><h4>Bu sektördeki meslekler</h4><div className="row">{careers.map((x) => <ItemChip key={x.id} id={x.id} />)}{plannedCareers.map((x) => <ItemChip key={x.id} id={x.id} />)}</div></div>
      <div className="card"><h4>Kullanılan ortak teknolojiler</h4><div className="row">{tech.map((x) => <ItemChip key={x.id} id={x.id} />)}</div></div>
      <div className="card"><h4>Öğrenme yolu</h4>{paths.length ? paths.map((p) => <div key={p.id}><ItemLink id={p.id} /> <span className="small muted">· {p.steps?.length || 0} adım</span></div>) : <span className="small muted">Bu sektör için henüz bir öğrenme yolu yok.</span>}</div>
      <div className="card"><h4>Vaka çalışmaları ve tutorial'lar</h4><div className="row">{[...cases, ...tutorials].map((x) => <ItemChip key={x.id} id={x.id} />)}</div></div>
    </div>
  );
}

function CareerPanel({ item }: { item: Item }) {
  const c = useContent();
  const sectors = relatedOfType(c, item.id, ['sector']);
  const paths = relatedOfType(c, item.id, ['path']);
  const tech = relatedOfType(c, item.id, ['technology', 'concept', 'algorithm', 'metric']);
  const careers = relatedOfType(c, item.id, ['career']);
  return (
    <div className="grid two" style={{ margin: '1.25rem 0' }} data-testid="career-panel">
      <div className="card"><h4>Çalışılan sektörler</h4><div className="row">{sectors.map((x) => <ItemChip key={x.id} id={x.id} />)}</div>
        <p className="small muted" style={{ marginBottom: 0 }}>Sektöre göre farklılıklar sayfadaki ilgili bölümlerde anlatılır.</p></div>
      <div className="card"><h4>Öğrenme yolu</h4>{paths.length ? paths.map((p) => <div key={p.id}><ItemLink id={p.id} /> <span className="small muted">· {p.steps?.length} adım</span></div>) : <span className="small muted">Bu meslek için ayrı bir yol henüz yok.</span>}</div>
      <div className="card"><h4>Gerekli teknik konular</h4><div className="row">{tech.slice(0, 16).map((x) => <ItemChip key={x.id} id={x.id} />)}</div></div>
      <div className="card"><h4>İlgili meslekler</h4><div className="row">{careers.map((x) => <ItemChip key={x.id} id={x.id} />)}</div></div>
    </div>
  );
}

function PathSteps({ item }: { item: Item }) {
  const c = useContent();
  useStore(() => getProgress(item.id)); // yeniden çizim için
  const done = stepsDone(item);
  return (
    <div className="card" style={{ margin: '1.25rem 0' }}>
      <div className="spread"><h3 style={{ margin: 0 }}>Adımlar</h3><span className="small">{done}/{item.steps!.length} tamamlandı</span></div>
      <div className="meter" style={{ margin: '.6rem 0 1rem' }}><i style={{ width: `${(done / item.steps!.length) * 100}%` }} /></div>
      <ol style={{ margin: 0, paddingLeft: '1.3rem' }}>
        {item.steps!.map((s) => <li key={s} style={{ padding: '.15rem 0' }}><ItemLink id={s} /> {getProgress(s)?.status === 'done' && <span className="badge ok">✓</span>}<span className="small muted"> {c.byId.get(s)?.duration || ''}</span></li>)}
      </ol>
    </div>
  );
}

export function ItemPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const section = params.get('s');
  const c = useContent();
  const t = useT();
  const { lang } = usePrefs();
  const nav = useNavigate();
  const item = c.byId.get(id);
  const [res, setRes] = useState<BodyResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [dl, setDl] = useState<boolean | null>(null);
  const bookmarked = useData('bookmarks', id);
  const scrolled = useRef<string | null>(null);

  useEffect(() => {
    if (!item || item.planned) return;
    setRes(null); setErr(null);
    getItemBody(id).then(setRes, (e) => setErr(e.message));
    void markViewed(id);
    void downloadState().then((m) => setDl(!!m.get(id)?.downloaded));
  }, [id, item]);

  useEffect(() => {
    if (!res || !section || scrolled.current === `${id}#${section}`) return;
    scrolled.current = `${id}#${section}`;
    requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView());
  }, [res, section, id]);
  useEffect(() => { if (!section) window.scrollTo(0, 0); }, [id, section]);

  const bodyText = useMemo(() => (res ? (lang === 'en' && res.body.body_en ? res.body.body_en : res.body.body) : ''), [res, lang]);

  if (!item) return <div><h1>Bulunamadı</h1><p>“{id}” adlı içerik yok. <Link to={`/search?q=${encodeURIComponent(id)}`}>Aramayı deneyin</Link>.</p></div>;

  if (item.planned) {
    return (
      <div className="page-head" data-testid="planned-page">
        <div className="eyebrow">{typeLabel(c, item.type, lang)} · {t('planned')}</div>
        <h1>{displayTitle(item, lang)}</h1>
        <div className="card planned"><p style={{ marginTop: 0 }}><b>Bu alan kapsamda ama içeriği henüz yazılmadı.</b> Boş bir sayfayı dolu gibi göstermemek için burada yalnızca planlandığı belirtiliyor.</p>
          <p className="small">Eklemek için: <code>npm run content:new -- {item.type} {item.id} "{item.title}"</code> — ayrıntılar README'de. Kapsam durumu için <Link to="/coverage">Kapsam</Link> sayfasına bakın.</p></div>
      </div>
    );
  }

  const toggleBookmark = () => (bookmarked ? remove('bookmarks', id) : put('bookmarks', id, { at: new Date().toISOString() }));
  const toggleDownload = async () => {
    if (dl) { await removeDownload(id); setDl(false); toast('Cihazdan kaldırıldı'); return; }
    const r = await downloadItems([id]);
    if (r.failed.length) toast('İndirilemedi — bağlantıyı kontrol edin'); else { setDl(true); toast('Çevrimdışı kullanım için indirildi'); }
  };

  return (
    <div className="with-rail">
      <article>
        <div className="page-head">
          <div className="row small" style={{ marginBottom: '.4rem' }}>
            <TypeBadge type={item.type} /><StatusBadge item={item} />
            {item.level && <span className="badge">{item.level}</span>}
            {item.duration && <span className="badge">⏱ {item.duration}</span>}
            {res?.from === 'device' && <span className="badge ok" title="Cihazdaki kopyadan açıldı">{t('downloaded')}</span>}
          </div>
          <h1>{displayTitle(item, lang)}</h1>
          {item.title_en && lang === 'tr' && item.title_en !== item.title && <div className="muted small" style={{ marginTop: '-.4rem', marginBottom: '.5rem' }}>{item.title_en}</div>}
          <p className="lede">{displaySummary(item, lang)}</p>
          {item.alt_titles.length > 0 && <p className="small muted">Diğer unvanlar: {item.alt_titles.join(' · ')}</p>}
          {lang === 'en' && res && !res.body.body_en && <p className="small muted">English body not available yet — showing Turkish original.</p>}
          <div className="row" style={{ marginTop: '.9rem' }}>
            <button className="btn primary" onClick={() => nav(`/notes/new?from=${encodeURIComponent(id)}`)} data-testid="take-note">✎ {t('takeNote')}</button>
            <button className={`btn${bookmarked ? ' on' : ''}`} onClick={() => void toggleBookmark()}>{bookmarked ? '★ ' + t('saved') : '☆ ' + t('save')}</button>
            <CompletePanel item={item} body={res?.body || null} />
            <button className={`btn${dl ? ' on' : ''}`} onClick={() => void toggleDownload()} data-testid="download-btn">{dl ? '⬇ ' + t('downloaded') : '⬇ ' + t('download')}</button>
            <Link className="btn ghost" to={`/graph?focus=${encodeURIComponent(id)}`}>⁂ {t('showInGraph')}</Link>
          </div>
        </div>

        {res?.outdated && <div className="banner warn" style={{ borderRadius: 8, marginBottom: '1rem' }}>Cihazdaki kopya güncel değil (daha yeni bir sürüm yayımlandı). Bağlantı gelince sayfayı yenileyin veya Online/Offline merkezinden güncelleyin.</div>}
        {item.type === 'sector' && <SectorPanel item={item} />}
        {item.type === 'career' && <CareerPanel item={item} />}
        {item.type === 'path' && item.steps && <PathSteps item={item} />}

        {err && <div className="empty">{err}</div>}
        {!res && !err && <p className="muted">Yükleniyor…</p>}
        {res && <Markdown source={bodyText} />}
        {res && item.code.length > 0 && <CodeFiles item={item} body={res.body} />}
        {res && res.body.quiz.length > 0 && <Quiz item={item} body={res.body} />}

        {item.sources.length > 0 && (
          <section style={{ marginTop: '2rem' }}>
            <h2 id="sources">{t('sources')}</h2>
            <ul className="small">
              {item.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> {s.kind && <span className="badge">{s.kind}</span>} {s.accessed && <span className="muted">erişim {s.accessed}</span>}</li>)}
            </ul>
          </section>
        )}
        <p className="small muted" style={{ marginTop: '2rem' }}>Son doğrulama: {fmtDate(item.last_verified)} · sürüm {item.version} · <code>{item.file}</code></p>
      </article>
      <aside className="rail">
        <div className="card toc-card"><h4>{t('contents')}</h4><Toc item={item} /></div>
        <Backlinks item={item} />
        <div className="card"><h4>{t('related')}</h4><Relations item={item} /></div>
      </aside>
    </div>
  );
}
