import { useEffect, useState } from 'react';
import { fmtBytes, fmtDate, toast, useOnline } from '../components/common';
import { useSyncState } from '../components/Layout';
import { downloadItems, downloadState, removeDownload, typeLabel, useContent } from '../lib/content';
import { requestPersistence } from '../lib/db';
import { setPrefs, usePrefs } from '../lib/prefs';
import { checkServer, getAuth, listConflicts, login, logout, resolveConflict, syncNow, type Auth, type Resolution } from '../lib/sync';
import type { Conflict } from '../lib/types';

function preview(d: any) {
  if (!d) return '(boş)';
  if (typeof d.body === 'string') return `# ${d.title || ''}\n\n${d.body}`;
  return JSON.stringify(d, null, 2);
}

function ConflictCard({ c, onDone }: { c: Conflict; onDone: () => void }) {
  const go = async (how: Resolution) => { await resolveConflict(c.key, how); toast('Çakışma çözüldü'); onDone(); };
  return (
    <div className="card" data-testid="conflict">
      <div className="spread"><b>{c.collection === 'notes' ? `Not: ${c.local.data?.title || c.id}` : `${c.collection}/${c.id}`}</b>
        <span className="small muted">Sunucu sürümü v{c.server.version} · {fmtDate(c.server.updated_at, true)}</span></div>
      <p className="small muted">Bu kayıt hem bu cihazda hem başka bir cihazda değiştirildi. Hiçbiri otomatik silinmedi; hangisini tutacağınızı seçin.</p>
      <div className="diff">
        <div><b className="small">Bu cihazdaki sürüm {c.local.deleted && '(silindi)'}</b><pre>{preview(c.local.data)}</pre></div>
        <div><b className="small">Diğer cihazdaki (sunucu) sürüm {c.server.deleted && '(silindi)'}</b><pre>{preview(c.server.data)}</pre></div>
      </div>
      <div className="row" style={{ marginTop: '.6rem' }}>
        <button className="btn" onClick={() => void go('local')}>Bu cihazdakini koru</button>
        <button className="btn" onClick={() => void go('server')}>Diğer sürümü al</button>
        {c.collection === 'notes' && <button className="btn primary" onClick={() => void go('merge')}>İkisini birleştir</button>}
      </div>
    </div>
  );
}

export function OfflineCenter() {
  const c = useContent();
  const prefs = usePrefs();
  const online = useOnline();
  const sync = useSyncState();
  const [auth, setAuth] = useState<Auth | null>(null);
  const [apiUrl, setApiUrl] = useState(prefs.apiUrl);
  const [server, setServer] = useState<string | null>(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [dl, setDl] = useState<Map<string, { hash: string; downloaded: boolean; saved_at: string }>>(new Map());
  const [progress, setProgress] = useState<string | null>(null);
  const [storage, setStorage] = useState<{ persisted: boolean | null; usage?: number; quota?: number } | null>(null);

  const refresh = () => {
    void getAuth().then(setAuth);
    void listConflicts().then(setConflicts);
    void downloadState().then(setDl);
    void requestPersistence().then(setStorage);
  };
  useEffect(refresh, [sync?.status, sync?.conflicts]);

  const test = async () => {
    setServer('…');
    try { const h = await checkServer(apiUrl); setServer(`✓ Sunucu çalışıyor (v${h.version}, ${h.database}${h.registration ? '' : ', yeni kayıt kapalı'})`); }
    catch (e: any) { setServer(`✗ Ulaşılamadı: ${e.message}`); }
  };
  const doLogin = async (register: boolean) => {
    setBusy(true);
    try { await setPrefs({ apiUrl }); const a = await login(apiUrl, user, pass, register); setAuth(a); setPass(''); toast(register ? 'Hesap oluşturuldu, eşitleme başladı' : 'Giriş yapıldı, eşitleme başladı'); }
    catch (e: any) { toast(`Hata: ${e.message}`); }
    finally { setBusy(false); }
  };

  const content = c.items;
  const downloaded = content.filter((i) => dl.get(i.id)?.downloaded);
  const outdated = content.filter((i) => dl.has(i.id) && dl.get(i.id)!.hash !== i.hash);
  const types = [...new Set(content.map((i) => i.type))];
  const download = async (ids: string[], label: string) => {
    setProgress(`${label}: 0/${ids.length}`);
    const r = await downloadItems(ids, (d, t) => setProgress(`${label}: ${d}/${t}`));
    setProgress(null);
    toast(r.failed.length ? `${r.failed.length} içerik indirilemedi` : `${ids.length} içerik cihaza indirildi`);
    refresh();
  };

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Online / Offline Center</div>
        <h1>Online / Offline Merkezi</h1>
        <p className="lede">Uygulama internetsiz de açılır. Notlar ve ilerleme önce bu cihaza kaydedilir; bir hesap bağlarsanız bağlantı geldiğinde diğer cihazlarınızla eşitlenir.</p>
      </div>
      <div className="grid two">
        <div className="card" data-testid="sync-card">
          <h3>Durum</h3>
          <p><span className={`status-dot ${online ? sync?.status : 'offline'}`} /> {online ? 'Çevrimiçi' : 'Çevrimdışı'} · {auth ? `Hesap: ${auth.username}` : 'Hesap yok — veriler yalnızca bu cihazda'}</p>
          <table><tbody>
            <tr><td>Eşitleme</td><td data-testid="sync-status">{sync?.status}</td></tr>
            <tr><td>Bekleyen değişiklik</td><td data-testid="pending-count">{sync?.pending ?? 0}</td></tr>
            <tr><td>Çakışma</td><td>{conflicts.length}</td></tr>
            <tr><td>Son eşitleme</td><td data-testid="last-sync" data-value={sync?.lastSync || ''}>{fmtDate(sync?.lastSync, true)}</td></tr>
            {sync?.lastError && <tr><td>Son hata</td><td className="small" style={{ color: 'var(--bad)' }}>{sync.lastError}</td></tr>}
            {sync?.nextRetryAt && <tr><td>Tekrar deneme</td><td className="small">{fmtDate(new Date(sync.nextRetryAt).toISOString(), true)}</td></tr>}
          </tbody></table>
          <button className="btn primary" style={{ marginTop: '.75rem' }} disabled={!auth || !online} onClick={() => void syncNow()} data-testid="sync-now">Şimdi eşitle</button>
        </div>
        <div className="card">
          <h3>Hesap ve sunucu</h3>
          {auth ? (
            <>
              <p className="small">Giriş yapıldı: <b data-testid="logged-in-user">{auth.username}</b> · sunucu <code>{auth.apiUrl || '(bu site)'}</code></p>
              <button className="btn" onClick={() => void logout().then(refresh)}>Çıkış yap (yerel veriler kalır)</button>
            </>
          ) : (
            <form className="stack" onSubmit={(e) => { e.preventDefault(); void doLogin(false); }}>
              <label className="field">API adresi <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="boş = bu site (ör. https://academy-api.ornek.com)" data-testid="api-url" /></label>
              <div className="row"><button type="button" className="btn sm" onClick={() => void test()}>Sunucuyu test et</button>{server && <span className="small">{server}</span>}</div>
              <label className="field">Kullanıcı adı <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" data-testid="username" /></label>
              <label className="field">Parola (en az 8 karakter) <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" data-testid="password" /></label>
              <div className="row"><button className="btn primary" disabled={busy || !online}>Giriş yap</button><button type="button" className="btn" disabled={busy || !online} onClick={() => void doLogin(true)} data-testid="register">Hesap oluştur</button></div>
            </form>
          )}
          <p className="small muted">Yerel depolama: veriler bu tarayıcının IndexedDB'sinde. Hesaba yükleme: veriler ayrıca sunucu veritabanına yazılır, yedeklenir ve diğer cihazlara iner. Tarayıcı verisini silerseniz yalnızca hesaba yüklenmiş kayıtlar geri gelir.</p>
        </div>
      </div>

      {conflicts.length > 0 && <><h2>Çözülmemiş çakışmalar ({conflicts.length})</h2><div className="stack">{conflicts.map((x) => <ConflictCard key={x.key} c={x} onDone={refresh} />)}</div></>}

      <h2>İndirilen içerik</h2>
      <div className="card">
        <div className="spread">
          <div><b data-testid="downloaded-count">{downloaded.length}</b> / {content.length} içerik cihazda · {outdated.length} güncel değil</div>
          <div className="row">
            <button className="btn primary" disabled={!online || !!progress} onClick={() => void download(content.map((i) => i.id), 'Tümü')} data-testid="download-all">Tümünü indir ({fmtBytes(content.reduce((s, i) => s + i.bytes, 0))})</button>
            {outdated.length > 0 && <button className="btn" disabled={!online || !!progress} onClick={() => void download(outdated.map((i) => i.id), 'Güncelleme')}>Güncel olmayanları yenile</button>}
            <button className="btn danger" onClick={async () => { for (const i of downloaded) await removeDownload(i.id); refresh(); }}>Tümünü kaldır</button>
          </div>
        </div>
        {progress && <p className="small">{progress}</p>}
        <div className="row small" style={{ marginTop: '.75rem' }}>
          {types.map((t) => { const ids = content.filter((i) => i.type === t).map((i) => i.id); const n = ids.filter((id) => dl.get(id)?.downloaded).length; return (
            <button key={t} className="btn sm" disabled={!online || !!progress} onClick={() => void download(ids, typeLabel(c, t, prefs.lang))}>{typeLabel(c, t, prefs.lang)} {n}/{ids.length}</button>
          ); })}
        </div>
        {outdated.length > 0 && <p className="small muted">Güncel değil: {outdated.map((o) => o.title).join(', ')}</p>}
        <p className="small muted">Depolama: {fmtBytes(storage?.usage)} / {fmtBytes(storage?.quota)} · {storage?.persisted ? 'Kalıcı depolama izni verildi (tarayıcı veriyi kendiliğinden silmez).' : 'Kalıcı depolama izni yok: tarayıcı yer darlığında veriyi silebilir. Uygulamayı ana ekrana ekleyin ve düzenli dışa aktarma yapın.'}</p>
      </div>

      <h2>Çevrimdışıyken ne çalışır?</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Özellik</th><th>Çevrimdışı</th></tr></thead>
        <tbody>
          {[
            ['İndirilmiş ve daha önce açılmış dersler, tutorial kodları, formüller', '✓'], ['Notlar: oluşturma, düzenleme, bağlantılar, backlink, sürüm geçmişi (cihaz)', '✓'],
            ['Bilgi grafiği, yerel arama, ilerleme, favoriler, tema ve dil', '✓'], ['Metrik hesaplayıcıları', '✓'],
            ['Eşitleme, sunucu sürüm geçmişi, sunucu yedek durumu', '✗ — bağlantı gelince otomatik devam eder'],
            ['Canlı haberler/makaleler, harici arama, GitHub bağlantıları', '✗ — internet gerekir'], ['Hiç indirilmemiş dersler', '✗'],
          ].map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}
        </tbody>
      </table></div>
    </div>
  );
}
