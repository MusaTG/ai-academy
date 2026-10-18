---
id: computer-vision-engineer
type: career
title: Computer Vision Engineer
title_en: Computer Vision Engineer
summary: Görüntü ve videodan bilgi çıkaran sistemleri tasarlayan, veri kalitesinden model değerlendirmesine kadar sorumlu mühendis.
status: partial
group: AI & Araştırma
order: 5
aliases: [Bilgisayarlı Görü Mühendisi, CV Engineer]
tags: [cv, görüntü, segmentasyon]
relations:
  used_in_sector: [manufacturing, healthcare, agriculture-environment, robotics-autonomy]
  used_with: [ai-engineer]
sources:
  - { title: "OpenCV dokümantasyonu", url: "https://docs.opencv.org/4.x/", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Mesleğin temel amacı {#purpose}

Görsel veriden güvenilir kararlar üretmek: kusurlu parçayı bulmak, binayı segmentlemek, yayayı tespit etmek.

## Gereken teknik bilgi {#tech-skills}

Klasik görüntü işleme ([[Convolution]], [[Gaussian Blur]], [[Canny Edge Detector]], [[Harris Corner Detector]]), derin öğrenme mimarileri, [[Object Detection]], değerlendirme ([[IoU]], [[Dice]]), veri ve anotasyon kalitesi.

## Sık karşılaşılan problemler {#problems}

Etiket tutarsızlığı, küçük nesneler, dağılım kayması (yeni kamera/şehir/cihaz), sınıf dengesizliği ([[Focal Loss]]).

## Örnek projeler {#projects}

[[canny-edge-numpy|Canny]], [[harris-corner-numpy|Harris]], [[iou-dice-metrics|IoU/Dice]], [[manufacturing-visual-inspection|görsel muayene vakası]].

> **Kapsam notu:** Günlük akış, KPI'lar, seviye farkları ve diğer şablon bölümleri henüz yazılmadı.
