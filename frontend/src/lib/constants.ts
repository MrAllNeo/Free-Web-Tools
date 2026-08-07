export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/** Snippet'lerin ait olabileceği kategoriler (DB'deki `category` alanı). */
export const SNIPPET_CATEGORIES = [
  {
    id: 'frontend',
    label: 'Frontend',
    tag: '01 — CANLI TEST EDİLEBİLİR',
    accent: 'amber',
    description: 'UI bileşenleri, CSS efektleri, animasyonlar.',
  },
  {
    id: 'backend',
    label: 'Backend',
    tag: '02 — ÇALIŞTIRILABİLİR',
    accent: 'amber',
    description: "Auth sistemleri, API pattern'leri, DB şemaları.",
  },
  {
    id: 'hacking',
    label: 'Hacking',
    tag: '03 — SADECE GÖRÜNTÜLEME',
    accent: 'blue',
    description: 'Pentest teknikleri, zafiyet analizi. Kod çalıştırılamaz.',
  },
] as const;

export type SnippetCategoryId = (typeof SNIPPET_CATEGORIES)[number]['id'];

/** Navigasyondaki dört ana bölüm — Tools snippet değil, ayrı bir modül. */
export const NAV_SECTIONS = [
  { id: 'frontend', label: 'frontend', href: '/snippets?category=frontend' },
  { id: 'backend', label: 'backend', href: '/snippets?category=backend' },
  { id: 'hacking', label: 'hacking', href: '/snippets?category=hacking' },
  { id: 'tools', label: 'tools', href: '/tools' },
] as const;

export const LANGUAGES = [
  'javascript',
  'typescript',
  // JSX/TSX önizlemede derlenip çalıştırılabiliyor; dil listesinde karşılıkları
  // olmadığı için katkıcılar React kodunu 'typescript' diye işaretlemek zorundaydı.
  'jsx',
  'tsx',
  'python',
  'css',
  'html',
  'bash',
  'sql',
  'go',
  'rust',
  'java',
  'php',
  'ruby',
] as const;

export const DIFFICULTIES = [
  { id: 'beginner', label: 'Başlangıç', tone: 'green' },
  { id: 'intermediate', label: 'Orta', tone: 'amber' },
  { id: 'advanced', label: 'İleri', tone: 'danger' },
] as const;

export const SORT_OPTIONS = [
  { id: 'latest', label: 'En yeni' },
  { id: 'popular', label: 'En popüler' },
  { id: 'top-rated', label: 'En yüksek puan' },
] as const;

/**
 * Utilities bölümü — 13 bağımsız araç.
 * `ready` false olanlar listede "yakında" olarak gösterilir; sayfası yazıldıkça true olur.
 */
export interface ToolMeta {
  slug: string;
  name: string;
  /** Kart üzerinde ikon yerine kullanılan mono glif. */
  glyph: string;
  short: string;
  description: string;
  needsBackend: boolean;
  ready: boolean;
  keywords: string[];
}

export const TOOLS: ToolMeta[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    glyph: '{ }',
    short: 'Biçimlendir & doğrula',
    description:
      'JSON verinizi girintileyip renklendirir, hatalıysa satır ve sütun bilgisiyle nerede bozulduğunu gösterir.',
    needsBackend: false,
    ready: true,
    keywords: ['json formatter', 'json validator', 'json güzelleştirici'],
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    glyph: '⬡',
    short: 'v4 UUID üret',
    description: 'Tek tıkla v4 UUID üretir; 1-100 arası toplu üretim ve tek tuşla kopyalama.',
    needsBackend: false,
    ready: true,
    keywords: ['uuid generator', 'guid üret', 'uuid v4'],
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    glyph: '✳',
    short: 'Güçlü şifre üret',
    description:
      'Uzunluk ve karakter setini seçerek kriptografik olarak güvenli şifre üretir, gücünü anında gösterir.',
    needsBackend: false,
    ready: true,
    keywords: ['şifre üretici', 'password generator', 'güçlü parola'],
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    glyph: '#',
    short: 'MD5 / SHA-256 / SHA-512',
    description: 'Girdiğiniz metnin seçtiğiniz algoritmaya göre özetini tarayıcıda hesaplar.',
    needsBackend: false,
    ready: true,
    keywords: ['hash generator', 'md5', 'sha256 hesapla'],
  },
  {
    slug: 'base64',
    name: 'Base64',
    glyph: 'B64',
    short: 'Encode / Decode',
    description: 'Metni veya dosyayı Base64 formatına çevirir, Base64 metni geri çözer.',
    needsBackend: false,
    ready: true,
    keywords: ['base64 encode', 'base64 decode', 'base64 çevirici'],
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    glyph: '◧',
    short: 'HEX / RGB / HSL',
    description: 'Renk kodlarını formatlar arasında anında çevirir ve canlı önizleme gösterir.',
    needsBackend: false,
    ready: true,
    keywords: ['hex to rgb', 'renk çevirici', 'hsl dönüştürücü'],
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    glyph: '.*',
    short: 'Canlı eşleşme',
    description: 'Regex desenini test metniyle karşılaştırır, eşleşmeleri anında vurgular.',
    needsBackend: false,
    ready: true,
    keywords: ['regex test', 'regex tester', 'düzenli ifade'],
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Preview',
    glyph: 'M↓',
    short: 'Canlı HTML önizleme',
    description: 'Solda markdown yazın, sağda render edilmiş HTML çıktısını anında görün.',
    needsBackend: false,
    ready: true,
    keywords: ['markdown preview', 'markdown to html', 'md önizleme'],
  },
  {
    slug: 'diff-checker',
    name: 'Diff Checker',
    glyph: '±',
    short: 'İki metni karşılaştır',
    description: 'İki metin arasındaki farkları satır ve kelime bazında renkli olarak gösterir.',
    needsBackend: false,
    ready: true,
    keywords: ['diff checker', 'metin karşılaştırma', 'fark bulma'],
  },
  {
    slug: 'cron-generator',
    name: 'Cron Generator',
    glyph: '⏱',
    short: 'Cron ifadesi üret',
    description:
      'Form ile cron ifadesi oluşturur; elle girilen ifadenin okunabilir açıklamasını da verir.',
    needsBackend: false,
    ready: true,
    keywords: ['cron generator', 'crontab', 'cron ifadesi'],
  },
  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    glyph: '▚',
    short: 'Metin / URL → QR',
    description: 'Metin veya bağlantıdan anında QR kod üretir, PNG veya SVG olarak indirilir.',
    needsBackend: false,
    ready: true,
    keywords: ['qr kod üret', 'qr generator', 'qr code oluştur'],
  },
  {
    slug: 'image-to-base64',
    name: 'Image to Base64',
    glyph: '⛶',
    short: 'Görsel → data URI',
    description: 'Sürükle-bırak ile görseli Base64 data URI formatına çevirir.',
    needsBackend: false,
    ready: true,
    keywords: ['image to base64', 'görsel base64', 'data uri'],
  },
  {
    slug: 'link-shortener',
    name: 'Link Kısaltma',
    glyph: '⇗',
    short: 'Uzun URL → kısa link',
    description: 'Uzun bağlantıları kısa ve paylaşılabilir hale getirir, tıklanma sayısını tutar.',
    needsBackend: true,
    ready: true,
    keywords: ['link kısaltma', 'url shortener', 'kısa link'],
  },
];

export const TOOLS_BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t])) as Record<
  string,
  ToolMeta
>;
