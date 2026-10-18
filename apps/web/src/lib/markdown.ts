// Markdown → güvenli HTML. KaTeX formülleri, [[wikilink]]'ler ve "## Başlık {#id}" bölüm kimlikleri desteklenir.
import DOMPurify from 'dompurify';
import katex from 'katex';
import { Marked } from 'marked';
import { slugify } from './content';

export type LinkResolver = (target: string, section?: string, alias?: string) => { href: string; label: string; className: string };

function renderMath(expr: string, display: boolean) {
  try {
    return katex.renderToString(expr, { displayMode: display, throwOnError: false, output: 'htmlAndMathml' });
  } catch {
    return `<code>${expr}</code>`;
  }
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function renderMarkdown(md: string, resolve: LinkResolver, opts: { attachments?: Record<string, string> } = {}): string {
  const seen = new Map<string, number>();
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    extensions: [
      {
        name: 'mathBlock', level: 'block',
        start: (src: string) => src.indexOf('$$'),
        tokenizer(src: string) {
          const m = /^\$\$([\s\S]+?)\$\$(?:\n|$)/.exec(src);
          if (m) return { type: 'mathBlock', raw: m[0], text: m[1].trim() };
          return undefined;
        },
        renderer: (t: any) => `<div class="math-block">${renderMath(t.text, true)}</div>`,
      },
      {
        name: 'mathInline', level: 'inline',
        start: (src: string) => src.indexOf('$'),
        tokenizer(src: string) {
          const m = /^\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\w)/.exec(src);
          if (m) return { type: 'mathInline', raw: m[0], text: m[1] };
          return undefined;
        },
        renderer: (t: any) => renderMath(t.text, false),
      },
      {
        name: 'wikilink', level: 'inline',
        start: (src: string) => src.indexOf('[['),
        tokenizer(src: string) {
          const m = /^\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/.exec(src);
          if (m) return { type: 'wikilink', raw: m[0], target: m[1].trim(), section: m[2]?.trim(), alias: m[3]?.trim() };
          return undefined;
        },
        renderer: (t: any) => {
          const r = resolve(t.target, t.section, t.alias);
          return `<a href="${escapeHtml(r.href)}" class="${r.className}" data-wikilink="${escapeHtml(t.target)}">${escapeHtml(r.label)}</a>`;
        },
      },
    ],
    renderer: {
      heading({ tokens, depth, text }: any) {
        const m = /\s*\{#([a-z0-9-]+)\}\s*$/.exec(text);
        const clean = m ? text.slice(0, m.index) : text;
        let id = m ? m[1] : slugify(clean);
        const n = seen.get(id) || 0;
        seen.set(id, n + 1);
        if (n) id = `${id}-${n + 1}`;
        const inner = (this as any).parser.parseInline(tokens).replace(/\s*\{#[a-z0-9-]+\}\s*$/, '');
        return `<h${depth} id="${id}" class="anchored">${inner}<a class="anchor" href="#" data-section="${id}" aria-label="Bölüm bağlantısını kopyala">#</a></h${depth}>`;
      },
      code({ text, lang }: any) {
        return `<div class="code-block"><div class="code-head"><span>${escapeHtml(lang || 'text')}</span><button class="copy-btn" type="button" data-copy>Kopyala</button></div><pre><code>${escapeHtml(text)}</code></pre></div>`;
      },
      image({ href, title, text }: any) {
        const src = href?.startsWith('attachment:') ? opts.attachments?.[href.slice(11)] || '' : href;
        if (!src) return `<span class="muted">[eksik ek: ${escapeHtml(text || href)}]</span>`;
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(text || '')}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy">`;
      },
      link({ href, title, tokens }: any) {
        const inner = (this as any).parser.parseInline(tokens);
        const external = /^https?:/.test(href);
        return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`;
      },
    },
  } as any);
  const html = marked.parse(md || '') as string;
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'data-wikilink', 'data-section', 'data-copy', 'aria-hidden', 'encoding'],
    ADD_TAGS: ['semantics', 'annotation'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|data:image\/(?:png|jpeg|gif|webp);|#|\.|\/)/i,
  });
}
