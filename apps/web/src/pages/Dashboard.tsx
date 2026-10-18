import { Link } from 'react-router-dom';
import { fmtDate, itemHref, ItemLink } from '../components/common';
import { useSyncState } from '../components/Layout';
import { displayTitle, useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';
import { allProgress, continueItem, nextSuggestion, reviewList, stepsDone } from '../lib/progress';
import { list, useStore } from '../lib/store';
import type { Note } from '../lib/types';

export function Dashboard() {
  const c = useContent();
  const { lang } = usePrefs();
  const sync = useSyncState();
  const data = useStore(() => {
    const prog = allProgress();
    return {
      prog,
      cont: continueItem(c),
      next: nextSuggestion(c),
      review: reviewList(c),
      notes: list<Note>('notes').sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5),
      bookmarks: list('bookmarks').map((b) => b.id).filter((id) => c.byId.has(id)),
      weekDone: [...prog.values()].filter((p) => p.status === 'done' && p.done_at && Date.now() - Date.parse(p.done_at) < 7 * 86400_000).length,
    };
  });
  const done = [...data.prog.values()].filter((p) => p.status === 'done').length;
  const learnable = c.items.filter((i) => !['sector', 'career', 'path'].includes(i.type)).length;
  const paths = c.items.filter((i) => i.type === 'path');
  const sectors = c.items.filter((i) => i.type === 'sector').length;
  const careers = c.items.filter((i) => i.type === 'career').length;

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">{lang === 'en' ? 'Dashboard' : 'Ana panel'}</div>
        <h1>{lang === 'en' ? 'Where to next?' : 'Bugün nereden devam edelim?'}</h1>
        <p className="lede">{sectors} sektör, {careers} meslek ve {c.items.length} içerik; ayrıca {c.planned.length} alan planlandı olarak işaretli. Notlarınız ve ilerlemeniz bu cihazda saklanır{sync?.status !== 'local-only' ? ' ve hesabınızla eşitlenir' : ''}.</p>
      </div>
      <div className="grid two">
        <div className="card">
          <h3>Kaldığın yerden devam et</h3>
          {data.cont ? <><Link to={itemHref(data.cont.id)} className="btn primary">{displayTitle(data.cont, lang)} →</Link><p className="small muted">Son açılış: {fmtDate(data.prog.get(data.cont.id)?.viewed_at, true)}</p></>
            : <p className="small muted">Henüz bir konu açmadınız. Bir sektör veya meslek seçerek başlayın.</p>}
          <h3 style={{ marginTop: '1.2rem' }}>Önerilen sonraki adım</h3>
          {data.next ? <><Link to={itemHref(data.next.item.id)}>{displayTitle(data.next.item, lang)}</Link><p className="small muted" style={{ margin: 0 }}>{data.next.why}</p></> : <p className="small muted">Öneri yok.</p>}
        </div>
        <div className="card">
          <h3>İlerleme</h3>
          <div className="row" style={{ gap: '2rem' }}>
            <div><div className="kpi">{done}</div><div className="small muted">tamamlanan</div></div>
            <div><div className="kpi">{data.weekDone}</div><div className="small muted">bu hafta</div></div>
            <div><div className="kpi">{data.notes.length ? list('notes').length : 0}</div><div className="small muted">not</div></div>
          </div>
          <div className="meter" style={{ marginTop: '1rem' }}><i style={{ width: `${Math.min(100, (done / Math.max(1, learnable)) * 100)}%` }} /></div>
          <p className="small muted">Tamamlama yalnızca okumayla olmaz: quiz (≥%60) veya öz değerlendirme gerekir.</p>
        </div>
      </div>

      <h2>Öğrenme yolları</h2>
      <div className="grid">
        {paths.map((p) => {
          const d = stepsDone(p, data.prog);
          return (
            <Link key={p.id} to={itemHref(p.id)} className="card link-card">
              <b>{displayTitle(p, lang)}</b>
              <p className="small muted" style={{ margin: '.3rem 0 .6rem' }}>{p.summary}</p>
              <div className="meter"><i style={{ width: `${(d / (p.steps?.length || 1)) * 100}%` }} /></div>
              <div className="small muted" style={{ marginTop: '.3rem' }}>{d}/{p.steps?.length} adım</div>
            </Link>
          );
        })}
      </div>

      <div className="grid two" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h3>Tekrar etmen gerekenler</h3>
          {data.review.length ? <ul className="rel-list">{data.review.map((r) => <li key={r.item.id}><ItemLink id={r.item.id} /> <span className="small muted">— {r.why}</span></li>)}</ul>
            : <p className="small muted">Şu an tekrar listesi boş. Quiz'de %80 altı kalan veya 14 günden uzun süredir açılmayan konular burada görünür.</p>}
        </div>
        <div className="card">
          <h3>Son notlar</h3>
          {data.notes.length ? <ul className="rel-list">{data.notes.map((n) => <li key={n.id}><Link to={`/notes/${n.id}`}>✎ {n.data.title || '(başlıksız)'}</Link> <span className="small muted">{fmtDate(n.updated_at)}</span></li>)}</ul>
            : <p className="small muted">Bir ders sayfasında “Not al” ile ilk notunuzu oluşturun.</p>}
          {data.bookmarks.length > 0 && <><h3>Kaydedilenler</h3><div className="row">{data.bookmarks.map((b) => <Link key={b} className="chip" to={itemHref(b)}>★ {c.byId.get(b)!.title}</Link>)}</div></>}
        </div>
      </div>
      <p className="small muted" style={{ marginTop: '2rem' }}>İçerik sürümü <code>{c.bundle.version}</code> · derleme {fmtDate(c.bundle.generated_at, true)} · {c.source === 'cache' ? 'cihazdaki kopyadan açıldı' : 'güncel'}</p>
    </div>
  );
}
