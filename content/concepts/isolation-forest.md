---
id: isolation-forest
type: algorithm
title: Isolation Forest
title_en: Isolation Forest
summary: Anomalilerin rastgele bölmelerle normal örneklerden daha çabuk izole edildiği fikrine dayanan, etiket gerektirmeyen anomali tespit algoritması.
status: complete
level: Orta
aliases: [iForest, İzolasyon Ormanı]
tags: [anomali, ağaç, denetimsiz]
relations:
  is_a: [anomaly-detection]
  used_in_sector: [banking, manufacturing, cybersecurity]
  alternative_of: [autoencoder]
sources:
  - { title: "Liu, Ting, Zhou (2008). Isolation Forest. ICDM", url: "https://doi.org/10.1109/ICDM.2008.17", kind: peer-reviewed, lang: en }
  - { title: "scikit-learn: IsolationForest", url: "https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Kalabalık bir salonda herkesten uzakta, tek başına duran birini "ayırmak" için birkaç ip germek yeter; kalabalığın ortasındaki birini ayırmak için çok ip gerekir. Isolation Forest, veriyi rastgele "iplerle" (bölmelerle) keser: **az bölmeyle yalnız kalan örnek anomalidir.**

## Neden gerekli? {#why}

Etiket yokken, çok boyutlu tablo verisinde hızlı ve ölçeklenebilir bir anomali skoru verir; mesafe hesaplamadığı için yüksek boyutta da makul çalışır.

## Matematik {#math}

Her ağaç, rastgele bir özellik ve o özelliğin min–max aralığında rastgele bir bölme değeri seçerek veriyi ikiye ayırır. Bir örneğin ağaçlardaki ortalama yol uzunluğu $E[h(x)]$, $n$ örneklik bir alt örneklem için normalleştirilir:

$$
s(x, n) = 2^{-\frac{E[h(x)]}{c(n)}}, \qquad c(n) = 2H(n-1) - \frac{2(n-1)}{n}, \quad H(i) \approx \ln i + 0.5772
$$

$s \to 1$: güçlü anomali; $s \approx 0{,}5$ veya altı: normal.

## Elle hesaplama {#example}

$n = 256$ için $c(256) \approx 2(\ln 255 + 0{,}5772) - 2\cdot255/256 \approx 10{,}24$. Bir örneğin ortalama yol uzunluğu 4 ise $s = 2^{-4/10{,}24} \approx 0{,}76$ (anomaliye yakın); 12 ise $s \approx 0{,}44$ (normal).

## Hata analizi {#failure-modes}

- Yalnızca eksenlere paralel bölmeler yaptığı için bazı eğik/korelasyonlu yapılarda zayıf kalabilir.
- Kategorik değişkenler için uygun kodlama gerekir.
- "Contamination" parametresi eşiği belirler; iş maliyetiyle ayarlanmalıdır.
- Bağlamsal anomaliler için bağlam özellikleri (saat, gün) eklenmelidir.

## Özet {#summary}

Etiketsiz tablo verisinde güçlü ve hızlı bir başlangıç. Sıfırdan uygulama: [[transaction-anomaly-detection|tutorial]]. Üst kavram: [[Anomaly Detection]].
