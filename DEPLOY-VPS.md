# Tek VPS üzerinde kurulum

FWT yığını frontend, backend, Postgres ve ayrı depodaki MP4 Avcısı
servisinden oluşuyor. Bu rehber hepsini tek bir sunucuda, Docker Compose ve
Caddy ile ayağa kaldırır.

Railway/Vercel kurulumu için [DEPLOY.md](DEPLOY.md)'ye bak. Bu dosya onun
yerine geçmez, alternatifidir.

## Neden bu yerleşim

MP4 Avcısı servisi dışarıya **hiç açılmaz**. `docker-compose.yml` içinde
yalnızca `caddy` servisinin `ports` tanımı var; diğerleri sadece iç ağdan
erişilebilir. Servisteki token bunun yerine geçmez, üstüne ikinci katman olarak
durur — bir gün dışarı açmak gerekirse ya da token sızarsa devreye girer.

Tek alan adı kullanılır. Caddy `/api/*` isteklerini backend'e, geri kalanı
frontend'e yönlendirir. Böylece CORS yapılandırması gerekmez.

## Gereken makine

| Kalem | İhtiyaç |
|---|---|
| MP4 Avcısı geçici dosyaları | 4,6 GB disk tavanı |
| Postgres + Next.js + Express | ~1-1,5 GB RAM |
| FFmpeg (dönüştürme) | CPU'ya bağlı, çekirdek ister |

**Önerilen: 2 vCPU / 4 GB RAM / 40 GB SSD.** Dönüştürme yoğunlaşırsa CPU'yu
artırmak RAM'i artırmaktan daha çok fayda sağlar.

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

Dizin yerleşimi önemli: `docker-compose.yml` MP4 Avcısı deposunu göreli yoldan
derliyor.

```bash
sudo mkdir -p /srv/fwt && sudo chown deploy:deploy /srv/fwt
cd /srv/fwt
git clone https://github.com/MrAllNeo/Free-Web-Tools.git
git clone https://github.com/MrAllNeo/mp4-avcisi.git
```

Sonuç:

```
/srv/fwt/
├── Free-Web-Tools/deploy/   <- compose buradan çalıştırılır
└── mp4-avcisi/
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
karakter), `MP4_INTERNAL_TOKEN`.
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

## 6. Yedekleme

```bash
chmod +x deploy/backup.sh
./deploy/backup.sh /srv/backups
```

Günlük çalıştırmak için crontab'a ekle:

```
0 4 * * * /srv/fwt/Free-Web-Tools/deploy/backup.sh /srv/backups
```

Betik Postgres dump'ını alır ve `BACKUP_KEEP_DAYS` günden (öntanımlı 14) eski
yedekleri siler.

## Güncelleme

```bash
cd /srv/fwt/Free-Web-Tools && git pull
cd ../mp4-avcisi && git pull
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

**Disk doluyor.** En olası sebep MP4 Avcısı'nın geçici dosyaları. Tavanı
`MP4_MAX_DISK_BYTES` belirler ve çıktılar bir saat sonra silinir; `docker
system prune` ile eski imaj katmanlarını da temizleyebilirsin.
