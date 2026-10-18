---
id: roc-auc
type: metric
title: ROC-AUC
title_en: ROC-AUC
summary: Rastgele seçilen bir pozitifin rastgele seçilen bir negatiften daha yüksek skor alma olasılığı; eşikten bağımsız sıralama kalitesi.
status: complete
level: Orta
aliases: [AUROC, AUC, ROC eğrisi altındaki alan]
tags: [metrik, sıralama]
relations:
  alternative_of: [pr-auc]
  used_with: [binary-classification]
sources:
  - { title: "scikit-learn — roc_auc_score", url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Ne ölçüyor? {#intuition}

Modelin pozitifleri negatiflerden ne kadar iyi **sıraladığını**. 0,5 rastgele, 1,0 kusursuz sıralamadır.

## Formül {#math}

ROC eğrisi, tüm eşikler için $\mathrm{TPR} = \frac{TP}{TP+FN}$ değerini $\mathrm{FPR} = \frac{FP}{FP+TN}$ değerine karşı çizer. Alan, olasılıksal yorumla:

$$
\mathrm{AUC} = P(s(x^+) > s(x^-))
$$

## Elle hesaplama {#example}

Pozitif skorları {0,9; 0,4}, negatif skorları {0,5; 0,1}. 4 çiftten 3'ünde pozitif daha yüksek (0,4 < 0,5 hariç) → AUC = 0,75.

## Python ile hesaplama {#code}

```python
from sklearn.metrics import roc_auc_score
print(roc_auc_score([1, 1, 0, 0], [0.9, 0.4, 0.5, 0.1]))  # 0.75
```

## Ne zaman yanıltıcıdır? {#pitfalls}

Çok dengesiz verilerde FPR'nin paydası (TN) çok büyük olduğu için binlerce yanlış alarm bile FPR'yi az değiştirir; ROC-AUC iyimser görünür → [[PR-AUC]] ile birlikte raporlayın. Kalibrasyon hakkında bilgi vermez.

## Özet {#summary}

Sıralama kalitesi; dengesizlikte tek başına yetersiz. Kredi riskinde Gini = 2·AUC − 1 ([[credit-scoring|kredi skorlama]]).
