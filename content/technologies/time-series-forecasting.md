---
id: time-series-forecasting
type: technology
title: Time-Series Forecasting
title_en: Time-Series Forecasting
summary: Zamana bağlı ölçümlerin geleceğini tahmin etme; finans, enerji, telekom ve lojistikte kapasite ve risk planlamanın temeli.
status: complete
group: Ortak teknolojiler
level: Orta
aliases: [Zaman Serisi Tahmini, Forecasting]
tags: [zaman-serisi, tahmin, planlama]
relations:
  used_in_sector: [banking, energy-climate, telecom, ecommerce, manufacturing]
  used_with: [anomaly-detection]
sources:
  - { title: "Hyndman & Athanasopoulos — Forecasting: Principles and Practice (3. baskı, açık erişim)", url: "https://otexts.com/fpp3/", kind: book, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Yarın bir markete kaç ekmek gerekir? Dünün satışına, haftanın gününe, havaya ve bayrama bakarsınız. Zaman serisi tahmini bu sezgiyi sistematik hâle getirir: geçmiş değerlerdeki **trend**, **mevsimsellik** ve **dışsal etkileri** modelleyip geleceği — tercihen bir **belirsizlik aralığıyla** — tahmin eder.

## Nasıl çalışır? {#how}

1. **Basit baseline'lar:** son değer (naive), geçen haftanın aynı günü (seasonal naive). Her modelin önce bunları geçmesi gerekir.
2. **İstatistiksel modeller:** üstel düzeltme (ETS), ARIMA ailesi; az veriyle güçlü ve yorumlanabilir.
3. **Makine öğrenmesi:** gecikmeli (lag) özellikler + gradient boosting; dışsal değişkenleri (hava, kampanya) kolayca ekler.
4. **Derin öğrenme ve hazır temel modeller:** çok sayıda benzer seri olduğunda faydalı olabilir; her zaman baseline ile karşılaştırılmalı.

**Doğrulama:** Rastgele bölme yanlıştır; zaman sırasına uyan **kayan pencere (rolling origin)** doğrulaması kullanılır. Aksi hâlde gelecekten bilgi sızar ([[Data Leakage]]).

## Sektöre göre neler değişir? {#sector-variation}

| Sektör | Ne tahmin edilir? | Ufuk | Özel kısıt |
|---|---|---|---|
| [[banking\|Bankacılık]] | Likidite, ATM nakit ihtiyacı, işlem hacmi | Gün–hafta | Mevzuat raporlaması, stres senaryoları |
| [[energy-climate\|Enerji]] | Elektrik yükü, yenilenebilir üretim | Saat–gün | Hava durumu bağımlılığı, dengesizlik maliyeti |
| [[telecom\|Telekom]] | Hücre trafiği, kapasite | Saat–ay | Binlerce seri, olay etkileri |
| [[ecommerce\|E-ticaret]] | Talep, stok | Gün–sezon | Kampanya etkisi, yeni ürün (geçmişi yok) |
| [[manufacturing\|Üretim]] | Talep, makine sinyalleri | Vardiya–ay | Tedarik zinciri gecikmeleri |

## Değerlendirme {#metrics}

MAE, RMSE, MAPE (sıfıra yakın değerlerde yanıltıcı), sMAPE, MASE (ölçekten bağımsız, baseline'a göre). Olasılıksal tahminde aralık kapsama oranı ve pinball loss.

## Hata analizi ve tuzaklar {#failure-modes}

- Rastgele train/test bölmesi → iyimser sonuçlar.
- Rejim değişikliği (pandemi, regülasyon) geçmişi geçersiz kılar.
- Tahminde kullanılan dışsal değişkenin gelecekteki değeri de bilinmiyor olabilir (ör. hava durumu da bir tahmindir).
- Tek nokta tahmini yerine aralık verin; karar vericiler belirsizliği bilmelidir.

## Bağlantılar {#related}

[[Anomaly Detection]] (tahmin kalıntılarıyla anomali), [[Data Leakage]], sektörler: [[energy-climate|Enerji]], [[telecom|Telekom]].
