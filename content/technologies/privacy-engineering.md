---
id: privacy-engineering
type: technology
title: Privacy Engineering
title_en: Privacy Engineering
summary: Kişisel veriyi korumayı sistem tasarımının parçası yapma; sağlık, finans, eğitim ve kurumsal sistemlerin ortak gereksinimi.
status: complete
group: Ortak teknolojiler
level: Orta
aliases: [Gizlilik Mühendisliği, Privacy by Design]
tags: [gizlilik, kvkk, gdpr, güvenlik]
relations:
  used_in_sector: [healthcare, banking, cybersecurity, software-infrastructure]
  required_in_career: [security-engineer, forward-deployed-engineer]
sources:
  - { title: "KVKK — Kişisel Verileri Koruma Kurumu", url: "https://www.kvkk.gov.tr", kind: standard, lang: tr }
  - { title: "Dwork & Roth — The Algorithmic Foundations of Differential Privacy", url: "https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf", kind: book, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Gizlilik mühendisliği, "veriyi koruyacağız" sözünü **kodda ve mimaride** somutlaştırmaktır: gereksiz veriyi hiç toplamamak, toplananı maskelemek, erişimi sınırlamak, kimin neye eriştiğini kaydetmek ve süresi dolanı silmek.

## Nasıl çalışır? {#how}

- **Veri minimizasyonu:** yalnızca amaç için gereken alanlar.
- **Takma adlandırma ve maskeleme:** kimliği doğrudan gösteren alanları ayırmak.
- **Erişim kontrolü ve denetim izi:** en az yetki; her erişim kaydedilir.
- **Saklama ve silme politikaları:** süresi dolan verinin gerçekten silinmesi (yedekler dahil).
- **İleri teknikler:** diferansiyel gizlilik, federatif öğrenme, güvenli çok taraflı hesaplama.

## Sektöre göre neler değişir? {#sector-variation}

| Sektör | Hassas veri | Özel kısıt |
|---|---|---|
| [[healthcare\|Sağlık]] | Tanı, tedavi, genetik veri | Özel nitelikli kişisel veri; açık rıza ve sıkı erişim |
| [[banking\|Bankacılık]] | Hesap, işlem, kimlik | Bankacılık sırrı, kart verisi standartları |
| [[cybersecurity\|Siber güvenlik]] | Log'lardaki kullanıcı verisi | Güvenlik izleme ile gizlilik dengesi |
| [[software-infrastructure\|Yazılım altyapısı]] | Telemetri, log | Log'lara kişisel veri sızması |

## Değerlendirme {#metrics}

Teknik metrikten çok süreç ölçütleri: kişisel veri envanterinin kapsamı, erişim gözden geçirme sıklığı, silme taleplerinin çözüm süresi, log'larda tespit edilen kişisel veri sayısı.

## Hata analizi ve tuzaklar {#failure-modes}

- "Anonimleştirildi" denen verinin başka verilerle birleştirilip yeniden kimliklendirilmesi.
- Yedeklerde ve log'larda unutulan kişisel veri.
- Geliştirme ortamına üretim verisi kopyalamak.

## Bağlantılar {#related}

[[Security Engineer]], [[Forward Deployed Engineer]], [[fde-10-security-boundaries|FDE: güvenlik sınırları]].
