---
id: cybersecurity
type: sector
title: Siber Güvenlik ve Gizlilik
title_en: Cybersecurity & Privacy
summary: Sistemleri, verileri ve kullanıcıları saldırılara karşı korumak; ağ güvenliğinden uygulama güvenliğine, olay müdahalesinden AI sistemlerinin güvenliğine.
status: complete
group: Teknoloji
order: 4
level: Başlangıç → İleri
tags: [güvenlik, ağ-güvenliği, siem, llm-güvenliği]
aliases: [Siber Güvenlik, Ağ Güvenliği, Network Security, Cybersecurity]
relations:
  used_with: [software-infrastructure, telecom]
sources:
  - { title: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework", kind: standard, lang: en }
  - { title: "MITRE ATT&CK", url: "https://attack.mitre.org", kind: standard, lang: en }
  - { title: "OWASP GenAI Security Project", url: "https://genai.owasp.org", kind: community, lang: en }
last_verified: 2026-10-18
version: 1
---

> Bu sayfadaki tüm uygulamalar **savunma** amaçlıdır ve yalnızca yetkiniz olan, kontrollü laboratuvar ortamlarında denenmelidir.

## Sektörün temel işleyişi {#overview}

Güvenlik üç hedef etrafında düşünülür: **gizlilik (confidentiality)**, **bütünlük (integrity)** ve **erişilebilirlik (availability)** — CIA üçlüsü. Kurumlar riskleri belirler, önlem alır (koruma), saldırıları tespit eder, müdahale eder ve toparlanır. NIST Cybersecurity Framework bu döngüyü yaygın kullanılan bir çerçeveye oturtur.

## Temel kavramlar ve terminoloji {#terminology}

Tehdit modelleme, saldırı yüzeyi, kimlik doğrulama/yetkilendirme, en az yetki, SIEM (log toplama ve korelasyon), IDS/IPS (saldırı tespit/önleme), SOC (güvenlik operasyon merkezi), olay müdahalesi, zafiyet yönetimi, MITRE ATT&CK (saldırgan teknikleri kataloğu).

## Değer zinciri ve iş süreçleri {#value-chain}

Varlık envanteri → risk analizi → kontroller (ağ, uç nokta, kimlik, uygulama) → izleme (log, ağ akışı) → alarm → triyaj → müdahale → olay sonrası analiz → kontrollerin iyileştirilmesi.

## Önemli meslekler ve ekipler {#roles}

[[Security Engineer]], SOC analistleri, olay müdahale ekipleri, uygulama güvenliği mühendisleri, ağ mühendisleri, privacy engineer'lar ([[Privacy Engineering]]), kırmızı takım (yetkili saldırı simülasyonu).

## Kullanılan yazılım ve donanım {#tools}

Güvenlik duvarları, SIEM, EDR (uç nokta tespit ve müdahale), kimlik sağlayıcılar (SSO/MFA), zafiyet tarayıcılar, gizli bilgi yönetimi (secret manager), bağımlılık tarama araçları.

## Veri türleri ve veri kaynakları {#data}

Ağ akış kayıtları, güvenlik duvarı ve DNS log'ları, kimlik doğrulama olayları, uç nokta telemetrisi, uygulama log'ları. Hacim çok yüksek, etiketli saldırı örneği çok azdır.

## Matematiksel ve bilimsel altyapı {#science}

Kriptografi temelleri (hash, simetrik/asimetrik şifreleme, dijital imza), olasılık ve istatistik (alarm eşikleri), graf teorisi (yanal hareket), ağ protokolleri.

## AI ve otomasyon kullanım alanları {#ai-uses}

Ağ ve kullanıcı davranışında [[Anomaly Detection]], alarm önceliklendirme, kimlik ele geçirme tespiti, oltalama (phishing) sınıflandırma, log özetleme; ayrıca **AI sistemlerinin kendisinin güvenliği** (prompt injection, model çalma, veri zehirleme).

## Sektörün kendi algoritmaları ve yöntemleri {#methods}

İmza tabanlı tespit (bilinen saldırılar) + davranış tabanlı tespit (bilinmeyenler), UEBA (kullanıcı ve varlık davranış analitiği), [[Graph Learning]] ile oturum açma grafları, kural korelasyonu.

## Başarı metrikleri ve KPI'lar {#metrics}

Tespit süresi (MTTD), müdahale süresi (MTTR), alarm başına gerçek olay oranı, kapsanan ATT&CK teknikleri, yamanma süresi. Model tarafında yanlış pozitif oranı kritik: SOC kapasitesi sınırlıdır.

## Operasyonel ve teknik problemler {#problems}

Alarm yorgunluğu, düşmanca uyum (saldırgan tespit sistemini öğrenir), log kalitesi ve eksik görünürlük, bulut ve konteyner ortamlarının hızlı değişimi, tedarik zinciri saldırıları.

## Güvenlik, gizlilik ve mevzuat {#regulation}

Kişisel veri mevzuatı (KVKK/GDPR) ihlal bildirim yükümlülükleri, sektörel düzenlemeler (finans, sağlık, kritik altyapı). Güvenlik izleme ile çalışan gizliliği arasında denge: [[Privacy Engineering]].

## Gerçek dünya vaka çalışmaları {#case-studies}

[[fde-customer-db-assistant|AI asistanının veri erişim sınırları]] vakası, LLM tabanlı sistemlerde güvenlik tasarımını örnekler. *(Kapsam notu: ağ güvenliği olay vakası henüz eklenmedi.)*

## Örnek projeler ve tutorial'lar {#projects}

1. [[fde-safe-db-assistant|Okuma-yalnız, maskeli veritabanı asistanı]] — yetki sınırlarının testlerle doğrulanması.
2. Örnek ağ akış verisinde robust z-score ile anormal trafik tespiti ([[transaction-anomaly-detection|anomali tutorial'ı]] yöntemleriyle).

## İleri araştırma kaynakları {#research}

MITRE ATT&CK, NIST CSF, OWASP GenAI güvenlik projesi (kaynaklar sayfa sonunda).

## İlgili meslek ve sektör bağlantıları {#related}

Sektörler: [[banking|Bankacılık]], [[healthcare|Sağlık]], [[software-infrastructure|Yazılım altyapısı]], [[telecom|Telekom]]. Teknolojiler: [[Anomaly Detection]], [[Graph Learning]], [[Privacy Engineering]]. Meslekler: [[Security Engineer]].
