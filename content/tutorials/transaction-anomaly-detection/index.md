---
id: transaction-anomaly-detection
type: tutorial
title: İşlem verisinde anomali tespiti
title_en: Anomaly detection on transaction data
summary: Sentetik kart işlemlerinde robust z-score ve sıfırdan yazılmış Isolation Forest'ı karşılaştırın; eşiği accuracy ile değil, iş maliyetiyle seçin.
status: complete
level: Orta
duration: "60–90 dk"
tags: [anomali, bankacılık, numpy]
relations:
  application_of: [anomaly-detection, isolation-forest, fraud-detection]
  evaluated_with: [pr-auc, precision-recall]
  used_in_sector: [banking, cybersecurity]
code:
  - { file: anomaly.py, title: "Veri üretimi, robust z-score, Isolation Forest ve değerlendirme", deps: ["numpy>=1.24"], run: "python anomaly.py" }
  - { file: test_anomaly.py, title: "Testler", deps: ["numpy>=1.24", "pytest>=8"], run: "python -m pytest -q" }
last_verified: 2026-10-18
version: 1
---

> **Veri notu:** Bu tutorial'daki işlemler **sentetiktir**. Sonuçlar gerçek bir bankanın fraud oranını veya model performansını temsil etmez; amaç yöntemleri ve değerlendirme mantığını öğretmektir.

## Öğrenme hedefi {#goal}

- [[Anomaly Detection]] için iki yöntemi uygulamak: robust z-score ve [[Isolation Forest]].
- Dengesiz veride doğru metrikleri kullanmak: [[PR-AUC]] ve precision@k ([[Class Imbalance]]).
- Eşiği **beklenen maliyetle** seçmek ([[Fraud Detection]] sayfasındaki formül).

## Kurulum {#setup}

```bash
pip install "numpy>=1.24" "pytest>=8"
cd content/tutorials/transaction-anomaly-detection
python anomaly.py
python -m pytest -q
```

## Adım adım {#steps}

1. **Veri:** `make_transactions` üç özellik üretir: log tutar, saat ve "son 1 saatteki işlem sayısı" (hız özelliği). Gerçek sistemlerde hız özellikleri, [[Data Leakage]] olmaması için yalnızca işlem anından **önceki** veriden hesaplanmalıdır.
2. **Robust z-score:** Medyan ve MAD aykırı değerlerden etkilenmez. Skor, özellikler arasındaki en büyük $|z|$ değeridir.
3. **Isolation Forest:** Her ağaç rastgele bir özellik ve rastgele bir bölme noktası seçer; derinlik sınırı $\lceil \log_2 \psi \rceil$'dir. Yaprakta kalan örnek sayısı için $c(n)$ düzeltmesi eklenir.
4. **Değerlendirme:** Average precision ve precision@50 hesaplanır; rastgele modelin AP'si pozitif oranına eşittir.
5. **Eşik:** `choose_threshold_by_cost`, kaçan dolandırıcılık tutarı + yanlış alarm maliyetini en aza indiren eşiği bulur.

## Beklenen çıktı {#expected}

Program her iki yöntem için AP, precision@50 ve en iyi eşikteki toplam maliyeti yazar. Örnek bir çalıştırmada (NumPy 2.x, seed 0) robust z-score için AP ≈ 0,10, Isolation Forest için AP ≈ 0,25 elde edilir; rastgele taban çizgisi ≈ 0,01'dir.

Bu sonuç bilinçli olarak "kusursuz" değildir: sentetik veride meşru gece işlemleri ve dolandırıcılıkla örtüşen tutarlar vardır. Bu, gerçek hayattaki iki gerçeği öğretir: **farklı olan her işlem dolandırıcılık değildir** ve denetimsiz yöntemler tek başına yetmez — etiketli veriyle denetimli bir model ve kurallar genellikle eklenir. Kesin sayılar sürüme göre küçük farklar gösterebilir; testler bu yüzden eşik değerler üzerinden doğrular. 8 test geçmelidir.

## Hata ayıklama {#debugging}

- **AP taban çizgisine yakın:** Özellikler ölçeklenmemiş veya y etiketleri karışmış olabilir.
- **Isolation Forest çok yavaş:** `n_trees` ve `sample_size` değerlerini düşürün; algoritma örneklem boyutuyla ölçeklenir, veri boyutuyla değil.
- **Maliyet eşiği hep en düşük skorda:** `cost_fp` çok küçük; yanlış alarm maliyetini gerçekçi seçin.

## Alıştırmalar {#exercises}

1. **Kolay:** `cost_fp` değerini 5, 20, 100 TL yapın; seçilen eşik ve alarm sayısı nasıl değişiyor?
2. **Orta:** Analist kapasitesini günde 50 alarmla sınırlayın; maliyeti bu kısıt altında yeniden optimize edin.
3. **İleri:** Kavram kaymasını simüle edin: dolandırıcılığı gündüz saatlerine kaydırın ve iki yöntemin dayanıklılığını karşılaştırın.
4. **Uzman:** Sonuçları scikit-learn'ün `IsolationForest` uygulamasıyla karşılaştırın; farkları (rastgelelik, eşik tanımı) açıklayın.
