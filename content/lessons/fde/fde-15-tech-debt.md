---
id: fde-15-tech-debt
type: lesson
title: Teknik borç ve entegrasyon sorunları
title_en: Technical debt & integration issues
summary: Müşteriye özel kodun bakım yüküne dönüşmesini önleme.
status: complete
order: 15
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

## Belirtiler

- Aynı entegrasyonun her müşteride kopyalanıp biraz değiştirilmesi.
- Kimsenin dokunmaya cesaret edemediği "müşteri X scripti".
- Sürüm yükseltmelerinde sürekli kırılan özel kod.

## Önlemler

1. Müşteriye özel mantığı **yapılandırmaya** taşıyın (kod yerine ayar).
2. Ortak entegrasyonları **kütüphane/bağlayıcı** hâline getirin.
3. Her müşteriye özel kod parçasının bir sahibi ve test seti olsun.
4. Teknik borç kaydını ([[fde-07-rapid-prototyping|prototip dersindeki]] tablo) her ay gözden geçirin.
