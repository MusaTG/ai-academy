---
id: credit-scoring
type: concept
title: Kredi Skorlama
title_en: Credit Scoring
summary: Bir başvurunun gelecekte temerrüde düşme olasılığını tahmin edip kredi kararını ve fiyatını destekleyen, açıklanabilirliğin zorunlu olduğu modelleme alanı.
status: complete
level: Orta
aliases: [Credit Scoring, Kredi Puanlama]
tags: [kredi, risk, açıklanabilirlik]
relations:
  used_in_sector: [banking]
  evaluated_with: [roc-auc]
  required_in_career: [risk-analyst]
sources:
  - { title: "Federal Reserve SR 11-7: Guidance on Model Risk Management", url: "https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm", kind: standard, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Banka, bir başvuru sahibinin krediyi geri ödeyip ödemeyeceğini önceden bilemez; geçmiş benzer müşterilerden öğrenerek bir **olasılık** tahmin eder ve bunu bir puana çevirir.

## Neden gerekli? {#why}

Tutarlı, hızlı ve denetlenebilir kredi kararları için. Aynı profildeki iki başvuruya farklı davranmamak hem adalet hem mevzuat açısından önemlidir.

## Matematik {#math}

Lojistik regresyon tabanlı klasik skor kartı:

$$
\log\frac{PD}{1-PD} = \beta_0 + \sum_j \beta_j\, \mathrm{WoE}_j(x_j)
$$

Beklenen kayıp: $EL = PD \times LGD \times EAD$. Ayırt etme gücü genellikle Gini ile raporlanır: $\mathrm{Gini} = 2\cdot\mathrm{AUC} - 1$ ([[ROC-AUC]]).

## Elle hesaplama {#example}

AUC = 0,78 → Gini = 0,56. PD = %4, LGD = %45, EAD = 100.000 TL → EL = 1.800 TL.

## Hata analizi {#failure-modes}

- **Reddedilen başvuru yanlılığı (reject inference):** yalnızca onaylanan başvuruların sonucunu biliriz.
- Ekonomik döngü değişince kalibrasyonun bozulması.
- Dolaylı ayrımcılık: korunan özelliklerle ilişkili değişkenler.

## Özet {#summary}

Yüksek AUC yetmez; kalibrasyon, kararlılık, açıklanabilirlik ve bağımsız doğrulama ([[Risk Analyst]]) birlikte değerlendirilir.
