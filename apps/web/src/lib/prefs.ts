// Kullanıcı tercihleri (tema, dil, yazı boyutu...) — "settings" koleksiyonunda eşitlenir.
import { useEffect } from 'react';
import { getData, put, useData } from './store';
import type { Prefs } from './types';

export const THEMES: { id: string; tr: string; en: string }[] = [
  { id: 'light', tr: 'Açık — akademik', en: 'Light — academic' },
  { id: 'dark', tr: 'Koyu — uzun çalışma', en: 'Dark — long sessions' },
  { id: 'midnight', tr: 'Gece mavisi', en: 'Midnight' },
  { id: 'glass', tr: 'Buzlu cam', en: 'Frosted glass' },
  { id: 'aurora', tr: 'Aurora', en: 'Aurora' },
  { id: 'neutral', tr: 'Sade nötr', en: 'Minimal neutral' },
  { id: 'contrast', tr: 'Yüksek kontrast', en: 'High contrast' },
];

export const DEFAULT_PREFS: Prefs = {
  theme: 'light', lang: 'tr', fontSize: 16, density: 'comfortable', reducedMotion: false, accent: null,
  appName: 'Engineering Academy', apiUrl: '', repoUrl: '', researchHubUrl: '',
};

export function getPrefs(): Prefs {
  return { ...DEFAULT_PREFS, ...(getData<Partial<Prefs>>('settings', 'prefs') || {}) };
}

export function usePrefs(): Prefs {
  const p = useData<Partial<Prefs>>('settings', 'prefs');
  return { ...DEFAULT_PREFS, ...(p || {}) };
}

export async function setPrefs(p: Partial<Prefs>) {
  await put('settings', 'prefs', { ...getPrefs(), ...p });
}

/** WCAG kontrast oranı (iki hex renk). Vurgu rengi seçilirken uyarı için kullanılır. */
export function contrastRatio(a: string, b: string) {
  const lum = (hex: string) => {
    const n = hex.replace('#', '');
    const [r, g, bl] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function useApplyPrefs(p: Prefs) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = p.theme;
    root.dataset.density = p.density;
    root.dataset.motion = p.reducedMotion ? 'reduced' : 'full';
    root.lang = p.lang;
    root.style.setProperty('--font-size', `${p.fontSize}px`);
    if (p.accent) root.style.setProperty('--accent', p.accent);
    else root.style.removeProperty('--accent');
    document.title = p.appName || 'Engineering Academy';
  }, [p.theme, p.density, p.reducedMotion, p.lang, p.fontSize, p.accent, p.appName]);
}

const STRINGS = {
  tr: {
    dashboard: 'Ana panel', learn: 'Öğren', explore: 'Keşfet', personal: 'Kişisel', system: 'Sistem',
    industry: 'Sektör Akademisi', careers: 'Meslek Keşfi', paths: 'Öğrenme yolları', tutorials: 'Tutorial & Kod', metrics: 'Metrik Laboratuvarı',
    graph: 'Bilgi Grafiği', search: 'Arama', research: 'Araştırma & Haberler', notes: 'Notlar & Kasa', offline: 'Online / Offline',
    data: 'Veri Koruma', coverage: 'Kapsam', settings: 'Ayarlar', searchPlaceholder: 'Konu, meslek, formül, not ara…',
    takeNote: 'Not al', save: 'Kaydet', saved: 'Kaydedildi', markDone: 'Tamamlandı işaretle', done: 'Tamamlandı', download: 'Cihaza indir',
    downloaded: 'Cihazda', showInGraph: 'Grafikte göster', contents: 'İçindekiler', related: 'İlişkiler', backlinks: 'Bu sayfaya bağlanan notlar',
    sources: 'Kaynaklar', planned: 'Planlandı', offlineBanner: 'Çevrimdışısınız — indirilen dersler ve notlarınız çalışır; haberler ve eşitleme bağlantı gelince devam eder.',
  },
  en: {
    dashboard: 'Dashboard', learn: 'Learn', explore: 'Explore', personal: 'Personal', system: 'System',
    industry: 'Industry Academy', careers: 'Career Explorer', paths: 'Learning paths', tutorials: 'Tutorials & Code', metrics: 'Metrics Lab',
    graph: 'Knowledge Graph', search: 'Search', research: 'Research & News', notes: 'Notes & Vault', offline: 'Online / Offline',
    data: 'Data Protection', coverage: 'Coverage', settings: 'Settings', searchPlaceholder: 'Search topics, careers, formulas, notes…',
    takeNote: 'Take note', save: 'Save', saved: 'Saved', markDone: 'Mark complete', done: 'Completed', download: 'Download',
    downloaded: 'On device', showInGraph: 'Show in graph', contents: 'Contents', related: 'Relations', backlinks: 'Notes linking here',
    sources: 'Sources', planned: 'Planned', offlineBanner: 'You are offline — downloaded lessons and notes work; news and sync resume when connected.',
  },
};
export type StrKey = keyof typeof STRINGS.tr;
export function useT() {
  const p = usePrefs();
  return (k: StrKey) => STRINGS[p.lang][k] || STRINGS.tr[k];
}
