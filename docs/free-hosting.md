# Ücretsiz barındırma: seçenekler, sınırlar ve riskler

*Son kontrol: 18 Ekim 2026. Ücretsiz planlar değişebilir; kullanmadan önce bağlantılardaki resmî sayfaları kontrol edin.*

## Tasarım ilkesi

Her bileşen **kaybolabilir** varsayımıyla seçildi:

| Bileşen | Görev | Kaybolursa ne olur? |
|---|---|---|
| Tarayıcı (IndexedDB + Service Worker) | Asıl çalışma yeri: içerik, notlar, ilerleme | Hesap varsa sunucudan geri iner; yoksa son JSON dışa aktarması |
| Statik barındırma (GitHub Pages) | Uygulama kodu + içerik dağıtımı | Uygulama zaten cihazda önbellekte; başka bir statik barındırmaya veya `npm start` ile yerele taşınır |
| API + veritabanı | Eşitleme, sürüm geçmişi, yedek | Uygulama çalışmaya devam eder ("Yalnızca bu cihaz"); değişiklikler cihazda bekler |
| GitHub Actions | Test, derleme, içerik bakım raporu, gece yedeği | Hiçbir kullanıcı işlevi etkilenmez |

**GitHub veritabanı değildir:** Kişisel veriler repoya yazılmaz. GitHub Actions sürekli çalışan bir sunucu değildir; yalnızca zamanlanmış/tetiklenen işler için kullanılır.

## Servisler ve doğrulanmış sınırlar

### GitHub Pages — web uygulaması
Kaynak: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- Yayımlanan site en fazla **1 GB**; aylık **100 GB** bant genişliği (esnek sınır); dağıtım 10 dakikada zaman aşımına uğrar.
- GitHub Free'de **yalnızca public repolarda** kullanılabilir. Private repo için ücretli plan gerekir.
- Bu projenin derlemesi ~3 MB'tır; sınırların çok altında.
- Risk: Repo public olduğu için içerik ve kod herkese açıktır (kişisel veriler zaten repoda değildir).

### GitHub Actions — CI, testler, yedek
Kaynak: [Billing and usage](https://docs.github.com/en/actions/concepts/billing-and-usage)
- Standart GitHub-hosted runner'lar **public repolarda ücretsizdir**. Private repolarda planınıza bağlı bir aylık dakika ve depolama kotası vardır; aşım ücretlendirilir.
- İş akışları gereksiz çalışmayacak şekilde ayarlandı: CI yalnızca push/PR'da, script testleri yalnızca tutorial değişince + haftada bir, içerik bakımı haftada bir, DB yedeği günde bir (yalnızca sırlar tanımlıysa).
- Not: GitHub, uzun süre etkinlik olmayan repolarda zamanlanmış iş akışlarını devre dışı bırakabilir; bakım raporu gelmiyorsa Actions sekmesinden yeniden etkinleştirin.

### Render (veya benzeri) — API sunucusu (isteğe bağlı)
Kaynak: [Render — Deploy for Free](https://render.com/docs/free)
- Ücretsiz web servisi **15 dakika** trafik olmayınca uykuya geçer; uyanması ~1 dakika sürer. Çalışma alanı başına ayda **750 saat**; biterse ay sonuna kadar askıya alınır.
- Dosya sistemi **geçicidir**: SQLite veya yerel yedekler yeniden başlatmada silinir. Bu yüzden ücretsiz serviste mutlaka harici Postgres (Neon) kullanın ve `BACKUP_INTERVAL_HOURS=0` yapın.
- Render'ın ücretsiz Postgres'i **30 gün sonra sona erer** (14 gün ek süre, sonra silinir), 1 GB, yedek yok → **uzun süreli kullanım için önerilmez.**
- Uygulamaya etkisi: Uyku sırasında eşitleme "hata / tekrar denenecek" görünür, veri kaybı olmaz; uyanınca bekleyen değişiklikler gönderilir.

### Neon — PostgreSQL (isteğe bağlı)
Kaynak: [Neon Free plan limits](https://neon.com/faqs/free-plan-limits-and-quotas)
- Proje başına **1 GB** depolama, proje başına ayda **100 CU-saat** hesaplama, 5 dakika boşta kalınca **sıfıra ölçeklenir**, **6 saatlik** anlık geri yükleme geçmişi, aylık 5 GB ağ trafiği.
- Sınır aşılınca veri silinmez; hesaplama askıya alınır veya depolamayı artıran yazmalar başarısız olur.
- Kişisel not uygulaması için 1 GB çok büyüktür (binlerce not birkaç MB tutar). Görsel eklerin 800 KB sınırı bu yüzden var.
- 6 saatlik geri yükleme penceresi bir yedek stratejisi değildir → `db-backup` iş akışı her gece şifreli, doğrulanmış yedek alır.

### Kendi bilgisayarınız — tamamen ücretsiz alternatif
- `npm start` veya `docker compose up` ile API + web aynı adreste çalışır; SQLite ve yerel otomatik yedekler (varsayılan 24 saatte bir, 14 kopya) kullanılır.
- Bilgisayar kapalıyken diğer cihazlar eşitleyemez ama çalışmaya devam eder; açılınca eşitlenir.
- Dışarıdan erişim için bir tünel/VPN (ör. Tailscale'in kişisel planı) kullanılabilir; şartlarını ayrıca kontrol edin.

## Ücretli olabilecek ama zorunlu olmayan şeyler

| İstenirse | Durum |
|---|---|
| AI/LLM API'leri | Kullanılmıyor. Notlar, öneriler, arama ve grafik yerel algoritmalarla çalışır |
| Haber/arama API'leri | Kullanılmıyor. Harici arama yalnızca ilgili sitenin arama sayfasını açar |
| Çeviri | İçerik iki dilli yazılır; otomatik çeviri servisi yok |
| Özel alan adı | İsteğe bağlı |

## Bir servis ücretsiz planını kaldırırsa

1. **Online / Offline → Durum**: değişiklikler cihazda "bekliyor" olarak kalır.
2. **Veri Koruma → Tüm verileri JSON olarak indir** (her cihazda).
3. Son gece yedeğini indirip çözün ve yeni veritabanına yükleyin (bkz. [backup-restore.md](backup-restore.md)), ya da yeni sunucuda boş hesap açıp JSON'u **İçe aktar**.
4. Uygulamada API adresini değiştirin; eşitleme kaldığı yerden devam eder.
