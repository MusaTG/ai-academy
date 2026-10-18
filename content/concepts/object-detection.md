---
id: object-detection
type: concept
title: Object Detection
title_en: Object Detection
summary: Bir görüntüdeki nesnelerin hem sınıfını hem de konumunu (sınırlayıcı kutu) tahmin etme görevi.
status: complete
level: Orta
aliases: [Nesne Tespiti]
tags: [computer-vision, tespit]
relations:
  is_a: [computer-vision]
  evaluated_with: [iou, precision-recall]
  used_in_sector: [robotics-autonomy, manufacturing, agriculture-environment]
sources:
  - { title: "COCO detection evaluation", url: "https://cocodataset.org/#detection-eval", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Sınıflandırma "bu resimde kedi var mı?" sorusunu yanıtlar. Nesne tespiti "kaç kedi var ve her biri **nerede**?" sorusunu yanıtlar.

## Neden gerekli? {#why}

Otonom sürüşte yaya ve araçlar, üretimde parçalar, tarımda meyveler, perakendede raf ürünleri için konum bilgisi gerekir.

## Matematik {#math}

Model her aday için bir kutu $b = (x_1, y_1, x_2, y_2)$ ve sınıf olasılıkları üretir. Tahmin ile gerçek kutunun örtüşmesi [[IoU]] ile ölçülür; bir tahmin genellikle $\mathrm{IoU} \ge 0{,}5$ ise doğru (TP) sayılır. Kutu sınıflandırmasında arka planın baskınlığı nedeniyle [[Focal Loss]] gibi kayıplar kullanılır.

## Elle hesaplama {#example}

Gerçek kutu (0,0,10,10), tahmin (5,0,15,10): kesişim 50, birleşim 150, IoU = 0,33 → 0,5 eşiğinde **FP** (ve gerçek nesne kaçırılırsa FN).

## Hata analizi {#failure-modes}

Küçük nesneler, örtüşen nesneler, sınıf dengesizliği, etiket kutularının tutarsız çizilmesi, farklı IoU eşiklerinde farklı sıralama. Değerlendirmede mAP'nin hangi IoU eşiklerinde hesaplandığını mutlaka belirtin.

## Özet {#summary}

Tespit = sınıf + konum. Değerlendirme [[IoU]] eşiğine bağlı precision/recall üzerinden yapılır ([[Precision ve Recall]]).
