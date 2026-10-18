---
id: forward-deployed-engineer
type: career
title: Forward Deployed Engineer
title_en: Forward Deployed Engineer (FDE)
summary: Bir yazılım/AI şirketi adına müşterinin kendi ortamında çalışan; belirsiz iş problemini çalışan, üretimdeki bir sisteme dönüştürmekten sorumlu mühendis.
summary_en: An engineer embedded in a customer's environment who turns an ambiguous business problem into a working production system.
status: complete
group: Müşteri & Ürün
order: 1
level: Orta → İleri
aliases: [FDE, Sahaya Konuşlanmış Mühendis]
alt_titles: [Forward Deployed Software Engineer, Deployment Strategist (bazı şirketlerde ayrı rol), Field Engineer (benzer ama aynı değil)]
tags: [müşteri, entegrasyon, prototipleme, üretim, ai-deployment]
relations:
  used_in_sector: [banking, healthcare, manufacturing, ecommerce]
  used_with: [ai-engineer, data-engineer]
sources:
  - { title: "TechTarget — When should you adopt the forward-deployed model?", url: "https://www.techtarget.com/searchapparchitecture/tip/When-should-you-adopt-the-forward-deployed-model", kind: community, lang: en, accessed: 2026-10-18 }
  - { title: "Leanware — Forward Deployed Engineer: Role, Responsibilities & Use Cases", url: "https://leanware.co/insights/forward-deployed-engineer-role-use-cases", kind: community, lang: en, accessed: 2026-10-18 }
last_verified: 2026-10-18
version: 1
---

> **Önemli not:** "FDE" unvanı her şirkette aynı işi anlatmaz. Bazı şirketlerde neredeyse tamamen kod yazan bir mühendislik rolüdür; bazılarında müşteri yönetimi ve çözüm tasarımı ağır basar. Bu sayfa ortak çekirdeği anlatır; başvurduğunuz şirketin **güncel ilanını** mutlaka ayrıca okuyun.

> **Kaynak notu (çelişki):** İncelenen kaynaklar rolün Palantir'de doğduğunda hemfikir, ancak tarih konusunda ayrışıyor: TechTarget 2000'lerin başını, Leanware 2010'ların başını veriyor. Kesin tarihi birincil bir kaynakla doğrulayana kadar "Palantir kökenli, yaygınlaşması 2020'lerde AI şirketleriyle" demek en güvenli ifadedir.

## Mesleğin temel amacı {#purpose}

FDE'nin işi tek cümleyle: **"Ürünümüz bu müşterinin gerçek problemini, gerçek verisiyle, gerçek ortamında çözüyor mu?" sorusunu evet yapmak.**

Klasik bir yazılım mühendisi ürünü *birçok müşteri için* geliştirir. FDE ise *bir müşterinin* (veya birkaç müşterinin) içine yerleşir; belirsiz bir iş talebini teknik bir probleme çevirir, prototip kurar, müşterinin verisine ve sistemlerine entegre eder ve sistem üretimde çalışana kadar sorumluluğu bırakmaz. İncelenen kaynaklar ortak olarak şu üç şapkayı tarif ediyor: çözüm mimarı (gereksinim ve tasarım), full-stack geliştirici (prototip ve üretim kodu) ve müşteri başarısı (sistemin değer üretmeye devam etmesi).

## Günlük iş akışı {#daily}

Tipik bir gün (müşteri ortamında, entegrasyon aşamasında):

| Saat | İş |
|---|---|
| 09:00 | Müşteri ekibiyle kısa senkron: dünkü demoya geri bildirim, bugünün engelleri |
| 09:30 | Veri erişimi: yeni tabloya okuma izni geldi mi? Şemayı ve örnek kayıtları incele |
| 10:30 | Prototip geliştirme: entegrasyon kodu, veri dönüşümü, değerlendirme scripti |
| 13:00 | Kullanıcı gözlemi: operasyon ekibinin mevcut işi nasıl yaptığını izle, not al |
| 14:00 | Ürün ekibiyle görüşme: müşteride görülen eksik özelliği ürüne nasıl taşırız? |
| 15:00 | Test ve güvenlik kontrolü: yetki sınırları, kişisel veri maskeleme, hata durumları |
| 16:30 | Ertesi günün demosu için senaryo hazırlama, kararları ve riskleri yazılı kayda geçirme |

Haftalık döngüde genellikle bir **demo/geri bildirim** toplantısı, ürün ekibine **saha raporu** ve bir **risk/engel** gözden geçirmesi bulunur. Proje bazında ise: keşif → prototip → pilot → üretim → devir/genişleme.

## Gerçek görev ve sorumluluklar {#responsibilities}

- Belirsiz iş taleplerini ölçülebilir başarı kriterlerine çevirmek ([[fde-04-requirements|Ders 4–5]]).
- Müşterinin mevcut sistemlerini, veri altyapısını ve kısıtlarını haritalamak ([[fde-06-systems-discovery|Ders 6]]).
- Günler içinde çalışan bir prototip kurmak ([[fde-07-rapid-prototyping|Ders 7]]).
- Gerçek veriyle çalışmak; veri kalitesini ve gizliliği yönetmek ([[fde-08-real-data|Ders 8]]).
- API ve kurumsal sistem entegrasyonları yazmak ([[fde-09-integrations|Ders 9]]).
- Güvenlik ve veri erişim sınırlarına uymak ([[fde-10-security-boundaries|Ders 10]]).
- Teknik demo ve sunum yapmak ([[fde-11-demo|Ders 11]]).
- Prototipi üretime taşımak ve izlemek ([[fde-12-production|Ders 12]]).
- Sahadan öğrenileni ürün ekibine aktarmak ([[fde-14-feedback-loop|Ders 14]]).

## Kullanılan araçlar ve teknolojiler {#tools}

- **Diller:** Python ve/veya TypeScript; SQL neredeyse her zaman.
- **Veri:** ilişkisel veritabanları, veri ambarları, ETL araçları, dataframe kütüphaneleri.
- **Entegrasyon:** REST/gRPC API'ler, mesaj kuyrukları, SSO/OAuth, kurumsal kimlik sistemleri.
- **Bulut ve dağıtım:** en az bir bulut sağlayıcı, konteynerler, CI/CD; bazen müşterinin kapalı (on-premise) ortamı.
- **AI:** LLM API'leri veya açık modeller, değerlendirme (eval) scriptleri, RAG ve araç kullanan iş akışları.
- **İletişim:** yazılı karar kayıtları, mimari diyagramlar, demo ortamları.

## Gereken teknik bilgi {#tech-skills}

"T şeklinde" bir profil beklenir: geniş genel mühendislik + bir veya iki alanda derinlik.

- Full-stack geliştirme yetkinliği (bir backend + temel frontend).
- SQL ve veri modelleme; büyük veriyle güvenli çalışma.
- Ağ, kimlik doğrulama ve yetkilendirme temelleri.
- Hata ayıklama: tanımadığınız bir sistemde, kısıtlı erişimle sorun bulma.
- AI ağırlıklı FDE rollerinde: prompt tasarımı, RAG, değerlendirme metrikleri, maliyet/gecikme optimizasyonu; ayrıca [[Anomaly Detection]] veya [[OCR]] gibi sektörde sık geçen yöntemler.

## İletişim ve iş becerileri {#soft-skills}

- **Belirsizliği parçalama** — "müşteri memnuniyetini artır" talebini "itiraz çözüm süresini 3 günden 1 güne indir" gibi ölçülebilir bir hedefe çevirmek.
- **Hızlı güven kurma** — müşteri ekibinin size veri ve zaman vermesi buna bağlıdır.
- **İki dil konuşmak** — iş tarafına teknik kısıtı, mühendislik tarafına iş önceliğini anlatmak.
- **Beklenti yönetimi** — "bunu iki haftada yapamayız, ama şu alt kümesini yapabiliriz" diyebilmek.
- **Yazılı iletişim** — kararları, varsayımları ve riskleri kayda geçirmek; FDE'nin hafızası belgeleridir.

## Matematik veya bilim altyapısı {#science}

FDE derin bir araştırma rolü değildir; ancak şunlar sık gerekir:

- Temel istatistik: dağılımlar, örnekleme, A/B karşılaştırması, güven aralığı.
- Değerlendirme metrikleri: [[Precision ve Recall]], [[F1 Score]]; bir modelin "yeterince iyi" olup olmadığını iş maliyetiyle ilişkilendirebilmek.
- Tahmin ve maliyet hesabı: gecikme, throughput ve bulut maliyetini kabaca hesaplayabilmek.

## Üretilen çıktılar {#outputs}

- Çalışan prototip ve üretim kodu (entegrasyonlar, pipeline'lar, uygulamalar).
- Gereksinim ve başarı kriteri belgesi.
- Mimari ve güvenlik notları; veri erişim haritası.
- Demo senaryoları ve sunumlar.
- Ürün ekibi için saha raporları ve özellik talepleri.
- Devir (handover) dokümantasyonu ve işletim kılavuzu (runbook).

## Başarı ölçütleri ve KPI'lar {#kpis}

| Ölçüt | Örnek |
|---|---|
| Değere ulaşma süresi | İlk faydalı demoya kadar geçen gün |
| Üretim benimsemesi | Sistemi düzenli kullanan son kullanıcı sayısı |
| İş etkisi | Müşterinin tanımladığı KPI'daki değişim (ör. işlem süresi, hata oranı) |
| Güvenilirlik | Üretimdeki hata/olay sayısı, çözüm süresi |
| Ürüne katkı | Sahadan ürüne taşınan ve diğer müşterilerde de kullanılan özellikler |
| Genişleme | Aynı müşteride yeni kullanım alanları |

## Diğer ekiplerle ilişki {#teams}

- **Müşteri ekibi:** iş sahipleri, son kullanıcılar, müşterinin IT ve güvenlik ekipleri.
- **Ürün ve mühendislik:** sahadan gelen ihtiyaçları genelleştirilebilir özelliklere dönüştüren ekipler.
- **Satış / Solutions Engineer:** satış öncesi teknik uygunluğu gösterir; FDE çoğunlukla sözleşmeden sonra devreye girer.
- **Destek ve SRE:** üretime geçtikten sonraki işletim.

## Sık karşılaşılan problemler {#problems}

- Veri erişiminin haftalarca gecikmesi.
- Gereksinimlerin proje ortasında değişmesi.
- "Tek müşteriye özel" kodun bakım yüküne dönüşmesi (teknik borç).
- Demo ile üretim arasındaki büyük fark: gerçek veri kirli, gerçek kullanıcılar beklenmedik şeyler yapar.
- Müşteri güvenlik ekibinin haklı kısıtları (ağ erişimi yok, kişisel veri dışarı çıkamaz).
- Başarının tanımlanmamış olması: proje bitti mi, işe yaradı mı, kimse bilmiyor.

## Problem çözme yöntemleri {#problem-solving}

1. **Başarıyı en başta yazılı tanımla** — metrik, hedef, ölçüm yöntemi, tarih.
2. **En ince dikey dilim** — veri girişinden son kullanıcı ekranına kadar uçtan uca çalışan en küçük parçayı önce kur.
3. **"Çakıl yol → asfalt yol"** — önce hızlı ve kaba çözüm, kullanım kanıtlanınca sağlamlaştır. Ama kaba çözümün nerede kaba olduğunu belgeleyin.
4. **Genelleştirilebilirlik testi** — "bu kodu başka bir müşteride kullanabilir miyiz?" sorusunu her hafta sorun.
5. **Güvenliği tasarımın parçası yap** — en az yetki, okuma-yalnız bağlantı, kişisel veri maskeleme baştan.

## Örnek projeler {#projects}

- [[fde-customer-db-assistant|Vaka: Müşteri veritabanına bağlanan AI asistanı]] — gereksinimden üretime tüm aşamalar.
- [[fde-safe-db-assistant|Tutorial: Okuma-yalnız, maskeli veritabanı soru-cevap prototipi]] — çalıştırılabilir kod ve testler.
- Bir bankada itiraz (chargeback) belgelerini [[OCR]] ile işleyen ve analist ekranına bağlanan iş akışı.
- Bir üretim tesisinde sensör verisini mevcut bakım sistemine bağlayan [[Anomaly Detection]] pilotu.

## Öğrenme yol haritası {#roadmap}

Ayrıntılı ve sıralı ders listesi: [[fde-path|FDE öğrenme yolu]]. Kısaca:

1. Rolü, farkları ve müşteri ortamını anla (Ders 1–3).
2. Gereksinim ve keşif becerileri (Ders 4–6).
3. Prototip, veri, entegrasyon ve güvenlik (Ders 7–10).
4. Demo, üretim ve sürdürülebilirlik (Ders 11–15).
5. Ölçüm, çalışma ritmi ve mülakat hazırlığı (Ders 16–20).

## Junior, mid-level ve senior farkları {#levels}

| Seviye | Odak | Beklenti |
|---|---|---|
| Junior | Verilen iş paketini müşteri ortamında teslim etmek | Entegrasyon kodu, testler, net raporlama |
| Mid-level | Bir kullanım alanını uçtan uca sahiplenmek | Gereksinimden üretime kadar bağımsız çalışma |
| Senior | Müşteri hesabının teknik yönünü ve ürüne geri bildirimi yönetmek | Mimari kararlar, risk yönetimi, birden fazla kullanım alanı, ekip yönlendirme |

## Kariyer geçiş yolları {#transitions}

- **Gelinen roller:** Software/Backend Engineer, [[Data Engineer]], [[AI Engineer]], danışmanlık geçmişi olan mühendisler.
- **Gidilen roller:** Ürün yönetimi (müşteri sezgisi güçlü), mühendislik yöneticiliği, Solutions Architect, girişimcilik, AI Engineer (daha derin teknik odak).
- **Farklar özeti:** [[fde-02-role-differences|Ders 2: FDE ile diğer roller arasındaki farklar]].
