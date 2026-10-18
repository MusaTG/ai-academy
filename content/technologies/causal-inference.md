---
id: causal-inference
type: technology
title: Causal Inference
title_en: Causal Inference
summary: "«X, Y'ye neden oldu mu?» sorusunu korelasyonun ötesinde yanıtlama; ürün deneyleri, sağlık araştırmaları ve ekonominin ortak aracı."
status: partial
group: Ortak teknolojiler
level: İleri
aliases: [Nedensel Çıkarım, Nedensellik]
tags: [nedensellik, ab-test, deney]
relations:
  used_in_sector: [ecommerce, healthcare]
sources:
  - { title: "Hernán & Robins — Causal Inference: What If (açık erişim kitap)", url: "https://miguelhernan.org/whatifbook", kind: book, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Dondurma satışı arttığında boğulma vakaları da artıyor. Dondurma boğulmaya mı yol açıyor? Hayır — ikisinin ortak nedeni sıcak hava. Nedensel çıkarım, bu tür **karıştırıcı (confounder)** etkileri ayıklayıp gerçek etkiyi ölçmeye çalışır.

## Nasıl çalışır? {#how}

- **Randomize deneyler (A/B test):** Altın standart; rastgele atama karıştırıcıları dengeler.
- **Gözlemsel yöntemler:** deney yapılamıyorsa eğilim skoru eşleştirme, fark-içinde-fark (difference-in-differences), araç değişkenler, regresyon süreksizliği.
- **Nedensel graflar (DAG):** hangi değişkenlerin kontrol edilmesi gerektiğine karar vermek için.

## Sektöre göre neler değişir? {#sector-variation}

| Sektör | Soru | Kritik kısıt |
|---|---|---|
| [[ecommerce\|E-ticaret]] | Yeni öneri algoritması satışı artırdı mı? | Ağ etkileri, yenilik etkisi, çoklu test |
| [[healthcare\|Sağlık]] | Tedavi sonucu iyileştirdi mi? | Etik nedenlerle deney sınırlı, gözlemsel veri yanlılığı |

## Bağlantılar {#related}

[[ecommerce|E-ticaret]], [[healthcare|Sağlık]].
