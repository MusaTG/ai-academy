---
id: banking-path
type: path
title: Bankacılık sektörüne geçiş yolu
title_en: Banking sector onboarding path
summary: Bankacılığın işleyişinden fraud ve kredi riskine, metrik seçiminden uygulamalı anomali tespitine uzanan sektör öğrenme yolu.
status: complete
level: Başlangıç → Orta
duration: "≈ 10 saat"
tags: [bankacılık, fraud, risk]
relations:
  part_of: [banking]
steps:
  - banking
  - kyc-aml
  - fraud-detection
  - credit-scoring
  - class-imbalance
  - precision-recall
  - pr-auc
  - data-leakage
  - anomaly-detection
  - isolation-forest
  - transaction-anomaly-detection
  - graph-learning
  - banking-realtime-fraud
last_verified: 2026-10-18
version: 1
---

Bu yol, bankacılık veya fintech sektöründe teknik bir role (veri, AI, yazılım, FDE) geçecek biri için ilk iki haftalık öğrenme planıdır.

## Neden bu sıra?

1. Önce sektörün dili: [[banking|sektör sayfası]], ardından [[kyc-aml|KYC/AML]].
2. Sonra sektörün en yaygın iki ML problemi: [[Fraud Detection]] ve [[credit-scoring|kredi skorlama]].
3. Bu problemlerin ortak tuzakları: [[Class Imbalance]], doğru metrikler ([[Precision ve Recall]], [[PR-AUC]]) ve [[Data Leakage]].
4. Yöntem: [[Anomaly Detection]] → [[Isolation Forest]] → uygulama: [[transaction-anomaly-detection|tutorial]].
5. İleri: [[Graph Learning]] ve bütün parçaları birleştiren [[banking-realtime-fraud|vaka]].
