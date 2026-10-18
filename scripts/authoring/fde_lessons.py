# Tek seferlik yazım yardımcısı: FDE derslerini content/lessons/fde/ altına yazar.
import json, pathlib
OUT = pathlib.Path(__file__).resolve().parents[2] / "content" / "lessons" / "fde"
OUT.mkdir(parents=True, exist_ok=True)

L = []
def lesson(n, slug, title, title_en, summary, body, quiz=None, duration="30 dk"):
    L.append(dict(n=n, slug=slug, title=title, title_en=title_en, summary=summary, body=body.strip(), quiz=quiz or [], duration=duration))

lesson(1, "what-is-fde", "FDE nedir ve hangi problemlere çözüm üretir?", "What is an FDE?",
 "FDE rolünün ortaya çıkış nedeni: ürün ile müşterinin gerçek problemi arasındaki boşluğu kapatmak.", """
## Basit anlatım

Bir şirket güçlü bir yazılım ya da AI ürünü satıyor, ama müşterinin verisi dağınık, sistemleri eski ve problemi tam tanımlanmamış. Ürün "kutudan çıktığı gibi" çalışmıyor. **Forward Deployed Engineer (FDE)** bu boşluğu kapatmak için müşterinin yanına gönderilen mühendistir.

## Hangi problemleri çözer?

- **Entegrasyon boşluğu:** Ürün, müşterinin veritabanına, kimlik sistemine ve iş akışına bağlanmadan değer üretemez.
- **Gereksinim belirsizliği:** Müşteri ne istediğini tam bilmez; birlikte keşfetmek gerekir.
- **Güven boşluğu:** Özellikle AI'da, müşterinin kendi verisiyle çalışan bir sonuç görmeden yatırım yapması zordur.
- **Geri bildirim boşluğu:** Ürün ekibi sahadaki gerçek kullanımı göremez; FDE bu bilgiyi geri taşır.

## Nerede yaygın?

İncelenen kaynaklara göre model Palantir'de doğdu; son yıllarda büyük AI şirketleri ve veri platformu şirketleri de FDE ekipleri kurdu. Uygun olduğu durumlar: karmaşık ve özelleştirilmiş eski sistemler, belirsiz gereksinimler, sürekli değişen ihtiyaçlar ve güvenlik kısıtlı ortamlar.

## Ne zaman uygun değildir?

Ürün standart ve self-servis kurulabiliyorsa, her müşteriye mühendis göndermek pahalıdır ve ölçeklenmez. FDE modeli, yüksek değerli ve karmaşık müşteriler için mantıklıdır.

## Özet

FDE = müşteri ortamında, gerçek veriyle, üretime kadar sorumluluk alan mühendis. Satış öncesi demo değil, **teslimat** odaklıdır.
""", quiz=[
 {"q": "FDE'nin klasik ürün mühendisinden temel farkı nedir?", "options": ["Daha az kod yazması", "Belirli müşterilerin ortamında, onların gerçek verisi ve sistemleriyle çalışarak üretime kadar sorumluluk alması", "Yalnızca satış sunumu yapması", "Sadece altyapı yönetmesi"], "answer": 1, "explain": "FDE teslimat odaklıdır: müşteri ortamında çalışan sistemi üretime taşır."},
 {"q": "FDE modeli hangi durumda en az uygundur?", "options": ["Belirsiz gereksinimler", "Eski ve özelleştirilmiş sistemler", "Self-servis kurulabilen standart bir ürün", "Güvenlik kısıtlı ortam"], "answer": 2, "explain": "Standart, self-servis ürünlerde her müşteriye mühendis göndermek ölçeklenmez."}])

lesson(2, "role-differences", "FDE ile Software Engineer, Solutions Engineer, Consultant ve AI Engineer arasındaki farklar", "FDE vs related roles",
 "Benzer görünen rollerin sorumluluk, zamanlama ve çıktı farkları.", """
## Karşılaştırma tablosu

| Rol | Ne zaman devrede? | Ana çıktı | Üretim kodu yazar mı? | Sonuçtan sorumlu mu? |
|---|---|---|---|---|
| **Software Engineer** | Sürekli, ürün içinde | Genel ürün özellikleri | Evet | Ürün kalitesinden |
| **Solutions Engineer / Sales Engineer** | Satış öncesi | Teknik uygunluk kanıtı, demo | Nadiren | Satışın teknik başarısından |
| **Consultant (danışman)** | Proje bazlı | Öneri, tasarım, rapor | Çoğunlukla hayır | Önerinin kalitesinden |
| **AI Engineer** | Ürün veya müşteri projesi | Model/LLM tabanlı sistemler | Evet | Model ve sistem performansından |
| **FDE** | Sözleşme sonrası, müşteride | Müşteride çalışan sistem + ürüne geri bildirim | Evet | Müşterideki iş sonucundan |

## Kritik ayrımlar

- **FDE vs Solutions Engineer:** İncelenen kaynaklara göre Solutions Engineer satış öncesinde "olur mu?" sorusunu yanıtlar; FDE sözleşmeden sonra "olsun" der ve kurar.
- **FDE vs Consultant:** Danışman öneriyi verir ve ayrılır; FDE kodu yazar, devreye alır ve çalışana kadar kalır.
- **FDE vs AI Engineer:** Teknik beceriler örtüşür. Fark, FDE'nin müşteri bağlamına ve entegrasyona; AI Engineer'ın ise model/sistem kalitesine daha derin odaklanmasıdır. AI şirketlerindeki FDE rollerinde ikisi neredeyse birleşir.

## Neden önemli?

Mülakatta "bu rol size neden uygun?" sorusuna bu farkları bilerek cevap vermek, rolü gerçekten anladığınızı gösterir.
""", quiz=[
 {"q": "Sözleşme imzalandıktan sonra müşteride çalışan sistemi kurup üretime taşıyan rol hangisidir?", "options": ["Solutions Engineer", "Consultant", "Forward Deployed Engineer", "Sales Engineer"], "answer": 2, "explain": "Solutions/Sales Engineer satış öncesindedir; danışman öneri verir; FDE kurar ve üretime taşır."}])

lesson(3, "customer-environment", "Müşteri ortamında çalışma", "Working in the customer's environment",
 "Başkasının sistemlerinde, onların kurallarıyla ve sınırlı erişimle verimli çalışma.", """
## Gerçeklik

Müşteri ortamında çoğu zaman kendi dizüstü bilgisayarınızı kullanamazsınız, internet erişimi kısıtlıdır, paket kurmak için onay gerekir ve üretim verisine doğrudan erişim yoktur.

## Pratik kurallar

1. **İlk hafta erişim listesi çıkarın:** hangi sistem, hangi hesap, kim onaylıyor, ne kadar sürer?
2. **Ortam paritesi:** Müşteri ortamına benzeyen yerel bir geliştirme ortamı kurun (aynı Python/DB sürümü, sahte ama gerçekçi veri). Böylece erişim beklerken de ilerlersiniz.
3. **Bağımlılıkları azaltın:** Müşteri ortamında paket kurmak zorsa, standart kütüphaneyle veya onaylı paketlerle çözün.
4. **Her şeyi yazın:** Kararlar, varsayımlar, kimden hangi bilgiyi aldığınız. Rotasyon olduğunda ekip arkadaşınız buradan devam eder.
5. **Kurallara saygı:** Müşterinin güvenlik kuralını "işi hızlandırmak için" delmek, projeyi ve güveni bitirir.

## İpucu

Müşteri ekibinde bir "iç şampiyon" bulun: sistemi bilen, işin çözülmesini isteyen ve kapıları açabilen kişi. Başarılı projelerin çoğunda böyle biri vardır.
""")

lesson(4, "requirements", "Belirsiz gereksinimleri teknik probleme dönüştürme", "Turning ambiguity into a technical problem",
 "‘Bunu AI ile iyileştirelim’ talebini ölçülebilir, test edilebilir bir problem tanımına çevirme.", """
## Problem tanımı şablonu

Belirsiz bir talebi şu beş soruya cevap vererek netleştirin:

1. **Kim?** Hangi kullanıcı, hangi rol?
2. **Ne yapıyor?** Bugünkü iş akışı adım adım nasıl?
3. **Acı nerede?** Zaman mı kaybediliyor, hata mı yapılıyor, para mı kaçıyor?
4. **Başarı nasıl ölçülür?** Bir metrik ve hedef değer.
5. **Kısıtlar neler?** Veri, güvenlik, bütçe, tarih, mevzuat.

## Örnek

- **Talep:** "Müşteri hizmetlerini AI ile iyileştirelim."
- **Netleşmiş hâli:** "Kart itiraz ekibindeki 12 analist, her itiraz için ortalama 25 dakikayı 4 farklı sistemden bilgi toplamaya harcıyor. Hedef: bu bilgileri tek ekranda toplayan bir asistanla süreyi 10 dakikaya indirmek. Kişisel veri banka dışına çıkamaz. 8 hafta içinde pilot."

## Tuzaklar

- Çözümle başlamak ("chatbot yapalım") yerine problemle başlayın.
- Ölçülemeyen hedef ("daha iyi olsun") kabul etmeyin.
- Başarı metriğini müşteriyle **birlikte** ve **yazılı** belirleyin.
""", quiz=[
 {"q": "Aşağıdakilerden hangisi iyi tanımlanmış bir başarı kriteridir?", "options": ["Sistem daha akıllı olsun", "Analist başına itiraz inceleme süresi 25 dk'dan 10 dk'ya insin", "Müşteriler memnun olsun", "AI kullanılsın"], "answer": 1, "explain": "Ölçülebilir bir metrik, başlangıç değeri ve hedef değer içeriyor."}])

lesson(5, "interviews", "Kullanıcı ve müşteri görüşmelerinden gereksinim çıkarma", "Eliciting requirements from interviews",
 "Görüşme ve gözlemle gerçek iş akışını ve gizli gereksinimleri ortaya çıkarma.", """
## Konuşmak yetmez, izleyin

İnsanlar işlerini anlatırken istisnaları ve "geçici çözümleri" unutur. Mümkünse kullanıcının ekranını **gerçek bir iş üzerinde** izleyin (contextual inquiry).

## İyi sorular

- "En son ne zaman bu iş çok uzun sürdü? Ne oldu?" (somut olay)
- "Bunu yaparken hangi sistemleri açıyorsunuz?"
- "Hangi durumda bu kuralı uygulamıyorsunuz?" (istisnalar)
- "Bir şey yanlış giderse kim fark ediyor?" (hata maliyeti)

## Kaçınılacak sorular

- "X özelliği olsa kullanır mıydınız?" — insanlar genellikle evet der.
- Yönlendirici sorular: "Bu süreç çok yavaş, değil mi?"

## Çıktı

Her görüşmeden sonra kısa bir not: kim, ne gözlendi, hangi acı noktası, hangi varsayım doğrulandı/çürüdü. Bu notları platformdaki **Notlar** bölümünde `[[Forward Deployed Engineer]]` bağlantısıyla tutabilirsiniz.
""")

lesson(6, "systems-discovery", "Mevcut sistemleri ve veri altyapısını inceleme", "Discovering existing systems and data",
 "Müşterinin sistem haritasını, veri akışlarını ve kalite sorunlarını hızla çıkarma.", """
## Sistem haritası

İlk iki hafta içinde şu haritayı çıkarın: kaynak sistemler → aktarım (batch/stream/API) → depolar → tüketiciler. Her ok için: sıklık, sahibi, format, erişim yöntemi.

## Veri keşfi kontrol listesi

- Şema ve veri sözlüğü var mı? Güncel mi?
- Birincil anahtarlar gerçekten tekil mi?
- Tarih alanlarının saat dilimi ne?
- Boş değer oranları, aykırı değerler, kodlanmış alanlar (ör. "99 = bilinmiyor").
- Tablolar arası birleştirmede (join) satır kaybı veya çoğalma var mı?
- Veri ne kadar gecikmeli geliyor?

## Küçük ama güçlü bir alışkanlık

Her önemli tabloya şu SQL ile başlayın:

```sql
SELECT COUNT(*), COUNT(DISTINCT id), MIN(created_at), MAX(created_at),
       SUM(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS null_amount
FROM transactions;
```

Bu tek sorgu birçok sürprizi ilk gün ortaya çıkarır.
""")

lesson(7, "rapid-prototyping", "Hızlı prototipleme", "Rapid prototyping",
 "Günler içinde uçtan uca çalışan en ince dikey dilimi kurma.", """
## En ince dikey dilim

Prototip, bir katmanı mükemmelleştirmek değil, **uçtan uca** çalışmaktır: gerçek veri kaynağından → işleme → kullanıcı ekranına. Her katman kaba olabilir; ama zincir kopuk olmamalıdır.

## Hız için kurallar

1. Mevcut araçları kullanın; altyapı icat etmeyin.
2. Sabit kodlanmış (hard-coded) yapılandırma kabul edilebilir — ama listeleyin.
3. Kullanıcıya **gerçek verisiyle** gösterin; sentetik veriyle yapılan demo güven üretmez.
4. Her prototipte bir **değerlendirme scripti** olsun: "doğru mu çalışıyor?" sorusunu sayıyla yanıtlayın.

## Bilinçli borç kaydı

Prototipte bilerek yaptığınız kestirmeleri bir tabloda tutun: *ne, neden, üretime geçmeden önce ne yapılmalı*. Bu tablo [[fde-15-tech-debt|teknik borç]] dersinin girdisidir.

Uygulamalı örnek: [[fde-safe-db-assistant|Okuma-yalnız veritabanı asistanı prototipi]].
""")

lesson(8, "real-data", "Müşterinin gerçek verisiyle çalışma", "Working with real customer data",
 "Gerçek verinin kirliliği, gizliliği ve temsil gücüyle başa çıkma.", """
## Gerçek veri neden farklı?

Demo verisi temizdir; gerçek veri değildir. Yazım hataları, eksik alanlar, mükerrer kayıtlar, değişen kodlamalar, test kayıtları ve "geçici" kolonlar beklenmelidir.

## Gizlilik önce

- Yalnızca gereken kolonlara erişin (veri minimizasyonu).
- Kişisel verileri geliştirme sırasında **maskeleyin** veya takma adlandırın (pseudonymization).
- Veri müşteri ortamından çıkabilir mi? Çoğu regüle sektörde cevap hayırdır; modeli veriye götürürsünüz, veriyi modele değil.
- Ekran görüntüsü ve log'lara kişisel veri düşmesine dikkat edin.

## Temsil gücü

Prototipte kullandığınız örnek, üretimdeki veriyi temsil ediyor mu? Farklı şubeler, ürünler, mevsimler, kanallar var mı? Değerlendirme setini bu çeşitliliği kapsayacak biçimde **katmanlı (stratified)** seçin.

## Bağlantılar

Veri sızıntısı riskleri için [[Data Leakage]], gizlilik tasarımı için [[Privacy Engineering]].
""")

lesson(9, "integrations", "API ve kurumsal sistem entegrasyonları", "API & enterprise integrations",
 "Kimlik doğrulama, hata yönetimi, idempotency ve eski sistemlerle konuşma.", """
## Entegrasyon kontrol listesi

- **Kimlik doğrulama:** servis hesabı mı, OAuth mu, SSO mu? Token süresi ve yenileme?
- **Yetki:** en az yetki ilkesi; yalnızca gereken uç noktalar ve tablolar.
- **Hata yönetimi:** zaman aşımı (timeout), sınırlı tekrar deneme (retry + exponential backoff), devre kesici (circuit breaker).
- **Idempotency:** aynı istek iki kez gelirse iki kez işlem yapılmamalı (ör. idempotency key).
- **Gözlemlenebilirlik:** her çağrı için korelasyon kimliği, gecikme ve hata metriği.
- **Sözleşme testi:** karşı sistemin yanıt formatı değişirse ilk siz fark etmelisiniz.

## Eski sistemler

Eski sistemler çoğu zaman API yerine toplu dosya (CSV/fixed-width), mesaj kuyruğu veya doğrudan veritabanı okumasıyla entegre edilir. Bu durumda dosya şeması doğrulaması ve "dosya gelmedi" alarmı hayati önemdedir.

## İpucu

Entegrasyonu ilk gün bir **sahte (mock) servisle** yazın; gerçek erişim geldiğinde yalnızca yapılandırmayı değiştirin.
""")

lesson(10, "security-boundaries", "Veri erişimi ve güvenlik sınırları", "Data access & security boundaries",
 "En az yetki, okuma-yalnız erişim, maskeleme, denetim izi ve AI'a özgü riskler.", """
## Temel ilkeler

1. **En az yetki:** Uygulamanın veritabanı kullanıcısı yalnızca gereken tablolara **okuma** yetkisine sahip olsun.
2. **Savunma katmanları:** Uygulama seviyesinde de yazma işlemlerini engelleyin (ör. yalnızca `SELECT` izinli, parametreli sorgular).
3. **Maskeleme:** Kimlik numarası, telefon, kart numarası gibi alanları sonuçlarda maskeleyin.
4. **Denetim izi:** Kim, ne zaman, hangi sorguyu çalıştırdı — kaydedin.
5. **Sırlar:** Bağlantı bilgileri kodda değil, gizli yönetim aracında veya ortam değişkenlerinde.

## AI'a özgü riskler

- **Prompt injection:** Kullanıcı girdisi veya belge içeriği, modele "talimat" gibi davranabilir. Modelin araç ve veri erişimini kodla sınırlayın; modele güvenmeyin.
- **Serbest SQL üretimi:** LLM'in ürettiği SQL'i doğrudan çalıştırmak risklidir. Şablonlanmış sorgular, izin listeleri ve okuma-yalnız bağlantı kullanın.
- **Veri sızıntısı:** Model yanıtında kullanıcının görmeye yetkisi olmayan veri olmamalı.

Uygulamalı örnek ve testler: [[fde-safe-db-assistant|Okuma-yalnız, maskeli veritabanı asistanı]].
""", quiz=[
 {"q": "LLM tarafından üretilen SQL'i güvenli çalıştırmanın en sağlam yolu hangisidir?", "options": ["Modele 'sadece SELECT yaz' demek", "Okuma-yalnız bağlantı + izinli sorgu şablonları + parametre doğrulama", "Sorguyu loglamak", "Sonuçları kısaltmak"], "answer": 1, "explain": "Model talimatına güvenmek yeterli değildir; erişim kodla ve yetkiyle sınırlandırılmalıdır."}])

lesson(11, "demo", "Demo hazırlama ve teknik sunum", "Demo preparation & technical presentation",
 "Gerçek veriyle, iş metriğine bağlanan ve riskleri dürüstçe gösteren demolar.", """
## İyi bir demonun yapısı

1. **Problem (1 dk):** Müşterinin kendi cümlesiyle acı nokta.
2. **Önce/sonra (3 dk):** Bugünkü iş akışı vs yeni akış, gerçek bir kayıt üzerinde.
3. **Metrik (1 dk):** Ölçülen değer ve nasıl ölçüldüğü.
4. **Sınırlar (1 dk):** Neyi henüz yapamıyor, hangi durumlarda yanılıyor.
5. **Sonraki adım (1 dk):** Karar gerektiren konu.

## Kurallar

- Canlı demo bozulabilir: yedek kayıt (video/ekran görüntüsü) hazırlayın.
- Seçilmiş "en iyi örnekler" yerine rastgele örneklerle de gösterin; güven buradan gelir.
- Teknik detayı dinleyiciye göre ayarlayın: yöneticiye iş etkisi, IT'ye mimari ve güvenlik.
""")

lesson(12, "production", "Üretim ortamına geçiş", "Moving to production",
 "Prototipten işletilebilir sisteme: test, izleme, geri alma ve devir.", """
## Üretime hazırlık listesi

- [ ] Otomatik testler (birim + entegrasyon) ve CI.
- [ ] Yapılandırma ve sırlar koddan ayrılmış.
- [ ] Log, metrik ve alarm: hata oranı, gecikme, veri gelmedi alarmı.
- [ ] AI bileşenleri için değerlendirme seti ve düzenli regresyon testi.
- [ ] Geri alma (rollback) planı ve denenmiş prosedür.
- [ ] Kapasite ve maliyet tahmini.
- [ ] Güvenlik incelemesi ve müşteri onayı.
- [ ] Runbook: "X olursa ne yapılır?"
- [ ] Devir: sistemi kim işletecek, eğitim verildi mi?

## Kademeli açılış

Önce küçük bir kullanıcı grubu (pilot), sonra kademeli genişleme. AI sistemlerinde bir süre **gölge mod** (shadow) çalıştırmak — sistem çıktı üretir ama karar vermez — riskleri büyük ölçüde azaltır.
""")

lesson(13, "speed-vs-architecture", "Hızlı teslimat ile sürdürülebilir mimari arasındaki denge", "Speed vs sustainable architecture",
 "Ne zaman kestirme, ne zaman sağlam yapı? Karar çerçevesi.", """
## Karar çerçevesi

Bir kestirmenin kabul edilebilirliğini üç soruyla değerlendirin:

1. **Geri dönüş maliyeti:** Sonra düzeltmek ne kadar zor? (Veri modeli ve güvenlik kararlarının geri dönüş maliyeti yüksektir.)
2. **Yayılma:** Bu kod başka müşterilere kopyalanacak mı?
3. **Risk:** Bozulursa ne olur? Para, veri, itibar?

| Durum | Öneri |
|---|---|
| Demo için arayüz | Hızlı ve kaba olabilir |
| Veri modeli, kimlik/yetki | Baştan doğru yapın |
| Tek seferlik veri dönüşümü | Script yeterli, ama tekrarlanabilir olsun |
| Birden fazla müşteride gerekecek özellik | Ürün ekibiyle birlikte genelleştirin |

## Özet

"Çakıl yol → asfalt yol" yaklaşımı ancak çakıl yolun nerede olduğunu biliyorsanız işe yarar.
""")

lesson(14, "feedback-loop", "Müşteri geri bildirimlerini ürüne aktarma", "Turning field feedback into product",
 "Sahadaki tek seferlik çözümleri genelleştirilebilir ürün özelliklerine dönüştürme.", """
## Saha raporu formatı

- **Gözlem:** Müşteride ne oldu? (somut, örnekli)
- **Etki:** Kaç kullanıcı, ne kadar zaman/para?
- **Mevcut geçici çözüm:** Sahada nasıl çözdük?
- **Genelleme:** Başka müşterilerde de görülüyor mu? Kanıt?
- **Öneri:** Ürüne ne eklenmeli?

## Dikkat

Her müşteri isteği ürün özelliği olmamalı. FDE'nin değeri, **tekrarlayan** örüntüleri görüp ürün ekibine kanıtla sunmasıdır. Tek müşteriye özel istekleri yapılandırma veya eklenti olarak çözmek çoğu zaman daha doğrudur.
""")

lesson(15, "tech-debt", "Teknik borç ve entegrasyon sorunları", "Technical debt & integration issues",
 "Müşteriye özel kodun bakım yüküne dönüşmesini önleme.", """
## Belirtiler

- Aynı entegrasyonun her müşteride kopyalanıp biraz değiştirilmesi.
- Kimsenin dokunmaya cesaret edemediği "müşteri X scripti".
- Sürüm yükseltmelerinde sürekli kırılan özel kod.

## Önlemler

1. Müşteriye özel mantığı **yapılandırmaya** taşıyın (kod yerine ayar).
2. Ortak entegrasyonları **kütüphane/bağlayıcı** hâline getirin.
3. Her müşteriye özel kod parçasının bir sahibi ve test seti olsun.
4. Teknik borç kaydını ([[fde-07-rapid-prototyping|prototip dersindeki]] tablo) her ay gözden geçirin.
""")

lesson(16, "success-metrics", "Başarı ölçütleri", "Success metrics",
 "Teknik metrikleri iş sonucuna bağlama ve ölçümü projenin başında kurma.", """
## Üç katmanlı ölçüm

1. **Teknik:** doğruluk, [[Precision ve Recall]], gecikme, hata oranı.
2. **Kullanım:** aktif kullanıcı, görev tamamlama oranı, sistemi atlayan kullanıcılar.
3. **İş:** süre, maliyet, gelir, risk azalması — müşterinin tanımladığı KPI.

## Kural

Teknik metrik iyi ama kullanım düşükse sistem başarısızdır. Ölçümü projenin **başında** kurun; sonradan "önceki durum" verisini bulmak çoğu zaman imkânsızdır (baseline).

## Örnek gösterge paneli

| Metrik | Baseline | Hedef | Şu an |
|---|---|---|---|
| İtiraz başına süre | 25 dk | 10 dk | 14 dk |
| Haftalık aktif analist | 0 | 12 | 9 |
| Asistan cevabında hata (örneklem) | – | < %5 | %3 |
""")

lesson(17, "work-rhythms", "Günlük, haftalık ve proje bazlı çalışma örnekleri", "Daily, weekly and project rhythms",
 "FDE'nin çalışma ritmini planlamak için somut örnekler.", """
## Günlük

Kısa müşteri senkronu → geliştirme blokları → kullanıcı gözlemi → kayıt tutma. Ayrıntılı örnek gün: [[Forward Deployed Engineer#daily]].

## Haftalık

- Pazartesi: hafta hedefleri ve engeller (müşteriyle).
- Çarşamba: ürün ekibine saha raporu.
- Cuma: demo + geri bildirim; kararlar yazılı.

## Proje (örnek 12 hafta)

| Hafta | Aşama | Çıktı |
|---|---|---|
| 1–2 | Keşif | Problem tanımı, başarı metriği, sistem haritası, erişim planı |
| 3–5 | Prototip | Uçtan uca dikey dilim, değerlendirme scripti |
| 6–8 | Pilot | Gerçek kullanıcılarla sınırlı kullanım, ölçüm |
| 9–11 | Üretim | Sağlamlaştırma, güvenlik, izleme, runbook |
| 12 | Devir | Eğitim, dokümantasyon, genişleme önerileri |
""")

lesson(18, "tech-prep", "FDE pozisyonları için teknik hazırlık", "Technical preparation for FDE roles",
 "Hangi teknik becerilere, hangi sırayla çalışılmalı?", """
## Öncelik sırası

1. **Bir backend dili derinlemesine** (Python veya TypeScript): API yazma, test, hata ayıklama.
2. **SQL:** join, window function, performans, veri kalitesi sorguları.
3. **Entegrasyon:** HTTP, kimlik doğrulama (OAuth/SSO), kuyruklar, retry/idempotency.
4. **Veri pipeline'ları:** ETL, şema doğrulama, zamanlanmış işler.
5. **Bulut + konteyner:** bir uygulamayı uçtan uca dağıtabilmek.
6. **AI rolleri için:** LLM API'leri, RAG, değerlendirme, araç kullanımı ve güvenliği.

## Pratik proje önerisi

Bu platformdaki [[fde-safe-db-assistant|veritabanı asistanı tutorial'ını]] genişletin: gerçek bir açık veri setini yükleyin, yeni soru şablonları ekleyin, bir değerlendirme seti yazın, sonuçları bir README'de raporlayın. Mülakatta anlatılacak somut bir hikâye olur.
""")

lesson(19, "interview-scenarios", "Örnek mülakat senaryoları", "Sample interview scenarios",
 "FDE mülakatlarında sık görülen senaryo türleri ve yapılandırılmış cevap yaklaşımı.", """
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
""")

lesson(20, "case-study", "Gerçekçi bir FDE vaka çalışması", "A realistic FDE case study",
 "Gereksinimden üretime: müşteri veritabanına bağlanan AI asistanı vakasının ders hâli.", """
## Bu derste

Vaka çalışmasını okuyun ve her aşamada "ben olsam ne yapardım?" sorusunu cevaplayın:

- Vaka: [[fde-customer-db-assistant|Müşteri veritabanına bağlanan AI asistanı]]
- Uygulama: [[fde-safe-db-assistant|Okuma-yalnız veritabanı asistanı tutorial'ı]]

## Değerlendirme soruları

1. Başarı metriği neydi ve nasıl ölçüldü?
2. Hangi güvenlik kararları prototipte bile ertelenmedi? Neden?
3. Pilotta hangi beklenmedik sorunlar çıktı?
4. Hangi parçalar ürüne geri taşındı?

## Mini proje

Vakadaki asistana yeni bir soru türü ekleyin, değerlendirme setine 5 örnek yazın ve testleri çalıştırın. Sonucu bir notta özetleyin.
""", quiz=[
 {"q": "Vakada prototip aşamasında bile ertelenmemesi gereken karar hangisidir?", "options": ["Arayüz renkleri", "Okuma-yalnız erişim ve kişisel veri maskeleme", "Logo", "Sunum şablonu"], "answer": 1, "explain": "Güvenlik ve veri erişim kararlarının geri dönüş maliyeti çok yüksektir."}])

for l in L:
    lid = f"fde-{l['n']:02d}-{l['slug']}"
    fm = {
        "id": lid, "type": "lesson", "title": l["title"], "title_en": l["title_en"],
        "summary": l["summary"], "status": "complete", "order": l["n"], "duration": l["duration"],
        "level": "Orta", "tags": ["fde"],
        "relations": {"part_of": ["fde-path"]},
        "last_verified": "2026-10-18", "version": 1,
    }
    if l["quiz"]:
        fm["quiz"] = l["quiz"]
    import yaml  # type: ignore
    text = "---\n" + yaml.safe_dump(fm, allow_unicode=True, sort_keys=False) + "---\n\n" + l["body"] + "\n"
    (OUT / f"{lid}.md").write_text(text, encoding="utf-8")
print(len(L), "ders yazıldı")
