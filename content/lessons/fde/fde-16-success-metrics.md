---
id: fde-16-success-metrics
type: lesson
title: Başarı ölçütleri
title_en: Success metrics
summary: Teknik metrikleri iş sonucuna bağlama ve ölçümü projenin başında kurma.
status: complete
order: 16
duration: 30 dk
level: Orta
tags:
- fde
relations:
  part_of:
  - fde-path
last_verified: '2026-10-18'
version: 1
---

## Üç katmanlı ölçüm

1. **Teknik:** doğruluk, [[Precision ve Recall]], gecikme, hata oranı.
2. **Kullanım:** aktif kullanıcı, görev tamamlama oranı, sistemi atlayan kullanıcılar.
3. **İş:** süre, maliyet, gelir, risk azalması — müşterinin tanımladığı KPI.

## Kural

Teknik metrik iyi ama kullanım düşükse sistem başarısızdır. Ölçümü projenin **başında** kurun; sonradan "önceki durum" verisini bulmak çoğu zaman imkânsızdır (baseline).

## Örnek gösterge paneli

| Metrik | Baseline | Hedef | Şu an |
|---|---|---|---|
| İtiraz başına süre | 25 dk | 10 dk | 14 dk |
| Haftalık aktif analist | 0 | 12 | 9 |
| Asistan cevabında hata (örneklem) | – | < %5 | %3 |
