// Öğrenme ilerlemesi. Bir konu yalnızca okunduğu için "tamamlandı" sayılmaz:
// quiz'i olan içerikte %60 başarı, quiz'i olmayan içerikte açık öz-değerlendirme gerekir.
import type { Content } from './content';
import { getData, list, put } from './store';
import type { Item } from './types';

export interface Progress {
  status: 'viewed' | 'in-progress' | 'done';
  viewed_at: string; done_at?: string;
  quiz?: { score: number; total: number; at: string; wrong: number[] };
  self_check?: string; // öz-değerlendirme notu
}

export const PASS_RATIO = 0.6;

export function getProgress(id: string) { return getData<Progress>('progress', id); }

export async function markViewed(id: string) {
  const p = getProgress(id);
  // Görüntüleme zaman damgası yalnızca 10 dakikada bir güncellenir (gereksiz eşitleme trafiği olmasın)
  if (p && Date.now() - Date.parse(p.viewed_at) < 10 * 60_000) return;
  await put('progress', id, { ...(p || { status: 'viewed' }), viewed_at: new Date().toISOString() });
}

export async function recordQuiz(id: string, score: number, total: number, wrong: number[]) {
  const p = getProgress(id) || { status: 'viewed', viewed_at: new Date().toISOString() };
  const passed = total > 0 && score / total >= PASS_RATIO;
  await put('progress', id, { ...p, status: passed ? 'done' : 'in-progress', done_at: passed ? new Date().toISOString() : p.done_at, quiz: { score, total, wrong, at: new Date().toISOString() } });
  return passed;
}

export async function markDone(id: string, selfCheck: string) {
  const p = getProgress(id) || { status: 'viewed', viewed_at: new Date().toISOString() };
  await put('progress', id, { ...p, status: 'done', done_at: new Date().toISOString(), self_check: selfCheck });
}

export async function markUndone(id: string) {
  const p = getProgress(id);
  if (p) await put('progress', id, { ...p, status: 'in-progress', done_at: undefined });
}

export function allProgress() {
  return new Map(list<Progress>('progress').map((r) => [r.id, r.data]));
}

/** Kaldığın yerden devam: en son görüntülenen, tamamlanmamış içerik. */
export function continueItem(c: Content): Item | null {
  const rows = list<Progress>('progress').filter((r) => r.data.status !== 'done' && c.byId.has(r.id))
    .sort((a, b) => b.data.viewed_at.localeCompare(a.data.viewed_at));
  return rows.length ? c.byId.get(rows[0].id)! : null;
}

/** Önerilen sonraki adım: başlanmış bir öğrenme yolundaki ilk tamamlanmamış adım; yoksa ön koşulu bitmiş bir konu. */
export function nextSuggestion(c: Content): { item: Item; why: string } | null {
  const prog = allProgress();
  const paths = c.items.filter((i) => i.type === 'path' && i.steps?.length);
  for (const p of paths.sort((a, b) => stepsDone(b, prog) - stepsDone(a, prog))) {
    const started = stepsDone(p, prog) > 0 || prog.has(p.id);
    const next = p.steps!.find((s) => prog.get(s)?.status !== 'done' && c.byId.has(s));
    if (started && next) return { item: c.byId.get(next)!, why: `“${p.title}” yolunun sıradaki adımı` };
  }
  // Ön koşullarının hepsi tamamlanmış ve kendisi bitmemiş bir kavram
  for (const it of c.items) {
    if (prog.get(it.id)?.status === 'done' || !['concept', 'algorithm', 'metric', 'tutorial'].includes(it.type)) continue;
    const pre = (c.incoming.get(it.id) || []).filter((e) => e.edge === 'prerequisite').map((e) => e.from);
    if (pre.length && pre.every((p) => prog.get(p)?.status === 'done')) return { item: it, why: 'Tüm ön koşullarını tamamladınız' };
  }
  const first = paths[0]?.steps?.[0];
  return first && c.byId.has(first) ? { item: c.byId.get(first)!, why: `“${paths[0].title}” ile başlayın` } : null;
}

export function stepsDone(path: Item, prog = allProgress()) {
  return (path.steps || []).filter((s) => prog.get(s)?.status === 'done').length;
}

/** Tekrar listesi (basit ve açıklanabilir; bilimsel kesinlik iddiası yok):
 *  quiz'de %80 altı kalanlar ve 14 günden uzun süredir tekrar edilmeyen tamamlanmış konular. */
export function reviewList(c: Content) {
  const out: { item: Item; why: string }[] = [];
  for (const r of list<Progress>('progress')) {
    const it = c.byId.get(r.id);
    if (!it) continue;
    const q = r.data.quiz;
    if (q && q.total && q.score / q.total < 0.8) out.push({ item: it, why: `Quiz: ${q.score}/${q.total}` });
    else if (r.data.status === 'done' && r.data.done_at && Date.now() - Date.parse(r.data.viewed_at) > 14 * 86400_000) out.push({ item: it, why: '14 günden uzun süredir tekrar edilmedi' });
  }
  return out;
}
