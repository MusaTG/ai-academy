---
id: ai-engineer
type: career
title: AI Engineer
title_en: AI Engineer
summary: Makine öğrenmesi ve büyük dil modellerini gerçek ürünlere ve iş akışlarına dönüştüren; model kadar veri, değerlendirme ve sistem tasarımından sorumlu mühendis.
status: complete
group: AI & Araştırma
order: 2
level: Başlangıç → İleri
aliases: [Yapay Zekâ Mühendisi, AI Mühendisi]
alt_titles: [Applied AI Engineer, ML/AI Engineer, GenAI Engineer]
tags: [ai, ml, llm, üretim]
relations:
  used_in_sector: [banking, healthcare, manufacturing, ecommerce, agriculture-environment, robotics-autonomy]
  used_with: [ml-engineer, data-engineer]
sources:
  - { title: "OWASP GenAI Security Project", url: "https://genai.owasp.org", kind: community, lang: en }
  - { title: "scikit-learn — Model evaluation", url: "https://scikit-learn.org/stable/modules/model_evaluation.html", kind: official-docs, lang: en }
last_verified: 2026-10-18
version: 1
---

> Unvan şirketten şirkete çok farklı kullanılır: bazı yerlerde model eğiten bir ML mühendisi, bazı yerlerde LLM tabanlı ürün geliştiren bir yazılım mühendisi anlamına gelir. Bu sayfa ortak çekirdeği anlatır.

## Mesleğin temel amacı {#purpose}

Bir iş problemini, ölçülebilir biçimde çözen ve üretimde güvenilir çalışan bir AI sistemine dönüştürmek. Model seçimi işin yalnızca bir parçasıdır; **veri, değerlendirme, entegrasyon, maliyet ve güvenlik** en az onun kadar önemlidir.

## Günlük iş akışı {#daily}

Hata analizi (modelin yanlış yaptığı örneklere bakmak) → deney tasarımı → kod (veri hazırlama, eğitim veya prompt/RAG değişikliği) → değerlendirme setinde ölçüm → ekip ve ürünle paylaşım → üretim metriklerini izleme.

## Gerçek görev ve sorumluluklar {#responsibilities}

- Problem tanımı ve başarı metriği (ürünle birlikte).
- Veri toplama, temizleme ve etiketleme süreçlerinin tasarımı.
- Baseline ve model/yaklaşım seçimi; deneyler.
- Değerlendirme setleri ve regresyon testleri.
- Model servisleme, izleme ve iyileştirme.
- Güvenlik: prompt injection, veri sızıntısı, yetki sınırları.

## Kullanılan araçlar ve teknolojiler {#tools}

Python, PyTorch veya benzeri çerçeveler, scikit-learn, veri araçları (SQL, dataframe), deney takibi, LLM API'leri veya açık modeller, vektör arama, konteyner ve bulut, CI.

## Gereken teknik bilgi {#tech-skills}

Olasılık ve istatistik, temel lineer cebir, [[Gradient Descent]] ve kayıp fonksiyonları ([[Cross-Entropy]]), değerlendirme metrikleri ([[Precision ve Recall]], [[F1 Score]], [[ROC-AUC]]), [[Data Leakage]] ve [[Class Imbalance]] gibi tuzaklar, yazılım mühendisliği (test, sürümleme).

## İletişim ve iş becerileri {#soft-skills}

Belirsizliği açıkça söyleyebilmek ("bu metrik X durumunda yanıltıcı"), iş hedefini teknik metriğe çevirebilmek, deney sonuçlarını dürüst raporlamak.

## Matematik veya bilim altyapısı {#science}

Türev ve zincir kuralı, olasılık dağılımları, optimizasyon, bilgi teorisi temelleri (entropi, çapraz entropi), istatistiksel test. Başlangıç: [[ai-foundations-path|AI Engineer başlangıç yolu]].

## Üretilen çıktılar {#outputs}

Model veya LLM tabanlı servisler, değerlendirme setleri ve raporları, deney kayıtları, veri pipeline'ları, izleme panoları, model kartları (model card).

## Başarı ölçütleri ve KPI'lar {#kpis}

İş metriği (müşterinin veya ürünün KPI'ı), model metriği (görev metriği), sistem metriği (gecikme, maliyet, hata oranı), güvenilirlik (regresyon olmadan yayın).

## Diğer ekiplerle ilişki {#teams}

Ürün yönetimi, [[Data Engineer]] (veri), [[MLOps Engineer]] (üretim), güvenlik ([[Security Engineer]]), alan uzmanları (ör. klinisyen, risk analisti), müşteri projelerinde [[Forward Deployed Engineer]].

## Sık karşılaşılan problemler {#problems}

Eğitimde iyi, üretimde kötü performans; veri sızıntısı; etiket gürültüsü; dağılım kayması; LLM halüsinasyonu; maliyetin beklenenden yüksek olması.

## Problem çözme yöntemleri {#problem-solving}

Sistematik teşhis: problemi tanımla → baseline → veri ve etiket kalitesi → train/val/test ayrımı ve sızıntı kontrolü → hata örneklerini sınıflandır → en düşük maliyetli deney → doğrula → izle. Her sorun fine-tuning ile çözülmez; önce problemin veri, değerlendirme, retrieval veya sistem tasarımı kaynaklı olup olmadığını ayırın.

## Örnek projeler {#projects}

[[iou-dice-metrics|IoU/Dice metrikleri]], [[transaction-anomaly-detection|işlem anomali tespiti]], [[canny-edge-numpy|Canny'yi sıfırdan uygulama]], [[fde-safe-db-assistant|güvenli veritabanı asistanı]].

## Öğrenme yol haritası {#roadmap}

[[ai-foundations-path|AI Engineer başlangıç yolu]] → sektör seçimi ([[banking-path|bankacılık]] gibi) → sektöre özgü problemler ve vaka çalışmaları.

## Junior, mid-level ve senior farkları {#levels}

| Seviye | Beklenti |
|---|---|
| Junior | Tanımlı deneyleri doğru yürütmek, metrikleri doğru hesaplamak |
| Mid-level | Bir problemi uçtan uca sahiplenmek; teşhis ve iyileştirme planı kurmak |
| Senior | Sistem tasarımı, değerlendirme stratejisi, ekipler arası teknik yön, risk yönetimi |

## Kariyer geçiş yolları {#transitions}

Yazılım mühendisliğinden, veri biliminden veya araştırmadan gelinir. Gidilen roller: [[ML Engineer]], [[MLOps Engineer]], [[Forward Deployed Engineer]], araştırma mühendisliği, teknik liderlik.

### Sektöre göre AI Engineer nasıl farklılaşır?

| Sektör | Tipik problem | Farklılaşan beceri |
|---|---|---|
| [[banking\|Bankacılık]] | Fraud, kredi riski, belge işleme | Açıklanabilirlik, model risk yönetimi, gecikme bütçesi |
| [[healthcare\|Sağlık]] | Görüntü segmentasyonu, klinik metin | Klinik doğrulama, mevzuat, mahremiyet |
| [[manufacturing\|Üretim]] | Görsel kusur tespiti, bakım | Edge çıkarım, az kusur örneği |
| [[ecommerce\|E-ticaret]] | Arama, öneri, talep | A/B test, ölçek, nedensel ölçüm |
| [[agriculture-environment\|Tarım]] | Uydu/drone görüntüsü | Uzaktan algılama, coğrafi veri |
| [[robotics-autonomy\|Robotik]] | Algılama, planlama | Gerçek zamanlılık, güvenlik doğrulaması |
