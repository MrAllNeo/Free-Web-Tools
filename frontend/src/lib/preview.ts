/**
 * Kodun kendisi tam bir HTML belgesi mi?
 *
 * Belge kökü yalnızca dosyanın başında olabilir. Metnin herhangi bir yerinde
 * `<html` aramak yanlış pozitif üretiyordu: JSX içindeki bir dizede geçen
 * `<html` yüzünden React bileşenleri "çalıştırılabilir" sayılıyordu.
 */
const isFullDocument = (code: string) => /^\s*(<!doctype\s+html|<html[\s>])/i.test(code);

/** Kodda gerçek HTML etiketi var mı (JSX değil, düz markup). */
const hasMarkup = (code: string) => /<(div|section|button|ul|ol|table|form|nav|header|main|p|h[1-6]|span|a|img|input|article|aside|footer|canvas|svg)\b/i.test(code);

/**
 * Kodun tarayıcıda olduğu gibi çalıştırılıp çalıştırılamayacağını belirler.
 *
 * Canlı önizleme yalnızca tarayıcının doğrudan çalıştırabildiği kod için anlamlıdır.
 * React/JSX/TypeScript bir derleme adımı gerektirir — onu iframe'e yapıştırmak
 * ekrana ham kaynak kod basar, ki bu önizleme olmaktan çok kafa karıştırır.
 */
export function canRenderLive(code: string, language: string): boolean {
  if (!code) return false;
  if (isFullDocument(code)) return true;

  const lang = language.toLowerCase();

  // Derleme gerektiren diller: tam bir HTML belgesi değilse çalıştırılamaz.
  if (['typescript', 'tsx', 'jsx', 'ts', 'react'].includes(lang)) return false;

  if (lang === 'html') return true;

  // CSS ve JS ancak üzerine uygulanacak markup varsa görünür bir şey üretir.
  if (['css', 'scss', 'javascript', 'js'].includes(lang)) return hasMarkup(code);

  return false;
}

/**
 * Snippet kodunu iframe içinde çalıştırılabilir tam bir HTML belgesine sarar.
 * Kod zaten tam bir belge ise olduğu gibi bırakılır.
 */
/**
 * Kod Tailwind yardımcı sınıfları kullanıyor mu?
 *
 * Tailwind CDN'i 400 KB'lık dış bir script; her önizlemede koşulsuz yüklemek
 * önizlemeyi yavaşlatır, çevrimdışı çalışmaz ve ziyaretçinin IP'sini üçüncü
 * tarafa açar. Bu yüzden yalnızca gerçekten gerektiğinde ekliyoruz.
 */
const usesTailwind = (code: string) =>
  /class(Name)?="[^"]*\b(flex|grid|text-|bg-|p[xytblr]?-\d|m[xytblr]?-\d|w-|h-|rounded|border|shadow|gap-|space-[xy]-|max-w-|min-h-|items-|justify-|font-|hover:|dark:|sm:|md:|lg:)/.test(
    code
  );

export function buildPreviewDocument(code: string, language = 'html'): string {
  if (isFullDocument(code)) return code;

  // Saf CSS, markup'a değil stil katmanına ait — <body> içine yazılırsa metin olarak görünür.
  const isStylesheet = ['css', 'scss'].includes(language.toLowerCase()) && !hasMarkup(code);
  const body = isStylesheet ? `<style>${code}</style>` : code;

  const tailwind = usesTailwind(code)
    ? '<script src="https://cdn.tailwindcss.com"></script>'
    : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${tailwind}
<style>
  html, body {
    margin: 0;
    padding: 16px;
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Önizleme iframe'i için sandbox izinleri.
 *
 * `allow-same-origin` bilinçli olarak VERİLMEZ: srcDoc ile yüklenen belge aksi hâlde
 * üst sayfayla aynı kaynağı paylaşır ve topluluktan gelen snippet kodu ana sayfanın
 * DOM'una ve localStorage'daki JWT'ye erişebilirdi.
 */
export const PREVIEW_SANDBOX = 'allow-scripts allow-modals';
