---
id: cross-entropy
type: formula
title: Cross-Entropy
title_en: Cross-Entropy Loss
summary: Modelin olasılık tahmininin gerçek etiketten ne kadar uzak olduğunu ölçen, sınıflandırmanın en temel kayıp fonksiyonu.
status: complete
level: Başlangıç
aliases: [Çapraz Entropi, Log Loss, Binary Cross-Entropy]
tags: [kayıp-fonksiyonu, olasılık]
relations:
  prerequisite: [focal-loss]
  used_with: [binary-classification, gradient-descent]
sources:
  - { title: "scikit-learn — log_loss", url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
quiz:
  - q: "Gerçek etiket 1 iken model p = 0.5 tahmin ederse ikili çapraz entropi yaklaşık kaçtır? (ln)"
    options: ["0.693", "0.5", "1.0", "0"]
    answer: 0
    explain: "−ln(0.5) ≈ 0.693."
---

## Basit anlatım {#intuition}

Model "%90 kedi" derse ve resim gerçekten kediyse az cezalandırılır; "%1 kedi" derse çok ağır cezalandırılır. Çapraz entropi, **emin olunan yanlışları** sert biçimde cezalandırır.

## Neden gerekli? {#why}

Olasılık üreten sınıflandırıcıları eğitmek için türevlenebilir ve olasılık açısından anlamlı (maksimum olabilirlik) bir kayıp gerekir. Sigmoid/softmax ile birlikte kullanıldığında gradyanı basit ve kararlıdır.

## Matematik {#math}

İkili durumda ($y \in \{0,1\}$, $p$ pozitif sınıf olasılığı):

$$
\mathrm{BCE}(y, p) = -\big[\,y\log p + (1-y)\log(1-p)\,\big]
$$

Çok sınıflı durumda ($y$ one-hot, $\hat{y}$ softmax çıktısı):

$$
\mathrm{CE} = -\sum_{k=1}^{K} y_k \log \hat{y}_k
$$

## Elle hesaplama {#example}

$y = 1$: $p = 0{,}9 \Rightarrow -\ln 0{,}9 \approx 0{,}105$; $p = 0{,}5 \Rightarrow 0{,}693$; $p = 0{,}01 \Rightarrow 4{,}605$.

## Hata analizi {#failure-modes}

- $\log(0)$ sayısal hatası: olasılıkları $[\epsilon, 1-\epsilon]$ aralığına kırpın veya logit tabanlı kararlı implementasyon kullanın.
- Dengesiz verilerde çoğunluk sınıfı kaybı domine eder: [[Class Imbalance]], [[Focal Loss]].

## Özet {#summary}

Olasılık tahmin eden sınıflandırıcıların varsayılan kaybı. [[Focal Loss]] bunun zor örneklere odaklanan bir türevidir.
