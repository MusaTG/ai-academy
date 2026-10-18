---
id: fde-customer-db-assistant
type: case-study
title: "FDE vakası: Müşteri veritabanına bağlanan AI asistanı"
title_en: "FDE case: AI assistant connected to a customer database"
summary: Bir bankanın kart itiraz ekibi için, kurum içi veritabanına güvenli bağlanan bir AI asistanının gereksinimden üretime 12 haftalık yolculuğu.
status: complete
evidence: hypothetical
level: Orta
tags: [fde, vaka, güvenlik, bankacılık]
relations:
  used_in_sector: [banking, cybersecurity]
  required_in_career: [forward-deployed-engineer]
  used_with: [fde-safe-db-assistant, privacy-engineering]
sources:
  - { title: "TechTarget — When should you adopt the forward-deployed model?", url: "https://www.techtarget.com/searchapparchitecture/tip/When-should-you-adopt-the-forward-deployed-model", kind: community, lang: en }
last_verified: 2026-10-18
version: 1
---

> **Kanıt düzeyi: Varsayımsal eğitim senaryosu.** Bu vaka belirli bir şirketin gerçek projesi değildir. Kurgu, FDE rolünü anlatan kaynaklardaki genel çalışma modeline ve yaygın mühendislik uygulamalarına dayanır; sayılar öğretici amaçlı seçilmiştir. "Şirket X bunu yaptı" iddiası taşımaz.

## Problem ve iş hedefi {#problem}

Bir bankanın kart itiraz (chargeback) ekibinde 12 analist çalışıyor. Her itiraz için müşteri bilgisi, işlem geçmişi ve önceki itirazlar dört ayrı ekrandan toplanıyor; analist başına itiraz süresi ortalama **25 dakika**. Banka, bir AI şirketinden "analistlerin doğal dilde soru sorabildiği bir asistan" istiyor.

**FDE'nin netleştirdiği hedef:** 8 haftalık pilotta itiraz başına süreyi **10 dakikaya** indirmek; kişisel veri banka dışına çıkmadan ve asistan hiçbir veriyi değiştiremeden.

## Bağlam ve kısıtlar {#context}

- **Veri:** Kurum içi ilişkisel veritabanı (müşteriler, işlemler, itirazlar); sistemler 10+ yıllık.
- **Güvenlik:** Üretim verisine yalnızca okuma; kişisel veri kurum ağından çıkamaz; tüm erişimler denetlenebilir olmalı.
- **Teknik:** Paket kurulumu onaya tabi; internet erişimi kısıtlı; LLM kullanılacaksa kurum içi barındırılan bir modelle veya onaylı bir uç noktayla.
- **Organizasyon:** Uyum ekibi ve bilgi güvenliği ekibinin onayı gerekli; iç şampiyon olarak itiraz ekibinin takım lideri belirlendi.

## Yaklaşım {#approach}

| Hafta | Aşama | Yapılanlar | Ders |
|---|---|---|---|
| 1–2 | Keşif | 6 analisti gerçek itirazlar üzerinde izleme; en sık sorulan 5 soru türünü çıkarma; baseline ölçümü | [[fde-05-interviews\|5]], [[fde-06-systems-discovery\|6]] |
| 3–4 | Prototip | Okuma-yalnız bağlantı, 5 niyet için parametreli sorgular, maskeleme, denetim kaydı | [[fde-07-rapid-prototyping\|7]], [[fde-10-security-boundaries\|10]] |
| 5 | Değerlendirme | 60 soruluk değerlendirme seti (reddedilmesi gerekenler dahil) | [[fde-16-success-metrics\|16]] |
| 6–8 | Pilot | 4 analistle sınırlı kullanım; haftalık demo ve geri bildirim | [[fde-11-demo\|11]] |
| 9–11 | Üretim | SSO entegrasyonu, izleme, runbook, güvenlik incelemesi | [[fde-09-integrations\|9]], [[fde-12-production\|12]] |
| 12 | Devir | Eğitim, dokümantasyon, ürün ekibine saha raporu | [[fde-14-feedback-loop\|14]] |

**Kritik tasarım kararı:** Dil modeli **SQL yazmaz**. Model yalnızca soruyu desteklenen niyetlerden birine ve parametrelerine eşler; SQL, önceden yazılmış ve incelenmiş şablonlardan gelir. Bu karar prototipin ilk gününde verildi çünkü geri dönüş maliyeti en yüksek karardı ([[fde-13-speed-vs-architecture|Ders 13]]). Çalıştırılabilir küçük sürümü: [[fde-safe-db-assistant|tutorial]].

**Pilotta çıkan beklenmedik sorunlar (senaryo):**

1. Şehir adlarında Türkçe büyük/küçük harf hataları (İZMİR/ızmir) — değerlendirme setine eklendi.
2. Analistler desteklenmeyen sorular sordu ("bu müşterinin başka kartı var mı?") — reddetme mesajı desteklenen soruları listeleyecek şekilde değiştirildi; en sık istenen iki soru yeni niyet olarak eklendi.
3. Denetim kaydı ilk sürümde soruların tam metnini tutuyordu ve bazı sorular kişisel veri içeriyordu — kayıt politikası uyum ekibiyle yeniden tasarlandı.

## Sonuçlar ve ödünleşimler {#results}

*(Senaryo sonuçları — öğretici amaçlı.)*

| Metrik | Baseline | Hedef | Pilot sonu |
|---|---|---|---|
| İtiraz başına süre | 25 dk | 10 dk | 13 dk |
| Haftalık aktif analist | – | 12 | 10 |
| Değerlendirme seti niyet doğruluğu | – | ≥ %95 | %97 |
| Yetkisiz veri erişimi | – | 0 | 0 |

**Ödünleşimler:** Serbest SQL üreten bir sistem daha fazla soruyu yanıtlayabilirdi, ama güvenlik onayı alamazdı. Niyet tabanlı tasarım daha dar ama denetlenebilir ve genişletilebilir. Hedef süreye tam ulaşılamadı; kalan sürenin büyük kısmı asistanın kapsamadığı manuel belge incelemesinden geliyordu — bu, sonraki faz için [[OCR]] tabanlı belge işleme önerisine dönüştü.

**Bugün yeniden tasarlansaydı:** Değerlendirme seti keşif haftasında, gerçek analist sorularından oluşturulurdu; denetim kaydı politikası ilk günden uyum ekibiyle yazılırdı.

## Kanıt düzeyi {#evidence}

- **Varsayımsal:** Banka, ekip, sayılar ve olay akışı.
- **Kaynakla desteklenen genel bilgi:** FDE'nin müşteri ortamında çalışan, belirsiz gereksinimi çalışan sisteme dönüştüren mühendis olması (kaynak sayfa sonunda).
- **Genel mühendislik uygulaması:** Okuma-yalnız erişim, parametreli sorgular, en az yetki, denetim kaydı — yaygın güvenli tasarım ilkeleri; bu platformdaki tutorial'da testlerle gösterilmiştir.
