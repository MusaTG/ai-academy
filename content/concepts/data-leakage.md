---
id: data-leakage
type: concept
title: Data Leakage
title_en: Data Leakage
summary: Eğitim sırasında, tahmin anında gerçekte bilinemeyecek bilginin modele sızması; test sonuçlarını sahte biçimde iyi gösteren en tehlikeli hata.
status: complete
level: Başlangıç
aliases: [Veri Sızıntısı, Target Leakage]
tags: [doğrulama, veri, hata]
relations:
  used_in_sector: [banking, healthcare]
  used_with: [class-imbalance, time-series-forecasting]
sources:
  - { title: "scikit-learn — Common pitfalls: Data leakage", url: "https://scikit-learn.org/stable/common_pitfalls.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Sınav sorularını önceden gören öğrenci yüksek not alır ama konuyu öğrenmemiştir. Veri sızıntısında model de "cevabı" eğitim verisinde görür; test başarısı yüksek, üretim başarısı düşük olur.

## Neden gerekli? {#why}

Sızıntı, model geliştirmede en pahalı hatalardan biridir çünkü **fark edilmeden** üretime gider ve iş kararlarını yanlış yönlendirir.

## Matematik {#math}

Tahmin zamanı $t$ olsun. Bir özellik $x$ ancak $x$'in değeri $t$ anında **bilinebiliyorsa** geçerlidir. Biçimsel olarak modelin $f(X_{\le t})$ fonksiyonu olması gerekir; $X_{>t}$ ya da hedefin kendisinden türetilmiş bilgi içermemelidir.

## Elle hesaplama {#example}

Fraud örneği: "Bu kart son 30 günde bloke edildi mi?" özelliği eğitimde %99 başarı verdi. Ama kartlar **dolandırıcılık tespit edildikten sonra** bloke ediliyor; yani özellik hedefin sonucunu taşıyor. Üretimde işlem anında bu bilgi yoktur.

## Hata analizi {#failure-modes}

Tipik kaynaklar:

- Ölçekleme/normalleştirmeyi tüm veriye uygulayıp sonra bölmek.
- Zaman serisinde rastgele bölme ([[Time-Series Forecasting]]).
- Aynı hastanın/müşterinin örneklerinin hem train hem test'te bulunması (grup sızıntısı).
- Hedef sonrası oluşan alanlar (bloke tarihi, iade tarihi).
- Oversampling'i bölmeden önce yapmak ([[Class Imbalance]]).

## Özet {#summary}

"Bu bilgi tahmin anında gerçekten var mıydı?" sorusunu her özellik için sorun. Zaman ve grup bazlı bölme kullanın; pipeline'ı yalnızca train üzerinde fit edin.
