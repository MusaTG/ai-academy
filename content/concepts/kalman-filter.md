---
id: kalman-filter
type: algorithm
title: Kalman Filter
title_en: Kalman Filter
summary: Gürültülü ölçümleri bir hareket modeliyle birleştirerek sistem durumunu ardışık olarak en iyi biçimde tahmin eden algoritma.
status: complete
level: Orta
aliases: [Kalman Filtresi]
tags: [sensör-füzyonu, tahmin, robotik]
relations:
  is_a: [bayesian-methods]
  used_in_sector: [robotics-autonomy]
  used_with: [signal-processing]
sources:
  - { title: "Kalman (1960). A New Approach to Linear Filtering and Prediction Problems", url: "https://doi.org/10.1115/1.3662552", kind: peer-reviewed, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Karanlık bir odada yürüyorsunuz. Adımlarınızı sayarak nerede olduğunuzu tahmin ediyorsunuz (model), arada bir duvara dokunarak düzeltiyorsunuz (ölçüm). Kalman filtresi, ikisinin **ne kadar güvenilir olduğuna göre** ağırlıklı bir birleşim yapar.

## Neden gerekli? {#why}

GPS gürültülüdür, IMU zamanla kayar; ikisini birleştirmek tek başına ikisinden de iyi sonuç verir. Robotik, navigasyon ve takipte temel araçtır.

## Matematik {#math}

Tahmin adımı: $\hat{x}^-_k = F\hat{x}_{k-1}$, $P^-_k = F P_{k-1} F^\top + Q$.

Güncelleme adımı:

$$
K_k = P^-_k H^\top (H P^-_k H^\top + R)^{-1}, \quad \hat{x}_k = \hat{x}^-_k + K_k(z_k - H\hat{x}^-_k), \quad P_k = (I - K_k H) P^-_k
$$

$Q$ süreç gürültüsü, $R$ ölçüm gürültüsü kovaryansıdır.

## Elle hesaplama {#example}

Tek boyut: önceki tahmin 10 (varyans 4), ölçüm 12 (varyans 1). $K = 4/(4+1) = 0{,}8$ → yeni tahmin $10 + 0{,}8\cdot2 = 11{,}6$, yeni varyans $(1-0{,}8)\cdot4 = 0{,}8$. Ölçüm daha güvenilir olduğu için tahmin ölçüme yaklaşır.

## Hata analizi {#failure-modes}

Doğrusal olmayan sistemlerde (genişletilmiş/kokusuz Kalman gerekir), yanlış ayarlanmış $Q$ ve $R$, aykırı ölçümler (outlier) tahmini bozar.

## Özet {#summary}

Tahmin + ölçüm, güvenilirliğe göre ağırlıklı birleşim. Üst çerçeve: [[Bayesian Methods]].
