// Ortak içerik şeması: içerik türleri, ilişki (kenar) türleri ve öğretim şablonları.
// Yeni bir sektör/meslek eklemek için kod değiştirmek gerekmez; sadece content/ altına
// bu şemaya uyan bir Markdown dosyası eklenir. Yeni bir *tür* eklemek de yalnızca bu
// dosyaya bir satır eklemeyi gerektirir.

export const ITEM_TYPES = {
  sector: { dir: 'sectors', label: 'Sektör', label_en: 'Sector' },
  career: { dir: 'careers', label: 'Meslek', label_en: 'Career' },
  technology: { dir: 'technologies', label: 'Ortak teknoloji', label_en: 'Cross-sector technology' },
  concept: { dir: 'concepts', label: 'Kavram', label_en: 'Concept' },
  algorithm: { dir: 'concepts', label: 'Algoritma', label_en: 'Algorithm' },
  model: { dir: 'concepts', label: 'Model', label_en: 'Model' },
  formula: { dir: 'concepts', label: 'Formül', label_en: 'Formula' },
  metric: { dir: 'metrics', label: 'Metrik', label_en: 'Metric' },
  lesson: { dir: 'lessons', label: 'Ders', label_en: 'Lesson' },
  tutorial: { dir: 'tutorials', label: 'Tutorial', label_en: 'Tutorial' },
  'case-study': { dir: 'case-studies', label: 'Vaka çalışması', label_en: 'Case study' },
  path: { dir: 'paths', label: 'Öğrenme yolu', label_en: 'Learning path' },
  paper: { dir: 'papers', label: 'Makale', label_en: 'Paper' },
  project: { dir: 'projects', label: 'Proje', label_en: 'Project' },
};

// Bilgi grafiğindeki ilişki türleri. "A --kenar--> B" A'nın frontmatter'ında
// `relations: { kenar: [B] }` olarak yazılır.
export const EDGE_TYPES = {
  prerequisite: { label: 'Ön koşuludur', label_en: 'Is prerequisite of', inverse: 'Ön koşulu' },
  is_a: { label: 'Bunun bir türüdür', label_en: 'Is a type of', inverse: 'Alt türleri' },
  used_with: { label: 'Bununla kullanılır', label_en: 'Used with', inverse: 'Bununla kullanılır' },
  alternative_of: { label: 'Bunun alternatifi', label_en: 'Alternative to', inverse: 'Alternatifleri' },
  evaluated_with: { label: 'Bununla değerlendirilir', label_en: 'Evaluated with', inverse: 'Bunu değerlendirir' },
  application_of: { label: 'Bunun uygulamasıdır', label_en: 'Application of', inverse: 'Uygulamaları' },
  used_in_sector: { label: 'Bu sektörde kullanılır', label_en: 'Used in sector', inverse: 'Bu sektörde kullanılanlar' },
  required_in_career: { label: 'Bu meslekte gereklidir', label_en: 'Required in career', inverse: 'Bu meslekte gerekenler' },
  explained_in: { label: 'Bu kaynakta açıklanır', label_en: 'Explained in', inverse: 'Açıkladığı konular' },
  used_in_project: { label: 'Bu projede kullanılır', label_en: 'Used in project', inverse: 'Projede kullanılanlar' },
  part_of: { label: 'Bunun parçasıdır', label_en: 'Part of', inverse: 'İçerdikleri' },
  mentioned_in_note: { label: 'Bu notta bahsedilir', label_en: 'Mentioned in note', inverse: 'Notlarda bahsedilenler' },
};

// Her tür için öğretim şablonu: zorunlu bölüm kimlikleri ({#id}) ve başlıkları.
// Kapsam (coverage) bu listeye göre hesaplanır.
export const TEMPLATES = {
  sector: [
    ['overview', 'Sektörün temel işleyişi'],
    ['terminology', 'Temel kavramlar ve terminoloji'],
    ['value-chain', 'Değer zinciri ve iş süreçleri'],
    ['roles', 'Önemli meslekler ve ekipler'],
    ['tools', 'Kullanılan yazılım ve donanım'],
    ['data', 'Veri türleri ve veri kaynakları'],
    ['science', 'Matematiksel ve bilimsel altyapı'],
    ['ai-uses', 'AI ve otomasyon kullanım alanları'],
    ['methods', 'Sektörün kendi algoritmaları ve yöntemleri'],
    ['metrics', 'Başarı metrikleri ve KPI\'lar'],
    ['problems', 'Operasyonel ve teknik problemler'],
    ['regulation', 'Güvenlik, gizlilik ve mevzuat'],
    ['case-studies', 'Gerçek dünya vaka çalışmaları'],
    ['projects', 'Örnek projeler ve tutorial\'lar'],
    ['research', 'İleri araştırma kaynakları'],
    ['related', 'İlgili meslek ve sektör bağlantıları'],
  ],
  career: [
    ['purpose', 'Mesleğin temel amacı'],
    ['daily', 'Günlük iş akışı'],
    ['responsibilities', 'Gerçek görev ve sorumluluklar'],
    ['tools', 'Kullanılan araçlar ve teknolojiler'],
    ['tech-skills', 'Gereken teknik bilgi'],
    ['soft-skills', 'İletişim ve iş becerileri'],
    ['science', 'Matematik veya bilim altyapısı'],
    ['outputs', 'Üretilen çıktılar'],
    ['kpis', 'Başarı ölçütleri ve KPI\'lar'],
    ['teams', 'Diğer ekiplerle ilişki'],
    ['problems', 'Sık karşılaşılan problemler'],
    ['problem-solving', 'Problem çözme yöntemleri'],
    ['projects', 'Örnek projeler'],
    ['roadmap', 'Öğrenme yol haritası'],
    ['levels', 'Junior, mid-level ve senior farkları'],
    ['transitions', 'Kariyer geçiş yolları'],
  ],
  technology: [
    ['intuition', 'Basit anlatım'],
    ['how', 'Nasıl çalışır?'],
    ['sector-variation', 'Sektöre göre neler değişir?'],
    ['metrics', 'Değerlendirme'],
    ['failure-modes', 'Hata analizi ve tuzaklar'],
    ['related', 'Bağlantılar'],
  ],
  concept: [
    ['intuition', 'Basit anlatım'],
    ['why', 'Neden gerekli?'],
    ['math', 'Matematik'],
    ['example', 'Elle hesaplama'],
    ['failure-modes', 'Hata analizi'],
    ['summary', 'Özet'],
  ],
  metric: [
    ['intuition', 'Ne ölçüyor?'],
    ['math', 'Formül'],
    ['example', 'Elle hesaplama'],
    ['code', 'Python ile hesaplama'],
    ['pitfalls', 'Ne zaman yanıltıcıdır?'],
    ['summary', 'Özet'],
  ],
  tutorial: [
    ['goal', 'Öğrenme hedefi'],
    ['setup', 'Kurulum'],
    ['steps', 'Adım adım'],
    ['expected', 'Beklenen çıktı'],
    ['debugging', 'Hata ayıklama'],
    ['exercises', 'Alıştırmalar'],
  ],
  'case-study': [
    ['problem', 'Problem ve iş hedefi'],
    ['context', 'Bağlam ve kısıtlar'],
    ['approach', 'Yaklaşım'],
    ['results', 'Sonuçlar ve ödünleşimler'],
    ['evidence', 'Kanıt düzeyi'],
  ],
};
TEMPLATES.algorithm = TEMPLATES.concept;
TEMPLATES.model = TEMPLATES.concept;
TEMPLATES.formula = TEMPLATES.concept;

export const STATUSES = ['complete', 'partial', 'stub', 'planned'];

export const SOURCE_KINDS = [
  'peer-reviewed', 'preprint', 'official-docs', 'company-blog', 'standard',
  'job-posting', 'community', 'tutorial', 'opinion', 'book', 'platform',
];

export const REQUIRED_FIELDS = ['id', 'type', 'title', 'summary'];
export const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
