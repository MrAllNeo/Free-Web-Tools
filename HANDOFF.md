# FWT — Asistan Devir Notu

> Bu dosya, projede çalışan yapay zekâ asistanlarının (Claude / ChatGPT) ortak referansıdır.
> Amaç: biri limitine takıldığında diğerinin sıfırdan keşif yapmadan kaldığı yerden devam edebilmesi.
>
> **Son güncelleme:** 2026-08-16 · **Son kod commit’i:** `84687d4` · **Repo:** https://github.com/MrAllNeo/Free-Web-Tools (public)
>
> Repo public ama **lisans dosyası yok** — bu hukuken "tüm hakları saklı" demek. Sahibi
> bunu bilerek böyle bırakmayı seçti; README ve footer'daki "açık kaynak" ibareleri kaldırıldı.

---

## 1. Proje nedir

**free/web/tools (FWT)** — video anlatımlı kod snippet platformu + 13 bağımsız geliştirici aracı.

Ürün fikri: Stack Overflow cevabı ile YouTube eğitimi arasındaki boşluğu kapatmak. Kullanıcı hem
kodu alır hem de birinin o kodu neden öyle yazdığını anlattığını izler.

Dört bölüm var:

| # | Bölüm | İçerik | Kod çalıştırma |
|---|-------|--------|----------------|
| 01 | Frontend | UI bileşenleri, CSS efektleri | **Canlı** — kod iframe'de çalışır |
| 02 | Backend | Auth, API pattern'leri, DB şemaları | Video veya görsel |
| 03 | Hacking | Pentest, zafiyet analizi | Video veya görsel — **asla çalıştırılmaz** |
| 04 | Tools | 13 bağımsız araç | Anında, hesap gerekmez |

FWT, sahibinin **TOYWES** ekosisteminin ilk projesi.

---

## 2. Teknoloji yığını

**Frontend** (`frontend/`, 86 dosya)
- Next.js **16.2.12** (App Router, Turbopack) + React **19.2.4** + TypeScript
- Tailwind CSS **v4** — `@theme inline` ile CSS değişkeni tabanlı token katmanı
- TanStack Query (veri), Zustand (auth state), React Hook Form + Zod (formlar)
- `react-syntax-highlighter` + projeye özel Prism teması
- Framer Motion (giriş animasyonları), lucide-react (ikonlar)
- **Sucrase** — JSX/TS'i tarayıcıda JS'e çevirir (canlı önizleme); dinamik `import()` ile
  yalnızca React önizlemesi açıldığında indirilir
- **esbuild** (devDependency) — önizleme iframe'inin React çalışma zamanını paketler

**Backend** (`backend/`, 21 dosya)
- Node + Express **5** + TypeScript
- Prisma **7.9.1** → PostgreSQL
- JWT + bcryptjs, helmet, cors, Zod doğrulama

> ⚠️ **Next.js 16 eğitim verinden farklı.** `frontend/AGENTS.md` bunu açıkça uyarıyor:
> API'ler, konvansiyonlar ve dosya yapısı değişmiş olabilir. Kod yazmadan önce
> `frontend/node_modules/next/dist/docs/` altındaki ilgili rehberi oku. Bu oturumda
> `prisma db push --skip-generate` gibi birkaç bayrağın kaldırıldığı da görüldü.

---

## 3. Çalıştırma

```bash
npm run setup        # kök + frontend + backend bağımlılıkları
cp backend/.env.example backend/.env   # DATABASE_URL, JWT_SECRET doldur
npm run db:push && npm run db:seed
npm run dev          # frontend :3000, backend :3001
```

Tüm scriptler **kökten** çalışır: `dev`, `build`, `start`, `typecheck`, `lint`,
`db:push`, `db:seed`, `db:studio`, `clean`. `:frontend` / `:backend` eki tek tarafı çalıştırır.

Seed demo yöneticisi: `admin@freewebtools.dev` / `Admin123!@#`

---

## 4. Mimari kararlar ve **gerekçeleri**

Bunlar keyfi değil; değiştirmeden önce gerekçeyi tart.

| Karar | Neden |
|-------|-------|
| **Sadece koyu tema** (toggle yok) | Referans tasarım (`fwt-full-demo.html`) tek paletle tasarlandı. İki tema tutmak token katmanını ikiye katlar, karşılığında bir şey kazandırmaz. |
| **Arayüz tamamen Türkçe** | Kullanıcının açık tercihi. Kod, değişken adları ve commit mesajları İngilizce; **kod içi yorumlar Türkçe**. |
| **Renk kodlaması** | Amber = frontend/backend, mavi = hacking, yeşil = tools. Kullanıcı hangi bölümde olduğunu renkten anlar. |
| **Araç mantığı `lib/tools/` altında saf fonksiyon** | Ana sayfadaki canlı demo paneli ile `/tools/<slug>` sayfası aynı kodu paylaşsın; iki ayrı implementasyon sapmasın. |
| **12 araç tamamen istemci tarafında** | Sunucu maliyeti sıfır, veri kullanıcının cihazından çıkmaz, çevrimdışı çalışır. Sadece link kısaltma sunucu gerektiriyor (kısa kod bir yerde saklanmalı). |
| **Frontend snippet'leri her zaman canlı** | Ürün kuralı. Sunucu `mediaType`'ı kullanıcıya güvenmek yerine kendisi çözer (`resolveMediaType`), böylece kategori değişince tutarsız duruma düşülemez. |
| **Lisans dosyası yok, repo public kaldı** | Kullanıcı telif satırı istemiyor. Repoyu private yapmak gündeme geldi ama vazgeçildi (2026-08-16). Lisanssız repo hukuken "tüm hakları saklı" sayılır; çelişkiyi gidermek için README'deki "fully open source" bölümü ve footer'daki "açık kaynak" ibaresi kaldırıldı. Lisans eklenirse (The Unlicense / CC0 önerilmişti) durum netleşir. |
| **Moderasyon rol değil kategori odaklı** | Hacking içeriği katkıcıdan gelse bile incelenir. Rolü yüksek olan kullanıcının riskli içeriği denetimsiz geçirmesi, platformun kendi yayımladığı politikayla çelişirdi. |

---

## 5. Veri modeli

`backend/prisma/schema.prisma` — 8 model: `User`, `Snippet`, `Comment`,
`UserInteraction`, `ContributionHistory`, `ShortLink`, `Notification`, `Report`.

**`Snippet.demoHtml`** (nullable): katkıcının yazdığı demo markup. Saf CSS/JS'i görünür kılan
iskelet. Sanitize **edilmez ve edilmemeli** — önizleme zaten sandbox'lı iframe'de çalışır ve bu
alan snippet kodunun kendisiyle aynı güven seviyesindedir. Ana sayfanın DOM'una asla enjekte edilmez.

**Kritik alan — `Snippet.mediaType`** (enum: `video | image | live | none`):
snippet'in üstünde ne gösterileceğini belirler. Yanında `videoUrl`,
`videoDurationSeconds`, `imageUrl`, `imageCaption` var.

Kural: frontend → her zaman `live`. Backend/hacking → katkıcı yüklerken seçer.
Sunucu tarafında `resolveMediaType()` (`snippetController.ts`) son sözü söyler.

Denormalize sayaçlar: `Snippet.likesCount`, `commentsCount`, `averageRating`
liste sorgularında `COUNT` atmamak için snippet üzerinde tutulur. Yorum ekleme/silme
`recalculateRating()`, beğeni ise `toggle()` içinde bunları günceller —
**yeni yazma yolu eklersen bu sayaçları güncellemeyi unutma.**

---

## 6. API uç noktaları

```
POST   /api/auth/register | login          GET /api/auth/me

GET    /api/snippets                       liste (sayfalama, filtre, arama, sıralama)
GET    /api/snippets/stats                 toplam, kategori kırılımı, ort. puan
GET    /api/snippets/:idOrSlug             detay
POST   /api/snippets                       oluştur (giriş yapan herkes; yayım kararı autoApproves)
PUT    /api/snippets/:id                   güncelle (sahip/admin)
DELETE /api/snippets/:id                   sil (sahip/admin)

GET    /api/snippets/:id/comments          yorum ağacı — sayfalı (page, limit≤50), yanıtlar 10 ile sınırlı
POST   /api/snippets/:id/comments          yorum + 1-5 puan
POST   /api/snippets/:id/like | save       toggle
GET    /api/snippets/:id/interaction       kullanıcının beğeni/kayıt durumu

PUT    /api/users/me                       profil güncelle
GET    /api/users/me/saved                 kaydedilenler
GET    /api/users/me/snippets              kendi snippet'leri — HER statüde + red gerekçesi
GET    /api/users/:username                herkese açık profil (e-posta/son giriş DÖNMEZ)
DELETE /api/users/comments/:id             yorum sil (sahip/admin)

POST   /api/links/shorten                  misafir de kullanabilir
GET    /api/links/:slug                    çöz + tıklanma say
GET    /api/links/stats/:slug              istatistik

GET    /api/snippets/:id/related           aynı yazardan + benzer snippet'ler
PUT    /api/users/comments/:id             yorum düzenle (YALNIZCA sahibi, yönetici bile değil)

GET    /api/notifications                  bildirimler + okunmamış sayısı
PUT    /api/notifications/read             tümünü okundu işaretle
POST   /api/reports                        içerik bildir (giriş şart)

GET    /api/admin/snippets/pending         moderasyon kuyruğu
PUT    /api/admin/snippets/:id/status      onayla/reddet (+gerekçe)
GET    /api/admin/reports                  açık şikayetler
PUT    /api/admin/reports/:id              şikayeti kapat
GET    /api/admin/analytics                platform özeti
```

**Sayfalama kuralı:** liste döndüren her yeni uç noktaya en baştan limit koy. `listComments`
ve `listSaved` sınırsız yazılmıştı; sorun ancak veri büyüyünce görünür olur, o zaman da geç olur.

**Rota sırası tuzağı:** `/stats` mutlaka `/:id`den, `/stats/:slug` de `/:slug`den,
`/me/*` de `/:username`den **önce** tanımlanmalı — yoksa dinamik segment onları yutar.
Aynı tuzak Next tarafında da var: `/profile/[username]` "snippets"i kullanıcı adı sanacağı
için hesap sayfaları `/my/...` altında duruyor.

---

## 7. Gelinen nokta

Tüm planlanan fazlar bitti (`FWT_TECH_STACK_BLUEPRINT.md` referans alındı):

- ✅ **Faz 0-1-2** — Terminal tasarım sistemi, 7 UI primitifi, ana sayfa, 13 sayfanın tamamı yeni temada
- ✅ **Faz 3** — 13 aracın hepsi canlı
- ✅ **Faz 4** — Yorumlar+puanlama, beğeni/kaydetme, moderasyon, analitik, link kısaltma
- ✅ **Faz 5** — `sitemap.ts`, `robots.ts`, sayfa bazında metadata

**Kalan işler gruplara bölündü (2026-08-16).** Sırayla ilerliyoruz; grup bitmeden diğerine geçme.

Saf kod — dış servis gerektirmez:

| Grup | İçerik | Durum |
|------|--------|-------|
| **A · Güvenlik** | Hız sınırlama, gövde boyutu limiti, vekil arkasında doğru IP | ✅ **bitti** |
| **B · Test altyapısı** | Vitest + 130 test: araçların saf mantığı, önizleme kuralları, `urlSafety`, doğrulayıcılar | ✅ **bitti** |
| **C · Profil** | `/profile/[username]`, yazar adlarının link olması, kullanıcının snippet'leri | ✅ **bitti** |
| **İ · Sahiplik** | Snippet düzenleme/silme, "snippet'lerim" (bekleyen+reddedilen), kaydedilenler | ✅ **bitti** |
| **J · Topluluk** | İçerik bildirme, yorum bildirimi, bu yazardan diğerleri, paylaş düğmesi, yorum düzenleme | ✅ **bitti** |
| **G · Arama ve ölçek** | Trigram indeksleri, çok kelimeli arama, yorum sayfalama | ✅ **bitti** |
| **E · Moderasyon filtresi** | Hacking için otomatik anahtar kelime taraması | ⏭️ **atlandı** — sahibi "çok detay" dedi (2026-08-16) |

Dış servis/karar gerektirir — kullanıcı seçmeden başlama:

| Grup | Neye bağlı |
|------|-----------|
| **D · Video/görsel yükleme** | Depolama servisi (Cloudinary vb.) |
| **F · E-posta doğrulama + bildirim** | SMTP sağlayıcı |
| **H · Dağıtım** | Hosting + CI hedefi |

**Commit haritası** — hangi iş nerede (`git show <hash>` ile ayrıntısına bak):

| Commit | İş |
|--------|-----|
| `3caf9b9` | README ve footer'dan "açık kaynak" ibaresinin kaldırılması |
| `3284bef` | **Grup A** — hız sınırlama, gövde limiti, `TRUST_PROXY`, istemcide 429 ve JSON olmayan hata yanıtı |
| `23561c2` | **Grup B** — Vitest + 130 test ve testlerin bulduğu üç hatanın düzeltilmesi |
| `2b9ff89` | **Grup C** — herkese açık profil sayfaları |

Commit mesajları uzun ve gerekçeli yazıldı; bir kararın nedenini merak edersen önce oraya bak.

**Grup G'de yapılanlar (arama ve ölçek):**

**1. Trigram indeksleri.** Arama `ILIKE '%terim%'` üretiyor ve desen baştan sabit olmadığı
için hiçbir B-tree indeksi kullanılamıyordu — her arama tam tablo taramasıydı. `pg_trgm`
eklentisi Prisma'nın `postgresqlExtensions` önizleme özelliğiyle **şemadan** kuruluyor
(`datasource db { extensions = [pg_trgm] }`), böylece `db push` yeterli; ayrı migration
dosyasına gerek yok — bu proje migration kullanmıyor.

`Snippet` üzerinde eklenen indeksler:
```prisma
@@index([status, publishedAt])                        // "yayındakiler, tarihe göre"
@@index([status, category])                           // "yayındakiler, kategoriye göre"
@@index([title(ops: raw("gin_trgm_ops"))], type: Gin)
@@index([description(ops: raw("gin_trgm_ops"))], type: Gin)
@@index([tags], type: Gin)
```
`status` her listeleme sorgusunda filtreleniyordu ama **hiç indeksi yoktu**.

**Ölçüldü:** 5.000 satırlık sentetik veriyle, az eşleşen bir terim için aynı sorgu
indeksle **0,67 ms**, `enable_bitmapscan=off` ile **23,6 ms** — ~35 kat. Sık eşleşen
terimlerde planlayıcı `LIMIT` varken yine tarama seçebilir; bu normal ve doğrudur.
Kıyas verisi sonrasında silindi.

**2. Çok kelimeli arama.** Eskiden sorgu tek bir alt dize olarak aranıyordu: "grid css"
**sıfır** sonuç veriyordu çünkü bu iki kelime bitişik geçmiyordu. Artık sorgu kelimelere
bölünüyor, **kelimeler arasında AND, alanlar (başlık/açıklama/etiket) arasında OR**.
"css grid" ve "grid css" aynı 2 sonucu veriyor. Kelime sayısı 6 ile sınırlı — her kelime
üç ILIKE daha ekliyor ve yapıştırılan uzun bir cümle sorguyu gereksiz pahalılaştırır.

**3. Yorum sayfalama.** `listComments` **sınırsızdı**: popüler bir snippet tüm yorumlarını,
tüm yanıtlarıyla birlikte tek yanıtta döndürürdü. Artık `page`/`limit` (varsayılan 20,
en fazla 50) ve `pagination` bilgisi dönüyor. Bir yorumun altındaki **yanıtlar da 10 ile
sınırlı**; `_count.replies` gerçek toplamı taşıyor ve arayüz "+N yanıt daha" gösteriyor.
`Comment` üzerine `@@index([snippetId, parentCommentId, createdAt])` eklendi.

**Grup J'de yapılanlar:** İki yeni model — `Notification` ve `Report`.

- **Bildirimler** (`services/notifications.ts`): snippet'ine yorum gelince, yorumuna yanıt
  gelince, moderasyon karar verince. E-posta yok, site içinde duruyor. Zil `Navbar`da,
  liste `/my/notifications`. Bildirim üretimi tetikleyen işlemi **etkilemez** — hata yutulup
  loglanıyor; yorum kaydedildiyse kaydedilmiştir.
- **Şikayet**: `/api/reports` (giriş şart — anonim bildirim kuyruğu doldurmanın bedava yolu
  olurdu). Aynı kişi aynı içeriği tekrar bildirirse yeni kayıt açılmıyor. Yönetici kuyruğu
  `/admin` içinde `ReportQueue` bileşeninde. **Moderasyon önceden yalnızca yayın öncesini
  kapsıyordu**; bu, yayımlandıktan sonrasını kapatıyor.
- **Benzer snippet'ler**: `GET /api/snippets/:id/related` → aynı yazardan 3 + benzer 3
  (önce ortak etiket, yoksa aynı kategori). Öneri motoru değil, amaç detay sayfasının
  çıkmaz sokak olmaması.
- **Paylaş düğmesi**: `navigator.share`, yoksa panoya kopyalama.
- **Yorum düzenleme**: yalnızca **sahibi**. Yönetici başkasının yorumunu silebilir ama
  **düzenleyemez** — birinin ağzından söz değiştirmek moderasyon değil tahrifat olurdu.
  Puan düzenlenemiyor: puan snippet ortalamasını besliyor, sessizce değiştirilebilmesi
  ortalamayı manipüle etmenin kolay yolu olurdu.

**Grup İ'de yapılanlar:** Katkıcı artık kendi içeriğinin sahibi:
- `/snippets/[slug]/edit` — düzenleme + silme. Form `components/snippets/SnippetForm.tsx`e
  çıkarıldı ve gönderim sayfasıyla **paylaşılıyor**; iki kopya tutulsaydı biri güncellenip
  diğeri unutulurdu (demo HTML alanı tam da böyle sessizce silinebilirdi).
- `/my/snippets` — kendi snippet'leri, **her statüde**; reddedilenler gerekçesiyle.
- `/my/saved` — kaydedilenler. Kaydetme düğmesi bugüne kadar hiçbir yere gitmiyordu.
- `getSnippet` artık statüyü sorgudan sonra kontrol ediyor: sahibi ve yönetici kendi
  yayınlanmamış snippet'ini görebilir, başkasına **404** döner (403 kaydın varlığını doğrulardı).
  Rotada `optionalAuth` var. Sahibinin kendi ziyareti görüntülenme sayılmıyor.
- `listSaved` eksik alanlar döndürüyordu (`codeContent`, `demoHtml`, `mediaType`, `imageUrl`);
  kaydedilenler listesinde kartlar boş görünürdü.

Rotalar `/my/...` altında, `/profile/...` altında **değil**: `/profile/[username]` dinamik
segmenti "snippets"/"saved" kullanıcı adlarıyla çakışırdı.

Düzenlemede statü **bilinçli olarak** değiştirilmiyor. Snippet oluşturma zaten yalnızca
contributor/admin'e açık ve o roller otomatik onaylanıyor; düzenlemeyi tekrar kuyruğa
sokmak moderasyon açısından bir şey kazandırmaz, sadece can sıkardı.

**Moderasyon artık gerçekten çalışıyor (sahibinin kararı, 2026-08-16).** Önceden `pending`
durumu erişilemezdi: gönderim `requireRole('contributor','admin')` ile sınırlıydı ve o iki rol
otomatik onaylanıyordu, yani kuyruk kalıcı olarak boştu.

Şimdi giriş yapan **herkes** gönderebiliyor; yayımlanıp yayımlanmayacağına
`autoApproves(role, category)` karar veriyor (`snippetController.ts`):

| Kim | Ne gönderiyor | Sonuç |
|-----|---------------|-------|
| Yönetici | her şey | doğrudan yayımlanır |
| Katkıcı | frontend/backend | doğrudan yayımlanır |
| Katkıcı | **hacking** | **incelemeye girer** |
| Diğer herkes | her şey | incelemeye girer |

Hacking istisnası bilinçli: platformun açık politikası "her hacking gönderimi yayından önce
incelenir". Rol yüzünden kendi kuralımızı delmiyoruz.

**Grup C'de yapılanlar:** `GET /api/users/:username` herkese açık profil döndürüyor —
kullanıcı + yayınlanmış snippet'leri (en fazla 50) + toplam görüntülenme/beğeni.
Rota dosyasında **en sonda**: dinamik segment `/me` ve `/comments/:id` yollarını yutmasın.

⚠️ **`PROFILE_FIELDS`, `PUBLIC_USER_FIELDS`ten ayrıdır ve öyle kalmalı.** İkincisi kullanıcının
kendi hesabı için ve `email` + `lastLogin` içeriyor; herkese açık profile eklenirse e-posta
spam hedefi olur, son giriş de çevrimiçi olma bilgisini sızdırır. Frontend'de de ayrı tip var
(`PublicProfile`), böylece arayüz var olmayan alanları beklemez.

Olmayan kullanıcıda **gerçek 404**: sayfa istemci bileşeni olduğu için `notFound()` orada
çağrılamıyor, kontrol `layout.tsx` içinde. API kapalıyken 404 basılmıyor — geçici kesinti
kalıcı "yok" sinyaline dönüşmemeli.

Yazar adı snippet detayında profile link; **kartlarda değil** — kartın tamamı zaten bir
`<Link>`, içine link koymak geçersiz HTML olurdu.

**Grup B'de yapılanlar:** Vitest 4 iki tarafa da kuruldu (`vitest.config.mts` — `.ts` uzantısı
Vite'ın yeni yapılandırma yükleyicisinde uyarı üretiyor). Testler kaynağın yanında `*.test.ts`.
Kökten `npm test` ikisini birden koşar. **130 test** (frontend 91, backend 39) —
araçların saf mantığı, önizleme kuralları ve `urlSafety` güvenlik kapısı.

Testler yazılırken **üç gerçek hata** çıktı, üçü de düzeltildi:
1. **IPv6 loopback engeli çalışmıyordu.** `URL.hostname` IPv6'yı `"[::1]"` diye köşeli
   parantezle döndürüyor, liste ise parantezsiz `::1` içeriyordu — eşleşme olmuyordu.
   Artık parantez soyuluyor; ayrıca `::ffff:` (IPv4-eşlemeli), `fe80:`, `fc00::/7`,
   tüm `127.` bloğu ve `169.254.` aralığı da kapatıldı.
2. **`generatePassword` 16.384 karakterden uzun parolada çöküyordu** —
   `crypto.getRandomValues` tek çağrıda 65.536 baytla sınırlı. Artık partiler hâlinde.
   (Arayüz 64'te sınırladığı için kullanıcıya yansımıyordu.)
3. **`escapeForScript` kodun harf yazımını bozuyordu** — `</SCRIPT>` küçük harfe çevriliyordu.

**Grup A'da yapılanlar:** `middleware/rateLimit.ts` dört sınırlayıcı tanımlıyor — genel tavan
(600/15dk), auth (10/15dk, başarılı girişler sayılmaz), link kısaltma (20/saat), yazma (40/15dk).
Sayaçlar **süreç belleğinde**: birden fazla kopya çalıştırılırsa Redis gerekir. `TRUST_PROXY`
ortam değişkeni vekil arkasında gerçek IP için; **vekil yokken açılmamalı**, yoksa istemci
kendi IP'sini uydurup sınırı aşar. JSON gövde limiti 10 MB → 1 MB. İstemci tarafında
`api.ts` artık HTTP durumunu da fırlatıyor ve JSON olmayan hata yanıtında çökmüyor;
`getApiErrorMessage` 429'u Türkçe gösteriyor.

**Son teknik güncelleme (2026-08-07):**
- Çalıştırılamayan frontend snippet'leri (`CodeThumbnail`) kartta artık düz metin yerine
  satır numaralı Prism syntax highlighting ile gösterilir.
- **Canlı önizleme iki yönden genişletildi:**
  1. `Snippet.demoHtml` alanı eklendi — katkıcı yalnızca CSS ya da JS paylaşsa bile önizleme
     çalışıyor. Yükleme formunda frontend kategorisinde isteğe bağlı alan olarak çıkıyor.
  2. JSX/TSX artık **derlenip çalıştırılıyor** (Sucrase + kendi paketlediğimiz React runtime).
     `LANGUAGES` listesine `jsx`/`tsx` eklendi.
  Güvenlik sandbox'ı değişmedi: `PREVIEW_SANDBOX` hâlâ `allow-same-origin` **vermiyor**.
  Doğrulandı: TSX sayaç bileşeni sandbox'lı iframe içinde render oluyor ve tıklamayla
  state güncelleniyor (0 → 2); saf CSS + demo markup canlı görünüyor; demo markup'ı olmayan
  snippet ne yapılması gerektiğini söyleyen panel gösteriyor.

---

## 8. Kod stili

- **TypeScript her yerde**, `any` kullanma (mevcut tek istisna: `updateSnippet` içindeki `updateData`)
- **Sabit renk yok** — tasarım token'ları kullan: `bg-raised`, `text-muted`, `border-line`, `text-amber` vb. Ham hex yazma.
- **Yorumlar *neden*i anlatır, *ne*yi değil.** Kodun kendisi ne yaptığını zaten söylüyor. Şaşırtıcı olan, tuzak olan, gerekçesi olmayan şeyi yaz.
- Commit mesajları İngilizce, ne değişti + neden. Bulunan hataları ayrıca belirt.
- **Doğrulama zorunlu:** `npm test && npm run typecheck && npm run lint && npm run build` yeşil
  olmadan commit yok. Yeni saf mantık yazdıysan testini de yaz — `lib/tools/`, `lib/preview.ts`
  ve `utils/` altındaki her şey test edilebilir olmalı. UI değişikliğinde ekran görüntüsüyle bak — bu oturumda birkaç hata sadece görsel kontrolde yakalandı.

---

## 9. Bilinen tuzaklar ⚠️

Bunlar zaman kaybettirdi; tekrar yaşamayın.

**1. Turbopack önbellek bozulması → rotalar teker teker 404/500**
Aynı checkout'ta iki dev sunucusu çalışırsa ya da bir dev sunucusu yazma sırasında
öldürülürse `frontend/.next` içindeki kalıcı önbellek bozuluyor. Belirti sinsi:
sayfalar derlendikçe *birer birer* düşüyor. Log: `frontend/.next/dev/logs/next-development.log`
→ `Failed to restore task data`. **Çözüm:** `npm run clean && npm run dev`.
`predev` guard'ı (`scripts/dev-cache-guard.mjs`) build-sonrası-dev durumunu otomatik yakalıyor.

**2b. Prisma önizleme özelliği + `db push` ile eklenti kurulabiliyor.** Migration dosyası
olmadan da `datasource db { extensions = [pg_trgm] }` + `previewFeatures = ["postgresqlExtensions"]`
eklentiyi kuruyor ve `@@index(..., type: Gin)` indeksleri oluşturuyor. Bu proje migration
kullanmadığı için tek yol bu; ham SQL yazmaya kalkma.

**2a. Prisma'da `onDelete` belirtmezsen zorunlu ilişkilerde varsayılan `Restrict`tir.**
`ContributionHistory.snippet` böyleydi ve **onaylanmış snippet silinemiyordu** — moderasyondan
geçen her snippet bir katkı kaydı oluşturduğu için "snippet'ini sil" tam da yayınlanmış
içerikte kırılıyordu. Yeni ilişki eklerken silme davranışını açıkça yaz.

**2. Prisma şeması değişince backend'i yeniden başlat.**
`prisma generate` çalışsa bile çalışan süreç eski istemciyi bellekte tutuyor →
`Unknown field ... for select statement`. `tsx watch` bunu kurtarmıyor.

**3. Canlı önizlemenin üç ayrı yolu var — hangisinin seçildiğini bil.**
`lib/preview.ts` karar verir:
- **Doğrudan çalışan kod** (tam HTML belgesi, markup, `<style>`/`<script>` içeren HTML):
  `canRenderLive()` true → `buildPreviewDocument()` senkron üretir.
- **Derleme gerektiren kod** (JSX/TSX): `needsCompilation()` true → `lib/reactPreview.ts`
  Sucrase ile derler, **asenkron**. Derleme üst sayfada yapılır, iframe'e düz JS girer.
- **Hiçbiri**: `liveBlocker()` nedeni söyler — `needs-demo-html` (katkıcı düzeltebilir)
  ya da `not-browser-language` (Python/Go/SQL — hiçbir koşulda çalışmaz).

Saf CSS/JS tek başına ekranda hiçbir şey göstermez; `Snippet.demoHtml` alanı katkıcının
yazdığı iskeleti taşır ve doluysa önizleme çalışır. Tailwind CDN'i **sadece kod Tailwind
sınıfı kullanıyorsa** enjekte edilir (400 KB, çevrimdışı çalışmaz, IP sızdırır).

**Kartlarda React önizlemesi bilinçli olarak yok.** Bir ızgarada düzinelerce iframe'in her biri
React çalışma zamanını ayrıştırsaydı zayıf makinelerde liste kilitlenirdi; kartta `CodeThumbnail`,
detayda canlı çalıştırma var.

**4. Önizleme iframe'inde `allow-same-origin` KULLANMA.**
`srcDoc` üst sayfayla aynı kaynağı paylaşır; topluluktan gelen snippet kodu
localStorage'daki JWT'yi okuyabilir. Sabit: `PREVIEW_SANDBOX = 'allow-scripts allow-modals'`.

**5. Zod sürümleri tutarsız** — backend v4, frontend v3.25. Paylaşılan şema yazacaksan dikkat.
Bu bir hataya yol açtı: Zod v4 `error.errors` alanını **`error.issues`** yaptı, `errorHandler`
eskisini okumaya devam etti ve `as any` cast'i tip hatasını gizledi. Sonuç, API'deki **her**
doğrulama hatasının 400 yerine 500 dönmesiydi — kullanıcı "parolan çok kısa" yerine
"Internal server error" görüyordu. `errorHandler.test.ts` artık bunu koruyor.
**`as any` yazmak zorunda kaldığın yer, tam da hatanın saklandığı yerdir.**

**6. Kalıcı lint uyarısı** — `snippets/new/page.tsx` içinde react-hook-form `watch()`
React Compiler tarafından memoize edilemiyor. Kütüphane kaynaklı, davranışsal etkisi yok.

**7. `npm exec -- <komut> --flag` argümanları geçirmiyor.** Scriptlerde `cd X && npx ...` kullan.

**8. React 19'un UMD build'i yok.** İframe'e doğrudan verilebilecek hazır dosya yayınlanmıyor.
`frontend/scripts/build-preview-runtime.mjs` esbuild ile kendi paketimizi üretip
`public/preview/react-runtime.js` olarak koyuyor; `predev`/`prebuild` bunu otomatik çalıştırır.
Çıktı git'e girmez (`.gitignore`) ve ESLint'ten hariç tutulur — yoksa üretilmiş minified dosya
700'e yakın sahte uyarı basıyor.

**9. Headless tarayıcı testinde `--virtual-time-budget` yanıltıyor.**
Sanal zaman CPU işini beklemiyor: React önizlemesi aslında çalışırken ekran görüntüsünde
sonsuz spinner görünüyordu ve bu **yanlışlıkla ürün hatası sanıldı**. Doğru ölçüm CDP ile
gerçek zamanlı bekleyip `Page.captureScreenshot` almak. Ayrıca önizleme iframe'i
`allow-same-origin` almadığı için **ayrı bir süreç hedefi (OOPIF)**: sayfa düzeyinde
`Input.dispatchMouseEvent` içine ulaşmaz, `Target.attachToTarget` ile çerçevenin kendi
oturumuna bağlanman gerekir.

---

## 10. İki asistan nasıl çalışsın

- **Başlamadan `git log --oneline -10` ve `git status`** — diğerinin ne yaptığını gör.
- **Küçük ve tam commit'ler.** Yarım bırakılmış iş diğerini yanıltır.
- **Bu dosyayı güncelle.** Yeni bir tuzak bulduysan, mimari karar verdiysen ya da bir faz
  bitirdiysen buraya yaz. Devir notu güncel değilse işe yaramaz.
- **Emin olmadığın şeyi doğrula, tahmin etme.** Bu oturumda "404'lerin sebebi production
  manifest çakışması" diye yanlış teşhis kondu; asıl sebep Turbopack önbellek bozulmasıydı
  ve ancak log okunarak bulundu.
- **Kullanıcı Türkçe konuşuyor**, Türkçe yanıt ver.

---

## 11. Referans dosyalar

**Repoda olanlar:**

| Dosya | İçerik |
|-------|--------|
| `README.md` | Kurulum, scriptler, API özeti, sorun giderme |
| `frontend/AGENTS.md` | Next.js 16 uyarısı |
| `frontend/src/lib/constants.ts` | Kategoriler, 13 aracın metadata'sı, `ready` bayrakları |
| `frontend/src/app/globals.css` | Tasarım token'larının **tek** kaynağı |
| `frontend/src/lib/preview.ts` | Canlı önizleme kuralları (`canRenderLive`, sandbox) |
| `backend/prisma/schema.prisma` | Veri modeli |

**⚠️ Repoda OLMAYAN iki kaynak belge** — bunlar sohbet üzerinden paylaşıldı, git'e girmedi.
İkinci asistana da ayrıca vermen gerekiyor, yoksa tasarımın ve planın kaynağını göremez:

| Dosya | Neden önemli |
|-------|--------------|
| `fwt-full-demo.html` | Referans tasarım. Palet, düzen, tipografi buradan birebir alındı. |
| `FWT_TECH_STACK_BLUEPRINT.md` | Orijinal plan. **Bazı kısımları artık güncel değil:** Next.js 14 diyor (gerçekte 16), shadcn/ui ve Cloudinary diyor (ikisi de kullanılmıyor), araç önceliklendirmesi tamamlandı. |
