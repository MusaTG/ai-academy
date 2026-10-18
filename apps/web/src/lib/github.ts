// GitHub dosya bağlantıları (Senaryo 7). Bağlantılar yalnızca derleme sırasında bilinen gerçek
// repo + commit ve içerik derleyicisinin dosyadan okuduğu gerçek yol/satır aralıklarıyla üretilir.
// Repo bilinmiyorsa sahte bağlantı üretilmez; arayüz "repo ayarlanmadı" der.
import type { CodeFile, CodeRegion, ContentBundle } from './types';

export interface RepoInfo { url: string; ref: string; source: 'build' | 'settings' }

export function repoInfo(bundle: ContentBundle, settingsUrl: string): RepoInfo | null {
  if (bundle.repo?.url) return { url: bundle.repo.url, ref: bundle.repo.ref, source: 'build' };
  const u = settingsUrl.trim().replace(/\/$/, '').replace(/\.git$/, '');
  if (/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(u)) return { url: u, ref: 'main', source: 'settings' };
  return null;
}

export function fileUrl(repo: RepoInfo, file: CodeFile, region?: CodeRegion): string {
  const base = `${repo.url}/blob/${encodeURIComponent(repo.ref)}/${file.path.split('/').map(encodeURIComponent).join('/')}`;
  return region ? `${base}#L${region.start}-L${region.end}` : base;
}

export function rawUrl(repo: RepoInfo, file: CodeFile): string {
  return `${repo.url}/raw/${encodeURIComponent(repo.ref)}/${file.path}`;
}

export function folderUrl(repo: RepoInfo, path: string): string {
  return `${repo.url}/tree/${encodeURIComponent(repo.ref)}/${path}`;
}

export function actionsUrl(repo: RepoInfo): string {
  return `${repo.url}/actions`;
}
