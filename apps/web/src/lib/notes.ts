// Obsidian benzeri not mantığı: [[bağlantı]] çözümleme, backlink'ler ve ilişki önerileri.
import { normTitle, resolveItem, type Content } from './content';
import { getData, list, put } from './store';
import type { LocalRecord, Note } from './types';

export interface WikiLink { target: string; section?: string; alias?: string }

export function parseWikilinks(text: string): WikiLink[] {
  const out: WikiLink[] = [];
  let inFence = false;
  for (const line of (text || '').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const m of line.matchAll(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g)) {
      out.push({ target: m[1].trim(), section: m[2]?.trim(), alias: m[3]?.trim() });
    }
  }
  return out;
}

export type Resolved = { kind: 'item'; id: string } | { kind: 'note'; id: string } | { kind: 'missing'; title: string };

export function notes(): LocalRecord<Note>[] {
  return list<Note>('notes');
}

/** Hedef çözümleme sırası: içerik id'si → not başlığı → içerik başlığı/takma adı. Hiçbiri yoksa "boş bağlantı". */
export function resolveLink(c: Content, target: string, allNotes = notes()): Resolved {
  if (c.byId.has(target) && !c.byId.get(target)!.planned) return { kind: 'item', id: target };
  const n = normTitle(target);
  const note = allNotes.find((r) => normTitle(r.data.title || '') === n || r.id === target);
  if (note) return { kind: 'note', id: note.id };
  const id = resolveItem(c, target);
  if (id && !c.byId.get(id)!.planned) return { kind: 'item', id };
  return { kind: 'missing', title: target };
}

/** Bir notun bağlandığı içerik ve notlar (gövde bağlantıları + onaylanmış ilişkiler). */
export function noteTargets(c: Content, note: Note, allNotes = notes()) {
  const items = new Set<string>(note.links || []);
  const noteIds = new Set<string>();
  const missing = new Set<string>();
  if (note.source_item) items.add(note.source_item);
  for (const s of note.sectors || []) items.add(s);
  for (const w of parseWikilinks(note.body)) {
    const r = resolveLink(c, w.target, allNotes);
    if (r.kind === 'item') items.add(r.id);
    else if (r.kind === 'note') noteIds.add(r.id);
    else missing.add(r.title);
  }
  return { items: [...items], notes: [...noteIds], missing: [...missing] };
}

/** Bir içerik sayfasına veya nota bağlantı veren notlar (Backlinks). */
export function backlinks(c: Content, target: { kind: 'item' | 'note'; id: string }): LocalRecord<Note>[] {
  const all = notes();
  return all.filter((r) => {
    if (target.kind === 'note' && r.id === target.id) return false;
    const t = noteTargets(c, r.data, all);
    return target.kind === 'item' ? t.items.includes(target.id) : t.notes.includes(target.id);
  });
}

export function newNoteId() {
  return 'n-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

export function emptyNote(partial: Partial<Note> = {}): Note {
  return { title: '', body: '', tags: [], folder: '', links: [], sectors: [], created_at: new Date().toISOString(), ...partial };
}

export async function saveNote(id: string, note: Note) {
  await put('notes', id, note);
}

export interface Suggestion { id: string; reason: string; score: number }

/**
 * İlişki önerileri (onay gerektirir, otomatik eklenmez):
 *  1) Not metninde başlığı/takma adı geçen içerikler,
 *  2) Notun bağlı olduğu içeriklerin grafikteki komşuları.
 * Kullanıcının reddettiği öneriler (graph_feedback) bir daha gösterilmez.
 */
export function suggestRelations(c: Content, noteId: string, note: Note, limit = 8): Suggestion[] {
  const linked = new Set(noteTargets(c, note).items);
  const rejected = new Set(list<{ note: string; target: string; verdict: string }>('graph_feedback')
    .filter((r) => r.data.note === noteId && r.data.verdict === 'rejected').map((r) => r.data.target));
  const text = ` ${normalizeText(note.title + ' ' + note.body)} `;
  const scores = new Map<string, Suggestion>();
  const add = (id: string, score: number, reason: string) => {
    if (linked.has(id) || rejected.has(id) || !c.byId.has(id) || c.byId.get(id)!.planned) return;
    const cur = scores.get(id);
    if (!cur || cur.score < score) scores.set(id, { id, score: (cur?.score || 0) + score, reason: cur ? `${cur.reason}; ${reason}` : reason });
  };
  for (const it of c.items) {
    if (it.type === 'lesson') continue;
    for (const name of [it.title, it.title_en, ...it.aliases].filter(Boolean) as string[]) {
      const n = normalizeText(name);
      if (n.length >= 3 && text.includes(` ${n} `)) { add(it.id, 3, `metinde “${name}” geçiyor`); break; }
    }
  }
  for (const id of linked) {
    const it = c.byId.get(id);
    if (!it) continue;
    for (const [edge, targets] of Object.entries(it.relations)) for (const t of targets) add(t, 1.5, `“${it.title}” ile ilişkili (${c.bundle.edgeTypes[edge]?.label || edge})`);
    for (const inc of c.incoming.get(id) || []) add(inc.from, 1, `“${it.title}” ile ilişkili`);
  }
  return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

function normalizeText(s: string) {
  return s.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export async function acceptSuggestion(noteId: string, target: string) {
  const n = getData<Note>('notes', noteId);
  if (!n) return;
  await put('notes', noteId, { ...n, links: [...new Set([...(n.links || []), target])] });
  await put('graph_feedback', `${noteId}__${target}`, { note: noteId, target, verdict: 'accepted', at: new Date().toISOString() });
}

export async function rejectSuggestion(noteId: string, target: string) {
  await put('graph_feedback', `${noteId}__${target}`, { note: noteId, target, verdict: 'rejected', at: new Date().toISOString() });
}

export function noteToMarkdown(c: Content, note: Note): string {
  const fm = [
    '---',
    `title: ${JSON.stringify(note.title)}`,
    `tags: [${(note.tags || []).map((t) => JSON.stringify(t)).join(', ')}]`,
    note.folder ? `folder: ${JSON.stringify(note.folder)}` : null,
    (note.links || []).length ? `related: [${note.links.map((l) => JSON.stringify(c.byId.get(l)?.title || l)).join(', ')}]` : null,
    note.source_url ? `source: ${note.source_url}` : null,
    `created: ${note.created_at}`,
    '---',
  ].filter(Boolean).join('\n');
  return `${fm}\n\n# ${note.title}\n\n${note.body}\n`;
}
