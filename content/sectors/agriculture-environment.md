---
id: agriculture-environment
type: sector
title: Tarım, Doğal Yaşam ve Çevre
title_en: Agriculture, Nature & Environment
summary: Saha, uydu, drone ve sensör verisini birleştirerek bitki sağlığı, verim, su ve biyoçeşitlilik kararlarını destekleyen alan.
status: partial
group: Doğa
order: 8
tags: [tarım, uzaktan-algılama, ndvi, çevre]
aliases: [Tarım, Çevre, Hassas Tarım]
relations:
  used_with: [energy-climate]
sources:
  - { title: "Copernicus Data Space Ecosystem (Sentinel uydu verisi)", url: "https://dataspace.copernicus.eu", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Sektörün temel işleyişi {#overview}

Tarımsal üretim; toprak, su, iklim, tohum, gübre ve iş gücünün bir sezon boyunca yönetilmesidir. Kararlar (ne zaman sulamalı, nereye ilaç atmalı, ne zaman hasat etmeli) **mekânsal** ve **zamansal** veriye dayanır. Hassas tarım, bu kararları tarlanın tamamı yerine bölge bölge vermeyi hedefler.

## Veri türleri ve veri kaynakları {#data}

Uydu görüntüleri (çok bantlı), drone görüntüleri, toprak nemi sensörleri, hava durumu verisi, saha gözlemleri, verim haritaları. Bu veriler farklı çözünürlük ve zaman aralıklarındadır; **coğrafi hizalama** temel bir mühendislik işidir.

## Matematiksel ve bilimsel altyapı {#science}

Bitki biyolojisi ve toprak bilimi temelleri, uzaktan algılama fiziği, spektral indeksler. En bilinen indeks NDVI, yakın kızılötesi (NIR) ve kırmızı (Red) bantlarından hesaplanır:

$$
\mathrm{NDVI} = \frac{NIR - Red}{NIR + Red}
$$

Sağlıklı bitki örtüsü NIR'ı güçlü yansıttığı için NDVI yüksektir.

## AI ve otomasyon kullanım alanları {#ai-uses}

Ürün sınıflandırma ve bitki hastalığı tespiti ([[Computer Vision]]), verim tahmini ([[Time-Series Forecasting]]), sulama optimizasyonu ([[Optimization]]), yaban hayatı izleme, orman ve afet takibi.

## Operasyonel ve teknik problemler {#problems}

Bulut örtüsü nedeniyle eksik uydu görüntüleri, bölgeden bölgeye değişen ürün desenleri (dağılım kayması), az ve pahalı saha etiketi, sezonluk döngü nedeniyle yavaş geri bildirim.

## İlgili meslek ve sektör bağlantıları {#related}

Sektörler: [[energy-climate|Enerji ve iklim]]. Teknolojiler: [[Computer Vision]], [[Time-Series Forecasting]], [[Optimization]].

> **Kapsam notu:** Terminoloji, değer zinciri, meslekler, araçlar, yöntemler, metrikler, mevzuat, vaka, proje ve araştırma bölümleri henüz yazılmadı.
