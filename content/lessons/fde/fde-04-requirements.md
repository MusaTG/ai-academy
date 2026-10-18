---
id: fde-04-requirements
type: lesson
title: Belirsiz gereksinimleri teknik probleme dönüştürme
title_en: Turning ambiguity into a technical problem
summary: ‘Bunu AI ile iyileştirelim’ talebini ölçülebilir, test edilebilir bir problem
  tanımına çevirme.
status: complete
order: 4
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
- q: Aşağıdakilerden hangisi iyi tanımlanmış bir başarı kriteridir?
  options:
  - Sistem daha akıllı olsun
  - Analist başına itiraz inceleme süresi 25 dk'dan 10 dk'ya insin
  - Müşteriler memnun olsun
  - AI kullanılsın
  answer: 1
  explain: Ölçülebilir bir metrik, başlangıç değeri ve hedef değer içeriyor.
---

## Problem tanımı şablonu

Belirsiz bir talebi şu beş soruya cevap vererek netleştirin:

1. **Kim?** Hangi kullanıcı, hangi rol?
2. **Ne yapıyor?** Bugünkü iş akışı adım adım nasıl?
3. **Acı nerede?** Zaman mı kaybediliyor, hata mı yapılıyor, para mı kaçıyor?
4. **Başarı nasıl ölçülür?** Bir metrik ve hedef değer.
5. **Kısıtlar neler?** Veri, güvenlik, bütçe, tarih, mevzuat.

## Örnek

- **Talep:** "Müşteri hizmetlerini AI ile iyileştirelim."
- **Netleşmiş hâli:** "Kart itiraz ekibindeki 12 analist, her itiraz için ortalama 25 dakikayı 4 farklı sistemden bilgi toplamaya harcıyor. Hedef: bu bilgileri tek ekranda toplayan bir asistanla süreyi 10 dakikaya indirmek. Kişisel veri banka dışına çıkamaz. 8 hafta içinde pilot."

## Tuzaklar

- Çözümle başlamak ("chatbot yapalım") yerine problemle başlayın.
- Ölçülemeyen hedef ("daha iyi olsun") kabul etmeyin.
- Başarı metriğini müşteriyle **birlikte** ve **yazılı** belirleyin.
