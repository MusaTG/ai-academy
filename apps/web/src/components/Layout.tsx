import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { setPrefs, usePrefs, useT, type StrKey } from '../lib/prefs';
import { onSyncState, type SyncState } from '../lib/sync';
import { useOnline } from './common';

const GROUPS: { key: StrKey | null; links: { to: string; k: StrKey; ico: string }[] }[] = [
  { key: null, links: [{ to: '/', k: 'dashboard', ico: '◎' }] },
  { key: 'learn', links: [
    { to: '/industry', k: 'industry', ico: '▦' }, { to: '/careers', k: 'careers', ico: '◇' }, { to: '/paths', k: 'paths', ico: '↗' },
    { to: '/code', k: 'tutorials', ico: '⌘' }, { to: '/metrics', k: 'metrics', ico: '∑' },
  ] },
  { key: 'explore', links: [{ to: '/graph', k: 'graph', ico: '⁂' }, { to: '/search', k: 'search', ico: '⌕' }, { to: '/research', k: 'research', ico: '¶' }] },
  { key: 'personal', links: [{ to: '/notes', k: 'notes', ico: '✎' }] },
  { key: 'system', links: [{ to: '/offline', k: 'offline', ico: '⇅' }, { to: '/data', k: 'data', ico: '⛨' }, { to: '/coverage', k: 'coverage', ico: '▤' }, { to: '/settings', k: 'settings', ico: '⚙' }] },
];

export function useSyncState() {
  const [s, setS] = useState<SyncState | null>(null);
  useEffect(() => onSyncState(setS), []);
  return s;
}

const SYNC_LABEL: Record<string, string> = { 'local-only': 'Yalnızca bu cihaz', idle: 'Eşitlendi', syncing: 'Eşitleniyor…', offline: 'Çevrimdışı', error: 'Eşitleme hatası' };

export function Layout({ children }: { children: ReactNode }) {
  const t = useT();
  const prefs = usePrefs();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const loc = useLocation();
  const nav = useNavigate();
  const online = useOnline();
  const sync = useSyncState();
  const [q, setQ] = useState('');
  useEffect(() => setOpen(false), [loc.pathname, loc.search]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className={`shell${open ? ' nav-open' : ''}`}>
      <a href="#main" className="visually-hidden">İçeriğe atla</a>
      <aside className="sidebar" aria-label="Ana menü" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <NavLink to="/" className="brand">
          <img src="./icon.svg" alt="" />
          <div><b>{prefs.appName}</b><span>{prefs.lang === 'en' ? 'Sectors · careers · graph' : 'Sektör · meslek · bilgi grafiği'}</span></div>
        </NavLink>
        <nav>
          {GROUPS.map((g, i) => (
            <div className="nav-group" key={i}>
              {g.key && <button onClick={() => setCollapsed((c) => ({ ...c, [g.key!]: !c[g.key!] }))} aria-expanded={!collapsed[g.key]}>{t(g.key)}<span>{collapsed[g.key] ? '+' : '–'}</span></button>}
              {!(g.key && collapsed[g.key]) && g.links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <span className="ico" aria-hidden>{l.ico}</span>{t(l.k)}
                  {l.to === '/offline' && sync && sync.conflicts > 0 && <span className="count" title="Çözülmemiş çakışma">{sync.conflicts}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="btn ghost menu-btn" onClick={() => setOpen(true)} aria-label="Menüyü aç">☰</button>
          <form onSubmit={submit} role="search">
            <input type="search" placeholder={t('searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('search')} />
          </form>
          <NavLink to="/offline" className="btn ghost hide-sm small" title="Eşitleme durumu" data-testid="sync-indicator">
            <span className={`status-dot ${online ? sync?.status : 'offline'}`} />
            {online ? SYNC_LABEL[sync?.status || 'local-only'] : SYNC_LABEL.offline}
            {sync && sync.status !== 'local-only' && sync.pending > 0 && <span className="muted">· {sync.pending} bekliyor</span>}
          </NavLink>
          <button className="btn sm" onClick={() => void setPrefs({ lang: prefs.lang === 'tr' ? 'en' : 'tr' })} aria-label="Dil değiştir">{prefs.lang === 'tr' ? 'EN' : 'TR'}</button>
          <button className="btn sm" onClick={() => void setPrefs({ theme: ['dark', 'midnight', 'aurora', 'contrast'].includes(prefs.theme) ? 'light' : 'dark' })} aria-label="Açık/koyu tema">◐</button>
        </header>
        {!online && <div className="banner warn" role="status" data-testid="offline-banner">{t('offlineBanner')}</div>}
        <main id="main" className="content">{children}</main>
      </div>
    </div>
  );
}
