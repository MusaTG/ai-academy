---
id: kyc-aml
type: concept
title: KYC ve AML
title_en: KYC & AML
summary: Müşteriyi tanıma ve suç gelirlerinin aklanmasını önleme; finans kurumlarının yasal yükümlülüklerini teknik sistemlere dönüştüren süreçler.
status: complete
level: Başlangıç
aliases: [KYC, AML, Müşteriyi Tanı, Kara Para Aklamayla Mücadele]
tags: [uyum, mevzuat, bankacılık]
relations:
  used_in_sector: [banking]
  used_with: [graph-learning, ocr]
sources:
  - { title: "MASAK — Mali Suçları Araştırma Kurulu", url: "https://masak.hmb.gov.tr", kind: standard, lang: tr }
  - { title: "FATF — Financial Action Task Force", url: "https://www.fatf-gafi.org", kind: standard, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

**KYC:** "Bu müşteri gerçekten iddia ettiği kişi mi ve risk profili ne?" **AML:** "Bu para hareketleri suç gelirini gizlemeye yönelik olabilir mi?"

## Neden gerekli? {#why}

Finans kurumları mevzuat gereği müşterilerini tanımak ve şüpheli işlemleri yetkili kuruma (Türkiye'de MASAK) bildirmek zorundadır. Yükümlülüklerin ayrıntısı ülkeye ve tarihe göre değişir; resmî kaynaklara bakın.

## Matematik {#math}

AML alarm sistemlerinde verimlilik genellikle alarm başına gerçek şüphe oranıyla ölçülür: $\text{verim} = \frac{\text{bildirime dönüşen alarm}}{\text{toplam alarm}}$. Çoğu sistemde bu oran düşüktür; ML'nin tipik katkısı alarmları **önceliklendirmektir**.

## Elle hesaplama {#example}

Ayda 10.000 alarm, 200'ü bildirime dönüşüyor → verim %2. Önceliklendirme modeliyle analistler en riskli 3.000 alarma bakıp 170 bildirim yakalıyorsa: verim %5,7, iş yükü %70 azalır, ama 30 vaka kaçar — bu ödünleşim **uyum ekibiyle birlikte** kararlaştırılmalıdır.

## Hata analizi {#failure-modes}

Senaryo kurallarının aşırı alarm üretmesi, isim eşleştirmede Türkçe karakter ve transliterasyon sorunları (yaptırım listesi taraması), [[OCR]] hataları (kimlik belgesi), para transfer ağlarını tek tek işlemlerde görememek ([[Graph Learning]]).

## Özet {#summary}

KYC/AML'de model kararı değil, **önceliklendirme ve açıklanabilir gerekçe** üretir; son karar ve sorumluluk uyum ekibindedir.
