---
id: fraud-detection
type: concept
title: Fraud Detection
title_en: Fraud Detection
summary: Ödeme ve hesap hareketlerinde dolandırıcılığı mümkünse işlem anında tespit etme; kural, makine öğrenmesi ve insan incelemesinin birlikte çalıştığı problem.
status: complete
level: Orta
aliases: [Dolandırıcılık Tespiti, Sahtecilik Tespiti]
tags: [fraud, bankacılık, gerçek-zamanlı]
relations:
  application_of: [anomaly-detection]
  used_in_sector: [banking, ecommerce, telecom]
  evaluated_with: [pr-auc, precision-recall]
  used_with: [graph-learning, class-imbalance]
sources:
  - { title: "Credit Card Fraud Detection veri seti (ULB, Kaggle)", url: "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud", kind: community, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Kartınız İstanbul'da kullanılırken beş dakika sonra başka bir kıtada kullanılıyorsa bir şeyler yanlıştır. Fraud tespiti bu tür sinyalleri, müşteriyi gereksiz yere rahatsız etmeden, milisaniyeler içinde yakalamaya çalışır.

## Neden gerekli? {#why}

Kaçan dolandırıcılık doğrudan para kaybıdır; yanlış alarm ise müşteri kaybı ve operasyon maliyetidir. İkisi arasındaki denge, sistemin kârlılığını belirler.

## Matematik {#math}

Eşik $t$ seçimi beklenen maliyetle yapılır. Tutar bazlı basit bir sürüm:

$$
\text{Maliyet}(t) = \sum_{i \in FN(t)} \text{tutar}_i + C_{FP}\cdot |FP(t)|
$$

## Elle hesaplama {#example}

Günde 100.000 işlem, %0,2 fraud (200 işlem, ortalama 1.500 TL). Model eşiği A: 150 fraud yakalıyor, 2.000 yanlış alarm. Eşik B: 120 yakalıyor, 500 yanlış alarm. $C_{FP} = 20$ TL ise:

- A: kaçan 50 × 1.500 = 75.000 TL + 2.000 × 20 = 40.000 TL → **115.000 TL**
- B: kaçan 80 × 1.500 = 120.000 TL + 500 × 20 = 10.000 TL → **130.000 TL**

Bu varsayımlarla A daha iyidir — ama analist kapasitesi günde 1.000 alarmsa A uygulanamaz.

## Hata analizi {#failure-modes}

Etiket gecikmesi, kavram kayması, [[Data Leakage]], [[Class Imbalance]], dolandırıcıların sisteme uyum sağlaması, gecikme bütçesinin aşılması.

## Özet {#summary}

Fraud tespiti bir model değil bir **sistemdir**: kurallar + model + eşik + insan incelemesi + geri bildirim döngüsü. Uygulama: [[transaction-anomaly-detection|tutorial]], tasarım: [[banking-realtime-fraud|vaka]].
