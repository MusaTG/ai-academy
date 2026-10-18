import { Link } from 'react-router-dom';
import { fmtDate, itemHref } from '../components/common';
import { TestBadge } from '../components/CodeFiles';
import { displayTitle, useContent } from '../lib/content';
import { actionsUrl, fileUrl, repoInfo } from '../lib/github';
import { usePrefs } from '../lib/prefs';

export function CodeHub() {
  const c = useContent();
  const prefs = usePrefs();
  const repo = repoInfo(c.bundle, prefs.repoUrl);
  const tutorials = c.items.filter((i) => i.type === 'tutorial');
  const passed = tutorials.filter((t) => t.tests?.status === 'passed').length;
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">GitHub & Code Hub</div>
        <h1>{prefs.lang === 'en' ? 'Tutorials & Code' : 'Tutorial ve Kod Merkezi'}</h1>
        <p className="lede">Tutorial kodları repodaki gerçek dosyalardır. Bağlantılar doğrudan dosyaya ve işaretli satır aralıklarına gider; test sonuçları CI'dan gelir.</p>
      </div>
      <div className="grid two">
        <div className="card">
          <h3>Repo bağlantısı</h3>
          {repo ? <><p className="small">Repo: <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.url}</a><br />Sürüm (commit/dal): <code>{repo.ref.slice(0, 12)}</code> {repo.source === 'settings' && <span className="badge warn" title="Bu adres Ayarlar'dan girildi; dal 'main' varsayılır">ayarlardan</span>}</p>
            <a className="btn sm" href={actionsUrl(repo)} target="_blank" rel="noopener noreferrer">GitHub Actions ↗</a></>
            : <p className="small">Bu derlemede repo bilgisi yok, bu yüzden GitHub bağlantısı <b>üretilmiyor</b> (tahminle sahte bağlantı yapılmaz). GitHub Actions ile derlendiğinde otomatik eklenir; yerelde <code>ACADEMY_REPO_URL=https://github.com/kullanici/repo npm run build</code> ya da <Link to="/settings">Ayarlar</Link>'dan repo adresi girin.</p>}
        </div>
        <div className="card">
          <h3>Script testleri</h3>
          <div className="kpi">{passed}/{tutorials.length}</div>
          <p className="small muted">tutorial testleri geçiyor{c.bundle.scriptReport ? ` · ${fmtDate(c.bundle.scriptReport.generated_at, true)} · Python ${c.bundle.scriptReport.python} · ${c.bundle.scriptReport.platform}` : ' · rapor yok'}</p>
          <p className="small">GPU gerektiren tutorial'lar (<code>requires_gpu: true</code>) CI'da çalıştırılmaz ve öyle işaretlenir. Kullanıcı kodu sunucuda veya CI'da çalıştırılmaz.</p>
        </div>
      </div>
      <h2>Tutorial'lar</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Tutorial</th><th>Seviye</th><th>Dosyalar</th><th>Test</th></tr></thead>
          <tbody>
            {tutorials.map((t) => (
              <tr key={t.id}>
                <td><Link to={itemHref(t.id)}>{displayTitle(t, prefs.lang)}</Link><div className="small muted">{t.duration}</div></td>
                <td className="small">{t.level}</td>
                <td className="small">{t.code.map((f) => <div key={f.path}>{repo ? <a href={fileUrl(repo, f)} target="_blank" rel="noopener noreferrer"><code>{f.file}</code></a> : <code>{f.file}</code>} <span className="muted">{f.lines} satır</span></div>)}</td>
                <td><TestBadge item={t} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
