# Engineering Academy

Sektörleri, meslekleri, bilimsel temelleri ve gerçek problemleri birbirine bağlayan; notlarınızı Obsidian benzeri bir bilgi grafiğinde tutan; **internetsiz de çalışan** ve temel işlevleri için hiçbir ücretli servise ihtiyaç duymayan kişisel mühendislik öğrenme platformu.

| Modül | Ne yapar? |
|---|---|
| **Sektör Akademisi** | 16 katmanlı sektör şablonu (işleyiş, terminoloji, veri, yöntemler, metrikler, mevzuat, vakalar…). 10 sektör: 4'ü tam (Bankacılık, Sağlık, Siber Güvenlik, Üretim), 3'ü kısmi, 3'ü taslak; 15 sektör planlandı |
| **Meslek Keşfi** | Sektörden mesleğe / meslekten sektöre. 9 meslek: FDE ve AI Engineer tam (16/16), 7'si taslak (özet + temel bölümler); 44 meslek planlandı |
| **Öğrenme yolları** | FDE (20 ders + vaka projesi), Bankacılık geçişi, AI Engineer başlangıç |
| **Bilgi Grafiği** | Kavram, sektör, meslek, tutorial ve notlarınız arasındaki tipli ilişkiler; filtre, derinlik, yetim ve benzer düğümler |
| **Notlar & Kasa** | Markdown, `[[bağlantı]]`, backlink, formül, kod, görsel, klasör/etiket, sürüm geçmişi, ilişki önerileri, Markdown/zip dışa aktarma |
| **Tutorial & Kod** | Repodaki gerçek dosyalara satır aralığı bağlantıları, CI test sonuçları, çalıştırma seçenekleri |
| **Online / Offline** | PWA (çevrimdışı açılış), cihaza ders indirme, hesapla çok cihazlı eşitleme, çakışma çözümü |
| **Veri Koruma** | JSON/Markdown dışa-içe aktarma, doğrulanmış otomatik sunucu yedekleri |
| **Kapsam** | Neyin yazıldığı, neyin eksik/planlandığı, doğrulama tarihleri (boş alan dolu gösterilmez) |
| Metrik Lab, Arama, Araştırma, Ayarlar | Etkileşimli formüller, çevrimdışı arama, 7 tema, TR/EN |

---

## 1. Kurulum (kendi bilgisayarınızda — önerilen başlangıç)

**Gerekenler:** [Node.js 20+](https://nodejs.org) ve [Python 3.10+](https://www.python.org/downloads/) (Windows'ta kurulumda *“Add python.exe to PATH”* kutusunu işaretleyin). Git isteğe bağlıdır.

```bash
# 1) Projeyi alın (zip'i açın veya GitHub'dan klonlayın) ve klasöre girin
cd engineering-academy

# 2) Tek komutla kurulum: Node paketleri, Python sanal ortamı, testler, derleme
npm run setup

# 3) Başlatın
npm start
```

Tarayıcıda **http://localhost:8000** adresini açın. Windows, macOS ve Linux'ta aynı komutlar çalışır.

İlk açılışta:

1. **Online / Offline** sayfasında *Hesap oluştur* deyin (kullanıcı adı + en az 8 karakter parola). Hesap, verilerinizin sunucu veritabanına da yazılmasını, yedeklenmesini ve diğer cihazlarınıza inmesini sağlar. Hesap açmadan da kullanabilirsiniz; o zaman her şey yalnızca o tarayıcıda kalır.
2. Aynı sayfada **Tümünü indir** ile tüm dersleri cihaza alın (~1 MB). Artık internet olmadan da açılırlar.
3. Hesabı oluşturduktan sonra `.env` dosyasında `ALLOW_REGISTRATION=false` yapıp `npm start` ile yeniden başlatarak başkalarının hesap açmasını kapatabilirsiniz.

> **Telefondan erişmek** için uygulamanın internetten erişilebilir olması gerekir: bkz. [2. Online kurulum](#2-online-kurulum-ücretsiz-seçenekler). Aynı Wi-Fi ağındaysanız `npm start -- --lan` ile bilgisayarın yerel IP adresinden (ör. `http://192.168.1.20:8000`) açabilirsiniz; ancak tarayıcılar PWA/çevrimdışı özelliklerini yalnızca `https` veya `localhost` üzerinde etkinleştirir.

### Docker ile (alternatif)

```bash
cp .env.example .env
docker compose up -d --build      # http://localhost:8000 — veriler "academy-data" biriminde kalıcı
```

### Geliştirme modu

```bash
npm run dev                                         # web: http://localhost:5173 (anında yenileme)
cd apps/api && .venv/bin/python -m uvicorn app.main:app --reload   # API (Windows: .venv\Scripts\python)
```

---

## 2. Online kurulum (ücretsiz seçenekler)

Ayrıntılı karşılaştırma ve güncel sınırlar: **[docs/free-hosting.md](docs/free-hosting.md)**. Özet:

| Kurulum | Maliyet | Ne elde edersiniz |
|---|---|---|
| **A. Yalnızca GitHub Pages** | Ücretsiz (public repo) | Her yerden açılan PWA: dersler, notlar, grafik, çevrimdışı mod. Veriler her cihazın tarayıcısında kalır; cihazlar arası eşitleme yok, yedek = JSON dışa aktarma |
| **B. Pages + kendi bilgisayarınızda API** | Ücretsiz | A + eşitleme ve yedek; bilgisayarınız açıkken çalışır |
| **C. Pages + ücretsiz barındırılan API + Neon Postgres** | Ücretsiz katmanlar (sınırlı) | A + her yerden eşitleme. API uykuya geçebilir; ilk istek ~1 dk sürebilir. Veriler yerelde olduğu için uyku süresince uygulama çalışmaya devam eder |

### A. GitHub Pages (5 dakika)

1. GitHub'da yeni bir **public** repo oluşturun ve projeyi gönderin:
   ```bash
   git init && git add . && git commit -m "Engineering Academy"
   git branch -M main
   git remote add origin https://github.com/<kullanici-adiniz>/engineering-academy.git
   git push -u origin main
   ```
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. `pages` iş akışı her push'ta çalışır; adres `https://<kullanici-adiniz>.github.io/engineering-academy/` olur. Kod bağlantıları bu repoya ve commit'e otomatik bağlanır.

### C. Ücretsiz eşitleme sunucusu

1. [Neon](https://neon.com)'da ücretsiz bir Postgres projesi açın, bağlantı dizesini alın (`postgresql+psycopg://…?sslmode=require` biçimine çevirin).
2. Bu repoyu Docker destekli ücretsiz bir servise (ör. Render “Web Service → Docker”) bağlayın. Ortam değişkenleri:
   `DATABASE_URL`, `ADMIN_TOKEN`, `ALLOW_REGISTRATION=true` (hesabı açtıktan sonra `false`), `CORS_ORIGINS=https://<kullanici-adiniz>.github.io`, `BACKUP_INTERVAL_HOURS=0` (disk geçici olduğu için yedeği GitHub Actions alır).
3. Uygulamada **Online / Offline → API adresi** alanına servis adresini girip hesap oluşturun.
4. Yedek için repo → Settings → Secrets → Actions: `DATABASE_URL` ve `BACKUP_PASSPHRASE` ekleyin. `db-backup` iş akışı her gece şifreli, doğrulanmış yedek alır.

> **Dürüst not:** Online sürüm için “hiç ücret ödenmeyecek” garantisi verilemez; ücretsiz planlar sağlayıcılar tarafından değiştirilebilir. Bu yüzden mimari, sunucu tamamen kaybolsa bile çalışacak şekilde kuruldu: veriler önce cihazda tutulur, sunucu yalnızca eşitleme ve yedek içindir ve tüm veriler tek tıkla dışa aktarılabilir.

---

## 3. Testler ve kabul senaryoları

```bash
npm test                      # içerik hattı + web birim testleri (16 test)
npm run test:api              # API: eşitleme, çakışma, tombstone, kalıcılık, yedek/geri yükleme (11 test)
npm run scripts:test          # tutorial scriptleri (CPU, küçük veri)
ACADEMY_REPO_URL=https://github.com/<siz>/<repo> npm run build && npm run e2e   # 10 kabul senaryosu, gerçek tarayıcıda
```

`npm run e2e` için bir kerelik: `npx playwright install chromium`.

| # | Senaryo | Nasıl doğrulanıyor (tests/e2e/run.mjs) |
|---|---|---|
| 1 | Bankacılığa geçiş | Sektör kartı → işleyiş/meslekler/veri/problemler/metrikler bölümleri → öğrenme yolu |
| 2 | Meslekten sektöre | FDE → günlük akış, beceriler, sektörler, öğrenme yolu → vaka çalışması |
| 3 | Bilgi grafiği | “Anomaly Detection” düğümü → bankacılık/üretim/siber güvenlik/sağlık ilişkileri → tıklayınca içerik |
| 4 | Kişisel not | Tutorial'dan not → `[[Object Detection]]` → backlink hedef sayfada; öneri onayı; boş bağlantıdan yeni not |
| 5 | Offline | Ders indirilir, ağ kesilir, sayfa yeniden yüklenir → ders açılır, yeni not yazılır |
| 6 | Eşitleme | Offline not bağlantı gelince gider; 2. cihaz alır; aynı not iki cihazda değişince çakışma gösterilir, birleştirilir; silme yayılır |
| 7 | GitHub bağlantısı | Bağlantıdaki dosya repoda var, satır aralığı gerçek `# region` sınırlarına denk; kurulum ve test sonucu görünür |
| 8 | Kalıcı veri | Tarayıcı kapat-aç, API yeniden başlat, doğrulanmış yedek al, komut satırından doğrula ve geri yükle |
| 9 | Ücretsiz | Senaryolar boyunca dış sunucuya tek istek yok; ücretli API referansı yok |
| 10 | Yeni alan | Yalnızca bir Markdown dosyasıyla yeni sektör derlenir, grafiğe bağlanır; yarım içerik “tamam” ilan edilemez |

---

## 4. Yeni sektör / meslek / kavram ekleme (kod değişikliği yok)

```bash
npm run content:new -- sector denizcilik "Denizcilik ve Limanlar" "Maritime & Ports"
# content/sectors/denizcilik.md oluşur: 16 şablon bölümü yorum içinde hazır
npm run content:validate      # kırık bağlantı, eksik bölüm, mükerrer, bozuk formül, ön koşul döngüsü
npm run content:build         # uygulamaya yansıt
```

Türler: `sector, career, technology, concept, algorithm, model, formula, metric, lesson, tutorial, case-study, path, paper, project`. İlişkiler frontmatter'da (`relations: { used_in_sector: [banking] }`) veya metin içinde `[[Başlık]]` ile kurulur. Durum rozeti şablon bölümlerinden **otomatik** hesaplanır. Ayrıntı: [docs/architecture.md](docs/architecture.md).

---

## 5. Neyin tamam, neyin prototip, neyin eksik olduğu

**Tamamlandı ve test edildi:** yukarıdaki 10 senaryo; içerik şeması ve doğrulayıcı; sektör/meslek/teknoloji katmanı; FDE yolu; notlar, backlink, grafik, öneriler; PWA çevrimdışı; eşitleme (sürüm, tombstone, çakışma, yeniden deneme); SQLite/PostgreSQL + Alembic; doğrulanmış yedek/geri yükleme; dışa/içe aktarma; GitHub Actions (CI, e2e, script testleri, Pages, içerik bakımı, DB yedeği); 7 tema, TR/EN arayüz.

**Prototip / sınırlı:**
- İçerik derinliği (Kapsam sayfasında canlı görünür): sektörlerden 4'ü tam, 3'ü kısmi (E-ticaret, Robotik, Telekom), 3'ü taslak (Enerji, Tarım, Yazılım/Altyapı); mesleklerden FDE ve AI Engineer tam, diğer 7'si taslak; 12 ortak teknolojiden 6'sı tam, 5'i kısmi, 1'i taslak; 25 kavram/metrik ve 5 tutorial tam. 15 sektör ve 44 meslek *planlandı* olarak görünür (içerik yok). Önceki master prompttaki tam AI müfredatı (CV, LLM, RAG, MCP…) aynı şemayla eklenmeyi bekliyor.
- İngilizce: arayüz ve başlık/özetler çevrildi; ders gövdeleri çoğunlukla yalnızca Türkçe.
- Araştırma & Haberler: canlı akış için ayrı **AI Research Hub** uygulamasına bağlanır (Ayarlar'dan adres); bu uygulama tek başına haber çekmez — sahte “güncel” içerik üretmemek için.
- Hesap sistemi: kullanıcı adı + parola + oturum belirteci. Çok kullanıcılı herkese açık kullanım için e-posta doğrulama/OAuth eklenmeli.
- Kod çalıştırma: güvenlik nedeniyle tarayıcıda/sunucuda kod çalıştırılmaz; yerel, Jupyter ve Colab talimatları verilir.

**Henüz yok:** masaüstü paketi (PWA “uygulama olarak yükle” bu ihtiyacı karşılıyor), aralıklı tekrarın kişiselleştirilmiş zamanlaması (şu an basit, açıklanabilir kural), makale kartları (şablon hazır, içerik yok).

---

## 6. Proje yapısı

```
apps/web/        React 19 + TypeScript + Vite — PWA, IndexedDB, eşitleme motoru, tüm modüller
apps/api/        FastAPI + SQLAlchemy + Alembic — hesap, eşitleme, sürüm geçmişi, yedek
content/         Markdown + YAML içerik (sectors, careers, technologies, concepts, metrics, lessons, tutorials, paths, case-studies)
content/catalog.yaml   Kapsamda olup henüz yazılmamış alanlar
scripts/         İçerik derleme/doğrulama, yeni içerik şablonu, bağlantı kontrolü, tutorial testleri, kurulum
tests/e2e/       10 kabul senaryosu (Playwright)
docs/            Mimari, ücretsiz barındırma, yedekleme/geri yükleme
.github/workflows/  ci, script-tests, pages, content-watch, db-backup
```

**Gizlilik:** Kişisel notlar ve ilerleme asla Git'e yazılmaz; repoda yalnızca kod ve eğitim içeriği bulunur.
