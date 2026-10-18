import { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadBlob } from '../lib/dataio';
import { useContent } from '../lib/content';
import { fileUrl, folderUrl, repoInfo } from '../lib/github';
import { usePrefs } from '../lib/prefs';
import type { CodeFile, Item, ItemBody } from '../lib/types';
import { fmtDate, toast } from './common';

export function TestBadge({ item }: { item: Item }) {
  const r = item.tests;
  if (!r) return <span className="badge" title="Bu derlemede test raporu yok">test raporu yok</span>;
  const label = { passed: `✓ ${r.passed} test geçti`, failed: `✗ ${r.failed} test başarısız`, 'gpu-skipped': 'GPU gerekir — CI\'da atlandı', 'no-tests': 'test yok' }[r.status];
  return <span className={`badge ${r.status}`} data-testid="test-badge">{label}</span>;
}

function FileBlock({ item, file }: { item: Item; file: CodeFile }) {
  const c = useContent();
  const prefs = usePrefs();
  const repo = repoInfo(c.bundle, prefs.repoUrl);
  const [show, setShow] = useState(false);
  const dir = file.path.split('/').slice(0, -1).join('/');
  const install = file.deps.length ? `pip install ${file.deps.map((d) => `"${d}"`).join(' ')}` : null;
  const local = [install, `cd ${dir}`, file.run].filter(Boolean).join('\n');
  const copy = (s: string) => void navigator.clipboard?.writeText(s).then(() => toast('Kopyalandı'));
  return (
    <div className="card" style={{ marginBottom: '1rem' }} data-testid={`code-${file.file}`}>
      <div className="spread">
        <div>
          <b>{file.title}</b> <code>{file.path}</code>
          <div className="small muted">{file.lines} satır · içerik özeti <code>{file.sha}</code></div>
        </div>
        <div className="row">
          {repo ? <a className="btn sm" href={fileUrl(repo, file)} target="_blank" rel="noopener noreferrer" data-testid="github-file-link">GitHub'da aç ↗</a>
            : <span className="badge warn" title="Derleme sırasında repo bilgisi yoktu. Ayarlar'dan GitHub repo adresinizi girin.">GitHub repo ayarlanmadı</span>}
          {file.source && <button className="btn sm" onClick={() => downloadBlob(file.source!, file.file, 'text/x-python')}>İndir</button>}
          {file.source && <button className="btn sm" onClick={() => setShow(!show)}>{show ? 'Kodu gizle' : 'Kodu göster'}</button>}
        </div>
      </div>
      {file.regions && file.regions.length > 0 && (
        <div className="row small" style={{ marginTop: '.5rem' }}>
          <span className="muted">Bölümler:</span>
          {file.regions.map((r) => repo
            ? <a key={r.name} className="chip" href={fileUrl(repo, file, r)} target="_blank" rel="noopener noreferrer" data-testid="github-region-link">{r.name} · L{r.start}–{r.end}</a>
            : <span key={r.name} className="chip">{r.name} · L{r.start}–{r.end}</span>)}
        </div>
      )}
      {show && file.source && <div className="code-block"><div className="code-head"><span>{file.file}</span></div><pre><code>{file.source.split('\n').map((l, i) => `${String(i + 1).padStart(3)}  ${l}`).join('\n')}</code></pre></div>}
      <details style={{ marginTop: '.6rem' }}>
        <summary className="small">Nasıl çalıştırılır?</summary>
        <div className="small" style={{ marginTop: '.4rem' }}>
          <p style={{ margin: '.3rem 0' }}><b>Yerel bilgisayarda</b> (Python 3.10+; repo klasöründe):</p>
          <div className="code-block"><div className="code-head"><span>bash</span><button className="copy-btn" onClick={() => copy(local)}>Kopyala</button></div><pre><code>{local}</code></pre></div>
          <p style={{ margin: '.3rem 0' }}><b>Jupyter'de:</b> <code>pip install jupyterlab {file.deps.map((d) => `"${d}"`).join(' ')}</code>, ardından <code>{dir}</code> klasöründe bir not defteri açıp <code>%run {file.file}</code>.</p>
          <p style={{ margin: '.3rem 0' }}><b>Bulut not defteri:</b> {repo ? <>Google Colab'da <code>!git clone {repo.url}</code> ve <code>%cd {repo.url.split('/').pop()}/{dir}</code> ile aynı adımlar. </> : 'Repo ayarlanınca Colab için klonlama komutu burada görünür. '}Kod tarayıcıda veya sunucuda çalıştırılmaz (güvenlik: izolasyonsuz kod çalıştırma yok).</p>
          {repo && <p style={{ margin: '.3rem 0' }}><a href={folderUrl(repo, dir)} target="_blank" rel="noopener noreferrer">Klasörü GitHub'da gör ↗</a></p>}
        </div>
      </details>
    </div>
  );
}

export function CodeFiles({ item, body }: { item: Item; body: ItemBody }) {
  const c = useContent();
  const r = item.tests;
  return (
    <section style={{ marginTop: '2rem' }} id="code-files">
      <div className="spread"><h2 style={{ margin: 0 }}>Kod dosyaları</h2><TestBadge item={item} /></div>
      <p className="small muted">Test sonucu GitHub Actions'taki <code>script-tests</code> iş akışından gelir; tutorial scriptleri küçük veriyle CPU üzerinde çalıştırılır.
        {c.bundle.scriptReport && <> Rapor: {fmtDate(c.bundle.scriptReport.generated_at, true)}, Python {c.bundle.scriptReport.python}, {c.bundle.scriptReport.platform}.</>} <Link to="/code">Kod Merkezi</Link></p>
      {body.code.map((f) => <FileBlock key={f.path} item={item} file={{ ...item.code.find((x) => x.path === f.path)!, source: f.source }} />)}
      {r?.cases && r.cases.length > 0 && (
        <details><summary className="small">Test vakaları ({r.cases.length})</summary>
          <ul className="small">{r.cases.map((cs) => <li key={cs.name}><span className={`badge ${cs.status}`}>{cs.status}</span> <code>{cs.name}</code></li>)}</ul></details>
      )}
    </section>
  );
}
