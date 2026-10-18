---
id: binary-classification
type: concept
title: Binary Classification
title_en: Binary Classification
summary: Her örneği iki sınıftan birine (pozitif/negatif) atayan, fraud'dan hastalık taramasına en yaygın makine öğrenmesi görevi.
status: complete
level: Başlangıç
aliases: [İkili Sınıflandırma]
tags: [sınıflandırma, temel]
relations:
  evaluated_with: [precision-recall, roc-auc, pr-auc, f1-score]
  used_with: [cross-entropy]
sources:
  - { title: "scikit-learn — Model evaluation", url: "https://scikit-learn.org/stable/modules/model_evaluation.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

E-posta spam mı, değil mi? İşlem dolandırıcılık mı, değil mi? Model bir **skor** üretir; bir **eşik** bu skoru evet/hayır kararına çevirir.

## Neden gerekli? {#why}

Pek çok iş kararı ikilidir: onayla/reddet, alarm ver/verme. Model ve eşik ayrı ayrı düşünülmelidir: model sıralamayı, eşik işletme noktasını belirler.

## Matematik {#math}

Lojistik model: $p = \sigma(z) = \frac{1}{1 + e^{-z}}$. Karar: $\hat{y} = \mathbb{1}[p \ge t]$. Hata türleri karışıklık matrisinde (TP, FP, TN, FN) toplanır.

## Elle hesaplama {#example}

$z = 2 \Rightarrow p = 1/(1+e^{-2}) \approx 0{,}88$. $t = 0{,}5$ iken pozitif, $t = 0{,}9$ iken negatif.

## Hata analizi {#failure-modes}

Eşiği varsayılan 0,5'te bırakmak, dengesiz veride accuracy kullanmak ([[Class Imbalance]]), olasılıkları kalibre etmeden maliyet hesabı yapmak.

## Özet {#summary}

Skor + eşik. Değerlendirme: [[Precision ve Recall]], [[F1 Score]], [[ROC-AUC]], [[PR-AUC]].
