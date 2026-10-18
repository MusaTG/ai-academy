---
id: fde-09-integrations
type: lesson
title: API ve kurumsal sistem entegrasyonları
title_en: API & enterprise integrations
summary: Kimlik doğrulama, hata yönetimi, idempotency ve eski sistemlerle konuşma.
status: complete
order: 9
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

## Entegrasyon kontrol listesi

- **Kimlik doğrulama:** servis hesabı mı, OAuth mu, SSO mu? Token süresi ve yenileme?
- **Yetki:** en az yetki ilkesi; yalnızca gereken uç noktalar ve tablolar.
- **Hata yönetimi:** zaman aşımı (timeout), sınırlı tekrar deneme (retry + exponential backoff), devre kesici (circuit breaker).
- **Idempotency:** aynı istek iki kez gelirse iki kez işlem yapılmamalı (ör. idempotency key).
- **Gözlemlenebilirlik:** her çağrı için korelasyon kimliği, gecikme ve hata metriği.
- **Sözleşme testi:** karşı sistemin yanıt formatı değişirse ilk siz fark etmelisiniz.

## Eski sistemler

Eski sistemler çoğu zaman API yerine toplu dosya (CSV/fixed-width), mesaj kuyruğu veya doğrudan veritabanı okumasıyla entegre edilir. Bu durumda dosya şeması doğrulaması ve "dosya gelmedi" alarmı hayati önemdedir.

## İpucu

Entegrasyonu ilk gün bir **sahte (mock) servisle** yazın; gerçek erişim geldiğinde yalnızca yapılandırmayı değiştirin.
