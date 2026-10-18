import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtDate, itemHref, StatusBadge, Tabs } from '../components/common';
import { typeLabel, useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';

/** Kapsam Gezgini: neler yazıldı, neler eksik, ne zaman doğrulandı. Boş alan dolu gösterilmez. */
export function Coverage() {
  const c = useContent();
  const { lang } = usePrefs();
  const [tab, setTab] = useState<'summary' | 'items' | 'planned'>('summary');
  const [type, setType] = useState('');
  const all = [...c.items, ...c.planned];
  const types = [...new Set(all.map((i) => i.type))];
  const count = (t: string, s: string) => all.filter((i) => i.type === t && i.status === s).length;
  const tpl = c.bundle.templates;
  const stale = c.items.filter((i) => i.last_verified && Date.now() - Date.parse(i.last_verified) > 180 * 86400_000);
  const noSource = c.items.filter((i) => ['sector', 'career', 'technology', 'case-study'].includes(i.type) && !i.sources.length);
  const rows = c.items.filter((i) => !type || i.type === type);

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Coverage Explorer</div>
        <h1>{lang === 'en' ? 'Coverage' : 'Kapsam Gezgini'}</h1>
        <p className="lede">Durum, içerik dosyasındaki şablon bölümlerinden otomatik hesaplanır. “Planlandı” alanların içeriği yoktur; dolu gibi gösterilmez.</p>
      </div>
      <Tabs value={tab} onChange={setTab} options={[['summary', 'Özet'], ['items', `İçerikler (${c.items.length})`], ['planned', `Planlananlar (${c.planned.length})`]]} />
      {tab === 'summary' && (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tür</th><th>Tamamlandı</th><th>Kısmi</th><th>Taslak</th><th>Planlandı</th><th>Şablon bölümü</th></tr></thead>
              <tbody>{types.map((t) => (
                <tr key={t}><td>{typeLabel(c, t, lang)}</td><td>{count(t, 'complete')}</td><td>{count(t, 'partial')}</td><td>{count(t, 'stub')}</td><td>{count(t, 'planned')}</td><td className="small muted">{tpl[t]?.length || '—'}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <div className="grid two" style={{ marginTop: '1rem' }}>
            <div className="card"><h3>Doğrulama</h3><p className="small">180 günden eski doğrulama tarihi olan içerik: <b>{stale.length}</b></p>
              <p className="small">Kaynak gösterilmemiş sektör/meslek/teknoloji/vaka: <b>{noSource.length}</b> {noSource.map((i) => <Link key={i.id} className="chip" to={itemHref(i.id)}>{i.title}</Link>)}</p></div>
            <div className="card"><h3>Yeni alan nasıl eklenir?</h3><p className="small">Kod değişikliği gerekmez:</p>
              <pre className="small" style={{ whiteSpace: 'pre-wrap' }}><code>npm run content:new -- sector denizcilik "Denizcilik ve Limanlar"{'\n'}npm run content:validate && npm run content:build</code></pre>
              <p className="small muted">Doğrulayıcı kırık bağlantı, eksik şablon bölümü, mükerrer kavram, bozuk formül ve ön koşul döngüsünü raporlar.</p></div>
          </div>
        </>
      )}
      {tab === 'items' && (
        <>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={{ marginBottom: '.75rem' }}><option value="">Tüm türler</option>{types.filter((t) => c.items.some((i) => i.type === t)).map((t) => <option key={t} value={t}>{typeLabel(c, t, lang)}</option>)}</select>
          <div className="table-wrap">
            <table>
              <thead><tr><th>İçerik</th><th>Durum</th><th>Eksik bölümler</th><th>Kaynak</th><th>Doğrulama</th></tr></thead>
              <tbody>{rows.map((i) => (
                <tr key={i.id}>
                  <td><Link to={itemHref(i.id)}>{i.title}</Link><div className="small muted">{typeLabel(c, i.type, lang)}</div></td>
                  <td><StatusBadge item={i} /></td>
                  <td className="small">{i.coverage.missing.length ? i.coverage.missing.map((m) => tpl[i.type]?.find((x) => x[0] === m)?.[1] || m).join(', ') : '—'}</td>
                  <td className="small">{i.sources.length}</td>
                  <td className="small">{fmtDate(i.last_verified)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
      {tab === 'planned' && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Alan</th><th>Tür</th><th>Grup</th><th>Durum</th></tr></thead>
            <tbody>{c.planned.map((p) => <tr key={p.id}><td>{p.title}{p.title_en && p.title_en !== p.title ? <span className="muted small"> · {p.title_en}</span> : null}</td><td>{typeLabel(c, p.type, lang)}</td><td className="small">{p.group}</td><td><span className="badge planned">Planlandı — içerik yok</span></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
