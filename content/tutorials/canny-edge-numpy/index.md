---
id: canny-edge-numpy
type: tutorial
title: Canny Edge Detector'ı sıfırdan uygulama
title_en: Implementing the Canny Edge Detector from scratch
summary: Gauss yumuşatma, Sobel gradyanı, maksimum olmayanı bastırma ve histerezis adımlarını yalnızca NumPy ile yazıp testlerle doğrulayın.
status: complete
level: Başlangıç
duration: "60–90 dk"
tags: [görüntü-işleme, numpy, kenar]
relations:
  application_of: [canny-edge-detector]
  used_with: [gaussian-blur, convolution]
  used_in_sector: [manufacturing]
code:
  - { file: imaging.py, title: "Ortak görüntü işleme yardımcıları", deps: ["numpy>=1.24"] }
  - { file: canny.py, title: "Canny implementasyonu", deps: ["numpy>=1.24"], run: "python canny.py" }
  - { file: test_canny.py, title: "Testler", deps: ["numpy>=1.24", "pytest>=8"], run: "python -m pytest -q" }
last_verified: 2026-10-18
version: 1
---

## Öğrenme hedefi {#goal}

Bu tutorial'ın sonunda [[Canny Edge Detector]]'ın dört adımını kendi kodunuzla uygulayabilecek, her adımın çıktıyı nasıl değiştirdiğini test ederek gösterebileceksiniz. Ön koşullar: [[Convolution]] ve [[Gaussian Blur]].

## Kurulum {#setup}

- Python 3.10+ ve NumPy (1.24+). Testler için pytest.
- GPU veya büyük indirme gerekmez; tüm örnekler CPU'da, saniyeler içinde çalışır.

```bash
pip install "numpy>=1.24" "pytest>=8"
cd content/tutorials/canny-edge-numpy
python canny.py          # sentetik karenin kenarlarını ASCII olarak çizer
python -m pytest -q      # testleri çalıştırır
```

## Adım adım {#steps}

1. **Konvolüsyon altyapısı** — `imaging.py` içindeki `filter2d`, kayan pencere üzerinde ağırlıklı toplam alır. `sliding_window_view` her piksel için 3×3'lük pencereleri kopyalamadan bir görünüm olarak üretir.
2. **Gauss yumuşatma** — `gaussian_kernel(σ)` yarıçapı ≈ 3σ olan, toplamı 1 olan bir çekirdek üretir. σ büyüdükçe gürültü azalır ama ince kenarlar da kaybolur.
3. **Gradyan** — `gradient` Sobel çekirdekleriyle $G_x, G_y$ hesaplar; büyüklük `np.hypot`, yön `arctan2` ile bulunur ve 0–180° aralığına katlanır (kenar yönü için işaret önemsizdir).
4. **Maksimum olmayanı bastırma** — `non_max_suppression` yönü dört gruba yuvarlar ve her pikseli gradyan yönündeki iki komşusuyla karşılaştırır. Satır ekseninin aşağı doğru arttığına dikkat edin: 45° yönünde komşular $(+1, +1)$ ve $(-1, -1)$'dir.
5. **Histerezis** — `hysteresis` güçlü pikselleri tohum olarak alır ve onlara 8-komşulukla bağlı zayıf pikselleri büyüterek ekler.
6. **Birleştirme** — `canny` eşikleri inceltilmiş gradyanın en büyük değerine oranla seçer; böylece görüntü parlaklığından daha az etkilenir.

## Beklenen çıktı {#expected}

`python canny.py` 24×24'lük bir karenin çevresini tek piksel kalınlığında bir çerçeve olarak çizer ve bulunan kenar pikseli sayısını yazar. `pytest` çıktısında 9 testin tamamı geçmelidir. Bu tutorial'ın testleri GitHub Actions'ta her değişiklikte çalıştırılır; sonuç sağ paneldeki **Test sonucu** rozetinde görünür.

## Hata ayıklama {#debugging}

| Belirti | Olası neden | Kontrol |
|---|---|---|
| Kenarlar kalın (2–3 piksel) | NMS'de komşu yönleri ters | `test_edges_are_thin` |
| Kenar kopuk | Yüksek eşik çok yüksek | `high_ratio`'yu düşürün |
| Her yerde kenar | σ çok küçük veya düşük eşik çok düşük | σ=1.5 deneyin |
| `ValueError: Gri tonlamalı` | Renkli görüntü | `img.mean(axis=2)` ile griye çevirin |

## Alıştırmalar {#exercises}

1. **Kolay:** σ = 0,5, 1, 2 için kenar sayısını tablo hâlinde raporlayın.
2. **Orta:** Gürültü standart sapmasını 0 → 0,2 arasında artırın; sahte kenar oranını σ'ya göre grafikleyin.
3. **İleri:** OpenCV'nin `cv2.Canny` çıktısıyla piksel bazında karşılaştırın; farkların nedenini (eşik tanımı, gradyan normu) açıklayın.
4. **Uzman:** Klasik Canny'yi öğrenilmiş bir kenar algılama yöntemiyle karşılaştırın; doğruluk ve hesaplama maliyetini birlikte raporlayın.
