# Tek VPS üzerinde kurulum

FWT yığını dört servisten oluşuyor ve üçü ayrı depoda duruyor. Bu rehber
hepsini tek bir sunucuda, Docker Compose ve Caddy ile ayağa kaldırır.

Railway/Vercel kurulumu için [DEPLOY.md](DEPLOY.md)'ye bak. Bu dosya onun
yerine geçmez, alternatifidir.

## Neden bu yerleşim

İki Python servisi (MP4 Avcısı ve Sahne Avcısı) dışarıya **hiç açılmaz**.
`docker-compose.yml` içinde yalnızca `caddy` servisinin `ports` tanımı var;
diğerleri sadece iç ağdan erişilebilir. Servislerdeki token ve hız sınırı bunun
yerine geçmez, üstüne ikinci katman olarak durur — bir gün birini dışarı açmak
gerekirse ya da token sızarsa devreye girer.

Tek alan adı kullanılır. Caddy `/api/*` isteklerini backend'e, geri kalanı
frontend'e yönlendirir. Böylece CORS yapılandırması gerekmez.

## Gereken makine

Ölçülen değerler (bkz. `sahne-avcisi/ARCHITECTURE.md`):

| Kalem | İhtiyaç |
|---|---|
| Sahne indeksi (kamu malı arşivin tamamı, 20,7M kare) | ~830 MB RAM, ~1,7 GB disk |
| MP4 Avcısı geçici dosyaları | 4,6 GB disk tavanı |
| Postgres + Next.js + Express | ~1-1,5 GB RAM |
| FFmpeg (indeksleme ve dönüştürme) | CPU'ya bağlı, çekirdek ister |

**Önerilen: 4 vCPU / 8 GB RAM / 80 GB SSD.** 2 vCPU / 4 GB ile başlanabilir ama
indeks büyüdükçe RAM sıkışır.

## 1. Sunucuyu hazırla

Root yerine sudo yetkili bir kullanıcıyla çalış:

```bash
adduser deploy && usermod -aG sudo deploy
```

Docker ve Compose eklentisini kur (Debian/Ubuntu):

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy   # yeniden oturum aç
```

Güvenlik duvarı — yalnızca SSH ve web:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

## 2. Depoları yan yana klonla

Dizin yerleşimi önemli: `docker-compose.yml` diğer iki depoyu göreli yoldan
derliyor.

```bash
sudo mkdir -p /srv/fwt && sudo chown deploy:deploy /srv/fwt
cd /srv/fwt
git clone https://github.com/MrAllNeo/Free-Web-Tools.git
git clone https://github.com/MrAllNeo/mp4-avcisi.git
git clone https://github.com/MrAllNeo/sahne-avcisi.git
```

Sonuç:

```
/srv/fwt/
├── Free-Web-Tools/deploy/   <- compose buradan çalıştırılır
├── mp4-avcisi/
└── sahne-avcisi/
```

## 3. DNS

Alan adının **A kaydı** VPS'in IPv4 adresine baksın (IPv6 varsa AAAA da).
Bu yapılmadan Caddy sertifika alamaz ve açılışta takılır.

## 4. Yapılandırma

```bash
cd /srv/fwt/Free-Web-Tools/deploy
cp .env.example .env
```

`.env` içindeki boş değerleri doldur. Rastgele üretmek için:

```bash
openssl rand -hex 32
```

Zorunlu olanlar: `FWT_DOMAIN`, `POSTGRES_PASSWORD`, `JWT_SECRET` (en az 32
karakter), `MP4_INTERNAL_TOKEN`, `SAHNE_INTERNAL_TOKEN`, `SAHNE_ADMIN_TOKEN`.
Eksik bırakılırsa compose açılışta durur.

## 5. Başlat

```bash
docker compose build
docker compose up -d
```

İlk açılışta veritabanı göçlerini uygula:

```bash
docker compose exec backend npx prisma migrate deploy
```

Demo veri istersen (üretimde her şeyi siler, dikkat):

```bash
docker compose exec backend npm run seed
```

Durum kontrolü:

```bash
docker compose ps
curl -sS https://$FWT_DOMAIN/api/health
```

## 6. İndeksi doldur

Kurulum bittiğinde film/dizi indeksi **boştur** — anime tarafı trace.moe
sayesinde hemen çalışır, film/dizi tarafı ise indekslediğin kadar çalışır.
Kamu malı arşivinden içe aktar:

```bash
docker compose exec sahne sahne-import-archive \
  --database /data/sahne-avcisi.sqlite3 --limit 100
```

Worker zaten sürekli çalışıyor; kuyruğa giren işleri kendisi işler. İlerlemeyi
izlemek için:

```bash
docker compose logs -f sahne-worker
docker compose exec sahne python -c "
from pathlib import Path
from sahne_avcisi.database import Database
print(Database(Path('/data/sahne-avcisi.sqlite3')).stats())
"
```

Kabaca film başına 1,5-2 dakika sürer. Arşivin tamamı (7.665 film) tek
makinede günler alır; parti parti almak mantıklı.

## 7. Yedekleme

```bash
chmod +x deploy/backup.sh
./deploy/backup.sh /srv/backups
```

Günlük çalıştırmak için crontab'a ekle:

```
0 4 * * * /srv/fwt/Free-Web-Tools/deploy/backup.sh /srv/backups
```

Betik Postgres dump'ı ve Sahne indeksini alır. İndeks worker tarafından sürekli
yazıldığı için düz kopyalama yerine SQLite'ın kendi backup API'si kullanılır;
çalışan yazarlarla tutarlı kopya veren tek yol bu.

## Güncelleme

```bash
cd /srv/fwt/Free-Web-Tools && git pull
cd ../mp4-avcisi && git pull
cd ../sahne-avcisi && git pull
cd ../Free-Web-Tools/deploy
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

Alan adını değiştirdiysen frontend'i **yeniden derlemen** gerekir:
`NEXT_PUBLIC_*` değerleri çalışma anında değil derleme anında pakete gömülür.

## Sorun giderme

**Caddy sertifika alamıyor.** DNS henüz yayılmamış olabilir; `dig +short
$FWT_DOMAIN` ile kontrol et. 80 portu dışarıya kapalıysa da başarısız olur.

**Backend açılışta duruyor.** Üretimde eksik veya zayıf bir değer varsa
bilinçli olarak başlamaz ve eksiklerin listesini yazar: `docker compose logs
backend`. En sık sebep 32 karakterden kısa `JWT_SECRET`.

**Sahne araması 401 dönüyor.** `SAHNE_INTERNAL_TOKEN` iki tarafta da aynı
olmalı. Compose ikisini de tek değişkenden okuduğu için normalde tutar; elle
oynadıysan kontrol et.

**Sahne servisinin kendi arayüzü açılmıyor.** Beklenen davranış: token
tanımlıyken tarayıcı o başlığı gönderemediği için servis kendi arayüzünü
sunmaz. Bu kurulumda servis yalnızca arka uçtur, arayüz FWT'nin
`/tools/sahne-avcisi` sayfasıdır.

**Disk doluyor.** En olası sebep MP4 Avcısı'nın geçici dosyaları. Tavanı
`MP4_MAX_DISK_BYTES` belirler ve çıktılar bir saat sonra silinir; `docker
system prune` ile eski imaj katmanlarını da temizleyebilirsin.
