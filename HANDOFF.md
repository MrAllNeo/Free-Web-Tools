# FWT — Asistan Devir Notu

> Bu dosya, projede çalışan yapay zekâ asistanlarının (Claude / ChatGPT) ortak referansıdır.
> Amaç: biri limitine takıldığında diğerinin sıfırdan keşif yapmadan kaldığı yerden devam edebilmesi.
>
> **Son güncelleme:** 2026-08-07 · **Son commit:** `ee526ef` · **Repo:** https://github.com/MrAllNeo/Free-Web-Tools (public)

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
| **Lisans dosyası yok** | Kullanıcının açık talebi (telif satırı istemiyor). ⚠️ **Hukuken bu "tüm hakları saklı" demek** — README "fully open source" diyor ama lisans olmadan kimse yasal olarak kullanamaz. Kullanıcıya The Unlicense / CC0 önerildi, henüz karar vermedi. Bu çelişkiyi ona tekrar hatırlatmak yerinde olur. |

---

## 5. Veri modeli

`backend/prisma/schema.prisma` — 6 model: `User`, `Snippet`, `Comment`,
`UserInteraction`, `ContributionHistory`, `ShortLink`.

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
POST   /api/snippets                       oluştur (contributor/admin)
PUT    /api/snippets/:id                   güncelle (sahip)
DELETE /api/snippets/:id                   sil (sahip/admin)

GET    /api/snippets/:id/comments          yorum ağacı (yanıtlarla)
POST   /api/snippets/:id/comments          yorum + 1-5 puan
POST   /api/snippets/:id/like | save       toggle
GET    /api/snippets/:id/interaction       kullanıcının beğeni/kayıt durumu

PUT    /api/users/me                       profil güncelle
GET    /api/users/me/saved                 kaydedilenler
DELETE /api/users/comments/:id             yorum sil (sahip/admin)

POST   /api/links/shorten                  misafir de kullanabilir
GET    /api/links/:slug                    çöz + tıklanma say
GET    /api/links/stats/:slug              istatistik

GET    /api/admin/snippets/pending         moderasyon kuyruğu
PUT    /api/admin/snippets/:id/status      onayla/reddet (+gerekçe)
GET    /api/admin/analytics                platform özeti
```

**Rota sırası tuzağı:** `/stats` mutlaka `/:id`den, `/stats/:slug` de `/:slug`den
**önce** tanımlanmalı — yoksa dinamik segment onları yutar.

---

## 7. Gelinen nokta

Tüm planlanan fazlar bitti (`FWT_TECH_STACK_BLUEPRINT.md` referans alındı):

- ✅ **Faz 0-1-2** — Terminal tasarım sistemi, 7 UI primitifi, ana sayfa, 13 sayfanın tamamı yeni temada
- ✅ **Faz 3** — 13 aracın hepsi canlı
- ✅ **Faz 4** — Yorumlar+puanlama, beğeni/kaydetme, moderasyon, analitik, link kısaltma
- ✅ **Faz 5** — `sitemap.ts`, `robots.ts`, sayfa bazında metadata

**Sırada (henüz yapılmadı):**
1. Video yükleme (Cloudinary) — blueprint'te var, hiç başlanmadı
2. Herkese açık profil sayfaları — `/profile/[username]` rotası **yok**, detay sayfasında yazar adı bu yüzden link değil
3. Hacking içeriği için otomatik anahtar kelime filtresi (blueprint'te moderasyon gereksinimi)
4. E-posta doğrulama + bildirimler
5. Ölçekte arama (şu an basit `contains` sorgusu)

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
- **Doğrulama zorunlu:** `npm run typecheck && npm run lint && npm run build` yeşil olmadan commit yok. UI değişikliğinde ekran görüntüsüyle bak — bu oturumda birkaç hata sadece görsel kontrolde yakalandı.

---

## 9. Bilinen tuzaklar ⚠️

Bunlar zaman kaybettirdi; tekrar yaşamayın.

**1. Turbopack önbellek bozulması → rotalar teker teker 404/500**
Aynı checkout'ta iki dev sunucusu çalışırsa ya da bir dev sunucusu yazma sırasında
öldürülürse `frontend/.next` içindeki kalıcı önbellek bozuluyor. Belirti sinsi:
sayfalar derlendikçe *birer birer* düşüyor. Log: `frontend/.next/dev/logs/next-development.log`
→ `Failed to restore task data`. **Çözüm:** `npm run clean && npm run dev`.
`predev` guard'ı (`scripts/dev-cache-guard.mjs`) build-sonrası-dev durumunu otomatik yakalıyor.

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
