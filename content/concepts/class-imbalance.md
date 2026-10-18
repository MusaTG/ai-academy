---
id: class-imbalance
type: concept
title: Class Imbalance
title_en: Class Imbalance
summary: Bir sınıfın diğerlerinden çok daha az örneğe sahip olması; fraud, kusur ve hastalık tespitinde metrikleri ve eğitimi yanıltan temel tuzak.
status: complete
level: Başlangıç
aliases: [Sınıf Dengesizliği, Imbalanced Data]
tags: [veri, metrik, dengesizlik]
relations:
  used_with: [focal-loss, precision-recall, pr-auc, hard-example-mining]
  used_in_sector: [banking, manufacturing, healthcare, cybersecurity]
sources:
  - { title: "scikit-learn — Model evaluation", url: "https://scikit-learn.org/stable/modules/model_evaluation.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

1000 işlemden 2'si dolandırıcılık. "Hepsi normal" diyen bir model %99,8 doğruluk alır ama tek bir dolandırıcılığı bile yakalamaz. Sınıf dengesizliği, **yüksek doğruluk ile işe yaramazlığın** aynı anda mümkün olduğu durumdur.

## Neden gerekli? {#why}

Fraud ([[banking|bankacılık]]), kusur ([[manufacturing|üretim]]), nadir hastalık ([[healthcare|sağlık]]) ve saldırı ([[cybersecurity|güvenlik]]) tespitinde ilgilenilen sınıf hep azınlıktadır.

## Matematik {#math}

Pozitif oranı (prevalans) $\pi = \frac{P}{P+N}$. Rastgele bir sınıflandırıcının beklenen precision değeri $\pi$'ye eşittir; bu yüzden [[PR-AUC]]'nin "taban çizgisi" de $\pi$'dir — [[ROC-AUC]]'nin taban çizgisi ise her zaman 0,5'tir.

## Elle hesaplama {#example}

$\pi = 0{,}002$. Model 100 alarm üretiyor, 1'i gerçek. Precision = %1. Bu kötü görünür ama rastgele seçime göre 5 kat iyidir ($0{,}01 / 0{,}002$). Bu oran **lift** olarak raporlanabilir.

## Hata analizi {#failure-modes}

- Accuracy ile model seçmek.
- Yeniden örneklemeyi (oversampling) train/test ayrımından **önce** yapmak → [[Data Leakage]].
- Test setini de dengelemek → gerçek dünyadaki precision'ı olduğundan yüksek gösterir.

Çözüm araçları: sınıf ağırlıkları, [[Focal Loss]], [[Hard Example Mining]], eşik ayarı, doğru metrikler ([[Precision ve Recall]]).

## Özet {#summary}

Dengesiz veride accuracy'ye güvenmeyin; prevalansı raporlayın, PR temelli metrikleri ve iş maliyetini kullanın.
