import { contrastRatio, setPrefs, THEMES, usePrefs } from '../lib/prefs';

const ACCENTS = ['#b5651d', '#1f6feb', '#2e7d4f', '#8e44ad', '#c0392b', '#0f766e'];

export function Settings() {
  const p = usePrefs();
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-elev').trim();
  const cr = p.accent && /^#[0-9a-f]{6}$/i.test(bg) ? contrastRatio(p.accent, bg) : null;
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Settings</div>
        <h1>{p.lang === 'en' ? 'Settings' : 'Ayarlar ve görünüm'}</h1>
        <p className="lede">Ayarlar da kişisel veri olarak saklanır ve hesap bağlıysa cihazlarınız arasında eşitlenir.</p>
      </div>
      <h2>Tema</h2>
      <div className="grid tight">
        {THEMES.map((t) => (
          <button key={t.id} className={`card link-card${p.theme === t.id ? ' on' : ''}`} style={{ textAlign: 'left', cursor: 'pointer', outline: p.theme === t.id ? '2px solid var(--accent)' : undefined }} onClick={() => void setPrefs({ theme: t.id })} data-testid={`theme-${t.id}`}>
            <b>{p.lang === 'en' ? t.en : t.tr}</b>
          </button>
        ))}
      </div>
      <div className="grid two" style={{ marginTop: '1.5rem' }}>
        <div className="card stack">
          <label className="field">Dil / Language
            <select value={p.lang} onChange={(e) => void setPrefs({ lang: e.target.value as 'tr' | 'en' })}><option value="tr">Türkçe</option><option value="en">English</option></select></label>
          <label className="field">Yazı boyutu: {p.fontSize}px<input type="range" min={14} max={20} value={p.fontSize} onChange={(e) => void setPrefs({ fontSize: Number(e.target.value) })} /></label>
          <label className="field">Yoğunluk<select value={p.density} onChange={(e) => void setPrefs({ density: e.target.value as any })}><option value="comfortable">Rahat</option><option value="compact">Sıkı</option></select></label>
          <label className="row small"><input type="checkbox" checked={p.reducedMotion} onChange={(e) => void setPrefs({ reducedMotion: e.target.checked })} /> Hareketi azalt</label>
        </div>
        <div className="card stack">
          <div className="field">Vurgu rengi
            <div className="row">
              <button className={`btn sm${!p.accent ? ' on' : ''}`} onClick={() => void setPrefs({ accent: null })}>Tema varsayılanı</button>
              {ACCENTS.map((a) => <button key={a} className="btn sm" aria-label={a} style={{ background: a, width: 30, height: 30, padding: 0, outline: p.accent === a ? '2px solid var(--ink)' : undefined }} onClick={() => void setPrefs({ accent: a })} />)}
              <input type="color" value={p.accent || '#b5651d'} onChange={(e) => void setPrefs({ accent: e.target.value })} aria-label="Özel renk" />
            </div>
            {cr !== null && <span className={`small ${cr < 3 ? '' : 'muted'}`} style={cr < 3 ? { color: 'var(--bad)' } : undefined}>Kart arka planına kontrast: {cr.toFixed(2)}:1 {cr < 3 ? '— düşük; okunabilirlik için başka bir renk seçin' : '— yeterli'}</span>}
          </div>
          <label className="field">Uygulama adı<input value={p.appName} onChange={(e) => void setPrefs({ appName: e.target.value })} /></label>
        </div>
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Bağlantılar</h3>
          <label className="field">GitHub repo adresi (derlemede bilgi yoksa kullanılır)<input value={p.repoUrl} onChange={(e) => void setPrefs({ repoUrl: e.target.value })} placeholder="https://github.com/kullanici/engineering-academy" /></label>
          <label className="field">AI Research Hub adresi (canlı makale/haber)<input value={p.researchHubUrl} onChange={(e) => void setPrefs({ researchHubUrl: e.target.value })} placeholder="http://localhost:8000" /></label>
          <label className="field">Eşitleme API adresi<input value={p.apiUrl} onChange={(e) => void setPrefs({ apiUrl: e.target.value })} placeholder="boş = bu site" /></label>
        </div>
      </div>
    </div>
  );
}
