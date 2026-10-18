import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnline } from '../components/common';
import { useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';
import { externalSearches } from '../lib/search';

/** Araştırma & Haberler. Güncel akış uydurulmaz: canlı makale/haber için AI Research Hub uygulaması
 *  (bu projenin kardeşi) bağlanabilir; yoksa güvenilir kaynakların arama sayfalarına yönlendirilir. */
export function Research() {
  const c = useContent();
  const prefs = usePrefs();
  const online = useOnline();
  const [q, setQ] = useState('');
  const papers = c.items.filter((i) => i.type === 'paper');
  const cited = c.items.flatMap((i) => i.sources.filter((s) => s.kind === 'peer-reviewed' || s.kind === 'preprint').map((s) => ({ ...s, from: i })));
  const uniq = [...new Map(cited.map((s) => [s.url, s])).values()];
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Research & News</div>
        <h1>{prefs.lang === 'en' ? 'Research & News' : 'Araştırma ve Haberler'}</h1>
        <p className="lede">Bu sayfa sahte “güncel” içerik üretmez. Canlı makale ve haber akışı internet ve ayrı bir tarayıcı servisi gerektirir.</p>
      </div>
      {!online && <div className="banner warn" style={{ borderRadius: 8, marginBottom: '1rem' }}>Çevrimdışısınız: canlı haberler ve harici aramalar şu an yenilenemez. Aşağıdaki kaynak listesi cihazdadır.</div>}
      <div className="grid two">
        <div className="card">
          <h3>Canlı akış: AI Research Hub</h3>
          {prefs.researchHubUrl ? <><p className="small">Bağlı: <code>{prefs.researchHubUrl}</code></p><a className="btn primary" href={prefs.researchHubUrl} target="_blank" rel="noopener noreferrer">Son 24 saat makale ve haberleri aç ↗</a></>
            : <p className="small">arXiv/OpenAlex makaleleri ve 13 RSS kaynağını toplayan <b>AI Research Hub</b> uygulamanız varsa adresini <Link to="/settings">Ayarlar</Link>'a girin; buradan açılır. İki uygulama ayrı çalışır, böylece bu akademi ücretsiz statik barındırmada kalabilir.</p>}
        </div>
        <div className="card">
          <h3>Kaynaklarda ara</h3>
          <form onSubmit={(e) => e.preventDefault()}><input className="input" style={{ width: '100%' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ör. open-vocabulary segmentation" /></form>
          {q.trim() && <div className="row" style={{ marginTop: '.6rem' }}>{externalSearches(q).map((e) => <a key={e.name} className="btn sm" href={e.url} target="_blank" rel="noopener noreferrer">{e.name} ↗</a>)}</div>}
        </div>
      </div>
      <h2>İçerikte atıf yapılan akademik kaynaklar ({uniq.length})</h2>
      <p className="small muted">Hakemli yayın ve ön baskılar (preprint) ayrı etiketlenir; ön baskı sonuçları bağımsız olarak doğrulanmamış olabilir. Makale kartları (<code>content/papers/</code>) için şablon hazır; henüz {papers.length} makale kartı yazıldı.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Kaynak</th><th>Tür</th><th>Kullanıldığı içerik</th></tr></thead>
          <tbody>{uniq.map((s) => <tr key={s.url}><td><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></td><td><span className={`badge ${s.kind === 'preprint' ? 'warn' : 'ok'}`}>{s.kind === 'preprint' ? 'ön baskı' : 'hakemli'}</span></td><td><Link to={`/item/${s.from.id}`}>{s.from.title}</Link></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
