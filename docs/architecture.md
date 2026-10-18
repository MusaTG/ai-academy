# Mimari ve teknik kararlar

## Genel bakış

```
 content/*.md  ──(scripts/build-content.mjs)──►  apps/web/public/content/index.json + items/*.json
                                                    │  (statik; GitHub Pages / FastAPI / yerel)
                                                    ▼
 Tarayıcı:  React uygulaması ── IndexedDB (kayıtlar, indirilen dersler, sürüm geçmişi)
            Service Worker (uygulama kabuğu önbelleği)      │ eşitleme motoru (push/pull)
                                                            ▼
 apps/api:  FastAPI ── SQLAlchemy ── SQLite | PostgreSQL ── doğrulanmış yedekler
```

## Kararlar ve gerekçeleri

| Karar | Gerekçe | Alternatif |
|---|---|---|
| İçerik = Markdown + YAML frontmatter, Git'te | Sürümlenebilir, PR ile incelenebilir, Obsidian ile okunabilir, kod değiştirmeden yeni alan eklenir | Headless CMS (ücretli/bağımlılık) |
| Derleme zamanında tek `index.json` (~275 KB) | Çevrimdışı arama ve grafik için tüm meta veri tek seferde; gövdeler ayrı ve isteğe bağlı indirilir | Her şey tek dosya (büyük) / sunucu tarafı arama (çevrimdışı çalışmaz) |
| Yerel-öncelikli (local-first) veri | İnternetsiz çalışma, sunucu kaybına dayanıklılık, ücretsiz katman uykusuna tolerans | Sunucu-öncelikli (bağlantı gerekir) |
| Kayıt başına sürüm + iyimser kilitleme | Basit, açıklanabilir; çakışma kullanıcıya gösterilir | CRDT (karmaşık, metin birleştirmede öngörülemez) / son-yazan-kazanır (veri kaybı) |
| Silme = tombstone | Silme diğer cihazlara yayılır, içerik kurtarılabilir | Satırı silmek (diğer cihaz kaydı geri yükler) |
| HashRouter + `base: './'` | Aynı derleme GitHub Pages alt yolunda, kökte ve FastAPI arkasında değişiklik olmadan çalışır | BrowserRouter (Pages'ta 404 yönlendirme hilesi gerekir) |
| Kendi Service Worker'ımız (~40 satır) | Ön-önbellek listesi derlemeden üretilir; bağımlılık yok, davranış şeffaf | Workbox |
| FastAPI + SQLAlchemy + Alembic | SQLite (sıfır kurulum) ve PostgreSQL (barındırma) aynı kodla; göçler sürümlü | Firebase/Supabase istemci SDK'sı (sağlayıcıya bağımlılık) |
| Parola: scrypt (standart kütüphane), opak belirteç, belirteç özeti saklanır | Ek bağımlılık yok; veritabanı sızsa da belirteçler kullanılamaz | JWT (iptal zor) |
| Kod çalıştırma yok | Güvenli bir sandbox olmadan keyfi kod çalıştırmak risklidir; CI yalnızca repodaki incelenmiş tutorial'ları test eder | Pyodide (ileride tarayıcı içi, izole seçenek olarak eklenebilir) |

## İçerik şeması

`scripts/lib/schema.mjs`: türler (`ITEM_TYPES`), ilişki türleri (`EDGE_TYPES`), öğretim şablonları (`TEMPLATES`). Yeni bir **içerik** eklemek kod gerektirmez; yeni bir **tür** eklemek bu dosyaya bir satır ekler.

Frontmatter alanları: `id, type, title, title_en, summary, summary_en, status, group, order, level, duration, tags, aliases, alt_titles, relations, sources[{title,url,kind,lang,accessed}], last_verified, version, quiz[{q,options,answer,explain}], code[{file,title,deps,run}], steps, requires_gpu`.

Durum (`complete/partial/stub/planned`) şablon bölümlerinin (`## Başlık {#id}`) varlığından hesaplanır. `status: complete` yazıp bölümleri eksik bırakmak derlemeyi durdurur.

Kod dosyalarında `# region: ad` … `# endregion` işaretleri, GitHub'a satır aralığı bağlantısının kaynağıdır; satır numaraları dosyadan okunur, tahmin edilmez.

## Eşitleme protokolü

- `POST /api/sync/push {device_id, changes:[{collection,id,base_version,deleted,data}]}` → her kayıt için `ok(version, seq)` | `conflict(server)` | `rejected(error)`.
- `GET /api/sync/pull?since=<seq>` → `seq`'e göre sıralı değişiklikler ve yeni imleç.
- İstemci: önce gönder, sonra çek, sonra (çakışma çözümü vb. için) tekrar gönder. Gönderim sırasında kullanıcı yeniden yazdıysa kayıt "bekliyor" kalır. Ağ hatasında üstel bekleme; `online` olayında hemen.
- Çakışma: yerel ve sunucu sürümü `conflicts` deposunda saklanır; kullanıcı *bu cihazdakini koru / diğerini al / birleştir* seçer.
- Senkronize koleksiyonlar: `notes, progress, bookmarks, settings, attachments, graph_feedback, search_history` (`apps/api/app/config.py`).

## Bilinen sınırlamalar

- Grafik, odak yokken en bağlantılı 260 düğümü çizer; çok büyük içerikte odak + derinlik kullanılır. Binlerce düğüm için canvas/WebGL çizimine geçmek gerekebilir.
- Arama tam metin + başlık ağırlıklıdır; anlamsal (embedding) arama yok — ücretsiz ve çevrimdışı kalması için bilinçli seçim.
- Ders gövdelerinin İngilizcesi (`body_en`) çoğu içerikte yok; arayüz bunu belirtir.
