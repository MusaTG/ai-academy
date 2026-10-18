---
id: iou
type: metric
title: IoU
title_en: Intersection over Union
summary: İki bölgenin (kutu veya maske) kesişim alanının birleşim alanına oranı; tespit ve segmentasyonda örtüşmenin temel ölçüsü.
status: complete
level: Başlangıç
aliases: [Intersection over Union, Jaccard Index, Jaccard]
tags: [metrik, computer-vision, segmentasyon]
relations:
  alternative_of: [dice]
  used_in_sector: [robotics-autonomy, agriculture-environment, healthcare, manufacturing]
sources:
  - { title: "COCO detection evaluation", url: "https://cocodataset.org/#detection-eval", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
quiz:
  - q: "Gerçek kutu (0,0,10,10), tahmin (5,0,15,10). IoU kaçtır?"
    options: ["0.5", "0.33", "0.25", "0.67"]
    answer: 1
    explain: "Kesişim 5×10=50, birleşim 100+100−50=150 → 1/3."
---

## Ne ölçüyor? {#intuition}

Tahmin ile gerçek ne kadar örtüşüyor? Tam örtüşme 1, hiç örtüşmeme 0.

## Formül {#math}

$$
\mathrm{IoU}(A, B) = \frac{|A \cap B|}{|A \cup B|} = \frac{TP}{TP + FP + FN}
$$

İkinci biçim piksel seviyesinde segmentasyon içindir.

## Elle hesaplama {#example}

Kutular (0,0,10,10) ve (5,0,15,10): kesişim $5\times10 = 50$, birleşim $100 + 100 - 50 = 150$ → IoU = 0,333.

## Python ile hesaplama {#code}

Sıfırdan, test edilmiş uygulama: [[iou-dice-metrics|IoU ve Dice tutorial'ı]]. Metrik Laboratuvarı'nda iki kutunun koordinatlarını değiştirerek IoU'yu canlı hesaplayabilirsiniz.

## Ne zaman yanıltıcıdır? {#pitfalls}

- Küçük nesnelerde birkaç piksellik kayma IoU'yu çok düşürür.
- Boş tahmin + boş gerçek durumunda (0/0) tanım kütüphaneye göre değişir; politikanızı belirtin.
- Kutu IoU'su nesne şeklini yansıtmaz.

## Özet {#summary}

Kesişim / birleşim. [[Dice]] ile monoton ilişkilidir: $D = 2J/(1+J)$.
