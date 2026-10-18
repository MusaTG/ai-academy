---
id: gaussian-blur
type: algorithm
title: Gaussian Blur
title_en: Gaussian Blur
summary: Gauss dağılımı ağırlıklı bir çekirdekle konvolüsyon yaparak görüntüdeki yüksek frekanslı gürültüyü azaltan yumuşatma filtresi.
status: complete
level: Başlangıç
aliases: [Gauss Bulanıklaştırma, Gaussian Smoothing]
tags: [görüntü-işleme, filtre]
relations:
  prerequisite: [canny-edge-detector, harris-corner-detector]
  used_with: [signal-processing]
sources:
  - { title: "OpenCV — Smoothing Images", url: "https://docs.opencv.org/4.x/d4/d13/tutorial_py_filtering.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Her pikseli komşularının ortalamasıyla değiştirirsiniz, ama yakın komşulara daha çok, uzak komşulara daha az ağırlık verirsiniz. Sonuç: gürültü azalır, büyük yapılar korunur.

## Neden gerekli? {#why}

Türev tabanlı yöntemler ([[Canny Edge Detector]], [[Harris Corner Detector]]) gürültüyü büyütür. Önce Gauss ile yumuşatmak sahte kenar ve köşeleri azaltır.

## Matematik {#math}

$$
G(x, y) = \frac{1}{2\pi\sigma^2}\exp\!\left(-\frac{x^2 + y^2}{2\sigma^2}\right)
$$

Gauss çekirdeği **ayrılabilir**dir: $G(x,y) = g(x)\,g(y)$. Böylece $k \times k$ yerine iki adet $k$ uzunluklu 1B konvolüsyon yapılır. Pratikte çekirdek yarıçapı yaklaşık $3\sigma$ seçilir.

## Elle hesaplama {#example}

$\sigma = 1$ için 1B ağırlıklar ($x = -1, 0, 1$): $e^{-0.5} \approx 0{,}607$, $1$, $0{,}607$ → normalleştirince $\approx [0{,}274,\ 0{,}452,\ 0{,}274]$.

## Hata analizi {#failure-modes}

Büyük σ ince detayları ve kenarları da siler; σ'yı görüntü çözünürlüğüne ve gürültü seviyesine göre seçin. Kenarları korumak isterseniz bilateral veya median filtre alternatiflerdir.

## Özet {#summary}

Gauss = ağırlıklı yerel ortalama; σ yumuşatma miktarını belirler. Bkz. [[Convolution]].
