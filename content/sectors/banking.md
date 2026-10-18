---
id: banking
type: sector
title: Bankacılık, Finans ve Sigortacılık
title_en: Banking, Finance & Insurance
summary: Para, ödeme ve risk akışlarının dijital sistemlerle yönetildiği; düşük gecikme, denetlenebilirlik ve sıkı mevzuatın birlikte çalıştığı sektör.
summary_en: The sector where money, payments and risk flow through digital systems under strict latency, auditability and regulatory constraints.
status: complete
group: Finans
order: 1
level: Başlangıç → İleri
tags: [finans, ödeme, risk, fraud, mevzuat]
aliases: [Bankacılık, Finans, Banking, Fintech]
relations:
  used_with: [ecommerce, cybersecurity]
sources:
  - { title: "BDDK — Bankacılık Düzenleme ve Denetleme Kurumu", url: "https://www.bddk.org.tr", kind: standard, lang: tr }
  - { title: "MASAK — Mali Suçları Araştırma Kurulu", url: "https://masak.hmb.gov.tr", kind: standard, lang: tr }
  - { title: "KVKK — Kişisel Verileri Koruma Kurumu", url: "https://www.kvkk.gov.tr", kind: standard, lang: tr }
  - { title: "FATF — Financial Action Task Force", url: "https://www.fatf-gafi.org", kind: standard, lang: en }
  - { title: "Basel Committee on Banking Supervision", url: "https://www.bis.org/bcbs/", kind: standard, lang: en }
  - { title: "PCI Security Standards Council", url: "https://www.pcisecuritystandards.org", kind: standard, lang: en }
  - { title: "Federal Reserve SR 11-7: Guidance on Model Risk Management", url: "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm", kind: standard, lang: en }
  - { title: "ISO 20022 — Financial messaging standard", url: "https://www.iso20022.org", kind: standard, lang: en }
  - { title: "Credit Card Fraud Detection veri seti (ULB, Kaggle)", url: "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud", kind: community, lang: en }
last_verified: 2026-10-18
version: 1
---

> **Bu sayfa nasıl okunmalı?** Önce *Temel işleyiş* ve *Terminoloji* bölümlerini okuyun. Teknik bir role geçiyorsanız *Veri*, *Yöntemler*, *Metrikler* ve *Problemler* bölümleri asıl çalışma alanınızdır. Mevzuat bilgileri ülkeye ve tarihe göre değişir; buradaki çerçeve eğitim amaçlıdır, hukuki görüş değildir.

## Sektörün temel işleyişi {#overview}

Bir bankayı en basit hâliyle **parayı zaman ve risk açısından yeniden dağıtan bir kurum** olarak düşünebilirsiniz: mevduat sahiplerinden fon toplar, bu fonu kredi olarak kullandırır ve aradaki faiz farkından (net faiz marjı) ve komisyonlardan gelir elde eder. Bunu yaparken üç temel riski yönetmek zorundadır:

1. **Kredi riski** — borçlunun ödememesi.
2. **Likidite riski** — mevduat sahipleri paralarını aynı anda isterse ödeyememe.
3. **Operasyonel risk** — dolandırıcılık, sistem arızası, insan hatası, siber saldırı.

Yazılım açısından bir banka, her biri farklı gecikme ve tutarlılık gereksinimi olan sistemlerden oluşur:

| Katman | Örnek | Gecikme beklentisi | Kritik özellik |
|---|---|---|---|
| Çekirdek bankacılık (core banking) | Hesap defteri, faiz, vade | Saniyeler (batch gece) | Tam tutarlılık, denetim izi |
| Ödeme ve kart işlemleri | POS, EFT/FAST, kart otorizasyonu | Onlarca–yüzlerce milisaniye | Yüksek erişilebilirlik |
| Dijital kanallar | Mobil uygulama, internet şubesi | < 1 sn kullanıcı algısı | Güvenlik, kimlik doğrulama |
| Risk ve analitik | Kredi skorlama, raporlama | Dakikalar–günler | Açıklanabilirlik |
| Uyum (compliance) | AML, KYC, yaptırım taraması | Gerçek zamanlı + periyodik | Denetlenebilirlik |

Sigortacılık benzer bir mantıkla çalışır: prim toplar, gelecekteki belirsiz hasarları öder. Burada temel soru, **bir riskin beklenen maliyetini** doğru fiyatlamaktır.

## Temel kavramlar ve terminoloji {#terminology}

- **Mevduat / kredi** — bankanın pasifi ve aktifi.
- **Otorizasyon (authorization)** — kart işleminin anlık onayı. Kartın sahibi, limit ve risk kontrol edilir.
- **Takas ve mutabakat (clearing & settlement)** — onaylanmış işlemlerin bankalar arasında gerçekten hesaplaşması; çoğu zaman otorizasyondan saatler veya günler sonra.
- **Chargeback** — kart sahibinin itirazıyla işlemin geri alınması. Fraud etiketlerinin önemli bir kaynağıdır ve **haftalar gecikmeyle** gelir.
- **KYC (Know Your Customer)** — müşteriyi tanıma; kimlik doğrulama ve risk profili. Ayrıntı: [[kyc-aml|KYC ve AML]].
- **AML (Anti-Money Laundering)** — suç gelirlerinin aklanmasını önleme. Türkiye'de yetkili kurum MASAK'tır.
- **Fraud** — dolandırıcılık. Kart dolandırıcılığı, hesap ele geçirme (account takeover), sentetik kimlik, sosyal mühendislik gibi türleri vardır. Ayrıntı: [[Fraud Detection]].
- **PD / LGD / EAD** — Kredi riskinde temerrüt olasılığı (Probability of Default), temerrüt hâlinde kayıp oranı (Loss Given Default) ve temerrüt anındaki risk tutarı (Exposure at Default). Beklenen kayıp: $EL = PD \times LGD \times EAD$.
- **Model risk** — yanlış veya yanlış kullanılan bir modelin finansal kayba yol açma riski.

## Değer zinciri ve iş süreçleri {#value-chain}

Bir kart işleminin uçtan uca yolculuğu, sektörün değer zincirini iyi özetler:

1. Müşteri POS'ta kartını kullanır → **üye işyeri bankası (acquirer)** işlemi alır.
2. İşlem kart şeması üzerinden **kartı çıkaran bankaya (issuer)** iletilir.
3. Issuer, **otorizasyon** sırasında bakiye/limit kontrolü ve **gerçek zamanlı fraud skoru** hesaplar. Bütün bunlar genellikle yüzlerce milisaniyelik bir zaman bütçesine sığmak zorundadır.
4. Karar: onay, ret veya ek doğrulama (ör. 3D Secure / tek kullanımlık şifre).
5. Gün sonunda takas ve mutabakat; haftalar sonra olası chargeback.

Kredi süreci ise başvuru → KYC → skorlama → limit/fiyat kararı → kullandırım → izleme → tahsilat adımlarından oluşur. Her adım veri üretir ve her karar **sonradan açıklanabilir** olmak zorundadır.

## Önemli meslekler ve ekipler {#roles}

- **Yazılım ve platform ekipleri** — çekirdek bankacılık entegrasyonları, ödeme servisleri, API'ler.
- **[[Data Engineer]]** — işlem akışlarını (streaming) ve veri ambarını kurar; veri soy ağacı (lineage) ve kalite burada kritik.
- **[[AI Engineer]] / ML ekipleri** — fraud, kredi skorlama, müşteri hizmetleri asistanları, belge işleme.
- **[[Risk Analyst]]** ve model doğrulama (model validation) ekipleri — modellerin bağımsız denetimi.
- **[[Security Engineer]]** — kimlik doğrulama, ağ güvenliği, olay müdahalesi.
- **Uyum (compliance) ve AML analistleri** — alarmları inceleyen, şüpheli işlem bildirimlerini hazırlayan ekipler.
- **[[Forward Deployed Engineer]]** — bankalara yazılım satan şirketlerde, ürünü bankanın kapalı ve regüle ortamına entegre eden mühendisler.
- Ayrıca: aktüerler (sigorta), ürün yöneticileri, SRE/altyapı ekipleri.

## Kullanılan yazılım ve donanım {#tools}

- **Çekirdek bankacılık sistemleri** — çoğu zaman onlarca yıllık, ana bilgisayar (mainframe) tabanlı veya ticari paketler. Entegrasyon çoğunlukla mesaj kuyrukları ve toplu dosya aktarımı üzerinden yapılır.
- **Mesajlaşma ve akış** — Kafka benzeri olay akış platformları; ISO 20022 gibi mesaj standartları.
- **Veritabanları** — ilişkisel veritabanları (işlemsel tutarlılık için), veri ambarları ve data lake'ler.
- **Kural motorları** — fraud ve AML'de makine öğrenmesi modelleriyle birlikte çalışan, denetçilerin okuyabildiği kurallar.
- **Donanım güvenlik modülleri (HSM)** — kart PIN ve anahtar işlemleri.
- **Analitik** — Python/R, SQL; regüle ortamlarda çoğu zaman kurum içi (on-premise) çalışma zorunluluğu.

## Veri türleri ve veri kaynakları {#data}

| Veri | Örnek alanlar | Dikkat |
|---|---|---|
| İşlem verisi | tutar, zaman, üye işyeri kategorisi (MCC), kanal, cihaz | Çok dengesiz sınıflar; etiket gecikmesi |
| Müşteri verisi | yaş bandı, gelir, ürünler, KYC bilgileri | Kişisel veri; KVKK kapsamında |
| Cihaz ve oturum | IP, cihaz parmak izi, oturum davranışı | Hesap ele geçirme tespiti |
| İlişki verisi | ortak cihaz, ortak adres, para transfer ağı | [[Graph Learning]] için uygun |
| Belge | kimlik, gelir belgesi, sözleşme | [[OCR]] ve belge anlama |
| Dış veri | kredi bürosu, yaptırım listeleri | Lisans ve güncellik |

Açık eğitim verisi olarak sık kullanılan bir örnek, ULB'nin kart işlemleri veri setidir: 284.807 işlemden yalnızca 492'si (≈ %0,17) dolandırıcılıktır. Özellikler PCA ile anonimleştirilmiştir; bu yüzden gerçek hayattaki **özellik mühendisliğini** öğretmez, ama [[Class Imbalance|sınıf dengesizliğini]] çok iyi gösterir.

## Matematiksel ve bilimsel altyapı {#science}

- **Olasılık ve istatistik** — beklenen kayıp, kalibrasyon, hipotez testleri.
- **Zaman serileri** — likidite tahmini, işlem hacmi tahmini: [[Time-Series Forecasting]].
- **Optimizasyon** — karar eşiği seçimi, portföy ve limit optimizasyonu.
- **Graf teorisi** — para transfer ağları, dolandırıcılık halkaları.
- **Karar teorisi** — yanlış pozitif ve yanlış negatifin farklı maliyetleri.

Fraud eşiği seçiminin temel mantığı, beklenen maliyeti en aza indirmektir:

$$
\text{Maliyet}(t) = C_{FN}\cdot FN(t) + C_{FP}\cdot FP(t)
$$

Burada $C_{FN}$ kaçırılan bir dolandırıcılığın ortalama maliyeti (çoğu zaman işlem tutarıyla orantılı), $C_{FP}$ ise yanlış alarmın maliyetidir (müşteri kaybı, çağrı merkezi yükü). İki maliyet çok farklı olduğu için **en yüksek doğruluk (accuracy) veren eşik genellikle yanlış eşiktir**.

## AI ve otomasyon kullanım alanları {#ai-uses}

- **Gerçek zamanlı fraud tespiti** — otorizasyon anında skor: [[Fraud Detection]], [[Anomaly Detection]].
- **AML işlem izleme** — senaryo kuralları + makine öğrenmesiyle alarm önceliklendirme.
- **Kredi skorlama** — [[credit-scoring|Kredi Skorlama]]; açıklanabilirlik zorunlu.
- **Belge işleme** — kimlik ve gelir belgelerinde [[OCR]] ve alan çıkarımı.
- **Müşteri hizmetleri asistanları** — LLM tabanlı; prompt injection ve veri sızıntısı riskleri nedeniyle sıkı yetki sınırları gerekir.
- **Tahsilat önceliklendirme**, **müşteri segmentasyonu**, **likidite tahmini**.

## Sektörün kendi algoritmaları ve yöntemleri {#methods}

- **Skor kartları (scorecards)** — lojistik regresyon + WoE (Weight of Evidence) dönüşümü. Eski ama denetçiler tarafından iyi anlaşıldığı için hâlâ yaygın.
- **Gradient boosting** — tablo verisinde güçlü; açıklama için SHAP gibi yöntemlerle birlikte kullanılır.
- **Hız (velocity) özellikleri** — "son 1 saatte aynı kartla kaç işlem?", "son 24 saatte farklı ülke sayısı?". Fraud modellerinin en değerli özellikleri çoğu zaman bunlardır.
- **Denetimsiz anomali tespiti** — etiket azken: [[Isolation Forest]], robust z-score. Uygulamalı örnek: [[transaction-anomaly-detection|İşlem verisinde anomali tespiti]].
- **Graf yöntemleri** — bağlantılı bileşenler, PageRank benzeri skorlar, GNN'ler: [[Graph Learning]].
- **Kural + model hibrit sistemler** — kural, bilinen dolandırıcılık kalıplarını hızla kapatır; model bilinmeyenleri yakalar.

## Başarı metrikleri ve KPI'lar {#metrics}

| Problem | Teknik metrik | İş metriği |
|---|---|---|
| Fraud | [[PR-AUC]], belirli FPR'de recall, [[Precision ve Recall]] | Önlenen kayıp (TL), yanlış ret oranı, müşteri şikâyeti |
| AML | Alarm başına gerçek şüpheli oranı | Analist başına incelenen alarm, bildirim kalitesi |
| Kredi skorlama | Gini (= 2·AUC − 1), KS, kalibrasyon | Temerrüt oranı, onay oranı |
| Operasyon | p99 gecikme, erişilebilirlik | İşlem başarısı |

> **Dikkat:** %0,17 pozitif oranında, her işleme "normal" diyen bir model %99,8 accuracy alır ve hiçbir işe yaramaz. Bu yüzden fraud'da [[ROC-AUC]] bile iyimser kalabilir; [[PR-AUC]] ve iş maliyeti birlikte izlenmelidir.

## Operasyonel ve teknik problemler {#problems}

1. **Etiket gecikmesi ve gürültüsü** — chargeback haftalar sonra gelir; bazı dolandırıcılıklar hiç bildirilmez. Model "dünün dolandırıcılığını" öğrenir.
2. **Kavram kayması (concept drift)** — dolandırıcılar model değiştikçe davranış değiştirir. İzleme ve düzenli yeniden eğitim gerekir.
3. **Gecikme bütçesi** — özellik hesaplama dahil skor, otorizasyon süresine sığmalıdır. Hız özellikleri için düşük gecikmeli bir özellik deposu (feature store) gerekir.
4. **Veri sızıntısı** — eğitimde, işlem anında henüz bilinmeyen bilgilerin (ör. sonraki chargeback) kullanılması: [[Data Leakage]].
5. **Eşik ve kapasite** — alarm sayısı inceleme ekibinin kapasitesini aşarsa model ne kadar iyi olursa olsun sistem çalışmaz.
6. **Eski sistem entegrasyonu** — çekirdek sistemlere erişim sınırlıdır; değişiklikler uzun onay süreçlerinden geçer.

## Güvenlik, gizlilik ve mevzuat {#regulation}

Bu bölüm bir **çerçevedir**; güncel yükümlülükler için ilgili kurumların resmî metinlerine bakın (kaynaklar sayfa sonunda).

- **Bankacılık denetimi** — Türkiye'de BDDK; uluslararası sermaye yeterliliği çerçevesi Basel Komitesi tarafından belirlenir.
- **AML / terörün finansmanı** — Türkiye'de MASAK; uluslararası standartlar FATF tavsiyeleri.
- **Kişisel veri** — KVKK; AB müşterileri varsa GDPR. Model eğitiminde kişisel veri kullanımının hukuki dayanağı ve saklama süreleri tanımlanmalıdır.
- **Kart verisi** — PCI DSS; kart numarası gibi verilerin saklanması ve işlenmesi sıkı kurallara bağlıdır.
- **Model risk yönetimi** — modelin bağımsız doğrulanması, dokümantasyonu ve izlenmesi. ABD'de Federal Reserve'ün SR 11-7 rehberi bu alanda sık referans verilen bir çerçevedir.
- **Açıklanabilirlik** — kredi reddi gibi kararlarda müşteriye ve denetçiye gerekçe sunabilmek gerekir. [[Privacy Engineering]] ile birlikte düşünülmelidir.

## Gerçek dünya vaka çalışmaları {#case-studies}

- [[banking-realtime-fraud|Gerçek zamanlı kart fraud sistemi tasarımı]] — genel mühendislik çıkarımlarına dayanan, kanıt düzeyi açıkça işaretlenmiş bir eğitim vakası.
- [[fde-customer-db-assistant|FDE vakası: Müşteri veritabanına bağlanan AI asistanı]] — bir bankanın kurum içi verisine güvenli erişen prototipin üretime taşınması (varsayımsal eğitim senaryosu).

## Örnek projeler ve tutorial'lar {#projects}

1. **Başlangıç:** [[transaction-anomaly-detection|İşlem verisinde anomali tespiti]] — robust z-score ve Isolation Forest'ı sıfırdan uygulayın; eşik seçimini maliyetle yapın.
2. **Orta:** Hız özellikleri üreten bir pipeline yazın (son 1 saat / 24 saat pencereleri) ve veri sızıntısı olmadığını test edin.
3. **İleri:** Ortak cihaz/IP üzerinden bir hesap grafı kurun; bağlantılı bileşenlerle şüpheli halkaları bulun ([[Graph Learning]]).
4. **Uzman:** Kural + model hibrit sistemini gecikme bütçesi, eşik maliyeti ve analist kapasitesiyle birlikte simüle edin.

## İleri araştırma kaynakları {#research}

- Anomali tespiti için genel bir başlangıç: [[Anomaly Detection]] sayfasındaki kaynaklar.
- Graf tabanlı dolandırıcılık tespiti: [[Graph Learning]].
- Kalibrasyon ve eşik seçimi: [[Precision ve Recall]].
- Mevzuat ve model riski: sayfa sonundaki resmî kaynaklar.

## İlgili meslek ve sektör bağlantıları {#related}

- **Sektörler:** [[ecommerce|E-ticaret]] (ödeme fraud'u ortak), [[cybersecurity|Siber güvenlik]] (hesap ele geçirme, olay müdahalesi).
- **Ortak teknolojiler:** [[Anomaly Detection]], [[Graph Learning]], [[Time-Series Forecasting]], [[OCR]], [[Privacy Engineering]].
- **Meslekler:** [[Forward Deployed Engineer]], [[AI Engineer]], [[Data Engineer]], [[Risk Analyst]], [[Security Engineer]].
- **Öğrenme yolu:** [[banking-path|Bankacılık öğrenme yolu]].
