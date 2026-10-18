---
id: fde-06-systems-discovery
type: lesson
title: Mevcut sistemleri ve veri altyapısını inceleme
title_en: Discovering existing systems and data
summary: Müşterinin sistem haritasını, veri akışlarını ve kalite sorunlarını hızla
  çıkarma.
status: complete
order: 6
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

## Sistem haritası

İlk iki hafta içinde şu haritayı çıkarın: kaynak sistemler → aktarım (batch/stream/API) → depolar → tüketiciler. Her ok için: sıklık, sahibi, format, erişim yöntemi.

## Veri keşfi kontrol listesi

- Şema ve veri sözlüğü var mı? Güncel mi?
- Birincil anahtarlar gerçekten tekil mi?
- Tarih alanlarının saat dilimi ne?
- Boş değer oranları, aykırı değerler, kodlanmış alanlar (ör. "99 = bilinmiyor").
- Tablolar arası birleştirmede (join) satır kaybı veya çoğalma var mı?
- Veri ne kadar gecikmeli geliyor?

## Küçük ama güçlü bir alışkanlık

Her önemli tabloya şu SQL ile başlayın:

```sql
SELECT COUNT(*), COUNT(DISTINCT id), MIN(created_at), MAX(created_at),
       SUM(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS null_amount
FROM transactions;
```

Bu tek sorgu birçok sürprizi ilk gün ortaya çıkarır.
