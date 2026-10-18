---
id: gradient-descent
type: algorithm
title: Gradient Descent
title_en: Gradient Descent
summary: Kayıp fonksiyonunun gradyanının tersi yönünde küçük adımlar atarak parametreleri iteratif biçimde iyileştiren optimizasyon yöntemi.
status: complete
level: Başlangıç
aliases: [Gradyan İnişi, SGD]
tags: [optimizasyon, eğitim]
relations:
  prerequisite: [cross-entropy]
  used_with: [optimization]
sources:
  - { title: "Goodfellow, Bengio, Courville — Deep Learning (açık erişim)", url: "https://www.deeplearningbook.org", kind: book, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Sisli bir dağda en alçak noktaya inmek istiyorsunuz. Etrafı göremiyorsunuz ama ayağınızın altındaki eğimi hissediyorsunuz: her adımda en dik aşağı yöne küçük bir adım atarsınız.

## Neden gerekli? {#why}

Sinir ağları gibi milyonlarca parametreli modellerde kapalı formda çözüm yoktur; gradyan tabanlı iteratif optimizasyon pratikteki tek ölçeklenebilir yoldur.

## Matematik {#math}

$$
\theta_{t+1} = \theta_t - \eta\,\nabla_\theta L(\theta_t)
$$

$\eta$ öğrenme oranıdır. Stokastik sürümde (SGD) gradyan küçük bir örnek grubundan (mini-batch) tahmin edilir.

## Elle hesaplama {#example}

$L(\theta) = (\theta - 3)^2$, $\nabla L = 2(\theta - 3)$, $\theta_0 = 0$, $\eta = 0{,}1$: $\theta_1 = 0 - 0{,}1\cdot(-6) = 0{,}6$; $\theta_2 = 0{,}6 - 0{,}1\cdot(-4{,}8) = 1{,}08$. Her adımda 3'e yaklaşır. $\eta = 1{,}1$ olsaydı ıraksardı.

## Hata analizi {#failure-modes}

Öğrenme oranı çok büyük → ıraksama; çok küçük → yavaş öğrenme; kötü ölçeklenmiş özellikler → zikzak hareket; dışbükey olmayan kayıplarda yerel minimum ve eyer noktaları.

## Özet {#summary}

Gradyanın tersi yönünde, öğrenme oranı kadar adım. Kayıp fonksiyonu seçimi: [[Cross-Entropy]].
