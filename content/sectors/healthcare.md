---
id: healthcare
type: sector
title: Sağlık, Tıp ve Yaşam Bilimleri
title_en: Healthcare, Medicine & Life Sciences
summary: Klinik bakım, medikal görüntüleme, klinik veri ve biyoinformatiğin; hasta güvenliği, klinik doğrulama ve sıkı gizlilik kurallarıyla birleştiği alan.
status: complete
group: Sağlık
order: 2
level: Başlangıç → İleri
tags: [sağlık, medikal-görüntüleme, klinik-veri, biyoinformatik]
aliases: [Sağlık, Tıp, Healthcare]
relations:
  used_with: [cybersecurity]
sources:
  - { title: "HL7 FHIR standardı", url: "https://hl7.org/fhir/", kind: standard, lang: en }
  - { title: "DICOM standardı", url: "https://www.dicomstandard.org", kind: standard, lang: en }
  - { title: "KVKK — Kişisel Verileri Koruma Kurumu", url: "https://www.kvkk.gov.tr", kind: standard, lang: tr }
  - { title: "AB Yapay Zekâ Tüzüğü (Regulation (EU) 2024/1689)", url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", kind: standard, lang: en }
  - { title: "U.S. FDA — Medical Devices", url: "https://www.fda.gov/medical-devices", kind: standard, lang: en }
last_verified: 2026-10-18
version: 1
---

> **Önemli:** Bu sayfa sağlık sektörünü **eğitim ve mühendislik** perspektifinden anlatır. Hiçbir bölüm kişiye özel teşhis veya tedavi önerisi değildir. Klinik kullanıma yönelik her model, bağımsız klinik doğrulama ve ilgili mevzuata uygunluk gerektirir.

## Sektörün temel işleyişi {#overview}

Sağlık sistemi; hastaneler, birinci basamak, laboratuvarlar, ilaç ve cihaz üreticileri, sigorta/geri ödeme kurumları ve araştırma merkezlerinden oluşur. Bir hastanın yolculuğu tipik olarak başvuru → muayene → tetkik (laboratuvar, görüntüleme) → tanı → tedavi → takip adımlarıyla ilerler ve her adım bir **klinik kayıt** üretir.

Mühendislik açısından temel gerçeklik şudur: **hata maliyeti insan sağlığıdır** ve sistemler birbirinden kopuk, farklı standartlarla çalışır.

## Temel kavramlar ve terminoloji {#terminology}

- **EHR/EMR** — elektronik sağlık kaydı.
- **HL7 FHIR** — klinik verinin sistemler arası paylaşımı için kaynak (resource) tabanlı standart.
- **DICOM** — medikal görüntü dosya ve iletişim standardı; görüntü + meta veri (hasta, cihaz, çekim parametreleri).
- **PACS** — görüntü arşivleme ve iletişim sistemi.
- **Duyarlılık (sensitivity) / özgüllük (specificity)** — klinikte recall ve true-negative oranının karşılıkları: [[Precision ve Recall]].
- **SaMD** — tıbbi cihaz olarak yazılım; klinik amaçla kullanılan yazılımlar mevzuata tabidir.

## Değer zinciri ve iş süreçleri {#value-chain}

Medikal görüntülemede tipik akış: istem → çekim (CT/MRI/röntgen/ultrason) → PACS'a kayıt → radyolog okuması → rapor → klinisyen kararı. AI genellikle **okuma iş akışına** yerleşir: önceliklendirme (acil vakaları öne alma), ikinci okuma, ölçüm otomasyonu (ör. segmentasyonla hacim hesabı).

## Önemli meslekler ve ekipler {#roles}

Klinisyenler ve radyologlar, klinik bilişim uzmanları, [[Data Engineer]] (klinik veri pipeline'ları), [[Computer Vision Engineer]] (medikal görüntü), [[AI Engineer]], biyoistatistikçiler, regülasyon/kalite uzmanları, [[Security Engineer]]. Sağlık yazılımı şirketlerinde hastane entegrasyonlarını yapan [[Forward Deployed Engineer]] profilleri de yaygındır.

## Kullanılan yazılım ve donanım {#tools}

Hastane bilgi sistemleri (HBYS), PACS, laboratuvar bilgi sistemleri, görüntüleme cihazları, giyilebilir sensörler; analiz tarafında Python, DICOM okuma kütüphaneleri, medikal görüntü segmentasyon çerçeveleri.

## Veri türleri ve veri kaynakları {#data}

| Veri | Örnek | Dikkat |
|---|---|---|
| Görüntü | CT, MRI, röntgen, patoloji | Cihaz/protokol farkı → dağılım kayması |
| Yapılandırılmış klinik veri | Tanı kodları, laboratuvar, ilaç | Kodlama alışkanlıkları kurumdan kuruma değişir |
| Serbest metin | Epikriz, radyoloji raporu | [[OCR]] ve dil işleme; mahremiyet |
| Sinyal | EKG, EEG, vital bulgular | [[Signal Processing]] |
| Omik veri | Genom, protein | Çok yüksek boyut, az örnek |

## Matematiksel ve bilimsel altyapı {#science}

Anatomi/fizyoloji temelleri, biyoistatistik (hipotez testleri, sağkalım analizi), [[Bayesian Methods]] (tanı testlerinin yorumu), görüntü işleme ve [[Signal Processing]], [[Causal Inference]] (gözlemsel klinik veri).

## AI ve otomasyon kullanım alanları {#ai-uses}

Görüntü segmentasyonu ve tespit, triyaj/önceliklendirme, klinik not özetleme, kodlama yardımı, erken uyarı skorları ([[Anomaly Detection]]), ilaç keşfinde [[Graph Learning]].

## Sektörün kendi algoritmaları ve yöntemleri {#methods}

U-Net türevi segmentasyon modelleri, sağkalım modelleri (Cox), klinik erken uyarı skorları, kurumlar arası veri paylaşmadan eğitim için federatif öğrenme, belirsizlik tahmini.

## Başarı metrikleri ve KPI'lar {#metrics}

Teknik: duyarlılık/özgüllük, [[ROC-AUC]], segmentasyonda [[Dice]]; kalibrasyon. Klinik: okuma süresi, gözden kaçan bulgu oranı, hasta sonuçları. **Bir modelin klinik faydası, teknik metrikten ayrı ve prospektif olarak ölçülmelidir.**

## Operasyonel ve teknik problemler {#problems}

Kurumlar arası dağılım kayması (farklı cihaz ve protokoller), etiket maliyeti ve uzmanlar arası anlaşmazlık, alarm yorgunluğu, hastane sistemleriyle entegrasyon zorluğu, kısa vadede test setine aşırı uyum.

## Güvenlik, gizlilik ve mevzuat {#regulation}

Sağlık verisi özel nitelikli kişisel veridir (KVKK). Klinik amaçlı yazılımlar tıbbi cihaz mevzuatına girebilir; AB'de AI Tüzüğü yüksek riskli sistemler için ek yükümlülükler getirir. Ayrıntı için [[Privacy Engineering]] ve sayfa sonundaki resmî kaynaklar.

## Gerçek dünya vaka çalışmaları {#case-studies}

Henüz bu sektöre özel doğrulanmış bir vaka eklenmedi. Genel teşhis yaklaşımı için [[manufacturing-visual-inspection|görsel muayene vakası]] (az kusur örneği ile çalışma) ve [[Anomaly Detection]] sayfası yol göstericidir. *(Kapsam notu: vaka eksik.)*

## Örnek projeler ve tutorial'lar {#projects}

1. [[iou-dice-metrics|IoU ve Dice hesaplama]] — segmentasyon değerlendirmesinin temeli.
2. Kamuya açık bir medikal görüntü veri setinde Dice'ı sınıf bazında raporlayın; sınır hatalarını görselleştirin.
3. Bir EKG sinyalinde gürültü filtreleme ve basit anomali skoru.

## İleri araştırma kaynakları {#research}

FHIR ve DICOM standart dokümanları; medikal görüntü segmentasyonu literatürü; klinik AI değerlendirme rehberleri. Kaynak listesi sayfa sonundadır.

## İlgili meslek ve sektör bağlantıları {#related}

Sektörler: [[cybersecurity|Siber güvenlik]] (hastane fidye yazılımı riskleri). Teknolojiler: [[Computer Vision]], [[OCR]], [[Anomaly Detection]], [[Privacy Engineering]], [[Causal Inference]]. Meslekler: [[Computer Vision Engineer]], [[Data Engineer]], [[Forward Deployed Engineer]].
