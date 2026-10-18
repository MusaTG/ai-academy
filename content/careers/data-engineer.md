---
id: data-engineer
type: career
title: Data Engineer
title_en: Data Engineer
summary: Verinin kaynaktan analize ve modellere güvenilir, zamanında ve doğru biçimde akmasını sağlayan pipeline ve platformları kuran mühendis.
status: partial
group: Veri
order: 4
aliases: [Veri Mühendisi]
tags: [veri, etl, pipeline, kalite]
relations:
  used_in_sector: [banking, healthcare, manufacturing, ecommerce]
sources:
  - { title: "Apache Kafka dokümantasyonu", url: "https://kafka.apache.org/documentation/", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Mesleğin temel amacı {#purpose}

Doğru verinin, doğru zamanda, doğru kişiye ve sisteme ulaşması. Modellerin ve raporların kalitesi doğrudan veri pipeline'larının kalitesine bağlıdır.

## Gerçek görev ve sorumluluklar {#responsibilities}

Batch ve akış (streaming) pipeline'ları, veri modelleme, veri kalitesi kontrolleri, veri soy ağacı (lineage), erişim yönetimi, maliyet optimizasyonu.

## Kullanılan araçlar ve teknolojiler {#tools}

SQL, Python, iş akışı orkestratörleri, veri ambarları ve data lake'ler, akış platformları (Kafka benzeri), şema doğrulama araçları.

## Sık karşılaşılan problemler {#problems}

Sessiz veri bozulmaları (şema değişikliği, boş alanlar), geç gelen veri, mükerrer kayıt, saat dilimi hataları, kişisel verinin yanlış yere kopyalanması.

## Sektöre göre farklılaşma {#sector-differences}

[[banking|Bankacılıkta]] düşük gecikmeli işlem akışları ve denetim izi; [[healthcare|sağlıkta]] FHIR/DICOM gibi standartlar ve mahremiyet; [[manufacturing|üretimde]] yüksek frekanslı sensör verisi.

> **Kapsam notu:** Günlük akış, KPI'lar, seviye farkları ve diğer şablon bölümleri henüz yazılmadı.
