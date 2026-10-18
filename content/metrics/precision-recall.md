---
id: precision-recall
type: metric
title: Precision ve Recall
title_en: Precision & Recall
summary: Pozitif dediğiniz örneklerin ne kadarının doğru olduğu (precision) ile gerçek pozitiflerin ne kadarını yakaladığınız (recall).
status: complete
level: Başlangıç
aliases: [Precision, Recall, Kesinlik, Duyarlılık, Precision-Recall, Sensitivity]
tags: [metrik, sınıflandırma]
relations:
  prerequisite: [f1-score, pr-auc]
  used_with: [class-imbalance]
sources:
  - { title: "scikit-learn — Precision, recall and F-measures", url: "https://scikit-learn.org/stable/modules/model_evaluation.html#precision-recall-f-measure-metrics", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
quiz:
  - q: "TP=40, FP=10, FN=60. Precision ve recall nedir?"
    options: ["0.8 ve 0.4", "0.4 ve 0.8", "0.8 ve 0.8", "0.4 ve 0.4"]
    answer: 0
    explain: "Precision = 40/50 = 0.8; Recall = 40/100 = 0.4."
  - q: "Kanser taramasında öncelik genellikle hangisidir?"
    options: ["Yüksek precision", "Yüksek recall (kaçırmamak)", "Yüksek accuracy", "Düşük recall"]
    answer: 1
    explain: "Kaçırılan vaka (FN) çok maliyetlidir; sonraki doğrulama testleri FP'leri ayıklar."
---

## Ne ölçüyor? {#intuition}

- **Precision:** "Alarm verdiklerimin ne kadarı gerçekten pozitif?" — yanlış alarm maliyetini anlatır.
- **Recall:** "Gerçek pozitiflerin ne kadarını yakaladım?" — kaçırma maliyetini anlatır.

İkisi genellikle ters yönde hareket eder: eşiği düşürünce recall artar, precision düşer.

## Formül {#math}

$$
\text{Precision} = \frac{TP}{TP + FP}, \qquad \text{Recall} = \frac{TP}{TP + FN}
$$

Klinikte recall "duyarlılık (sensitivity)" olarak da bilinir.

## Elle hesaplama {#example}

Fraud modeli 50 alarm verdi, 40'ı gerçek (TP=40, FP=10). Toplam 100 gerçek fraud vardı (FN=60). Precision = 0,80; Recall = 0,40. Model güvenilir alarm veriyor ama fraud'un %60'ını kaçırıyor.

## Python ile hesaplama {#code}

```python
from sklearn.metrics import precision_score, recall_score
y_true = [1, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 1, 0]
print(precision_score(y_true, y_pred), recall_score(y_true, y_pred))  # 0.667 0.667
```

Bu platformun Metrik Laboratuvarı'nda TP/FP/FN değerlerini değiştirerek sonucu canlı görebilirsiniz.

## Ne zaman yanıltıcıdır? {#pitfalls}

- Tek eşikte raporlanan precision/recall, modelin genel kalitesini göstermez → [[PR-AUC]].
- Precision prevalansa bağlıdır: test setini yapay olarak dengelemek precision'ı şişirir ([[Class Imbalance]]).
- Hangi sınıfın "pozitif" olduğu açıkça belirtilmelidir.

## Özet {#summary}

Precision yanlış alarmı, recall kaçırmayı ölçer. Tek sayı gerekiyorsa [[F1 Score]], eşikten bağımsız özet için [[PR-AUC]].
