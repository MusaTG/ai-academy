---
id: robotics-autonomy
type: sector
title: Robotik, Otonom Sürüş ve Fiziksel AI
title_en: Robotics, Autonomous Driving & Physical AI
summary: Algılama, konumlama, tahmin, planlama ve kontrolün gerçek zamanlı ve güvenlik kritik bir sistemde birleştiği alan.
status: partial
group: Fiziksel sistemler
order: 7
tags: [robotik, otonom-sürüş, slam, kontrol]
aliases: [Robotik, Otonom Sürüş, Otonom Sistemler]
relations:
  used_with: [manufacturing]
sources:
  - { title: "ROS 2 dokümantasyonu", url: "https://docs.ros.org", kind: official-docs, lang: en }
  - { title: "Kalman (1960). A New Approach to Linear Filtering and Prediction Problems", url: "https://doi.org/10.1115/1.3662552", kind: peer-reviewed, lang: en }
last_verified: 2026-10-18
version: 1
---

## Sektörün temel işleyişi {#overview}

Otonom bir sistem, sürekli tekrarlanan bir döngüdür: **algıla → konumunu bil → çevreyi tahmin et → plan yap → kontrol et**. Otonom sürüşü yalnızca nesne tespiti olarak görmek yanlıştır; tespit, bu zincirin yalnızca ilk halkasıdır. Her halkanın gecikmesi ve hatası bir sonrakine aktarılır.

## Temel kavramlar ve terminoloji {#terminology}

Kinematik ve dinamik, sensör füzyonu, SLAM (eşzamanlı konumlama ve haritalama), yol/hareket planlama, PID ve model öngörülü kontrol (MPC), sim-to-real, fonksiyonel güvenlik, senaryo tabanlı test.

## Kullanılan yazılım ve donanım {#tools}

Kamera, LiDAR, radar, IMU, GNSS; gömülü GPU'lar; ROS 2; simülatörler; donanım-döngüde (HIL) test düzenekleri.

## Matematiksel ve bilimsel altyapı {#science}

Lineer cebir ve 3B geometri, olasılık ve [[Bayesian Methods]] ([[Kalman Filter]]), kontrol teorisi, [[Optimization]], [[Signal Processing]].

## AI ve otomasyon kullanım alanları {#ai-uses}

3B [[Object Detection]], takip, yörünge tahmini, davranış planlama, [[Reinforcement Learning]] ile kontrol, simülasyonda sentetik veri.

## Operasyonel ve teknik problemler {#problems}

Nadir ama kritik senaryolar (uzun kuyruk), sensör kalibrasyonunun bozulması, gerçek zamanlı gecikme bütçesi, simülasyon ile gerçek dünya arasındaki fark, güvenlik doğrulamasının maliyeti.

## İlgili meslek ve sektör bağlantıları {#related}

Sektörler: [[manufacturing|Üretim]]. Teknolojiler: [[Computer Vision]], [[Signal Processing]], [[Optimization]], [[Reinforcement Learning]].

> **Kapsam notu:** Değer zinciri, meslekler, veri, yöntemler, metrikler, mevzuat (fonksiyonel güvenlik standartları), vaka, proje ve araştırma bölümleri henüz yazılmadı.
