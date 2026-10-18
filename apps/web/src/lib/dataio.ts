// Dışa / içe aktarma (Veri Koruma Merkezi). Sunucu olmadan da çalışır.
import { strToU8, zipSync } from 'fflate';
import type { Content } from './content';
import { noteToMarkdown } from './notes';
import { allRecords, getRecord, putRaw } from './store';
import type { LocalRecord, Note } from './types';

export function exportJSON() {
  return {
    format: 'academy-export', schema_version: 1, exported_at: new Date().toISOString(),
    records: allRecords().map((r) => ({ collection: r.collection, id: r.id, version: r.version, deleted: r.deleted, data: r.data, updated_at: r.updated_at })),
  };
}

export function exportNotesZip(c: Content): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  const used = new Set<string>();
  for (const r of allRecords().filter((x) => x.collection === 'notes' && !x.deleted) as LocalRecord<Note>[]) {
    const base = (r.data.title || r.id).replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80) || r.id;
    let name = `${r.data.folder ? r.data.folder.replace(/[\\:*?"<>|]+/g, '-') + '/' : ''}${base}.md`;
    let i = 2;
    while (used.has(name)) name = name.replace(/(?: \(\d+\))?\.md$/, ` (${i++}).md`);
    used.add(name);
    files[name] = strToU8(noteToMarkdown(c, r.data));
  }
  files['README.txt'] = strToU8('Engineering Academy not dışa aktarımı. [[Bağlantılar]] Obsidian ile uyumludur.\n');
  return zipSync(files);
}

export function downloadBlob(data: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** İçe aktarma birleştirir: yerelde daha yeni olan kayıt korunur, hiçbir şey sessizce ezilmez. */
export async function importJSON(json: any): Promise<{ created: number; updated: number; skipped: number; invalid: number }> {
  if (json?.format !== 'academy-export' || !Array.isArray(json.records)) throw new Error('Bu dosya bir Academy dışa aktarımı değil.');
  const stats = { created: 0, updated: 0, skipped: 0, invalid: 0 };
  for (const r of json.records) {
    if (!r || typeof r.collection !== 'string' || typeof r.id !== 'string') { stats.invalid++; continue; }
    const cur = getRecord(r.collection, r.id);
    if (cur && cur.updated_at >= (r.updated_at || '')) { stats.skipped++; continue; }
    await putRaw({ key: `${r.collection}/${r.id}`, collection: r.collection, id: r.id, data: r.data, deleted: !!r.deleted, version: cur?.version ?? 0, dirty: true, updated_at: r.updated_at || new Date().toISOString() }, true);
    stats[cur ? 'updated' : 'created']++;
  }
  return stats;
}
