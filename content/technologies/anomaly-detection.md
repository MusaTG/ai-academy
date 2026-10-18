---
id: anomaly-detection
type: technology
title: Anomaly Detection
title_en: Anomaly Detection
summary: Verinin "normal" davranışını öğrenip ondan anlamlı biçimde sapan örnekleri bulma; bankacılıktan üretime, ağ güvenliğinden sağlığa ortak bir yöntem ailesi.
status: complete
group: Ortak teknolojiler
level: Orta
aliases: [Anomali Tespiti, Outlier Detection, Aykırı Değer Tespiti]
tags: [anomali, denetimsiz-öğrenme, izleme]
relations:
  used_in_sector: [banking, manufacturing, cybersecurity, healthcare, energy-climate, telecom]
  evaluated_with: [pr-auc, roc-auc, precision-recall]
  used_with: [time-series-forecasting, graph-learning]
  required_in_career: [ai-engineer, security-engineer]
sources:
  - { title: "Chandola, Banerjee, Kumar (2009). Anomaly Detection: A Survey. ACM Computing Surveys", url: "https://doi.org/10.1145/1541880.1541882", kind: peer-reviewed, lang: en }
  - { title: "Liu, Ting, Zhou (2008). Isolation Forest. ICDM", url: "https://doi.org/10.1109/ICDM.2008.17", kind: peer-reviewed, lang: en }
  - { title: "Roth et al. (2021). Towards Total Recall in Industrial Anomaly Detection (PatchCore)", url: "https://arxiv.org/abs/2106.08265", kind: preprint, lang: en }
  - { title: "MVTec AD — endüstriyel anomali tespiti veri seti", url: "https://www.mvtec.com/company/research/datasets/mvtec-ad", kind: official-docs, lang: en }
  - { title: "scikit-learn: IsolationForest", url: "https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Her sabah aynı saatte aynı otobüse binen bir komşunuz düşünün. Bir gün gece 3'te havaalanına gidiyorsa bu **alışılmadık**tır — ama mutlaka kötü değildir; tatile gidiyor olabilir. Anomali tespiti tam olarak budur: **önce "normal"i öğren, sonra normalden sapanı işaretle; sapmanın kötü olup olmadığına ise bağlam karar versin.**

Üç tür anomali ayırt edilir:

- **Nokta anomalisi:** Tek başına tuhaf bir örnek (ör. normalden 50 kat büyük bir işlem).
- **Bağlamsal anomali:** Bağlamında tuhaf (ör. Temmuz'da normal olan sıcaklığın Ocak'ta görülmesi).
- **Toplu (collective) anomali:** Tek tek normal görünen, birlikte tuhaf olan örnekler (ör. birçok hesaptan aynı hesaba küçük transferler).

## Nasıl çalışır? {#how}

Yöntemleri, eldeki **etiket** miktarına göre gruplamak en pratik yoldur:

| Yaklaşım | Etiket | Örnek yöntemler | Ne zaman? |
|---|---|---|---|
| İstatistiksel | Yok | z-score, robust z-score (median/MAD), çeyrekler açıklığı | Az boyut, hızlı başlangıç |
| Denetimsiz | Yok | [[Isolation Forest]], LOF, One-Class SVM | Etiket yok, çok boyutlu tablo verisi |
| Yeniden oluşturma tabanlı | Yalnız normal örnekler | [[Autoencoder]], VAE | Görüntü, sinyal; "normal" bol |
| Gömme (embedding) tabanlı | Yalnız normal örnekler | PatchCore, PaDiM, DINO özellikleri + k-NN | Endüstriyel görüntü kusuru |
| Tahmin tabanlı | Yok | Zaman serisi tahmini + kalıntı (residual) analizi | Sensör, trafik, talep: [[Time-Series Forecasting]] |
| Denetimli | Var | Gradient boosting, sinir ağları | Etiket yeterli ve güvenilirse |

**Robust z-score** en basit ve en öğretici başlangıçtır. Ortalama ve standart sapma aykırı değerlerden etkilendiği için medyan ve MAD (median absolute deviation) kullanılır:

$$
z_i = \frac{0.6745\,(x_i - \operatorname{median}(x))}{\operatorname{MAD}(x)}, \qquad \operatorname{MAD}(x) = \operatorname{median}(|x_i - \operatorname{median}(x)|)
$$

0,6745 katsayısı, normal dağılımda MAD'i standart sapmayla karşılaştırılabilir kılar. Yaygın bir kural $|z_i| > 3.5$ eşiğidir — ama eşik her zaman **maliyet ve kapasiteye** göre yeniden seçilmelidir.

**Isolation Forest** ise "anomaliler azdır ve farklıdır, bu yüzden rastgele bölmelerle **daha çabuk izole edilirler**" fikrine dayanır. Bir örneği izole etmek için gereken ortalama bölme sayısı (yol uzunluğu) ne kadar kısaysa, örnek o kadar anomaliktir. Sıfırdan uygulama: [[transaction-anomaly-detection|İşlem verisinde anomali tespiti tutorial'ı]].

## Sektöre göre neler değişir? {#sector-variation}

Aynı yöntem ailesi her sektörde kullanılır; ama **varsayımlar, metrikler ve kısıtlar** aynı değildir. Bir sektörde işe yarayan çözümü diğerine doğrudan taşımak yanlış sonuç verir.

| Sektör | Tipik veri | "Anomali" ne demek? | Etiket durumu | Hata maliyeti | Kritik kısıt |
|---|---|---|---|---|---|
| [[banking\|Bankacılık]] | Kart/transfer işlemleri | Dolandırıcılık, aklama | Gecikmeli ve gürültülü (chargeback haftalar sonra) | FN: doğrudan para kaybı; FP: müşteri kaybı | Otorizasyon gecikme bütçesi, açıklanabilirlik, denetim |
| [[manufacturing\|Üretim]] | Ürün görüntüleri, sensörler | Kusurlu parça, arızaya giden makine | Kusur örneği çok az; normal bol | FN: hatalı ürün müşteriye gider; FP: gereksiz hurda/duruş | Hat hızında çıkarım (edge), aydınlatma/kamera değişimi |
| [[cybersecurity\|Ağ güvenliği]] | Ağ akışları, loglar | Saldırı, yetkisiz erişim, veri sızdırma | Saldırgan uyum sağlar; etiket nadir | FN: ihlal; FP: alarm yorgunluğu (SOC ekibi) | Çok yüksek hacim, düşmanca (adversarial) ortam |
| [[healthcare\|Sağlık]] | Vital bulgular, EKG, laboratuvar, görüntü | Klinik kötüleşme, aritmi, nadir bulgu | Uzman etiketi pahalı, kurumlar arası farklı | FN: hasta güvenliği; FP: alarm yorgunluğu | Klinik doğrulama, mevzuat, hasta verisi gizliliği |
| [[energy-climate\|Enerji]] | Sayaç ve şebeke zaman serileri | Arıza, kaçak kullanım, sensör hatası | Kısmi | Arıza süresi, kaçak kayıp | Mevsimsellik, hava durumu etkisi |
| [[telecom\|Telekom]] | KPI ve trafik zaman serileri | Baz istasyonu arızası, trafik anomalisi | Kısmi (olay kayıtları) | Hizmet kesintisi | Binlerce hücre için ölçeklenme |

**Ortak ders:** Anomali tespitinin çıktısı nadiren nihai karardır. Bankacılıkta analist kuyruğunu, üretimde operatör ekranını, güvenlikte SOC kuyruğunu, sağlıkta klinisyen alarmını besler. Bu yüzden eşik, **o kuyruğu inceleyecek insanların kapasitesine** göre seçilir.

## Değerlendirme {#metrics}

- Pozitif oranı çok düşük olduğu için [[PR-AUC]] ve belirli bir yanlış pozitif oranındaki recall, [[ROC-AUC]]'den daha bilgilendiricidir.
- **Precision@k:** "Her gün inceleyebildiğimiz 100 alarmın kaçı gerçek?" — kapasite odaklı en pratik metrik.
- Endüstriyel görüntüde görüntü seviyesinde AUROC'un yanında piksel seviyesinde metrikler (ör. PRO) kullanılır.
- Etiketsiz ortamda bile küçük, elle doğrulanmış bir değerlendirme seti oluşturun; aksi hâlde iyileşme iddiası ölçülemez.

## Hata analizi ve tuzaklar {#failure-modes}

- **"Farklı" ≠ "kötü":** Kampanya günü, yeni ürün, bayram trafiği anomali görünür. Bağlamsal özellikler (takvim, kampanya) ekleyin.
- **Kirli "normal" veri:** Eğitim setinde fark edilmemiş anomaliler varsa model onları normal öğrenir.
- **Kavram kayması:** Normalin kendisi zamanla değişir; eşikler ve modeller izlenmelidir.
- **Ölçek ve birim:** Mesafe tabanlı yöntemler özellik ölçeğine duyarlıdır; normalleştirme şarttır.
- **Düşmanca uyum:** Fraud ve güvenlikte karşı taraf modeli öğrenir; tek bir statik model yeterli değildir.

## Bağlantılar {#related}

- Yöntemler: [[Isolation Forest]], [[Autoencoder]], [[Time-Series Forecasting]], [[Graph Learning]].
- Metrikler: [[Precision ve Recall]], [[PR-AUC]], [[ROC-AUC]].
- Uygulama: [[transaction-anomaly-detection|İşlem verisinde anomali tespiti]].
- Meslekler: [[AI Engineer]], [[Security Engineer]].
