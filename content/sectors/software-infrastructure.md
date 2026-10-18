---
id: software-infrastructure
type: sector
title: Yazılım, Donanım ve Altyapı
title_en: Software, Hardware & Infrastructure
summary: İşletim sistemlerinden dağıtık sistemlere, bulut altyapısından gözlemlenebilirliğe; diğer tüm sektörlerin üzerinde çalıştığı temel katman.
status: partial
group: Teknoloji
order: 10
tags: [yazılım, altyapı, dağıtık-sistemler, sre]
aliases: [Yazılım Altyapısı, Altyapı, Infrastructure]
relations:
  used_with: [cybersecurity]
sources:
  - { title: "Google — Site Reliability Engineering (açık erişim kitap)", url: "https://sre.google/sre-book/table-of-contents/", kind: book, lang: en }
last_verified: 2026-10-18
version: 1
---

## Sektörün temel işleyişi {#overview}

Her dijital ürün; hesaplama (CPU/GPU), depolama, ağ ve bunların üzerinde çalışan yazılım katmanlarına dayanır. Altyapı ekiplerinin hedefi, ürün ekiplerinin **güvenilir, hızlı ve maliyet etkin** biçimde yazılım yayınlamasını sağlamaktır.

## Temel kavramlar ve terminoloji {#terminology}

Gecikme ve throughput, p50/p95/p99, erişilebilirlik ve SLO/SLA, hata bütçesi (error budget), tutarlılık modelleri, önbellek, mesaj kuyrukları, konteyner ve orkestrasyon, gözlemlenebilirlik (log, metrik, iz).

## Matematiksel ve bilimsel altyapı {#science}

Kuyruk teorisi (yük altında gecikme), olasılık (arıza oranları), algoritma karmaşıklığı, dağıtık sistem teorisi (CAP ve tutarlılık ödünleşimleri).

## Operasyonel ve teknik problemler {#problems}

Zincirleme arızalar, kapasite planlama hataları, yapılandırma değişikliğinden kaynaklanan kesintiler, maliyet artışı, log'lara kişisel veri sızması ([[Privacy Engineering]]).

## İlgili meslek ve sektör bağlantıları {#related}

Meslekler: [[Site Reliability Engineer]], [[MLOps Engineer]], [[Data Engineer]], [[Security Engineer]]. Sektörler: [[cybersecurity|Siber güvenlik]].

> **Kapsam notu:** Değer zinciri, araçlar, veri, AI kullanımları, yöntemler, metrikler, mevzuat, vaka, proje ve araştırma bölümleri henüz yazılmadı.
