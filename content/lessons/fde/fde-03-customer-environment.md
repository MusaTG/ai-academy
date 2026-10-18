---
id: fde-03-customer-environment
type: lesson
title: Müşteri ortamında çalışma
title_en: Working in the customer's environment
summary: Başkasının sistemlerinde, onların kurallarıyla ve sınırlı erişimle verimli
  çalışma.
status: complete
order: 3
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

## Gerçeklik

Müşteri ortamında çoğu zaman kendi dizüstü bilgisayarınızı kullanamazsınız, internet erişimi kısıtlıdır, paket kurmak için onay gerekir ve üretim verisine doğrudan erişim yoktur.

## Pratik kurallar

1. **İlk hafta erişim listesi çıkarın:** hangi sistem, hangi hesap, kim onaylıyor, ne kadar sürer?
2. **Ortam paritesi:** Müşteri ortamına benzeyen yerel bir geliştirme ortamı kurun (aynı Python/DB sürümü, sahte ama gerçekçi veri). Böylece erişim beklerken de ilerlersiniz.
3. **Bağımlılıkları azaltın:** Müşteri ortamında paket kurmak zorsa, standart kütüphaneyle veya onaylı paketlerle çözün.
4. **Her şeyi yazın:** Kararlar, varsayımlar, kimden hangi bilgiyi aldığınız. Rotasyon olduğunda ekip arkadaşınız buradan devam eder.
5. **Kurallara saygı:** Müşterinin güvenlik kuralını "işi hızlandırmak için" delmek, projeyi ve güveni bitirir.

## İpucu

Müşteri ekibinde bir "iç şampiyon" bulun: sistemi bilen, işin çözülmesini isteyen ve kapıları açabilen kişi. Başarılı projelerin çoğunda böyle biri vardır.
