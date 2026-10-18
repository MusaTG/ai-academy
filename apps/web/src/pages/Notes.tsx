import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fmtDate, ItemChip, itemHref, toast } from '../components/common';
import { Markdown } from '../components/Markdown';
import { downloadBlob } from '../lib/dataio';
import { displayTitle, normTitle, useContent } from '../lib/content';
import { acceptSuggestion, backlinks, emptyNote, newNoteId, noteTargets, noteToMarkdown, rejectSuggestion, saveNote, suggestRelations } from '../lib/notes';
import { usePrefs } from '../lib/prefs';
import { getData, getRecord, put, remove, revisionsOf, useCollection, useStore } from '../lib/store';
import { apiBase, getAuth } from '../lib/sync';
import type { Note } from '../lib/types';

const created = new Set<string>(); // StrictMode'da çift not oluşmasını önler

function NewNote() {
  const c = useContent();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (created.has(loc.key)) return;
    created.add(loc.key);
    const from = params.get('from');
    const title = params.get('title');
    const it = from ? c.byId.get(from) : null;
    const id = newNoteId();
    const note = emptyNote(it ? {
      title: `${it.title} — notlarım`, body: `Kaynak: [[${it.id}|${it.title}]]\n\n`, source_item: it.id,
      sectors: it.type === 'sector' ? [it.id] : (it.relations.used_in_sector || []).slice(0, 3),
    } : { title: title || '' });
    void saveNote(id, note).then(() => nav(`/notes/${id}`, { replace: true }));
  }, [loc.key, params, c, nav]);
  return <p className="muted">Not oluşturuluyor…</p>;
}

function History({ id, onRestore }: { id: string; onRestore: (n: Note) => void }) {
  const [local, setLocal] = useState<any[] | null>(null);
  const [server, setServer] = useState<any[] | null>(null);
  const [srvErr, setSrvErr] = useState<string | null>(null);
  useEffect(() => {
    void revisionsOf('notes', id).then(setLocal);
    void getAuth().then(async (a) => {
      if (!a) { setSrvErr('Sunucu geçmişi için hesapla eşitleme gerekir.'); return; }
      try {
        const r = await fetch(`${apiBase(a.apiUrl)}/records/notes/${encodeURIComponent(id)}/revisions`, { headers: { authorization: `Bearer ${a.token}` } });
        if (r.status === 404) { setServer([]); return; }
        if (!r.ok) throw new Error(String(r.status));
        setServer(await r.json());
      } catch { setSrvErr('Sunucuya ulaşılamadı (çevrimdışı olabilirsiniz).'); }
    });
  }, [id]);
  return (
    <div className="small">
      <b>Bu cihazdaki sürümler</b> ({local?.length ?? '…'}, en fazla 50)
      <ul className="rel-list">{(local || []).slice(0, 15).map((r, i) => (
        <li key={i}>{fmtDate(r.at, true)} — {r.deleted ? 'silindi' : `${(r.data?.body || '').length} karakter`} {!r.deleted && i > 0 && <button className="btn sm ghost" onClick={() => onRestore(r.data)}>Geri yükle</button>}</li>
      ))}</ul>
      <b>Sunucudaki sürümler</b>
      {srvErr ? <p className="muted">{srvErr}</p> : <ul className="rel-list">{(server || []).slice(0, 15).map((r) => (
        <li key={r.version}>v{r.version} · {fmtDate(r.created_at, true)} {r.deleted ? '(silindi)' : ''} <button className="btn sm ghost" onClick={() => onRestore(r.data)}>Geri yükle</button></li>
      ))}</ul>}
    </div>
  );
}

function Editor({ id }: { id: string }) {
  const c = useContent();
  const { lang } = usePrefs();
  const nav = useNavigate();
  const stored = useStore(() => getData<Note>('notes', id));
  const rec = useStore(() => getRecord('notes', id));
  const [draft, setDraft] = useState<Note | null>(stored || null);
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showHistory, setShowHistory] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lastSaved = useRef<string>('');
  const attachments = useCollection<{ dataUrl: string }>('attachments');
  const attMap = useMemo(() => Object.fromEntries(attachments.map((a) => [a.id, a.data.dataUrl])), [attachments]);

  // Başka cihazdan / çakışma çözümünden gelen değişiklik: kullanıcı yazmıyorsa taslağı güncelle
  useEffect(() => {
    if (!stored) return;
    const s = JSON.stringify(stored);
    if (!draft || (s !== lastSaved.current && !timer.current)) { setDraft(stored); lastSaved.current = s; }
  }, [stored]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const update = (p: Partial<Note>) => {
    const next = { ...draft!, ...p };
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { timer.current = null; lastSaved.current = JSON.stringify(next); void saveNote(id, next); }, 700);
  };
  const flush = () => { if (timer.current && draft) { clearTimeout(timer.current); timer.current = null; lastSaved.current = JSON.stringify(draft); void saveNote(id, draft); } };

  const backl = useStore(() => backlinks(c, { kind: 'note', id }));
  const targets = useMemo(() => (draft ? noteTargets(c, draft) : { items: [], notes: [], missing: [] }), [c, draft]);
  const suggestions = useStore(() => (draft ? suggestRelations(c, id, draft) : []));

  if (!stored && !draft) return <div className="empty">Not bulunamadı veya silindi. <Link to="/notes">Notlara dön</Link></div>;
  if (!draft) return null;

  const insert = (before: string, after = '') => {
    const ta = taRef.current!;
    const { selectionStart: s, selectionEnd: e } = ta;
    const body = draft.body.slice(0, s) + before + draft.body.slice(s, e) + after + draft.body.slice(e);
    update({ body });
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + before.length + (e - s); });
  };
  const attach = (f: File) => {
    if (!f.type.startsWith('image/')) { toast('Şimdilik yalnızca görsel eklenebilir'); return; }
    if (f.size > 800 * 1024) { toast('Görsel 800 KB\'tan küçük olmalı (eşitleme sınırı)'); return; }
    const r = new FileReader();
    r.onload = () => {
      const aid = 'att-' + Date.now().toString(36);
      void put('attachments', aid, { name: f.name, type: f.type, dataUrl: r.result, note: id });
      insert(`![${f.name}](attachment:${aid})`);
    };
    r.readAsDataURL(f);
  };
  const del = async () => {
    if (!confirm('Not silinsin mi? (Silme diğer cihazlara da yansır; sürüm geçmişinden geri yüklenebilir.)')) return;
    flush();
    await remove('notes', id);
    nav('/notes');
  };
  const sectors = c.items.filter((i) => i.type === 'sector');

  return (
    <div className="stack" data-testid="note-editor">
      <div className="spread">
        <input className="title-input" value={draft.title} placeholder="Not başlığı" onChange={(e) => update({ title: e.target.value })} onBlur={flush} aria-label="Not başlığı" data-testid="note-title" />
      </div>
      <div className="row small">
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>Klasör <input className="input" style={{ width: 140 }} value={draft.folder} onChange={(e) => update({ folder: e.target.value })} placeholder="ör. FDE" /></label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>Etiketler <input className="input" style={{ width: 200 }} value={draft.tags.join(', ')} onChange={(e) => update({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="virgülle ayırın" /></label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>Kaynak URL <input className="input" style={{ width: 220 }} value={draft.source_url || ''} onChange={(e) => update({ source_url: e.target.value })} placeholder="https://…" /></label>
        <span className="muted">{rec?.dirty ? 'Kaydedildi (cihazda) · eşitleme bekliyor' : rec?.version ? `Eşitlendi · v${rec.version}` : 'Kaydedildi (cihazda)'}</span>
      </div>
      <div className="row small">
        <span className="muted">Sektörler:</span>
        {sectors.map((s) => <button key={s.id} className={`btn sm${draft.sectors.includes(s.id) ? ' on' : ''}`} onClick={() => update({ sectors: draft.sectors.includes(s.id) ? draft.sectors.filter((x) => x !== s.id) : [...draft.sectors, s.id] })}>{displayTitle(s, lang)}</button>)}
      </div>
      <div className="spread">
        <div className="row">
          <button className="btn sm" onClick={() => insert('[[', ']]')} title="Başka bir nota veya konuya bağlantı">[[bağlantı]]</button>
          <button className="btn sm" onClick={() => insert('$', '$')}>formül</button>
          <button className="btn sm" onClick={() => insert('\n```python\n', '\n```\n')}>kod</button>
          <label className="btn sm">görsel<input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && attach(e.target.files[0])} /></label>
        </div>
        <div className="row">
          {(['edit', 'split', 'preview'] as const).map((m) => <button key={m} className={`btn sm${mode === m ? ' on' : ''}`} onClick={() => setMode(m)}>{{ edit: 'Yaz', split: 'Bölünmüş', preview: 'Önizleme' }[m]}</button>)}
        </div>
      </div>
      <div className="editor" style={mode !== 'split' ? { gridTemplateColumns: '1fr' } : undefined}>
        {mode !== 'preview' && <textarea ref={taRef} value={draft.body} onChange={(e) => update({ body: e.target.value })} onBlur={flush} aria-label="Not içeriği" data-testid="note-body"
          placeholder={'Markdown yazın. [[IoU]] gibi bağlantılar diğer notlara ve konulara bağlanır; $x^2$ formül olur.'} />}
        {mode !== 'edit' && <div className="preview"><Markdown source={draft.body} attachments={attMap} /></div>}
      </div>

      <div className="grid two">
        <div className="card">
          <h4>Bu notun bağlantıları</h4>
          <div className="row">{targets.items.map((t) => <ItemChip key={t} id={t} />)}{targets.notes.map((n) => <Link key={n} className="chip" to={`/notes/${n}`}>✎ {getData<Note>('notes', n)?.title}</Link>)}</div>
          {targets.missing.length > 0 && <p className="small">Boş bağlantılar (henüz notu yok): {targets.missing.map((m) => <Link key={m} className="chip" to={`/notes/new?title=${encodeURIComponent(m)}`} style={{ marginRight: 4 }}>+ {m}</Link>)}</p>}
          <h4 style={{ marginTop: '1rem' }}>Bu nota bağlanan notlar ({backl.length})</h4>
          {backl.length ? <ul className="rel-list">{backl.map((b) => <li key={b.id}><Link to={`/notes/${b.id}`}>✎ {b.data.title}</Link></li>)}</ul> : <p className="small muted">Yok.</p>}
        </div>
        <div className="card" data-testid="suggestions">
          <h4>Önerilen ilişkiler</h4>
          <p className="small muted" style={{ marginTop: 0 }}>Otomatik eklenmez; onaylarsanız notun ilişkilerine eklenir ve grafikte görünür.</p>
          {suggestions.length ? suggestions.map((s) => (
            <div key={s.id} className="spread small" style={{ padding: '.25rem 0', borderBottom: '1px solid var(--line)' }}>
              <div><Link to={itemHref(s.id)}>{c.byId.get(s.id)!.title}</Link><div className="muted" style={{ fontSize: '.76rem' }}>{s.reason}</div></div>
              <div className="row"><button className="btn sm" onClick={() => { flush(); void acceptSuggestion(id, s.id); }} aria-label={`${c.byId.get(s.id)!.title} onayla`}>✓</button><button className="btn sm" onClick={() => void rejectSuggestion(id, s.id)} aria-label="Reddet">✕</button></div>
            </div>
          )) : <p className="small muted">Şimdilik öneri yok. Notta bir kavramdan bahsedin veya bir konuya bağlantı verin.</p>}
        </div>
      </div>
      <div className="row">
        <button className="btn" onClick={() => setShowHistory(!showHistory)}>Sürüm geçmişi</button>
        <button className="btn" onClick={() => { flush(); downloadBlob(noteToMarkdown(c, draft), `${draft.title || id}.md`, 'text/markdown'); }}>Markdown olarak indir</button>
        <Link className="btn" to={`/graph?focus=note:${id}`}>Grafikte göster</Link>
        <button className="btn danger" onClick={() => void del()}>Sil</button>
      </div>
      {showHistory && <div className="card"><History id={id} onRestore={(n) => { update(n); toast('Sürüm geri yüklendi (yeni sürüm olarak kaydedilir)'); }} /></div>}
    </div>
  );
}

export function NotesPage() {
  const { id } = useParams();
  const notes = useCollection<Note>('notes');
  const [filter, setFilter] = useState('');
  const [folder, setFolder] = useState('');
  const folders = [...new Set(notes.map((n) => n.data.folder).filter(Boolean))].sort();
  const shown = notes.filter((n) => (!folder || n.data.folder === folder) && (!filter || normTitle(n.data.title + ' ' + n.data.body + ' ' + n.data.tags.join(' ')).includes(normTitle(filter))))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  return (
    <div>
      <div className="page-head spread">
        <div><div className="eyebrow">Notes & Vault</div><h1 style={{ marginBottom: 0 }}>Notlar</h1></div>
        <Link className="btn primary" to="/notes/new">+ Yeni not</Link>
      </div>
      <div className="notes-layout">
        <aside>
          <input className="input" style={{ width: '100%', marginBottom: '.5rem' }} placeholder="Notlarda ara…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Notlarda ara" />
          {folders.length > 0 && <select className="input" style={{ width: '100%', marginBottom: '.5rem' }} value={folder} onChange={(e) => setFolder(e.target.value)}><option value="">Tüm klasörler</option>{folders.map((f) => <option key={f}>{f}</option>)}</select>}
          <ul className="note-list" data-testid="note-list">
            {shown.map((n) => <li key={n.id}><Link className={n.id === id ? 'active' : ''} to={`/notes/${n.id}`}><div>{n.data.title || '(başlıksız)'}</div><div className="small muted">{n.data.folder ? `${n.data.folder} · ` : ''}{fmtDate(n.updated_at)}{n.dirty ? ' · ●' : ''}</div></Link></li>)}
          </ul>
          {!notes.length && <p className="small muted">Henüz not yok.</p>}
        </aside>
        <section>
          {id === 'new' ? <NewNote /> : id ? <Editor key={id} id={id} /> : (
            <div className="empty">Soldan bir not seçin veya yeni bir not oluşturun. Notlar bu cihazda saklanır; hesap bağlıysa diğer cihazlarınızla eşitlenir. <code>[[Başlık]]</code> sözdizimi Obsidian ile uyumludur.</div>
          )}
        </section>
      </div>
    </div>
  );
}
