---
id: fde-01-what-is-fde
type: lesson
title: FDE nedir ve hangi problemlere çözüm üretir?
title_en: What is an FDE?
summary: 'FDE rolünün ortaya çıkış nedeni: ürün ile müşterinin gerçek problemi arasındaki
  boşluğu kapatmak.'
status: complete
order: 1
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
- q: FDE'nin klasik ürün mühendisinden temel farkı nedir?
  options:
  - Daha az kod yazması
  - Belirli müşterilerin ortamında, onların gerçek verisi ve sistemleriyle çalışarak
    üretime kadar sorumluluk alması
  - Yalnızca satış sunumu yapması
  - Sadece altyapı yönetmesi
  answer: 1
  explain: 'FDE teslimat odaklıdır: müşteri ortamında çalışan sistemi üretime taşır.'
- q: FDE modeli hangi durumda en az uygundur?
  options:
  - Belirsiz gereksinimler
  - Eski ve özelleştirilmiş sistemler
  - Self-servis kurulabilen standart bir ürün
  - Güvenlik kısıtlı ortam
  answer: 2
  explain: Standart, self-servis ürünlerde her müşteriye mühendis göndermek ölçeklenmez.
---

## Basit anlatım

Bir şirket güçlü bir yazılım ya da AI ürünü satıyor, ama müşterinin verisi dağınık, sistemleri eski ve problemi tam tanımlanmamış. Ürün "kutudan çıktığı gibi" çalışmıyor. **Forward Deployed Engineer (FDE)** bu boşluğu kapatmak için müşterinin yanına gönderilen mühendistir.

## Hangi problemleri çözer?

- **Entegrasyon boşluğu:** Ürün, müşterinin veritabanına, kimlik sistemine ve iş akışına bağlanmadan değer üretemez.
- **Gereksinim belirsizliği:** Müşteri ne istediğini tam bilmez; birlikte keşfetmek gerekir.
- **Güven boşluğu:** Özellikle AI'da, müşterinin kendi verisiyle çalışan bir sonuç görmeden yatırım yapması zordur.
- **Geri bildirim boşluğu:** Ürün ekibi sahadaki gerçek kullanımı göremez; FDE bu bilgiyi geri taşır.

## Nerede yaygın?

İncelenen kaynaklara göre model Palantir'de doğdu; son yıllarda büyük AI şirketleri ve veri platformu şirketleri de FDE ekipleri kurdu. Uygun olduğu durumlar: karmaşık ve özelleştirilmiş eski sistemler, belirsiz gereksinimler, sürekli değişen ihtiyaçlar ve güvenlik kısıtlı ortamlar.

## Ne zaman uygun değildir?

Ürün standart ve self-servis kurulabiliyorsa, her müşteriye mühendis göndermek pahalıdır ve ölçeklenmez. FDE modeli, yüksek değerli ve karmaşık müşteriler için mantıklıdır.

## Özet

FDE = müşteri ortamında, gerçek veriyle, üretime kadar sorumluluk alan mühendis. Satış öncesi demo değil, **teslimat** odaklıdır.
