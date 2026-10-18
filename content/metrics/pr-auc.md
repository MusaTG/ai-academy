---
id: pr-auc
type: metric
title: PR-AUC
title_en: PR-AUC (Average Precision)
summary: Precision–recall eğrisinin altındaki alan; nadir pozitif sınıfta modelin gerçek kullanışlılığını ROC-AUC'den daha iyi yansıtır.
status: complete
level: Orta
aliases: [Average Precision, AP, AUPRC]
tags: [metrik, dengesizlik]
relations:
  used_with: [class-imbalance]
  used_in_sector: [banking, cybersecurity]
sources:
  - { title: "scikit-learn — average_precision_score", url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Ne ölçüyor? {#intuition}

Eşik değiştikçe precision ve recall'un birlikte nasıl değiştiğini tek bir sayıda özetler. Rastgele bir modelin PR-AUC'si **pozitif oranına** eşittir; bu yüzden nadir olaylarda iyileşmeyi daha dürüst gösterir.

## Formül {#math}

scikit-learn'deki Average Precision tanımı (bu sayfada kullanılan varyant):

$$
\mathrm{AP} = \sum_n (R_n - R_{n-1})\,P_n
$$

> **Varyant notu:** Yamuk (trapez) kuralıyla hesaplanan PR eğrisi alanı ve nesne tespitindeki interpolasyonlu AP (ör. COCO) farklı değerler verir. Raporda hangi tanımı kullandığınızı yazın.

## Elle hesaplama {#example}

Skorlara göre sıralı etiketler: 1, 0, 1, 0 (2 pozitif). İlk örnekte P=1, R=0,5; üçüncüde P=2/3, R=1. AP = 0,5·1 + 0,5·0,667 = 0,833.

## Python ile hesaplama {#code}

```python
from sklearn.metrics import average_precision_score
print(average_precision_score([1, 0, 1, 0], [0.9, 0.8, 0.7, 0.1]))  # 0.833
```

## Ne zaman yanıltıcıdır? {#pitfalls}

Farklı pozitif oranlarına sahip veri setlerinde PR-AUC değerleri doğrudan karşılaştırılamaz; taban çizgisini (prevalans) yanında raporlayın. İş için asıl önemli olan çoğu zaman eğrinin tamamı değil, işletme noktasıdır (ör. günde 100 alarmda precision).

## Özet {#summary}

Nadir pozitiflerde birincil özet metrik. Bkz. [[Precision ve Recall]], [[Class Imbalance]].
