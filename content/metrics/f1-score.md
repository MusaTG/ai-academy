---
id: f1-score
type: metric
title: F1 Score
title_en: F1 Score
summary: Precision ve recall'un harmonik ortalaması; ikisini tek bir sayıda dengeleyen metrik.
status: complete
level: Başlangıç
aliases: [F1, F-score, F-measure]
tags: [metrik, sınıflandırma]
relations:
  used_with: [binary-classification]
sources:
  - { title: "scikit-learn — f1_score", url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Ne ölçüyor? {#intuition}

Precision ve recall'u birlikte özetler; biri çok düşükse F1 de düşük olur (harmonik ortalama küçük değeri cezalandırır).

## Formül {#math}

$$
F_1 = \frac{2 \cdot P \cdot R}{P + R} = \frac{2\,TP}{2\,TP + FP + FN}
$$

Genel hâli: $F_\beta = (1+\beta^2)\frac{P R}{\beta^2 P + R}$; $\beta > 1$ recall'a daha çok ağırlık verir.

## Elle hesaplama {#example}

P = 0,8, R = 0,4 → $F_1 = 2\cdot0{,}32/1{,}2 \approx 0{,}533$ (aritmetik ortalama 0,6 olurdu).

## Python ile hesaplama {#code}

```python
from sklearn.metrics import f1_score
print(f1_score([1, 1, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0]))  # 0.667
```

## Ne zaman yanıltıcıdır? {#pitfalls}

TN'yi hiç kullanmaz; FP ve FN maliyetleri çok farklıysa F1 yerine maliyet tabanlı değerlendirme yapın. Çok sınıflı durumda macro/micro/weighted ortalamalardan hangisinin kullanıldığını belirtin.

## Özet {#summary}

Dengeli tek sayı; ama iş maliyetinin yerini tutmaz. Bkz. [[Precision ve Recall]].
