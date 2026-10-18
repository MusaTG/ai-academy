---
id: fde-07-rapid-prototyping
type: lesson
title: Hızlı prototipleme
title_en: Rapid prototyping
summary: Günler içinde uçtan uca çalışan en ince dikey dilimi kurma.
status: complete
order: 7
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

## En ince dikey dilim

Prototip, bir katmanı mükemmelleştirmek değil, **uçtan uca** çalışmaktır: gerçek veri kaynağından → işleme → kullanıcı ekranına. Her katman kaba olabilir; ama zincir kopuk olmamalıdır.

## Hız için kurallar

1. Mevcut araçları kullanın; altyapı icat etmeyin.
2. Sabit kodlanmış (hard-coded) yapılandırma kabul edilebilir — ama listeleyin.
3. Kullanıcıya **gerçek verisiyle** gösterin; sentetik veriyle yapılan demo güven üretmez.
4. Her prototipte bir **değerlendirme scripti** olsun: "doğru mu çalışıyor?" sorusunu sayıyla yanıtlayın.

## Bilinçli borç kaydı

Prototipte bilerek yaptığınız kestirmeleri bir tabloda tutun: *ne, neden, üretime geçmeden önce ne yapılmalı*. Bu tablo [[fde-15-tech-debt|teknik borç]] dersinin girdisidir.

Uygulamalı örnek: [[fde-safe-db-assistant|Okuma-yalnız veritabanı asistanı prototipi]].
