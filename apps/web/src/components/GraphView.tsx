import { drag } from 'd3-drag';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { useEffect, useRef } from 'react';
import type { GEdge, GNode } from '../lib/graph';

type SNode = GNode & SimulationNodeDatum;
type SLink = SimulationLinkDatum<SNode> & { type: string };

// Gereksiz renk kalabalığı yerine: 4 vurgu rengi + şekil farkı. Diğer türler nötr gri.
export const KIND_STYLE: Record<string, { color: string; shape: 'circle' | 'square' | 'diamond' | 'triangle'; r: number; label: string }> = {
  sector: { color: 'var(--accent)', shape: 'square', r: 11, label: 'Sektör' },
  career: { color: 'var(--info)', shape: 'diamond', r: 10, label: 'Meslek' },
  technology: { color: 'var(--ok)', shape: 'circle', r: 10, label: 'Ortak teknoloji' },
  note: { color: 'var(--warn)', shape: 'triangle', r: 8, label: 'Kişisel not' },
};
const DEFAULT_STYLE = { color: 'var(--ink-3)', shape: 'circle' as const, r: 6, label: 'Kavram / metrik / tutorial / diğer' };
export const styleOf = (kind: string) => KIND_STYLE[kind] || DEFAULT_STYLE;

function shapePath(shape: string, r: number) {
  switch (shape) {
    case 'square': return `M${-r},${-r}h${2 * r}v${2 * r}h${-2 * r}z`;
    case 'diamond': return `M0,${-r * 1.25}L${r * 1.25},0L0,${r * 1.25}L${-r * 1.25},0z`;
    case 'triangle': return `M0,${-r * 1.2}L${r * 1.1},${r * 0.8}L${-r * 1.1},${r * 0.8}z`;
    default: return `M${r},0A${r},${r} 0 1,1 ${-r},0A${r},${r} 0 1,1 ${r},0`;
  }
}

export function GraphView({ nodes, edges, focus, highlight, onSelect, showLabels = true }: {
  nodes: GNode[]; edges: GEdge[]; focus: string | null; highlight: Set<string> | null; onSelect: (id: string) => void; showLabels?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const svg = select(ref.current!);
    svg.selectAll('*').remove();
    const { width, height } = ref.current!.getBoundingClientRect();
    const g = svg.append('g');
    const sn: SNode[] = nodes.map((n) => ({ ...n }));
    const byId = new Map(sn.map((n) => [n.id, n]));
    const sl: SLink[] = edges.filter((e) => byId.has(e.source) && byId.has(e.target)).map((e) => ({ source: e.source, target: e.target, type: e.type }));
    const degree = new Map<string, number>();
    for (const l of sl) for (const k of [l.source as string, l.target as string]) degree.set(k, (degree.get(k) || 0) + 1);

    const sim = forceSimulation(sn)
      .force('link', forceLink<SNode, SLink>(sl).id((d) => d.id).distance((l) => (l.type === 'links' ? 120 : 95)).strength(0.4))
      .force('charge', forceManyBody().strength(-420))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<SNode>().radius((d) => styleOf(d.kind).r + 6));

    const link = g.append('g').selectAll('line').data(sl).join('line')
      .attr('stroke', 'var(--line-strong)').attr('stroke-width', (d) => (d.type === 'links' || d.type === 'mentioned_in_note' ? 1 : 1.5))
      .attr('stroke-dasharray', (d) => (d.type === 'links' || d.type === 'mentioned_in_note' ? '3 3' : null))
      .attr('class', (d) => (highlight && !(highlight.has((d.source as SNode).id) && highlight.has((d.target as SNode).id)) ? 'dim' : ''));

    const node = g.append('g').selectAll<SVGGElement, SNode>('g').data(sn).join('g')
      .attr('class', (d) => `node${d.id === focus ? ' focus' : ''}${highlight && !highlight.has(d.id) ? ' dim' : ''}`)
      .attr('data-node', (d) => d.id)
      .attr('tabindex', 0).attr('role', 'button').attr('aria-label', (d) => d.label)
      .style('cursor', 'pointer')
      .on('click', (_, d) => onSelectRef.current(d.id))
      .on('keydown', (ev: KeyboardEvent, d) => { if (ev.key === 'Enter' || ev.key === ' ') onSelectRef.current(d.id); });

    node.append('path')
      .attr('d', (d) => shapePath(styleOf(d.kind).shape, styleOf(d.kind).r + Math.min(6, (degree.get(d.id) || 0) * 0.4) + (d.id === focus ? 4 : 0)))
      .attr('fill', (d) => (d.planned ? 'transparent' : styleOf(d.kind).color))
      .attr('stroke', (d) => (d.planned ? 'var(--ink-3)' : d.id === focus ? 'var(--ink)' : 'var(--bg-elev)'))
      .attr('stroke-dasharray', (d) => (d.planned ? '2 2' : null))
      .attr('stroke-width', (d) => (d.id === focus ? 2.5 : 1.5));
    node.append('title').text((d) => `${d.label}${d.planned ? ' (planlandı — içerik yok)' : ''}`);
    if (showLabels) node.append('text').attr('x', (d) => styleOf(d.kind).r + 5).attr('y', 4).text((d) => d.label.length > 34 ? d.label.slice(0, 32) + '…' : d.label);

    node.call(drag<SVGGElement, SNode>()
      .on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
      .on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    const z = zoom<SVGSVGElement, unknown>().scaleExtent([0.15, 4]).on('zoom', (ev) => g.attr('transform', ev.transform));
    svg.call(z);
    sim.on('tick', () => {
      link.attr('x1', (d) => (d.source as SNode).x!).attr('y1', (d) => (d.source as SNode).y!)
        .attr('x2', (d) => (d.target as SNode).x!).attr('y2', (d) => (d.target as SNode).y!);
      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
    // Yerleşim oturunca odak düğümü merkeze al
    sim.on('end.center', () => {
      const f = focus ? byId.get(focus) : null;
      if (f && f.x !== undefined) svg.call(z.transform, zoomIdentity.translate(width / 2 - f.x, height / 2 - f.y!));
    });
    return () => { sim.stop(); };
  }, [nodes, edges, focus, highlight, showLabels]);

  return <svg ref={ref} role="img" aria-label="Bilgi grafiği" data-testid="graph-svg" />;
}
