---
id: fde-12-production
type: lesson
title: Üretim ortamına geçiş
title_en: Moving to production
summary: 'Prototipten işletilebilir sisteme: test, izleme, geri alma ve devir.'
status: complete
order: 12
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

## Üretime hazırlık listesi

- [ ] Otomatik testler (birim + entegrasyon) ve CI.
- [ ] Yapılandırma ve sırlar koddan ayrılmış.
- [ ] Log, metrik ve alarm: hata oranı, gecikme, veri gelmedi alarmı.
- [ ] AI bileşenleri için değerlendirme seti ve düzenli regresyon testi.
- [ ] Geri alma (rollback) planı ve denenmiş prosedür.
- [ ] Kapasite ve maliyet tahmini.
- [ ] Güvenlik incelemesi ve müşteri onayı.
- [ ] Runbook: "X olursa ne yapılır?"
- [ ] Devir: sistemi kim işletecek, eğitim verildi mi?

## Kademeli açılış

Önce küçük bir kullanıcı grubu (pilot), sonra kademeli genişleme. AI sistemlerinde bir süre **gölge mod** (shadow) çalıştırmak — sistem çıktı üretir ama karar vermez — riskleri büyük ölçüde azaltır.
