---
id: shannon-capacity
type: formula
title: Shannon kapasitesi
title_en: Shannon–Hartley channel capacity
summary: Belirli bant genişliği ve sinyal/gürültü oranına sahip bir kanaldan hatasız iletilebilecek teorik en yüksek veri hızı.
status: complete
level: Orta
aliases: [Shannon-Hartley, Kanal Kapasitesi, Channel Capacity]
tags: [telekom, bilgi-teorisi]
relations:
  used_in_sector: [telecom]
  used_with: [signal-processing]
sources:
  - { title: "Shannon (1948). A Mathematical Theory of Communication", url: "https://doi.org/10.1002/j.1538-7305.1948.tb01338.x", kind: peer-reviewed, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Bir boruya ne kadar su sığar? Borunun genişliğine (bant genişliği) ve suyun ne kadar temiz aktığına (gürültü) bağlıdır. Shannon kapasitesi, bir iletişim kanalının "boru kapasitesini" verir.

## Neden gerekli? {#why}

Kablosuz sistem tasarımında ulaşılabilecek üst sınırı bilmek, yatırımın (daha fazla spektrum mu, daha iyi SNR mı?) nereye yapılacağını belirler.

## Matematik {#math}

Toplamsal beyaz Gauss gürültülü kanal için:

$$
C = B \log_2\!\left(1 + \frac{S}{N}\right)
$$

$C$ bit/s, $B$ Hz cinsinden bant genişliği, $S/N$ doğrusal (dB değil) sinyal/gürültü oranı.

## Elle hesaplama {#example}

$B = 20$ MHz, SNR = 20 dB → doğrusal $10^{20/10} = 100$. $C = 20\cdot10^6 \cdot \log_2(101) \approx 20\cdot10^6 \cdot 6{,}66 \approx 133$ Mbit/s.

## Hata analizi {#failure-modes}

dB değerini doğrudan formüle koymak en sık hatadır. Formül tek antenli, Gauss gürültülü idealize bir kanal içindir; çok antenli sistemler ve gerçek kodlama kayıpları farklıdır.

## Özet {#summary}

Kapasite bant genişliğiyle doğrusal, SNR ile logaritmik artar. Bkz. [[Signal Processing]], [[telecom|Telekom]].
