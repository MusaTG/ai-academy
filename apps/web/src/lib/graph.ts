// Bilgi grafiği verisi: içerik ilişkileri + içerik içi bağlantılar + kişisel notlar + planlanmış alanlar.
import { normTitle, type Content } from './content';
import { noteTargets } from './notes';
import type { LocalRecord, Note } from './types';

export interface GNode { id: string; label: string; kind: string; planned?: boolean; note?: boolean }
export interface GEdge { source: string; target: string; type: string }
export interface Graph { nodes: GNode[]; edges: GEdge[]; adj: Map<string, { other: string; type: string; dir: 'out' | 'in' }[]> }

export const NOTE_PREFIX = 'note:';

export function buildGraph(c: Content, notes: LocalRecord<Note>[], opts: { includeLessons?: boolean; includePlanned?: boolean } = {}): Graph {
  const nodes: GNode[] = [];
  const has = new Set<string>();
  const addNode = (n: GNode) => { if (!has.has(n.id)) { has.add(n.id); nodes.push(n); } };
  for (const it of c.items) {
    if (it.type === 'lesson' && !opts.includeLessons) continue;
    addNode({ id: it.id, label: it.title, kind: it.type });
  }
  if (opts.includePlanned !== false) for (const p of c.planned) addNode({ id: p.id, label: p.title, kind: p.type, planned: true });
  for (const n of notes) addNode({ id: NOTE_PREFIX + n.id, label: n.data.title || '(başlıksız not)', kind: 'note', note: true });

  const edges: GEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (source: string, target: string, type: string) => {
    if (!has.has(source) || !has.has(target) || source === target) return;
    const k = `${source}|${target}|${type}`;
    if (seen.has(k)) return;
    seen.add(k);
    edges.push({ source, target, type });
  };
  for (const it of c.items) {
    for (const [edge, targets] of Object.entries(it.relations)) for (const t of targets) addEdge(it.id, t, edge);
    for (const t of it.links || []) {
      // Aynı çift arasında tipli ilişki varsa ek "bahseder" kenarı çizilmez
      const typed = Object.values(it.relations).some((ts) => ts.includes(t)) || (c.byId.get(t)?.relations && Object.values(c.byId.get(t)!.relations).some((ts) => ts.includes(it.id)));
      if (!typed) addEdge(it.id, t, 'links');
    }
  }
  for (const n of notes) {
    const tg = noteTargets(c, n.data, notes);
    for (const t of tg.items) addEdge(NOTE_PREFIX + n.id, t, 'mentioned_in_note');
    for (const t of tg.notes) addEdge(NOTE_PREFIX + n.id, NOTE_PREFIX + t, 'links');
  }
  const adj: Graph['adj'] = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    adj.get(e.source)!.push({ other: e.target, type: e.type, dir: 'out' });
    adj.get(e.target)!.push({ other: e.source, type: e.type, dir: 'in' });
  }
  return { nodes, edges, adj };
}

/** Bir düğümün çevresi (yönsüz BFS), izin verilen kenar türleriyle. */
export function neighborhood(g: Graph, center: string, depth: number, allowed?: Set<string>): Set<string> {
  const out = new Set<string>([center]);
  let frontier = [center];
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) for (const a of g.adj.get(id) || []) {
      if (allowed && !allowed.has(a.type)) continue;
      if (!out.has(a.other)) { out.add(a.other); next.push(a.other); }
    }
    frontier = next;
  }
  return out;
}

export function orphans(g: Graph): GNode[] {
  return g.nodes.filter((n) => !n.planned && (g.adj.get(n.id)?.length || 0) === 0);
}

/** Olası mükerrer kavramlar: normalize başlığı aynı olan farklı düğümler (ör. not "IoU" ve kavram "IoU"). */
export function duplicates(c: Content, g: Graph): GNode[][] {
  const groups = new Map<string, GNode[]>();
  for (const n of g.nodes) {
    const keys = new Set([normTitle(n.label)]);
    const it = c.byId.get(n.id);
    if (it) for (const a of it.aliases) keys.add(normTitle(a));
    for (const k of keys) {
      if (k.length < 2) continue;
      if (!groups.has(k)) groups.set(k, []);
      if (!groups.get(k)!.includes(n)) groups.get(k)!.push(n);
    }
  }
  const out: GNode[][] = [];
  const seenSets = new Set<string>();
  for (const arr of groups.values()) if (arr.length > 1) {
    const k = arr.map((n) => n.id).sort().join('|');
    if (!seenSets.has(k)) { seenSets.add(k); out.push(arr); }
  }
  return out;
}
