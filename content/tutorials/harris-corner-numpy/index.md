---
id: harris-corner-numpy
type: tutorial
title: Harris Corner Detector'ı sıfırdan uygulama
title_en: Implementing the Harris Corner Detector from scratch
summary: Yapı tensörünü ve Harris yanıtını NumPy ile hesaplayın; köşe, kenar ve düz bölge davranışını testlerle doğrulayın.
status: complete
level: Başlangıç
duration: "45–60 dk"
tags: [görüntü-işleme, numpy, köşe]
relations:
  application_of: [harris-corner-detector]
  used_with: [gaussian-blur, convolution]
  used_in_sector: [manufacturing, robotics-autonomy]
code:
  - { file: imaging.py, title: "Ortak görüntü işleme yardımcıları (Canny tutorial'ıyla aynı)", deps: ["numpy>=1.24"] }
  - { file: harris.py, title: "Harris implementasyonu", deps: ["numpy>=1.24"], run: "python harris.py" }
  - { file: test_harris.py, title: "Testler", deps: ["numpy>=1.24", "pytest>=8"], run: "python -m pytest -q" }
last_verified: 2026-10-18
version: 1
---

## Öğrenme hedefi {#goal}

[[Harris Corner Detector]]'ın yapı tensörü fikrini koda dökmek ve $R$ yanıtının işaretinin köşe/kenar/düz bölgeyi nasıl ayırdığını sayısal olarak görmek.

## Kurulum {#setup}

```bash
pip install "numpy>=1.24" "pytest>=8"
cd content/tutorials/harris-corner-numpy
python harris.py
python -m pytest -q
```

## Adım adım {#steps}

1. Sobel ile $I_x, I_y$ türevlerini hesaplayın (`imaging.sobel`).
2. $I_x^2$, $I_y^2$, $I_x I_y$ görüntülerini Gauss penceresiyle toplayın — bu yapı tensörünün dört bileşenidir.
3. $R = \det(M) - k\,(\operatorname{tr} M)^2$ yanıtını her piksel için hesaplayın.
4. Yerel maksimumları (`max_filter`) ve göreli eşiği uygulayarak köşeleri seçin.

## Beklenen çıktı {#expected}

`python harris.py` 40×40'lık karenin dört köşesini yaklaşık (10,10), (10,29), (29,10), (29,29) koordinatlarında bulur. 4 testin tamamı geçmelidir.

## Hata ayıklama {#debugging}

- Hiç köşe yok: `rel_threshold` çok yüksek olabilir.
- Köşe yerine kümeler: `window` (yerel maksimum penceresi) küçük olabilir.
- Kenar boyunca köşe: $k$ çok küçük; 0,04–0,06 aralığını deneyin.

## Alıştırmalar {#exercises}

1. Kareyi 30° döndürüp köşelerin hâlâ bulunduğunu doğrulayın.
2. Görüntüyü 2 kat küçültün; hangi köşeler kayboluyor? (Ölçek duyarlılığı.)
3. İki kaydırılmış görüntüde köşeleri eşleştirip kaymayı tahmin edin.
