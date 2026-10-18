---
id: manufacturing
type: sector
title: Üretim, Endüstri ve Lojistik
title_en: Manufacturing, Industry & Logistics
summary: Fiziksel ürünün üretildiği ve taşındığı; sensör verisi, görüntü tabanlı kalite kontrol ve kestirimci bakımın operasyonel verimlilikle buluştuğu sektör.
status: complete
group: Endüstri
order: 3
level: Başlangıç → İleri
tags: [üretim, kalite-kontrol, iot, bakım]
aliases: [Üretim, Endüstri, Manufacturing]
relations:
  used_with: [energy-climate, robotics-autonomy]
sources:
  - { title: "MVTec AD — endüstriyel anomali tespiti veri seti", url: "https://www.mvtec.com/company/research/datasets/mvtec-ad", kind: official-docs, lang: en }
  - { title: "ISA (International Society of Automation) standartları", url: "https://www.isa.org", kind: standard, lang: en }
last_verified: 2026-10-18
version: 1
---

## Sektörün temel işleyişi {#overview}

Bir fabrika, hammaddeyi belirli bir **çevrim süresi** içinde, belirli bir **kalitede** ve mümkün olan en düşük **duruş** ile ürüne dönüştürmeye çalışır. Kârlılık; makinelerin ne kadar çalıştığına, ne kadar hızlı çalıştığına ve ne kadar hatasız ürün çıkardığına bağlıdır. Bu üçü [[OEE]] metriğinde birleşir.

## Temel kavramlar ve terminoloji {#terminology}

- **PLC** — makineleri kontrol eden endüstriyel bilgisayar.
- **SCADA** — saha cihazlarını izleme ve kontrol sistemi.
- **MES** — üretim yürütme sistemi (iş emirleri, izlenebilirlik).
- **OEE** — kullanılabilirlik × performans × kalite: [[OEE]].
- **Kestirimci bakım** — arıza olmadan önce müdahale: [[Predictive Maintenance]].
- **Hurda / yeniden işleme (scrap / rework)** — kalite kaybının maliyeti.

## Değer zinciri ve iş süreçleri {#value-chain}

Tedarik → hammadde kabul → üretim (istasyonlar) → kalite kontrol → paketleme → depolama → sevkiyat. Kalite kontrolde amaç hatayı **mümkün olan en erken istasyonda** yakalamaktır; son kontrolde bulunan hata, tüm önceki işçiliğin boşa gittiği anlamına gelir.

## Önemli meslekler ve ekipler {#roles}

Üretim ve proses mühendisleri, kalite mühendisleri, bakım ekipleri, otomasyon/PLC mühendisleri, [[Computer Vision Engineer]] (görsel muayene), [[Data Engineer]] (sensör verisi), [[MLOps Engineer]] (edge cihazlarda model işletimi).

## Kullanılan yazılım ve donanım {#tools}

PLC, SCADA, MES, ERP; endüstriyel kameralar ve aydınlatma; edge bilgisayarlar; titreşim/sıcaklık sensörleri; zaman serisi veritabanları.

## Veri türleri ve veri kaynakları {#data}

Ürün görüntüleri, sensör zaman serileri (titreşim, sıcaklık, akım), makine durum kodları, bakım kayıtları, iş emri ve kalite kayıtları. En büyük zorluk: **kusurlu örnekler çok azdır** ve bakım kayıtları serbest metindir.

## Matematiksel ve bilimsel altyapı {#science}

İstatistiksel proses kontrol (kontrol kartları), [[Signal Processing]] (titreşim spektrumu), [[Time-Series Forecasting]], [[Optimization]] (çizelgeleme), görüntü işleme.

## AI ve otomasyon kullanım alanları {#ai-uses}

Görsel kusur tespiti ([[Anomaly Detection]] + [[Computer Vision]]), kestirimci bakım, talep tahmini, enerji optimizasyonu, kök neden analizi, robotik montaj.

## Sektörün kendi algoritmaları ve yöntemleri {#methods}

Kontrol kartları (Shewhart, CUSUM), FFT tabanlı titreşim analizi, yalnız normal örneklerle eğitilen görsel anomali yöntemleri (PatchCore, PaDiM), kalan ömür (RUL) tahmini.

## Başarı metrikleri ve KPI'lar {#metrics}

[[OEE]], hurda oranı, ilk seferde doğru (first pass yield), plansız duruş süresi, MTBF/MTTR. Model tarafında: kaçan kusur oranı (FN) ve yanlış red oranı (FP) — ikisinin maliyeti çok farklıdır.

## Operasyonel ve teknik problemler {#problems}

Aydınlatma veya kamera değişince modelin bozulması, hat hızında gecikme bütçesi, kusur tanımının operatörden operatöre değişmesi (etiket tutarsızlığı), OT (operasyonel teknoloji) ağına erişim kısıtları.

## Güvenlik, gizlilik ve mevzuat {#regulation}

İş güvenliği, OT siber güvenliği ([[cybersecurity|Siber güvenlik]]), ürün izlenebilirliği ve sektöre özel kalite standartları (otomotiv, havacılık, gıda, ilaç).

## Gerçek dünya vaka çalışmaları {#case-studies}

[[manufacturing-visual-inspection|Az kusur örneğiyle görsel muayene sistemi]] — kanıt düzeyi işaretli eğitim vakası.

## Örnek projeler ve tutorial'lar {#projects}

1. [[canny-edge-numpy|Canny kenar algılamayı sıfırdan uygulama]] — parça kenar kontrolü için temel.
2. [[harris-corner-numpy|Harris köşe algılayıcı]] — hizalama ve ölçüm için.
3. MVTec AD üzerinde yalnız normal görüntülerle anomali skoru üretin; görüntü ve piksel seviyesinde değerlendirin.

## İleri araştırma kaynakları {#research}

[[Anomaly Detection]] sayfasındaki PatchCore ve MVTec AD kaynakları; [[Predictive Maintenance]].

## İlgili meslek ve sektör bağlantıları {#related}

Sektörler: [[energy-climate|Enerji]], [[robotics-autonomy|Robotik]]. Teknolojiler: [[Anomaly Detection]], [[Computer Vision]], [[Optimization]], [[Signal Processing]]. Meslekler: [[Computer Vision Engineer]], [[MLOps Engineer]], [[Forward Deployed Engineer]].
