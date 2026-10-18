---
id: oee
type: metric
title: OEE
title_en: Overall Equipment Effectiveness
summary: Bir makinenin planlanan sürede ne kadar çalıştığını, ne kadar hızlı çalıştığını ve ne kadar hatasız ürün çıkardığını tek bir oranda birleştiren üretim metriği.
status: complete
level: Başlangıç
aliases: [Overall Equipment Effectiveness, Toplam Ekipman Etkinliği]
tags: [üretim, kpi]
relations:
  used_in_sector: [manufacturing]
last_verified: 2026-10-18
version: 1
---

## Ne ölçüyor? {#intuition}

Bir makine teorik olarak üretebileceğinin ne kadarını **iyi ürün** olarak üretiyor?

## Formül {#math}

$$
\mathrm{OEE} = \underbrace{\frac{\text{çalışma süresi}}{\text{planlanan süre}}}_{\text{kullanılabilirlik}} \times \underbrace{\frac{\text{ideal çevrim} \times \text{toplam adet}}{\text{çalışma süresi}}}_{\text{performans}} \times \underbrace{\frac{\text{iyi adet}}{\text{toplam adet}}}_{\text{kalite}}
$$

## Elle hesaplama {#example}

Planlanan 480 dk, duruş 60 dk → kullanılabilirlik 420/480 = 0,875. İdeal çevrim 1 dk, 380 adet → performans 380/420 = 0,905. 361 iyi adet → kalite 0,95. OEE ≈ 0,875 × 0,905 × 0,95 ≈ **0,752**.

## Python ile hesaplama {#code}

```python
planned, downtime, ideal_cycle, total, good = 480, 60, 1.0, 380, 361
run = planned - downtime
oee = (run / planned) * (ideal_cycle * total / run) * (good / total)
print(round(oee, 3))  # 0.752
```

## Ne zaman yanıltıcıdır? {#pitfalls}

"Planlanan süre" tanımı fabrikadan fabrikaya değişir; farklı tesislerin OEE'leri tanım aynı değilse karşılaştırılamaz. Tek sayı, kaybın **hangi** bileşenden geldiğini gizler; üç bileşeni ayrı raporlayın.

## Özet {#summary}

Kullanılabilirlik × performans × kalite. AI projelerinde iş etkisini ölçmek için doğal bir hedef metriktir ([[manufacturing|Üretim]]).
