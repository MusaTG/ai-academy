---
id: fde-19-interview-scenarios
type: lesson
title: Örnek mülakat senaryoları
title_en: Sample interview scenarios
summary: FDE mülakatlarında sık görülen senaryo türleri ve yapılandırılmış cevap yaklaşımı.
status: complete
order: 19
duration: 30 dk
level: Orta
tags:
- fde
relations:
  part_of:
  - fde-path
last_verified: '2026-10-18'
version: 1
---

> Bu senaryolar eğitim amaçlı örneklerdir; belirli bir şirketin mülakat sorusu oldukları iddia edilmez.

## Senaryo 1 — Belirsiz problem

"Bir lojistik müşterisi teslimat gecikmelerini azaltmak istiyor. İlk iki haftanızı nasıl planlarsınız?"

**Yaklaşım:** Paydaşlar → mevcut süreç gözlemi → veri haritası → başarı metriği (ör. zamanında teslim oranı) → baseline → en ince dikey dilim planı → riskler.

## Senaryo 2 — Teknik derinlik

"Müşterinin veritabanına bağlanan bir soru-cevap asistanı tasarlayın."

**Konuşulması gerekenler:** okuma-yalnız erişim, sorgu şablonları, maskeleme, denetim izi, değerlendirme seti, gecikme, prompt injection.

## Senaryo 3 — Çatışma

"Müşteri, güvenlik ekibinin onaylamadığı bir veri aktarımını istiyor."

**Yaklaşım:** Kuralı delmeyin; güvenlik ekibiyle alternatif tasarım (veriyi taşımak yerine işlemi veriye götürmek, anonimleştirme).

## Senaryo 4 — Debug

"Dün çalışan entegrasyon bugün boş sonuç dönüyor."

**Yaklaşım:** Değişiklik ne? (deploy, şema, yetki, veri gelmedi mi?) → log ve metrikler → küçük reprodüksiyon → düzeltme → alarm ekle.
