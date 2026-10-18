---
id: manufacturing-visual-inspection
type: case-study
title: Az kusur örneğiyle görsel muayene sistemi
title_en: Visual inspection with very few defect samples
summary: Kusurlu örneğin çok az olduğu bir üretim hattında, yalnız normal görüntülerle eğitilen anomali tespiti ve hat entegrasyonu.
status: complete
evidence: engineering-inference
level: Orta
tags: [üretim, görsel-muayene, anomali]
relations:
  used_in_sector: [manufacturing]
  used_with: [anomaly-detection, computer-vision]
  evaluated_with: [roc-auc]
sources:
  - { title: "MVTec AD — endüstriyel anomali tespiti veri seti", url: "https://www.mvtec.com/company/research/datasets/mvtec-ad", kind: official-docs, lang: en }
  - { title: "Roth et al. (2021). Towards Total Recall in Industrial Anomaly Detection (PatchCore)", url: "https://arxiv.org/abs/2106.08265", kind: preprint, lang: en }
last_verified: 2026-10-18
version: 1
---

> **Kanıt düzeyi: Genel mühendislik çıkarımı.** Belirli bir fabrikanın projesi değildir. Yöntem seçimi, kamuya açık araştırma ve veri setlerine dayanır; sayılar örnektir.

## Problem ve iş hedefi {#problem}

Bir montaj hattında yüzey çizik ve çatlaklarını görsel olarak tespit etmek. Kusurlu parçanın müşteriye gitmesi (FN) çok pahalı; gereksiz red (FP) hurda ve hat yavaşlaması demek. Hedef metrik: [[OEE]]'nin kalite bileşenini artırmak ve kaçan kusur oranını düşürmek.

## Bağlam ve kısıtlar {#context}

Binlerce normal görüntü var, ama her kusur türünden yalnızca birkaç örnek. Kusur türleri önceden tam bilinmiyor. Çıkarım, hat hızında ve hat yanındaki bir edge bilgisayarda yapılmalı. Aydınlatma ve kamera konumu zamanla değişebilir.

## Yaklaşım {#approach}

1. **Görüntü kalitesi önce:** Sabit aydınlatma ve kamera kalibrasyonu; birçok "model problemi" aslında görüntüleme problemidir.
2. **Yalnız normal örneklerle eğitim:** Önceden eğitilmiş bir görsel ağın özellikleriyle normal yamaların bir bellek bankasını oluşturan PatchCore benzeri yöntemler; test yamalarının en yakın normal yamaya uzaklığı anomali skorudur ([[Anomaly Detection]]).
3. **Eşik:** Az sayıdaki kusurlu örnek ve operatör geri bildirimiyle; kaçan kusur maliyeti ağırlıklı.
4. **İnsan döngüde:** Belirsiz skorlu parçalar operatöre; operatör kararları yeni etiket olarak toplanır.
5. **İzleme:** Normal görüntülerin skor dağılımı (kayma = aydınlatma/kamera değişti mi?).

## Sonuçlar ve ödünleşimler {#results}

- Görüntü seviyesinde AUROC ile birlikte piksel seviyesinde konum metrikleri raporlanır; operatörün güveni için "nerede" bilgisi önemlidir.
- Bellek bankası büyüdükçe doğruluk artabilir ama edge cihazda gecikme ve bellek artar; alt örnekleme (coreset) bu dengeyi kurar.
- Denetimli bir modele geçiş, yeterli etiketli kusur birikince değerlendirilir.

## Kanıt düzeyi {#evidence}

- **Kaynakla desteklenen:** Yalnız normal örneklerle eğitilen gömme tabanlı yöntemlerin endüstriyel anomali kıyaslama veri setlerinde (MVTec AD) kullanılması.
- **Genel mühendislik çıkarımı:** Hat entegrasyonu, eşik ve izleme stratejisi.
