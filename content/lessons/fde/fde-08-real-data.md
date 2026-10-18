---
id: fde-08-real-data
type: lesson
title: Müşterinin gerçek verisiyle çalışma
title_en: Working with real customer data
summary: Gerçek verinin kirliliği, gizliliği ve temsil gücüyle başa çıkma.
status: complete
order: 8
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

## Gerçek veri neden farklı?

Demo verisi temizdir; gerçek veri değildir. Yazım hataları, eksik alanlar, mükerrer kayıtlar, değişen kodlamalar, test kayıtları ve "geçici" kolonlar beklenmelidir.

## Gizlilik önce

- Yalnızca gereken kolonlara erişin (veri minimizasyonu).
- Kişisel verileri geliştirme sırasında **maskeleyin** veya takma adlandırın (pseudonymization).
- Veri müşteri ortamından çıkabilir mi? Çoğu regüle sektörde cevap hayırdır; modeli veriye götürürsünüz, veriyi modele değil.
- Ekran görüntüsü ve log'lara kişisel veri düşmesine dikkat edin.

## Temsil gücü

Prototipte kullandığınız örnek, üretimdeki veriyi temsil ediyor mu? Farklı şubeler, ürünler, mevsimler, kanallar var mı? Değerlendirme setini bu çeşitliliği kapsayacak biçimde **katmanlı (stratified)** seçin.

## Bağlantılar

Veri sızıntısı riskleri için [[Data Leakage]], gizlilik tasarımı için [[Privacy Engineering]].
