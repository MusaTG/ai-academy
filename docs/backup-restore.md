# Yedekleme ve geri yükleme

Veriler üç katmanda korunur. Her katmanın bir sınırı vardır, bu yüzden birden fazlasını kullanın.

| Katman | Nerede | Otomatik mi? | Sınır |
|---|---|---|---|
| Cihaz | Tarayıcının IndexedDB'si | Evet (her değişiklik anında) | Tarayıcı verisi silinirse gider. Uygulama "kalıcı depolama" izni ister |
| Sunucu | SQLite veya PostgreSQL + kayıt başına sürüm geçmişi | Evet (eşitlemeyle) | Sunucu diski/veritabanı kaybolursa gider |
| Sunucu yedeği | `apps/api/data/backups/*.json.gz` veya şifreli GitHub artifact'ı | Evet (varsayılan 24 saatte bir) | Ücretsiz barındırmada yerel disk geçicidir → GitHub Actions yedeği kullanın |
| Dışa aktarma | Sizin bilgisayarınız | Hayır (Veri Koruma sayfası) | Ne sıklıkla alırsanız o kadar günceldir |

## Sunucu yedeği nasıl çalışır?

- Biçim veritabanından bağımsızdır (gzip'li JSON): SQLite yedeği PostgreSQL'e, PostgreSQL yedeği SQLite'a yüklenebilir.
- **Her yedek alındıktan hemen sonra doğrulanır:** dosya geçici bir bellek-içi veritabanına gerçekten geri yüklenir ve tablo satır sayıları kaynakla karşılaştırılır. Doğrulanmayan yedek "başarısız" kaydedilir ve eski yedekler silinmez.
- Son başarılı yedeğin zamanı ve son başarısız denemenin hatası uygulamada **Veri Koruma** sayfasında görünür (`GET /api/backups/status`).
- Saklama: son `BACKUP_KEEP` (varsayılan 14) yedek tutulur.

## Komutlar

`apps/api` klasöründe (sanal ortam: `.venv/bin/python`, Windows'ta `.venv\Scripts\python`):

```bash
python -m app.backup create                         # şimdi yedek al + doğrula
python -m app.backup list                           # yedekleri listele
python -m app.backup verify data/backups/academy-20261018T020000Z.json.gz
python -m app.backup restore data/backups/academy-20261018T020000Z.json.gz           # boş veritabanına
python -m app.backup restore data/backups/academy-20261018T020000Z.json.gz --force   # dolu veritabanının ÜZERİNE
```

Hangi veritabanına yükleneceği `DATABASE_URL` ortam değişkeniyle belirlenir. `--force` olmadan dolu bir veritabanının üzerine yazılmaz.

Yönetici HTTP uç noktası (`.env` içinde `ADMIN_TOKEN` tanımlıysa):

```bash
curl -X POST -H "X-Admin-Token: $ADMIN_TOKEN" http://localhost:8000/api/admin/backup
```

## GitHub Actions gece yedeğini geri yükleme (Neon/Postgres kullanıyorsanız)

1. Repo → Actions → `db-backup` → son başarılı çalıştırma → artifact'ı indirin ve açın.
2. Şifreyi çözün: `gpg -d academy-backup.json.gz.gpg > academy-backup.json.gz` (parola: `BACKUP_PASSPHRASE`).
3. Doğrulayın ve yükleyin:
   ```bash
   cd apps/api
   python -m app.backup verify academy-backup.json.gz
   DATABASE_URL="postgresql+psycopg://…" python -m app.backup restore academy-backup.json.gz --force
   ```
Artifact'lar 90 gün saklanır (iş akışındaki `retention-days`).

## Kullanıcı tarafı: dışa/içe aktarma

- **Veri Koruma → Tüm verileri JSON olarak indir:** notlar, ilerleme, yer imleri, ayarlar, ekler, grafik kararları (silinmiş kayıtların işaretleri dahil).
- **Notları Markdown (.zip):** Obsidian'da doğrudan açılabilir; `[[bağlantılar]]` korunur.
- **İçe aktar:** birleştirme yapar. Yerelde daha yeni olan kayıt korunur; içe aktarılan kayıtlar hesap bağlıysa sunucuya da gönderilir. Hiçbir kayıt sessizce ezilmez.

## Geri yükleme testi (önerilen: ayda bir)

```bash
cd apps/api
python -m app.backup create
DATABASE_URL=sqlite:////tmp/restore-test.db python -m app.backup restore "$(ls -t data/backups/*.json.gz | head -1)"
```

Otomatik testler de her CI çalışmasında yedek → doğrulama → boş veritabanına geri yükleme döngüsünü çalıştırır (`apps/api/tests/test_api.py`, e2e Senaryo 8).

## Not geçmişinden kurtarma

Silinen veya bozulan bir not için önce **Notlar → Sürüm geçmişi**ne bakın: cihazdaki son 50 sürüm ve (hesap bağlıysa) sunucudaki son 100 sürüm tek tıkla geri yüklenebilir. Sunucuda silme bir *tombstone*'dur; içerik veritabanında kalır.
