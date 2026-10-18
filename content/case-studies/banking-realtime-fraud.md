---
id: banking-realtime-fraud
type: case-study
title: Gerçek zamanlı kart fraud sistemi tasarımı
title_en: Designing a real-time card fraud system
summary: Otorizasyon gecikme bütçesi, etiket gecikmesi, sınıf dengesizliği ve analist kapasitesi altında bir fraud tespit sisteminin uçtan uca tasarımı.
status: complete
evidence: engineering-inference
level: İleri
tags: [bankacılık, fraud, gerçek-zamanlı, sistem-tasarımı]
relations:
  used_in_sector: [banking]
  used_with: [fraud-detection, anomaly-detection, graph-learning]
  evaluated_with: [pr-auc]
sources:
  - { title: "Credit Card Fraud Detection veri seti (ULB, Kaggle)", url: "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud", kind: community, lang: en }
  - { title: "PCI Security Standards Council", url: "https://www.pcisecuritystandards.org", kind: standard, lang: en }
last_verified: 2026-10-18
version: 1
---

> **Kanıt düzeyi: Genel mühendislik çıkarımı.** Bu vaka belirli bir bankanın sistemini anlatmaz. Yaygın olarak bilinen problem özelliklerinden (dengesizlik, etiket gecikmesi, gecikme bütçesi) yola çıkan bir tasarım egzersizidir. Sayısal değerler örnektir.

## Problem ve iş hedefi {#problem}

Kart otorizasyonu sırasında, işlemi onaylama/reddetme/ek doğrulama kararını destekleyecek bir risk skoru üretmek. Hedef: **önlenen kayıp – (yanlış ret + operasyon maliyeti)** farkını en büyük yapmak.

## Bağlam ve kısıtlar {#context}

- Pozitif oran çok düşük (açık eğitim veri setlerinde %0,2 civarı) → [[Class Imbalance]].
- Etiketler (chargeback) haftalar sonra gelir; bir kısmı hiç gelmez.
- Skor, otorizasyonun toplam süre bütçesinin küçük bir dilimine sığmalı (onlarca milisaniye mertebesi).
- Kart verisi PCI DSS kapsamında; özellik deposu ve log'lar buna göre tasarlanmalı.
- İnceleme ekibinin günlük alarm kapasitesi sınırlı.

## Yaklaşım {#approach}

1. **Katmanlı karar:** Kurallar (bilinen kalıplar, kara listeler) → model skoru → eşik tablosu (onay / 3D Secure / ret / incelemeye gönder).
2. **Özellikler:** Hız özellikleri (son 1 saat/24 saat işlem sayısı, farklı ülke sayısı), müşterinin kendi geçmişine göre sapma, cihaz ve üye işyeri risk skorları. Tümü **yalnızca işlem anından önceki** veriden ([[Data Leakage]]).
3. **Model:** Etiketli veriyle gradient boosting; etiketin az olduğu yeni dolandırıcılık türleri için denetimsiz skor ([[Isolation Forest]]) ek özellik olarak.
4. **Graf katmanı:** Ortak cihaz/IP/adres üzerinden hesap grafında halka tespiti — gerçek zamanlıda değil, saatlik toplu işte ([[Graph Learning]]).
5. **Değerlendirme:** Zaman bazlı bölme; [[PR-AUC]], belirli alarm hacminde precision ve tutar ağırlıklı recall.
6. **İzleme:** Skor dağılımı kayması, alarm hacmi, onay oranı, geç gelen etiketlerle haftalık performans.

## Sonuçlar ve ödünleşimler {#results}

- **Gecikme vs doğruluk:** Graf özellikleri değerli ama pahalı; gerçek zamanlı yolda önceden hesaplanmış skor olarak kullanılır.
- **Recall vs müşteri deneyimi:** Daha agresif eşik daha çok dolandırıcılık yakalar ama meşru müşterileri reddeder; çoğu durumda "ret" yerine "ek doğrulama" ara yolu tercih edilir.
- **Açıklanabilirlik:** İnceleme ekibine her alarmda en etkili özellikler gösterilir; kural katmanı denetçiler için okunabilir kalır.

## Kanıt düzeyi {#evidence}

- **Kaynakla desteklenen:** Açık veri setindeki dengesizlik oranı; kart verisinin PCI DSS kapsamında olması.
- **Genel mühendislik çıkarımı:** Mimari katmanlar, özellik türleri, izleme planı.
- **Doğrulanmamış:** Herhangi bir bankaya özgü performans veya maliyet rakamı — bu vakada yoktur.

Uygulamalı başlangıç: [[transaction-anomaly-detection|İşlem verisinde anomali tespiti]].
