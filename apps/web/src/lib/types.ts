export type Relations = Record<string, string[]>;

export interface Section { id: string; title: string; level: number }
export interface Source { title: string; url: string; kind?: string; lang?: string; accessed?: string }
export interface CodeRegion { name: string; start: number; end: number }
export interface CodeFile {
  title: string; file: string; path: string; lines?: number; sha?: string;
  regions?: CodeRegion[]; deps: string[]; run: string | null; source?: string;
}
export interface TestResult {
  id: string; status: 'passed' | 'failed' | 'gpu-skipped' | 'no-tests'; passed: number; failed: number; duration: number;
  cases?: { name: string; status: string }[];
}

export interface Item {
  id: string; type: string; title: string; title_en: string | null; summary: string; summary_en: string | null;
  status: 'complete' | 'partial' | 'stub' | 'planned'; declaredStatus: string | null;
  coverage: { required: number; present: number; missing: string[] };
  level: string | null; duration: string | null; group: string | null; order: number | null;
  tags: string[]; aliases: string[]; alt_titles: string[]; relations: Relations; links: string[];
  sources: Source[]; last_verified: string | null; version: number; hash: string; file: string;
  sections: Section[]; code: CodeFile[]; hasQuiz: boolean; steps: string[] | null; tests: TestResult | null;
  text: string; bytes: number;
  planned?: boolean; // catalog.yaml'dan gelen, içeriği henüz yazılmamış alan
}

export interface CatalogEntry { id: string; title: string; title_en?: string; group?: string }

export interface ContentBundle {
  schema: number; generated_at: string; version: string;
  repo: { url: string; ref: string } | null;
  scriptReport: { generated_at: string; python: string; platform: string } | null;
  edgeTypes: Record<string, { label: string; label_en: string; inverse: string }>;
  itemTypes: Record<string, { dir: string; label: string; label_en: string }>;
  templates: Record<string, [string, string][]>;
  catalog: { sectors: CatalogEntry[]; careers: CatalogEntry[] };
  items: Item[];
}

export interface QuizQuestion { q: string; q_en?: string; options: string[]; answer: number; explain?: string }

export interface ItemBody {
  id: string; body: string; body_en: string | null; quiz: QuizQuestion[]; code: CodeFile[]; hash: string;
}

/** Yerel kayıt: IndexedDB'de tutulan, sunucuyla eşitlenebilen kişisel veri. */
export interface LocalRecord<T = any> {
  key: string; // `${collection}/${id}`
  collection: string;
  id: string;
  data: T;
  version: number; // bilinen son sunucu sürümü (0 = sunucuda hiç yok)
  deleted: boolean;
  dirty: boolean; // sunucuya gönderilmemiş yerel değişiklik var
  updated_at: string;
}

export interface Conflict { key: string; collection: string; id: string; local: LocalRecord; server: { version: number; deleted: boolean; data: any; updated_at: string; device_id?: string } }

export interface Note {
  title: string; body: string; tags: string[]; folder: string;
  links: string[]; // kullanıcının onayladığı ilişkiler (içerik id'leri)
  sectors: string[]; source_item?: string; source_url?: string; created_at: string;
}

export interface Prefs {
  theme: string; lang: 'tr' | 'en'; fontSize: number; density: 'comfortable' | 'compact';
  reducedMotion: boolean; accent: string | null; appName: string; apiUrl: string; repoUrl: string; researchHubUrl: string;
}
