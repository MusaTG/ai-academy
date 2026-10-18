---
id: iou-dice-metrics
type: tutorial
title: IoU ve Dice hesaplama
title_en: Computing IoU and Dice
summary: Kutu ve maske IoU'su ile Dice katsayısını sıfırdan yazın; tanım varyantlarını ve boş maske politikasını testlerle sabitleyin.
status: complete
level: Başlangıç
duration: "30–45 dk"
tags: [metrik, segmentasyon, tespit]
relations:
  application_of: [iou, dice]
  used_with: [object-detection]
  used_in_sector: [healthcare, agriculture-environment]
code:
  - { file: metrics.py, title: "IoU ve Dice", deps: ["numpy>=1.24"], run: "python metrics.py" }
  - { file: test_metrics.py, title: "Testler", deps: ["numpy>=1.24", "pytest>=8"], run: "python -m pytest -q" }
last_verified: 2026-10-18
version: 1
---

## Öğrenme hedefi {#goal}

[[IoU]] ve [[Dice]] metriklerini kutular ve maskeler için doğru hesaplamak; aralarındaki $D = 2J/(1+J)$ ilişkisini doğrulamak ve kenar durumlarını (boş maske, geçersiz kutu) bilinçli bir politikayla ele almak.

## Kurulum {#setup}

```bash
pip install "numpy>=1.24" "pytest>=8"
cd content/tutorials/iou-dice-metrics
python metrics.py
python -m pytest -q
```

## Adım adım {#steps}

1. **Kutu IoU:** Kesişim dikdörtgeninin köşeleri, iki kutunun sol-üst köşelerinin maksimumu ve sağ-alt köşelerinin minimumudur. Negatif genişlik "kesişim yok" demektir; `max(0, …)` bunu yakalar.
2. **Maske sayımları:** TP, FP, FN mantıksal işlemlerle bulunur.
3. **Maske IoU ve Dice:** Sayımlardan doğrudan hesaplanır; payda 0 ise `empty_score` döner.
4. **İlişki testi:** Rastgele maskelerde Dice'ın her zaman IoU'dan büyük veya eşit olduğunu ve formülle dönüştürülebildiğini doğrulayın.

## Beklenen çıktı {#expected}

```text
Kutu IoU: 0.333
Maske IoU: 0.532 Dice: 0.694
```

8 testin tamamı geçmelidir.

## Hata ayıklama {#debugging}

- IoU > 1 çıkıyorsa birleşimde kesişimi çıkarmayı unutmuşsunuzdur.
- Farklı bir kütüphaneyle küçük farklar görüyorsanız "+1 piksel" konvansiyonunu kontrol edin.
- Toplu değerlendirmede görüntü başına ortalama ile tüm piksellerin birleşik metriği farklıdır; hangisini raporladığınızı yazın.

## Alıştırmalar {#exercises}

1. Çok sınıflı segmentasyon için sınıf bazında IoU ve mIoU hesaplayan bir fonksiyon ekleyin.
2. GIoU'yu (Generalized IoU) uygulayın ve ayrık kutularda IoU'dan farkını gösterin.
3. Görüntü başına ortalama ile birleşik Dice'ın farklı sonuç verdiği bir örnek kurun.
