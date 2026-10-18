import { useEffect, useState } from 'react';
import { fmtBytes, fmtDate, toast } from '../components/common';
import { downloadBlob, exportJSON, exportNotesZip, importJSON } from '../lib/dataio';
import { useContent } from '../lib/content';
import { requestPersistence } from '../lib/db';
import { allRecords, useStore } from '../lib/store';
import { apiBase, getAuth, syncNow, type Auth } from '../lib/sync';

export function DataProtection() {
  const c = useContent();
  const counts = useStore(() => {
    const m: Record<string, number> = {};
    for (const r of allRecords()) if (!r.deleted) m[r.collection] = (m[r.collection] || 0) + 1;
    return m;
  });
  const [auth, setAuth] = useState<Auth | null>(null);
  const [backup, setBackup] = useState<any>(null);
  const [backupErr, setBackupErr] = useState<string | null>(null);
  const [storage, setStorage] = useState<{ persisted: boolean | null; usage?: number; quota?: number } | null>(null);

  useEffect(() => {
    void requestPersistence().then(setStorage);
    void getAuth().then(async (a) => {
      setAuth(a);
      if (!a) return;
      try {
        const r = await fetch(`${apiBase(a.apiUrl)}/backups/status`, { headers: { authorization: `Bearer ${a.token}` } });
        if (!r.ok) throw new Error(String(r.status));
        setBackup(await r.json());
      } catch { setBackupErr('Sunucuya ulaşılamadı.'); }
    });
  }, []);

  const stamp = new Date().toISOString().slice(0, 10);
  const onImport = async (f: File) => {
    try {
      const stats = await importJSON(JSON.parse(await f.text()));
      toast(`İçe aktarıldı: ${stats.created} yeni, ${stats.updated} güncellendi, ${stats.skipped} atlandı (yerelde daha yeni)`);
      void syncNow();
    } catch (e: any) { toast(`İçe aktarılamadı: ${e.message}`); }
  };
  const serverExport = async () => {
    const r = await fetch(`${apiBase(auth!.apiUrl)}/export`, { headers: { authorization: `Bearer ${auth!.token}` } });
    if (!r.ok) { toast('Sunucudan alınamadı'); return; }
    downloadBlob(JSON.stringify(await r.json(), null, 2), `academy-sunucu-${stamp}.json`, 'application/json');
  };

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Data Protection Center</div>
        <h1>Veri Koruma Merkezi</h1>
        <p className="lede">Verileriniz üç katmanda korunabilir: bu cihaz (IndexedDB), hesabınız (sunucu veritabanı + doğrulanmış otomatik yedek) ve sizin aldığınız dışa aktarma dosyaları.</p>
      </div>
      <div className="grid two">
        <div className="card">
          <h3>Bu cihazdaki veriler</h3>
          <table><tbody>{[['notes', 'Notlar'], ['progress', 'İlerleme kayıtları'], ['bookmarks', 'Kaydedilenler'], ['attachments', 'Ekler'], ['graph_feedback', 'Grafik ilişki kararları'], ['settings', 'Ayarlar']].map(([k, l]) => <tr key={k}><td>{l}</td><td>{counts[k] || 0}</td></tr>)}</tbody></table>
          <p className="small muted">Kullanım {fmtBytes(storage?.usage)} · {storage?.persisted ? 'kalıcı depolama izni var' : 'kalıcı depolama izni yok (tarayıcı yer darlığında silebilir)'}</p>
        </div>
        <div className="card">
          <h3>Dışa aktar</h3>
          <div className="stack">
            <button className="btn primary" onClick={() => downloadBlob(JSON.stringify(exportJSON(), null, 2), `academy-yedek-${stamp}.json`, 'application/json')} data-testid="export-json">Tüm verileri JSON olarak indir</button>
            <button className="btn" onClick={() => downloadBlob(exportNotesZip(c) as BlobPart, `academy-notlar-${stamp}.zip`, 'application/zip')}>Notları Markdown (.zip) olarak indir — Obsidian uyumlu</button>
            {auth && <button className="btn" onClick={() => void serverExport()}>Sunucudaki kopyayı indir</button>}
          </div>
        </div>
        <div className="card">
          <h3>İçe aktar / geri yükle</h3>
          <p className="small">JSON dışa aktarma dosyasını seçin. Birleştirme yapılır: yerelde daha yeni olan kayıt korunur, hiçbir kayıt sessizce ezilmez.</p>
          <input type="file" accept="application/json,.json" onChange={(e) => e.target.files?.[0] && void onImport(e.target.files[0])} data-testid="import-file" />
        </div>
        <div className="card">
          <h3>Sunucu yedekleri</h3>
          {!auth ? <p className="small">Hesap bağlı değil. Sunucu yedeği yalnızca hesapla eşitlenen veriler için geçerlidir; şimdilik düzenli JSON dışa aktarması yapın.</p>
            : backupErr ? <p className="small">{backupErr}</p>
              : backup ? <>
                <p className="small">Son başarılı ve <b>doğrulanmış</b> yedek: {backup.last_ok ? `${fmtDate(backup.last_ok.created_at, true)} (${fmtBytes(backup.last_ok.size_bytes)})` : 'henüz yok'}</p>
                {backup.last_attempt?.status === 'failed' && <p className="small" style={{ color: 'var(--bad)' }}>Son deneme başarısız: {fmtDate(backup.last_attempt.created_at, true)} — {backup.last_attempt.detail}</p>}
                <p className="small muted">Aralık: {backup.interval_hours > 0 ? `${backup.interval_hours} saatte bir` : 'otomatik yedek kapalı'}. Her yedek alındıktan sonra geçici bir veritabanına geri yüklenerek doğrulanır.</p>
              </> : <p className="small">Yükleniyor…</p>}
          <details><summary className="small">Sunucuyu yedekten geri yükleme</summary>
            <pre className="small" style={{ whiteSpace: 'pre-wrap' }}><code>{`cd apps/api
python -m app.backup list
python -m app.backup verify data/backups/academy-….json.gz
python -m app.backup restore data/backups/academy-….json.gz --force`}</code></pre>
            <p className="small muted">Ayrıntı: <code>docs/backup-restore.md</code></p></details>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: '1.5rem' }}>Gizlilik: kişisel notlarınız Git reposuna yazılmaz. Repoda yalnızca uygulama kodu ve eğitim içeriği bulunur.</p>
    </div>
  );
}
