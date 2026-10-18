---
id: fde-10-security-boundaries
type: lesson
title: Veri erişimi ve güvenlik sınırları
title_en: Data access & security boundaries
summary: En az yetki, okuma-yalnız erişim, maskeleme, denetim izi ve AI'a özgü riskler.
status: complete
order: 10
duration: 30 dk
level: Orta
tags:
- fde
relations:
  part_of:
  - fde-path
last_verified: '2026-10-18'
version: 1
quiz:
- q: LLM tarafından üretilen SQL'i güvenli çalıştırmanın en sağlam yolu hangisidir?
  options:
  - Modele 'sadece SELECT yaz' demek
  - Okuma-yalnız bağlantı + izinli sorgu şablonları + parametre doğrulama
  - Sorguyu loglamak
  - Sonuçları kısaltmak
  answer: 1
  explain: Model talimatına güvenmek yeterli değildir; erişim kodla ve yetkiyle sınırlandırılmalıdır.
---

## Temel ilkeler

1. **En az yetki:** Uygulamanın veritabanı kullanıcısı yalnızca gereken tablolara **okuma** yetkisine sahip olsun.
2. **Savunma katmanları:** Uygulama seviyesinde de yazma işlemlerini engelleyin (ör. yalnızca `SELECT` izinli, parametreli sorgular).
3. **Maskeleme:** Kimlik numarası, telefon, kart numarası gibi alanları sonuçlarda maskeleyin.
4. **Denetim izi:** Kim, ne zaman, hangi sorguyu çalıştırdı — kaydedin.
5. **Sırlar:** Bağlantı bilgileri kodda değil, gizli yönetim aracında veya ortam değişkenlerinde.

## AI'a özgü riskler

- **Prompt injection:** Kullanıcı girdisi veya belge içeriği, modele "talimat" gibi davranabilir. Modelin araç ve veri erişimini kodla sınırlayın; modele güvenmeyin.
- **Serbest SQL üretimi:** LLM'in ürettiği SQL'i doğrudan çalıştırmak risklidir. Şablonlanmış sorgular, izin listeleri ve okuma-yalnız bağlantı kullanın.
- **Veri sızıntısı:** Model yanıtında kullanıcının görmeye yetkisi olmayan veri olmamalı.

Uygulamalı örnek ve testler: [[fde-safe-db-assistant|Okuma-yalnız, maskeli veritabanı asistanı]].
