/**
 * Kodun kendisi tam bir HTML belgesi mi?
 *
 * Belge kökü yalnızca dosyanın başında olabilir. Metnin herhangi bir yerinde
 * `<html` aramak yanlış pozitif üretiyordu: JSX içindeki bir dizede geçen
 * `<html` yüzünden React bileşenleri "çalıştırılabilir" sayılıyordu.
 */
const isFullDocument = (code: string) => /^\s*(<!doctype\s+html|<html[\s>])/i.test(code);

/** Kodda gerçek HTML etiketi var mı (JSX değil, düz markup). */
const hasMarkup = (code: string) =>
  /<(div|section|button|ul|ol|table|form|nav|header|main|p|h[1-6]|span|a|img|input|article|aside|footer|canvas|svg)\b/i.test(
    code
  );

const STYLE_LANGUAGES = ['css', 'scss', 'sass', 'less'];
const SCRIPT_LANGUAGES = ['javascript', 'js'];

/**
 * Kod React/JSX mi?
 *
 * Dil etiketine tek başına güvenilemiyor: `LANGUAGES` listesinde uzun süre
 * `jsx`/`tsx` yoktu, bu yüzden mevcut kayıtların çoğu `typescript` ya da
 * `javascript` olarak işaretli. Bu yüzden dilin yanında içeriğe de bakıyoruz.
 */
export function looksLikeReact(code: string, language: string): boolean {
  if (!code || isFullDocument(code)) return false;

  const lang = language.toLowerCase();
  if (['tsx', 'jsx', 'react'].includes(lang)) return true;
  if (!['typescript', 'ts', 'javascript', 'js'].includes(lang)) return false;

  // Büyük harfle başlayan bir JSX etiketi ya da React'e özgü bir çağrı.
  return (
    /<[A-Z][\w.]*[\s/>]/.test(code) ||
    /\bfrom\s+['"]react['"]/.test(code) ||
    /\bReact\.\w/.test(code) ||
    /\buse(State|Effect|Ref|Memo|Callback|Reducer)\s*\(/.test(code)
  );
}

/**
 * Kod, derlemeye gerek kalmadan tarayıcıda olduğu gibi çalıştırılabilir mi?
 *
 * `demoHtml` bu kararı değiştirir: saf CSS ya da DOM'a bağlı JS tek başına ekranda
 * hiçbir şey göstermez, ama katkıcı onu saran markup'ı verdiyse gösterebilir.
 */
export function canRenderLive(code: string, language: string, demoHtml?: string): boolean {
  if (!code) return false;
  if (isFullDocument(code)) return true;
  if (looksLikeReact(code, language)) return false;

  const lang = language.toLowerCase();
  const hasDemo = Boolean(demoHtml && demoHtml.trim());

  // Derleme gerektiren diller: React değilse bile tarayıcı TypeScript'i çalıştıramaz.
  if (['typescript', 'ts'].includes(lang)) return false;

  if (lang === 'html') return true;

  // Stil ve script, üzerine uygulanacak markup olmadan görünür bir şey üretmez.
  if (STYLE_LANGUAGES.includes(lang) || SCRIPT_LANGUAGES.includes(lang)) {
    return hasDemo || hasMarkup(code);
  }

  return false;
}

/**
 * Kod tarayıcıda çalışabilir ama önce derlenmesi gerekiyor mu?
 * (JSX/TS → JS). Bu yol asenkron olduğu için çağıranlar ayrı ele alır.
 */
export function needsCompilation(code: string, language: string): boolean {
  return looksLikeReact(code, language);
}

/**
 * Canlı önizleme mümkün değilse nedeni.
 *
 * `needs-demo-html` çözülebilir bir eksiklik: katkıcı demo markup'ı eklerse çalışır.
 * `not-browser-language` ise Python, Go, SQL gibi tarayıcının hiçbir koşulda
 * çalıştıramayacağı kod — kullanıcıya boş yere umut vermeyelim.
 */
export type LiveBlocker = 'needs-demo-html' | 'not-browser-language';

export function liveBlocker(
  code: string,
  language: string,
  demoHtml?: string
): LiveBlocker | null {
  if (canRenderLive(code, language, demoHtml) || needsCompilation(code, language)) return null;

  const lang = language.toLowerCase();
  if (STYLE_LANGUAGES.includes(lang) || SCRIPT_LANGUAGES.includes(lang)) return 'needs-demo-html';
  return 'not-browser-language';
}

/**
 * Kod Tailwind yardımcı sınıfları kullanıyor mu?
 *
 * Tailwind CDN'i 400 KB'lık dış bir script; her önizlemede koşulsuz yüklemek
 * önizlemeyi yavaşlatır, çevrimdışı çalışmaz ve ziyaretçinin IP'sini üçüncü
 * tarafa açar. Bu yüzden yalnızca gerçekten gerektiğinde ekliyoruz.
 */
export const usesTailwind = (code: string) =>
  /class(Name)?="[^"]*\b(flex|grid|text-|bg-|p[xytblr]?-\d|m[xytblr]?-\d|w-|h-|rounded|border|shadow|gap-|space-[xy]-|max-w-|min-h-|items-|justify-|font-|hover:|dark:|sm:|md:|lg:)/.test(
    code
  );

/**
 * `</script>` dizisi, içine gömüldüğü script bloğunu erkenden kapatır — kod
 * gövdeye taşar ve önizleme bozulur. Etiketi ayırarak bunu engelliyoruz.
 */
export const escapeForScript = (code: string) => code.replace(/<\/script/gi, '<\\/script');

/**
 * Önizleme belgesinin ortak iskeleti. Hem doğrudan çalışan kod hem de derlenmiş
 * React çıktısı aynı kabuğu kullanır ki iki yol görsel olarak ayrışmasın.
 */
export function wrapPreviewDocument(bodyHtml: string, options: { tailwind?: boolean } = {}): string {
  const tailwind = options.tailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : '';

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
${bodyHtml}
</body>
</html>`;
}

/**
 * Snippet kodunu iframe içinde çalıştırılabilir tam bir HTML belgesine sarar.
 *
 * `demoHtml` varsa kod ona göre yerleştirilir: stil `<style>`, script `<script>`
 * içine girer ve demo markup'ı gövdeye önce yazılır — böylece katkıcı yalnızca
 * CSS paylaşıp önizlemenin çalışmasını sağlayabilir.
 */
export function buildPreviewDocument(code: string, language = 'html', demoHtml?: string): string {
  if (isFullDocument(code)) return code;

  const lang = language.toLowerCase();
  const demo = demoHtml?.trim() ?? '';
  const codeIsMarkup = hasMarkup(code);

  let body: string;
  if (STYLE_LANGUAGES.includes(lang) && !codeIsMarkup) {
    body = `${demo}\n<style>${code}</style>`;
  } else if (SCRIPT_LANGUAGES.includes(lang) && !codeIsMarkup) {
    body = `${demo}\n<script>${escapeForScript(code)}</script>`;
  } else {
    // Kodun kendisi markup içeriyor; demo varsa onu kapsayıcı olarak öne alıyoruz.
    body = demo ? `${demo}\n${code}` : code;
  }

  return wrapPreviewDocument(body, { tailwind: usesTailwind(`${code}\n${demo}`) });
}

/**
 * Önizleme iframe'i için sandbox izinleri.
 *
 * `allow-same-origin` bilinçli olarak VERİLMEZ: srcDoc ile yüklenen belge aksi hâlde
 * üst sayfayla aynı kaynağı paylaşır ve topluluktan gelen snippet kodu ana sayfanın
 * DOM'una ve localStorage'daki JWT'ye erişebilirdi.
 *
 * Bu, katkıcının yazdığı `demoHtml` ve derlenmiş React çıktısı için de geçerli:
 * ikisi de snippet kodunun kendisiyle aynı güven seviyesindedir.
 */
export const PREVIEW_SANDBOX = 'allow-scripts allow-modals';
