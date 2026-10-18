---
id: dice
type: metric
title: Dice
title_en: Dice Coefficient
summary: İki bölgenin örtüşmesini 2·kesişim / (toplam alan) olarak ölçen, özellikle medikal segmentasyonda yaygın metrik.
status: complete
level: Başlangıç
aliases: [Dice Coefficient, Dice Score, F1 (piksel), Sørensen–Dice]
tags: [metrik, segmentasyon]
relations:
  used_in_sector: [healthcare, agriculture-environment]
sources:
  - { title: "scikit-learn — Model evaluation", url: "https://scikit-learn.org/stable/modules/model_evaluation.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Ne ölçüyor? {#intuition}

Maskeler ne kadar örtüşüyor? IoU'ya benzer ama kesişime iki kat ağırlık verir; aynı tahmin için Dice her zaman IoU'dan büyük veya eşittir.

## Formül {#math}

$$
\mathrm{Dice}(A, B) = \frac{2|A \cap B|}{|A| + |B|} = \frac{2\,TP}{2\,TP + FP + FN}
$$

Piksel seviyesinde Dice, [[F1 Score]] ile aynıdır. IoU ($J$) ile ilişki: $D = \frac{2J}{1 + J}$.

> **Varyant notu:** Dice *loss* olarak kullanılırken "soft Dice" (olasılıklarla) ve paydaya küçük bir $\epsilon$ eklenmiş sürümler vardır; metrik olarak raporlarken ikili maske kullandığınızı belirtin.

## Elle hesaplama {#example}

TP = 50, FP = 20, FN = 30 → Dice = 100/150 = 0,667; IoU = 50/100 = 0,5. Kontrol: $2\cdot0{,}5/1{,}5 = 0{,}667$ ✓.

## Python ile hesaplama {#code}

Sıfırdan, test edilmiş uygulama: [[iou-dice-metrics|IoU ve Dice tutorial'ı]].

## Ne zaman yanıltıcıdır? {#pitfalls}

Görüntü başına ortalama ile tüm piksellerin birleşik Dice'ı farklı sonuç verir; küçük yapılar ortalamayı çok etkiler; sınır kalitesini ayrıca (ör. Hausdorff mesafesi) değerlendirmek gerekebilir.

## Özet {#summary}

Örtüşme ölçüsü; [[IoU]] ile birebir dönüştürülebilir.
