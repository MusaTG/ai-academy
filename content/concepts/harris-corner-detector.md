---
id: harris-corner-detector
type: algorithm
title: Harris Corner Detector
title_en: Harris Corner Detector
summary: Yerel pencerenin her yönde kaydırılmasında parlaklığın ne kadar değiştiğini yapı tensörü ile ölçerek köşeleri bulan algoritma.
status: complete
level: Başlangıç
aliases: [Harris, Harris Köşe Algılayıcı]
tags: [görüntü-işleme, köşe, öznitelik]
relations:
  used_in_sector: [manufacturing, robotics-autonomy]
sources:
  - { title: "OpenCV — Harris Corner Detection", url: "https://docs.opencv.org/4.x/dc/d0d/tutorial_py_features_harris.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Küçük bir pencereyi düz bir duvarda kaydırırsanız hiçbir şey değişmez; bir kenar boyunca kaydırırsanız da değişmez, ama kenara dik kaydırırsanız değişir. **Köşede ise her yöne kaydırmak değişim yaratır.** Harris bunu ölçer.

## Neden gerekli? {#why}

Köşeler, iki görüntü arasında eşleştirme (hizalama, panorama, takip) için kararlı referans noktalarıdır.

## Matematik {#math}

Gradyanlar $I_x, I_y$ ve bir pencere ağırlığı $w$ ile yapı tensörü:

$$
M = \sum_{(x,y)} w(x,y)\begin{bmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{bmatrix}
$$

Köşe yanıtı ($k$ genellikle 0,04–0,06):

$$
R = \det(M) - k\,(\operatorname{tr} M)^2 = \lambda_1\lambda_2 - k(\lambda_1 + \lambda_2)^2
$$

İki özdeğer de büyükse köşe ($R \gg 0$), biri büyükse kenar ($R < 0$), ikisi de küçükse düz bölge.

## Elle hesaplama {#example}

$M = \begin{bmatrix} 100 & 0 \\ 0 & 90 \end{bmatrix}$, $k = 0{,}05$: $R = 9000 - 0{,}05\cdot190^2 = 9000 - 1805 = 7195$ → köşe. $M = \begin{bmatrix} 100 & 0 \\ 0 & 1 \end{bmatrix}$: $R = 100 - 0{,}05 \cdot 10201 \approx -410$ → kenar.

## Hata analizi {#failure-modes}

Ölçeğe duyarlıdır (yakınlaştırılınca köşe kenara dönüşebilir); eşik ve $k$ görüntüye bağlıdır; gürültüye karşı önce [[Gaussian Blur]] uygulanmalıdır.

## Özet {#summary}

Harris = yapı tensörünün iki özdeğerinin de büyük olduğu noktalar. Uygulama: [[harris-corner-numpy|Harris tutorial'ı]].
