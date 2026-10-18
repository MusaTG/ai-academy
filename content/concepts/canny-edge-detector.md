---
id: canny-edge-detector
type: algorithm
title: Canny Edge Detector
title_en: Canny Edge Detector
summary: Yumuşatma, gradyan, maksimum olmayanı bastırma ve histerezis eşikleme adımlarıyla ince ve sürekli kenarlar üreten klasik kenar tespit algoritması.
status: complete
level: Başlangıç
aliases: [Canny, Canny Kenar Algılayıcı]
tags: [görüntü-işleme, kenar]
relations:
  used_in_sector: [manufacturing, robotics-autonomy]
  alternative_of: [harris-corner-detector]
sources:
  - { title: "Canny (1986). A Computational Approach to Edge Detection. IEEE TPAMI", url: "https://doi.org/10.1109/TPAMI.1986.4767851", kind: peer-reviewed, lang: en }
  - { title: "OpenCV — Canny Edge Detection", url: "https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
quiz:
  - q: "Canny'de histerezis eşiklemenin amacı nedir?"
    options: ["Görüntüyü küçültmek", "Zayıf kenar piksellerini yalnızca güçlü kenarlara bağlıysa korumak", "Renkleri normalleştirmek", "Gürültü eklemek"]
    answer: 1
    explain: "İki eşik kullanılır; zayıf pikseller güçlü bir kenara bağlıysa korunur, böylece kenarlar sürekli kalır."
  - q: "Non-maximum suppression ne işe yarar?"
    options: ["Kenarları inceltir (1 piksel genişliğe indirir)", "Bulanıklaştırır", "Köşe bulur", "Eşik seçer"]
    answer: 0
    explain: "Gradyan yönünde yerel maksimum olmayan pikseller bastırılır."
---

## Basit anlatım {#intuition}

Kenar, parlaklığın hızlı değiştiği yerdir. Canny bunu dört adımda bulur: önce gürültüyü azalt, sonra değişimin büyüklüğünü ve yönünü hesapla, kalın kenarları tek piksele incelt, son olarak güçlü kenarları ve onlara bağlı zayıf kenarları tut.

## Neden gerekli? {#why}

Basit eşikleme kalın, kopuk ve gürültülü kenarlar üretir. Canny; iyi tespit, iyi konumlama ve tek yanıt kriterlerini birlikte hedefler. Parça ölçümü, hizalama ve şekil analizinde hâlâ yaygındır.

## Matematik {#math}

1. Yumuşatma: $I_s = G_\sigma * I$ ([[Gaussian Blur]]).
2. Gradyan (Sobel ile): $G_x, G_y$; büyüklük ve yön:

$$
M = \sqrt{G_x^2 + G_y^2}, \qquad \theta = \operatorname{atan2}(G_y, G_x)
$$

3. **Non-maximum suppression:** $\theta$ dört yöne (0°, 45°, 90°, 135°) yuvarlanır; piksel bu yöndeki iki komşusundan büyük değilse bastırılır.
4. **Histerezis:** $M \ge T_{\text{yüksek}}$ güçlü; $T_{\text{düşük}} \le M < T_{\text{yüksek}}$ zayıf. Zayıf pikseller yalnızca güçlü bir piksele (8-komşulukla) bağlıysa kenar sayılır.

## Elle hesaplama {#example}

Bir pikselde $G_x = 30$, $G_y = 40$ → $M = 50$, $\theta \approx 53°$ → 45° yönüne yuvarlanır. $T_{\text{düşük}} = 20$, $T_{\text{yüksek}} = 60$ ise bu piksel **zayıf** kenardır; güçlü bir kenara bağlıysa korunur.

## Hata analizi {#failure-modes}

- Eşikler görüntüye bağlıdır; aydınlatma değişince yeniden ayarlanmalıdır. Yaygın bir sezgisel: $T_{\text{yüksek}} \approx 2$–$3 \times T_{\text{düşük}}$.
- Büyük σ ince kenarları kaybettirir, küçük σ gürültüyü bırakır.
- Doku yoğun bölgelerde çok fazla kenar üretir.

## Özet {#summary}

Canny = Gauss → Sobel → NMS → histerezis. Sıfırdan uygulama ve testler: [[canny-edge-numpy|Canny tutorial'ı]].
