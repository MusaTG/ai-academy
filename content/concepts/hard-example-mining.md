---
id: hard-example-mining
type: concept
title: Hard Example Mining
title_en: Hard Example Mining
summary: Eğitimde modelin en çok zorlandığı (yüksek kayıplı) örnekleri seçip öne çıkararak öğrenmeyi verimli hâle getirme stratejisi.
status: partial
level: Orta
aliases: [Zor Örnek Madenciliği, OHEM, Hard Negative Mining]
tags: [eğitim, dengesizlik]
relations:
  alternative_of: [focal-loss]
  used_with: [object-detection, class-imbalance]
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Sınava çalışırken zaten bildiğiniz soruları tekrar tekrar çözmek yerine yanlış yaptıklarınıza odaklanırsınız. Hard example mining, eğitim döngüsünde bunu otomatik yapar.

## Neden gerekli? {#why}

Dengesiz verilerde kolay negatifler eğitim sinyalini boğar. Zor negatifleri seçmek (ör. arka plana benzeyen ama nesne olmayan bölgeler) modelin karar sınırını keskinleştirir. [[Focal Loss]] aynı amaca örnek seçmek yerine **kaybı yeniden ağırlıklandırarak** ulaşır.

## Hata analizi {#failure-modes}

Etiket hatalı örnekler "zor" görünür; onları sürekli seçmek gürültüyü ezberletir. Zor örnekleri periyodik olarak elle inceleyin.

> **Kapsam notu:** Matematik, elle hesaplama ve özet bölümleri henüz yazılmadı.
