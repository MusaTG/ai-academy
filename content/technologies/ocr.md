---
id: ocr
type: technology
title: OCR
title_en: Optical Character Recognition
summary: Görüntüdeki metni makinenin okuyabileceği metne çevirme; bankacılıktan sağlık belgelerine, e-ticarete kadar belge otomasyonunun temeli.
status: complete
group: Ortak teknolojiler
level: Orta
aliases: [Optik Karakter Tanıma, Optical Character Recognition, Belge Okuma]
tags: [ocr, belge, computer-vision]
relations:
  used_in_sector: [banking, healthcare, ecommerce]
  is_a: [computer-vision]
  required_in_career: [computer-vision-engineer]
sources:
  - { title: "Tesseract OCR (açık kaynak)", url: "https://github.com/tesseract-ocr/tesseract", kind: official-docs, lang: en }
  - { title: "PaddleOCR (açık kaynak)", url: "https://github.com/PaddlePaddle/PaddleOCR", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

OCR, bir fotoğraftaki yazıyı "okuyan" sistemdir. Ama gerçek hayatta okumak yetmez: bir faturada **hangi sayının toplam tutar** olduğunu anlamak (alan çıkarımı) asıl değerdir.

## Nasıl çalışır? {#how}

Klasik bir OCR hattı iki aşamalıdır:

1. **Metin tespiti (detection):** Görüntüde metin bölgelerini bulur (kutu veya çokgen).
2. **Metin tanıma (recognition):** Her bölgedeki karakter dizisini okur; CRNN + CTC loss veya Transformer tabanlı modeller kullanılır.

Sonra **belge anlama** gelir: düzen analizi (başlık, tablo, paragraf), anahtar-değer çıkarımı, tablo çıkarımı. Ön işleme (eğiklik düzeltme, perspektif düzeltme, kontrast) sonuç kalitesini ciddi biçimde etkiler.

## Sektöre göre neler değişir? {#sector-variation}

| Sektör | Belge | Kritik gereksinim |
|---|---|---|
| [[banking\|Bankacılık]] | Kimlik, gelir belgesi, dekont | KYC doğrulama, sahtecilik tespiti, kişisel veri güvenliği |
| [[healthcare\|Sağlık]] | Reçete, epikriz, laboratuvar raporu | Tıbbi terim doğruluğu, el yazısı, hasta mahremiyeti |
| [[ecommerce\|E-ticaret]] | Fatura, ürün etiketi, irsaliye | Hacim ve maliyet, çok dilli metin |

## Değerlendirme {#metrics}

- **CER (Character Error Rate)** ve **WER (Word Error Rate)** — düzenleme (edit) mesafesi tabanlı.
- Alan seviyesinde **exact match** — iş açısından asıl önemli olan (tutar alanı doğru mu?).
- Tespit için precision/recall/F-score; tanıma ile tespit hatalarını ayrı raporlayın.

## Hata analizi ve tuzaklar {#failure-modes}

- Düşük çözünürlük, bulanıklık, katlanmış kâğıt, damga ve imza üst üste binmesi.
- Türkçe karakterler (ı/i, ş/s, ğ/g) — dil modeli desteği olmayan sistemlerde sık hata.
- Güven skoruna körü körüne güvenmek: düşük güvenli alanları insana yönlendiren bir akış kurun.

## Bağlantılar {#related}

[[Computer Vision]], [[banking|Bankacılık]] (KYC), [[Computer Vision Engineer]].
