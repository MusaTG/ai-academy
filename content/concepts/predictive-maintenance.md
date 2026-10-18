---
id: predictive-maintenance
type: concept
title: Predictive Maintenance
title_en: Predictive Maintenance
summary: Makine arızalarını sensör verisiyle önceden tahmin edip bakımı arızadan önce ve gerektiği kadar yapma yaklaşımı.
status: partial
level: Orta
aliases: [Kestirimci Bakım]
tags: [bakım, sensör, zaman-serisi]
relations:
  used_in_sector: [manufacturing, energy-climate]
  used_with: [anomaly-detection, signal-processing, time-series-forecasting]
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Arabanız garip bir ses çıkarmaya başladığında servise gidersiniz; yolda kalmayı beklemezsiniz. Kestirimci bakım, makinelerin "garip seslerini" (titreşim, sıcaklık, akım) sensörlerle sürekli dinler.

## Neden gerekli? {#why}

Reaktif bakım (bozulunca tamir) plansız duruşa, periyodik bakım (her X saatte) gereksiz parça değişimine yol açar. Kestirimci bakım ikisi arasında maliyet dengesini hedefler.

## Hata analizi {#failure-modes}

Arıza örnekleri çok azdır ve her arıza türü farklıdır; bakım kayıtları serbest metin ve eksiktir; sensör hatası ile makine arızası birbirine karışabilir. Bkz. [[Anomaly Detection]], [[Signal Processing]].

> **Kapsam notu:** Matematik, elle hesaplama ve özet bölümleri henüz yazılmadı.
