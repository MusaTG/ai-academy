---
id: fde-13-speed-vs-architecture
type: lesson
title: Hızlı teslimat ile sürdürülebilir mimari arasındaki denge
title_en: Speed vs sustainable architecture
summary: Ne zaman kestirme, ne zaman sağlam yapı? Karar çerçevesi.
status: complete
order: 13
duration: 30 dk
level: Orta
tags:
- fde
relations:
  part_of:
  - fde-path
last_verified: '2026-10-18'
version: 1
---

## Karar çerçevesi

Bir kestirmenin kabul edilebilirliğini üç soruyla değerlendirin:

1. **Geri dönüş maliyeti:** Sonra düzeltmek ne kadar zor? (Veri modeli ve güvenlik kararlarının geri dönüş maliyeti yüksektir.)
2. **Yayılma:** Bu kod başka müşterilere kopyalanacak mı?
3. **Risk:** Bozulursa ne olur? Para, veri, itibar?

| Durum | Öneri |
|---|---|
| Demo için arayüz | Hızlı ve kaba olabilir |
| Veri modeli, kimlik/yetki | Baştan doğru yapın |
| Tek seferlik veri dönüşümü | Script yeterli, ama tekrarlanabilir olsun |
| Birden fazla müşteride gerekecek özellik | Ürün ekibiyle birlikte genelleştirin |

## Özet

"Çakıl yol → asfalt yol" yaklaşımı ancak çakıl yolun nerede olduğunu biliyorsanız işe yarar.
