---
id: ecommerce
type: sector
title: E-ticaret, Perakende ve Dijital Ürünler
title_en: E-commerce, Retail & Digital Products
summary: Arama, öneri, fiyatlandırma ve deneylerin doğrudan gelire dönüştüğü; ölçek, kişiselleştirme ve nedensel ölçümün kritik olduğu sektör.
status: partial
group: Dijital
order: 6
tags: [e-ticaret, öneri, arama, ab-test]
aliases: [E-ticaret, Perakende, E-commerce]
relations:
  used_with: [banking]
sources:
  - { title: "Hernán & Robins — Causal Inference: What If", url: "https://miguelhernan.org/whatifbook", kind: book, lang: en }
last_verified: 2026-10-18
version: 1
---

## Sektörün temel işleyişi {#overview}

Bir e-ticaret platformu; kullanıcıyı ürüne ulaştırır (arama, öneri), satın almaya ikna eder (fiyat, sunum, güven), siparişi karşılar (stok, depo, kargo) ve geri gelmesini sağlar. Temel huni: ziyaret → arama/göz atma → ürün sayfası → sepet → ödeme → teslimat → tekrar alışveriş.

## Temel kavramlar ve terminoloji {#terminology}

Dönüşüm oranı (conversion rate), sepet ortalaması, müşteri yaşam boyu değeri (LTV), arama alaka düzeyi (search relevance), sıralama (ranking), atıf (attribution), A/B testi.

## Veri türleri ve veri kaynakları {#data}

Olay akışı (tıklama, görüntüleme, sepete ekleme), katalog (başlık, kategori, görsel), sipariş ve iade kayıtları, yorumlar, stok ve lojistik verisi.

## AI ve otomasyon kullanım alanları {#ai-uses}

Öneri sistemleri ve [[Graph Learning]], arama sıralaması, talep tahmini ([[Time-Series Forecasting]]), görsel ürün arama ([[Computer Vision]]), fatura/etiket [[OCR]], ödeme [[Fraud Detection]], müşteri destek asistanları ([[Natural Language Processing]]).

## Başarı metrikleri ve KPI'lar {#metrics}

İş: dönüşüm, gelir/oturum, iade oranı. Arama/öneri: nDCG, Recall@k, tıklama oranı. **Çevrimdışı metrikteki iyileşme, A/B testinde doğrulanmadan başarı sayılmaz** ([[Causal Inference]]).

## Operasyonel ve teknik problemler {#problems}

Soğuk başlangıç (yeni kullanıcı/ürün), popülerlik yanlılığı, kampanya dönemlerinde ölçek, deneylerde yenilik etkisi ve çoklu test hatası.

## İlgili meslek ve sektör bağlantıları {#related}

Sektörler: [[banking|Bankacılık]] (ödeme ve fraud). Teknolojiler: [[Causal Inference]], [[Graph Learning]], [[Time-Series Forecasting]], [[Optimization]].

> **Kapsam notu:** Değer zinciri, araçlar, bilimsel altyapı, yöntemler, mevzuat, vaka, proje ve araştırma bölümleri henüz yazılmadı.
