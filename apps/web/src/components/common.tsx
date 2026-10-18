import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { displaySummary, displayTitle, typeLabel, useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';
import type { Item } from '../lib/types';

const STATUS_TR: Record<string, string> = { complete: 'Tamamlandı', partial: 'Kısmi', stub: 'Taslak', planned: 'Planlandı' };
const STATUS_EN: Record<string, string> = { complete: 'Complete', partial: 'Partial', stub: 'Stub', planned: 'Planned' };

/** İçerik durumu rozeti: içerik dosyasının şablon kapsamından hesaplanır (elle "dolu" denemez). */
export function StatusBadge({ item }: { item: Item }) {
  const { lang } = usePrefs();
  const label = (lang === 'en' ? STATUS_EN : STATUS_TR)[item.status];
  const title = item.planned ? 'Bu alan kapsamda ama içeriği henüz yazılmadı.'
    : item.coverage.required ? `Şablon bölümleri: ${item.coverage.present}/${item.coverage.required}${item.coverage.missing.length ? ` — eksik: ${item.coverage.missing.join(', ')}` : ''}` : '';
  return <span className={`badge ${item.status}`} title={title}>{label}{item.coverage.required && !item.planned ? ` · ${item.coverage.present}/${item.coverage.required}` : ''}</span>;
}

export function TypeBadge({ type }: { type: string }) {
  const c = useContent();
  const { lang } = usePrefs();
  return <span className="badge type">{type === 'note' ? (lang === 'en' ? 'Note' : 'Not') : typeLabel(c, type, lang)}</span>;
}

export function itemHref(id: string, section?: string) {
  return `/item/${encodeURIComponent(id)}${section ? `?s=${encodeURIComponent(section)}` : ''}`;
}

export function ItemLink({ id, children, section }: { id: string; children?: ReactNode; section?: string }) {
  const c = useContent();
  const { lang } = usePrefs();
  const it = c.byId.get(id);
  if (!it) return <span className="muted">{id}</span>;
  if (it.planned) return <span className="chip planned" title="Planlandı — içerik henüz yok">{children || displayTitle(it, lang)}</span>;
  return <Link to={itemHref(id, section)}>{children || displayTitle(it, lang)}</Link>;
}

export function ItemChip({ id }: { id: string }) {
  const c = useContent();
  const { lang } = usePrefs();
  const it = c.byId.get(id);
  if (!it) return null;
  if (it.planned) return <span className="chip planned" title="Planlandı — içerik henüz yok">{displayTitle(it, lang)}</span>;
  return <Link className="chip" to={itemHref(id)}>{displayTitle(it, lang)}</Link>;
}

export function ItemCard({ item, extra }: { item: Item; extra?: ReactNode }) {
  const { lang } = usePrefs();
  const body = (
    <>
      <div className="spread" style={{ marginBottom: '.35rem' }}>
        <TypeBadge type={item.type} />
        <StatusBadge item={item} />
      </div>
      <h3 style={{ margin: '.2rem 0 .3rem' }}>{displayTitle(item, lang)}</h3>
      <p className="small muted" style={{ margin: 0 }}>{displaySummary(item, lang)}</p>
      {extra}
    </>
  );
  if (item.planned) return <div className="card planned" data-testid={`card-${item.id}`}>{body}</div>;
  return <Link className="card link-card" to={itemHref(item.id)} data-testid={`card-${item.id}`}>{body}</Link>;
}

let toastSetter: ((m: string | null) => void) | null = null;
export function toast(msg: string) { toastSetter?.(msg); }
export function ToastHost() {
  const [m, setM] = useState<string | null>(null);
  useEffect(() => { toastSetter = setM; return () => { toastSetter = null; }; }, []);
  useEffect(() => { if (m) { const t = setTimeout(() => setM(null), 3200); return () => clearTimeout(t); } }, [m]);
  return m ? <div className="toast" role="status">{m}</div> : null;
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="tabs" role="tablist">
      {options.map(([v, l]) => <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

export function fmtDate(iso?: string | null, withTime = false) {
  if (!iso) return '—';
  const d = new Date(iso);
  return withTime ? d.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : d.toLocaleDateString('tr-TR', { dateStyle: 'medium' });
}

export function fmtBytes(n?: number) {
  if (n === undefined) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export function useOnline() {
  const [on, setOn] = useState(navigator.onLine);
  useEffect(() => {
    const a = () => setOn(true), b = () => setOn(false);
    window.addEventListener('online', a);
    window.addEventListener('offline', b);
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b); };
  }, []);
  return on;
}
