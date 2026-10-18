import { useMemo, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../lib/content';
import { renderMarkdown } from '../lib/markdown';
import { notes, resolveLink } from '../lib/notes';
import { useStore } from '../lib/store';
import { itemHref, toast } from './common';

/** Markdown gövdesi. [[Bağlantılar]] içerik sayfalarına, notlara veya (yoksa) yeni not oluşturmaya gider. */
export function Markdown({ source, attachments, className = 'prose' }: { source: string; attachments?: Record<string, string>; className?: string }) {
  const c = useContent();
  const nav = useNavigate();
  const allNotes = useStore(() => notes());
  const html = useMemo(() => renderMarkdown(source, (target, section, alias) => {
    const r = resolveLink(c, target, allNotes);
    if (r.kind === 'item') return { href: '#' + itemHref(r.id, section), label: alias || c.byId.get(r.id)!.title, className: 'wikilink' };
    if (r.kind === 'note') return { href: `#/notes/${encodeURIComponent(r.id)}`, label: alias || target, className: 'wikilink note' };
    return { href: `#/notes/new?title=${encodeURIComponent(target)}`, label: alias || target, className: 'wikilink missing' };
  }, { attachments }), [source, c, allNotes, attachments]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    const copy = el.closest('[data-copy]');
    if (copy) {
      const code = copy.closest('.code-block')?.querySelector('code')?.textContent || '';
      void navigator.clipboard?.writeText(code).then(() => toast('Kod kopyalandı'), () => toast('Kopyalanamadı'));
      return;
    }
    const anchor = el.closest('a[data-section]') as HTMLAnchorElement | null;
    if (anchor) {
      e.preventDefault();
      const id = anchor.dataset.section!;
      const url = new URL(window.location.href);
      const [path] = url.hash.slice(1).split('?');
      const link = `${url.origin}${url.pathname}#${path}?s=${id}`;
      void navigator.clipboard?.writeText(link).then(() => toast('Bölüm bağlantısı kopyalandı'));
      document.getElementById(id)?.scrollIntoView();
      return;
    }
    const a = el.closest('a') as HTMLAnchorElement | null;
    const href = a?.getAttribute('href');
    if (a && href?.startsWith('#/')) { e.preventDefault(); nav(href.slice(1)); }
  };
  // eslint-disable-next-line react/no-danger
  return <div className={className} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
