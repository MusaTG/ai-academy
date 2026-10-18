---
id: convolution
type: concept
title: Convolution
title_en: Convolution
summary: Küçük bir çekirdeği (kernel) görüntü veya sinyal üzerinde kaydırarak her konumda ağırlıklı toplam alma; filtrelerin ve CNN'lerin temeli.
status: complete
level: Başlangıç
aliases: [Konvolüsyon, Evrişim, Kernel]
tags: [görüntü-işleme, sinyal, cnn]
relations:
  prerequisite: [gaussian-blur, canny-edge-detector, harris-corner-detector]
  used_with: [signal-processing]
sources:
  - { title: "OpenCV — Image Filtering", url: "https://docs.opencv.org/4.x/d4/d13/tutorial_py_filtering.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Bir fotoğrafın üzerinde 3×3'lük küçük bir pencere gezdirdiğinizi düşünün. Her konumda penceredeki 9 pikseli belirli ağırlıklarla çarpıp toplarsınız. Ağırlıklar neyse sonuç o olur: hepsi eşitse **bulanıklaştırma**, soldan sağa artıyorsa **dikey kenar bulma**.

## Neden gerekli? {#why}

Yerel desenleri (kenar, köşe, doku) yakalamanın en temel yolu. [[Gaussian Blur]], Sobel türevleri, [[Canny Edge Detector]] ve CNN katmanları bu işleme dayanır.

## Matematik {#math}

İki boyutlu (görüntü işlemede pratikte kullanılan, çekirdeği çevirmeden uygulanan **çapraz korelasyon** biçimi):

$$
(I * K)(i, j) = \sum_{u=-r}^{r} \sum_{v=-r}^{r} I(i+u,\, j+v)\,K(u, v)
$$

> **Varyant notu:** Matematiksel konvolüsyonda çekirdek 180° çevrilir. Simetrik çekirdeklerde (Gauss) fark yoktur; Sobel gibi asimetrik çekirdeklerde işaret değişir. Derin öğrenme kütüphaneleri genellikle çapraz korelasyon uygular.

## Elle hesaplama {#example}

Görüntü parçası ve yatay türev çekirdeği:

$$
I = \begin{bmatrix} 10 & 10 & 80 \\ 10 & 10 & 80 \\ 10 & 10 & 80 \end{bmatrix}, \quad K = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}
$$

Sonuç: $(-10 + 80) + 2(-10 + 80) + (-10 + 80) = 70 + 140 + 70 = 280$ → güçlü dikey kenar.

## Hata analizi {#failure-modes}

Kenarlarda dolgu (padding) seçimi sonucu etkiler; büyük çekirdekler yavaştır (ayrılabilir çekirdekler veya FFT ile hızlandırılır); gürültü türev filtrelerinde büyür → önce yumuşatma.

## Özet {#summary}

Konvolüsyon = kaydırılan ağırlıklı toplam. Çekirdek, hangi deseni aradığınızı belirler.
