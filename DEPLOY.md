# Yayına Alma Rehberi

Bu dosya, projeyi kiralanan bir sunucuda çalışır hâle getirmek için baştan sona
izlenecek adımları içerir. Komutlar Ubuntu 24.04 içindir; başka bir dağıtımda
yalnızca paket yöneticisi komutları değişir.

Hiçbir adımı ezberden atlamayın — özellikle **§7 (ilk yönetici)** ve
**§9 (yedekleme)** unutulduğunda geri dönüşü olmayan sonuçlar doğuruyor.

---

## 0. Neyin nerede çalıştığı

Üç parça var ve üçü de aynı sunucuda durabilir:

| Parça | Ne | Port |
|---|---|---|
| PostgreSQL | Veritabanı | 5432 (yalnızca yerel) |
| Backend | Express API (`backend/`) | 3001 (yalnızca yerel) |
| Frontend | Next.js sunucusu (`frontend/`) | 3000 (yalnızca yerel) |
| nginx | Ters vekil + TLS | 80 / 443 (dışa açık) |

Frontend **statik değildir**: sunucu tarafı yönlendirmeler, `generateMetadata`
ve `notFound()` çalışan bir Node süreci gerektirir. Bu yüzden GitHub Pages gibi
yalnızca statik dosya sunan ortamlar bu projeyi barındıramaz.

**Minimum sunucu:** 2 GB RAM. 1 GB'da Next.js derlemesi (`npm run build`)
bellek yetersizliğinden ölür. Derlemeyi sunucuda yapacaksanız 2 GB alın.

---

## 1. Sunucuyu hazırla

```bash
# Sunucuya root olarak bağlandıktan sonra
apt update && apt upgrade -y

# Günlük işler için kullanıcı — root ile uygulama çalıştırmayın
adduser fwt
usermod -aG sudo fwt

# Güvenlik duvarı: yalnızca SSH ve web dışarı açık
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

Bundan sonraki komutlar `fwt` kullanıcısıyla çalıştırılır (`su - fwt`).

---

## 2. Node.js kur

Next.js 16, Node 20.9 veya üstünü ister. 22 LTS kurun:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # v22.x.x görmelisiniz
```

---

## 3. PostgreSQL kur ve veritabanını oluştur

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Veritabanı ve kullanıcı:

```bash
sudo -u postgres psql
```

```sql
CREATE USER fwt WITH PASSWORD 'buraya-uzun-rastgele-bir-parola';
CREATE DATABASE freewebtools OWNER fwt;
\c freewebtools
-- Arama indeksleri bu eklentiye bağlı. Göç dosyası da oluşturmayı deniyor ama
-- eklenti kurulumu süper kullanıcı yetkisi ister; burada peşinen kuruyoruz.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\q
```

> **Neden şimdi:** `pg_trgm` olmadan göç, `CREATE EXTENSION` satırında yetki
> hatasıyla durur. Yönetilen bir veritabanı kullanıyorsanız (Neon, Supabase, RDS)
> bu eklenti genelde panelden açılır ya da zaten açıktır.

---

## 4. Kodu sunucuya al

```bash
cd ~
git clone https://github.com/<kullanıcı>/Free-Web-Tools.git
cd Free-Web-Tools
```

---

## 5. Ortam değişkenlerini yaz

### Backend

```bash
cp backend/.env.example backend/.env
openssl rand -base64 48        # çıkan değeri JWT_SECRET'e yapıştırın
nano backend/.env
```

Doldurulacaklar:

```ini
DATABASE_URL="postgresql://fwt:PAROLA@localhost:5432/freewebtools?schema=public"
JWT_SECRET="openssl'in ürettiği değer"
FRONTEND_URL="https://alanadiniz.com"
NODE_ENV=production
PORT=3001
# nginx arkasında çalışacağı için gerçek istemci IP'si başlıktan gelir.
TRUST_PROXY=1
```

> **Sunucu açılmıyorsa önce buraya bakın.** Üretimde eksik ya da zayıf bir değer
> varsa sunucu bilinçli olarak başlamaz ve eksiklerin listesini yazar. Özellikle
> `JWT_SECRET`: örnek dosyadaki değer olduğu gibi bırakılırsa reddedilir, çünkü o
> dize deponun içinde yazılı — kullanılsaydı herkes kendine yönetici tokenı
> üretebilirdi.

### Frontend

```bash
cp frontend/.env.example frontend/.env.local
nano frontend/.env.local
```

```ini
NEXT_PUBLIC_API_URL="https://alanadiniz.com/api"
NEXT_PUBLIC_SITE_URL="https://alanadiniz.com"
```

> **Dikkat:** `NEXT_PUBLIC_` ile başlayan değerler derleme sırasında koda gömülür.
> Bunları sonradan değiştirirseniz `npm run build` tekrar çalıştırılmalıdır;
> yalnızca servisi yeniden başlatmak yetmez.

---

## 6. Bağımlılıklar, veritabanı şeması ve derleme

```bash
cd ~/Free-Web-Tools

# Backend
cd backend
npm ci                    # postinstall Prisma istemcisini üretir
npm run migrate:deploy    # şemayı veritabanına uygular
npm run build
cd ..

# Frontend — devDependencies gerekli:
# derleme öncesi çalışan betik önizleme çalışma zamanını esbuild ile üretiyor,
# esbuild ise bir devDependency. Bu yüzden `--omit=dev` KULLANMAYIN.
cd frontend
npm ci
npm run build
cd ..
```

`migrate:deploy` yalnızca `backend/prisma/migrations/` altındaki dosyaları
uygular. **`db push` üretimde kullanılmaz:** şemayı zorla eşitlerken sütun
düşürüp içindeki veriyi uyarısızca silebilir.

---

## 7. İlk yöneticiyi oluştur

Tohumlama betiği (`npm run seed`) üretimde bilinçli olarak çalışmaz — ilk işi
tüm kullanıcıları, snippetleri ve yorumları silmek olurdu. Bu yüzden ilk yönetici
elle yapılır:

1. Site ayağa kalktıktan sonra `/auth/register` üzerinden normal bir hesap açın.
2. Ardından o hesabı yönetici yapın:

```bash
sudo -u postgres psql -d freewebtools \
  -c "UPDATE users SET role = 'admin' WHERE username = 'kullanici-adiniz';"
```

3. Siteden çıkıp tekrar girin — rol tokenın içinde taşınıyor, eski token hâlâ
   sizi normal kullanıcı sanar.

---

## 8. Servisleri systemd'ye bağla

İki birim dosyası. `sudo nano /etc/systemd/system/fwt-backend.service`:

```ini
[Unit]
Description=Free Web Tools API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=fwt
WorkingDirectory=/home/fwt/Free-Web-Tools/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

`sudo nano /etc/systemd/system/fwt-frontend.service`:

```ini
[Unit]
Description=Free Web Tools Web
After=network.target

[Service]
Type=simple
User=fwt
WorkingDirectory=/home/fwt/Free-Web-Tools/frontend
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now fwt-backend fwt-frontend
sudo systemctl status fwt-backend fwt-frontend
```

Günlükleri okumak: `journalctl -u fwt-backend -f`

---

## 9. nginx ve HTTPS

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/fwt
```

```nginx
server {
    listen 80;
    server_name alanadiniz.com www.alanadiniz.com;

    # API çağrıları backend'e. Bu blok / bloğundan ÖNCE gelmeli.
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # Hız sınırlayıcı gerçek istemci IP'sini bu başlıktan okuyor;
        # backend tarafında TRUST_PROXY=1 ile eşleşmesi gerekir.
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fwt /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Ücretsiz sertifika — otomatik yenilenir
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d alanadiniz.com -d www.alanadiniz.com
```

---

## 10. Yedekleme

**Bu adımı atlamayın.** Sunucu tek bir disk; disk giderse her şey gider.

```bash
mkdir -p ~/backups
crontab -e
```

```cron
# Her gece 03:00'te yedek al, 14 günden eskisini sil
0 3 * * * pg_dump "postgresql://fwt:PAROLA@localhost:5432/freewebtools" | gzip > ~/backups/fwt-$(date +\%F).sql.gz
30 3 * * * find ~/backups -name 'fwt-*.sql.gz' -mtime +14 -delete
```

Yedeği geri yüklemek:

```bash
gunzip -c ~/backups/fwt-2026-09-05.sql.gz | psql "postgresql://fwt:PAROLA@localhost:5432/freewebtools"
```

> Yedekler aynı sunucuda durduğu sürece yalnızca "yanlış silme"ye karşı korur,
> sunucu kaybına karşı korumaz. Ayda bir kendi bilgisayarınıza indirin:
> `scp fwt@sunucu:~/backups/fwt-*.sql.gz ./`

---

## 11. Güncelleme akışı

Kod değiştikten sonra sunucuda:

```bash
cd ~/Free-Web-Tools
git pull

cd backend
npm ci
npm run migrate:deploy     # yeni göç yoksa hiçbir şey yapmaz
npm run build
cd ../frontend
npm ci
npm run build
cd ..

sudo systemctl restart fwt-backend fwt-frontend
```

Şema değiştiğinde göç dosyası **geliştirme makinesinde** üretilir ve depoya
işlenir:

```bash
# yerel makinede, schema.prisma düzenlendikten sonra
npm run db:migrate         # dosyayı üretir ve yerel veritabanına uygular
git add backend/prisma/migrations && git commit
```

---

## 12. Yayın öncesi kontrol listesi

- [ ] `backend/.env` içindeki `JWT_SECRET` `openssl rand` ile üretildi, örnek değer değil
- [ ] `FRONTEND_URL` gerçek alan adı, sonunda eğik çizgi yok
- [ ] `NEXT_PUBLIC_API_URL` ve `NEXT_PUBLIC_SITE_URL` doldurulup **sonra** derleme yapıldı
- [ ] `TRUST_PROXY=1` (nginx arkasındayken) — yoksa tüm ziyaretçiler tek IP sanılıp birlikte kısıtlanır
- [ ] `npm run migrate:status` "up to date" diyor
- [ ] PostgreSQL dışarı açık değil (`ufw status` içinde 5432 yok)
- [ ] `backend/.env` depoya işlenmedi (`git status` temiz)
- [ ] İlk yönetici oluşturuldu ve giriş yapabiliyor
- [ ] Yedekleme cron'u kurulu ve bir kez elle denendi
- [ ] HTTPS çalışıyor, http:// adresi https://'e yönleniyor
- [ ] `/api/health` yanıt veriyor: `curl https://alanadiniz.com/api/health`

---

## 13. Alternatif: hazır platformlar

Sunucu yönetmek istemiyorsanız:

| Parça | Uygun platform | Not |
|---|---|---|
| Frontend | Vercel | Next.js için doğal ortam, ücretsiz katman yeterli |
| Backend | Render, Railway, Fly.io | Sürekli çalışan bir süreç gerekir |
| Veritabanı | Neon, Supabase | Bağlantı havuzlayan uçları kullanın |

**Backend'i Vercel'e koymayın.** İki nedeni var: hız sınırlayıcı sayaçları süreç
belleğinde tutuyor — her istek ayrı bir sunucusuz örneğe düşünce sınır fiilen
çalışmaz; ve her örnek kendi veritabanı bağlantı havuzunu açtığı için PostgreSQL
bağlantıları hızla tükenir.

Docker bekleyen ortamlar için `backend/Dockerfile` hazır ve **derlenip
çalıştırılarak doğrulandı** (2026-08-25): imaj 676 MB, konteyner veritabanına
bağlanıp gerçek veriyi döndürüyor, `/api/health` üzerinden HEALTHCHECK çalışıyor
ve göçler konteynerin içinden yürütülebiliyor.

```bash
docker build -t fwt-backend ./backend
docker run -p 3001:3001 --env-file backend/.env fwt-backend

# Göçleri konteynerin içinden çalıştırmak:
docker exec <konteyner> npx prisma migrate deploy
```

> **`--env-file` imajdaki ayarları ezer.** `backend/.env` içinde
> `NODE_ENV=development` satırı kalırsa bu bayrak konteynere de geçer. Bu
> durumda üretime özel doğrulamalar (zayıf `JWT_SECRET`'in reddi, eksik
> `FRONTEND_URL` kontrolü) devre dışı kalırdı — bu yüzden imaj `NODE_ENV`
> değerini başlatma komutunda sabitliyor ve `.env` ne derse desin üretim kipinde
> açılıyor. Yine de sunucudaki `.env` dosyasında `NODE_ENV=production` yazması
> doğrusudur: systemd yolunda kip oradan okunuyor.

---

## 14. Sorun giderme

**Sunucu başlamıyor, "Ortam yapılandırması geçersiz" yazıyor**
Mesaj eksik değişkenleri tek tek sayar. `backend/.env` dosyasını düzeltin.
Bu bilinçli bir davranıştır: yarım yapılandırmayla çalışan bir sunucu, sessizce
güvensiz olan sunucudur.

**Site açılıyor ama hiçbir veri gelmiyor**
Tarayıcı konsolunda CORS hatası varsa `FRONTEND_URL` yanlış. Sonunda eğik çizgi
olmamalı ve şema (`https://`) dahil olmalı.

**Girişler çalışıyor ama her istek 401 dönüyor**
`JWT_SECRET` derlemeden sonra değişmiş olabilir. Değiştiğinde eski tokenlar
geçersizleşir; çıkıp yeniden girin.

**Herkes aynı anda hız sınırına takılıyor**
`TRUST_PROXY` ayarlanmamış. nginx arkasındaysanız `TRUST_PROXY=1` ekleyip
backend'i yeniden başlatın.

**`npm audit` üç yüksek uyarı gösteriyor**
Uyarı `prisma` komut satırı aracının yapılandırma okuyucusundaki
(`deepmerge-ts`) bir sorundan geliyor ve yalnızca kendi yazdığınız
`prisma.config.ts` dosyası işlenirken tetiklenebilir — dışarıdan gelen veriye
dokunmuyor. `npm audit fix --force` prisma'yı eski bir sürüme düşürür; yapmayın.

**Next.js derlemesi sunucuda öldü**
Bellek yetersiz. 2 GB'a çıkın ya da derlemeyi kendi bilgisayarınızda yapıp
`.next` klasörünü sunucuya kopyalayın.
