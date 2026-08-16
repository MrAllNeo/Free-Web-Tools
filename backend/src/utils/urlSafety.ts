/**
 * Kısaltma servisleri phishing ve malware dağıtımı için sık kötüye kullanılır.
 * Burada minimum düzeyde bir kapı bekçisi var: şema kısıtı, iç ağ engeli ve
 * bilinen kötüye kullanım alanları. Üretimde Google Safe Browsing gibi bir
 * itibar servisiyle desteklenmelidir.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Yerel ağ ve bulut metadata adresleri: kısa linkin kendi altyapımıza ya da
 * kullanıcının iç ağına yönlendirme yapmasını engeller.
 */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // AWS/GCP metadata uç noktası
  'metadata.google.internal',
]);

const BLOCKED_HOSTNAME_PATTERNS = [
  // IPv4 özel aralıkları
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  // Loopback bloğunun tamamı — 127.0.0.1 dışındaki 127.x adresleri de kendimize işaret eder.
  /^127\./,
  // Link-local; bulut metadata uç noktası da bu aralıkta.
  /^169\.254\./,
  /\.local$/,
  /\.internal$/,
  // IPv6. Köşeli parantezler normalizeHostname'de soyuluyor.
  /^::1$/,
  /^::$/,
  // IPv4-eşlemeli IPv6 (::ffff:7f00:1 = 127.0.0.1). Meşru kullanımı yok denecek
  // kadar az, buna karşılık engel atlatmanın kolay yolu.
  /^::ffff:/,
  /^fe80:/,
  /^f[cd][0-9a-f]{2}:/, // benzersiz yerel adresler (fc00::/7)
];

/**
 * `URL.hostname` IPv6 adreslerini köşeli parantezle döndürür ("[::1]"). Parantezler
 * soyulmazsa liste "::1" içerse bile eşleşme olmaz ve IPv6 loopback engeli atlanır —
 * bu gerçekten yaşanmış bir açıktı.
 */
const normalizeHostname = (hostname: string) => hostname.toLowerCase().replace(/^\[|\]$/g, '');

/** Zincirleme kısaltma (shortener → shortener) kötüye kullanımı gizlemekte kullanılır. */
const BLOCKED_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
]);

export type UrlCheck = { ok: true; url: string } | { ok: false; reason: string };

export function checkUrl(input: string, selfHost?: string): UrlCheck {
  const trimmed = input.trim();

  if (trimmed.length === 0) return { ok: false, reason: 'URL boş' };
  if (trimmed.length > 2048) return { ok: false, reason: 'URL çok uzun (en fazla 2048 karakter)' };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'Geçerli bir URL değil' };
  }

  // javascript: ve data: şemaları yönlendirmede XSS'e dönüşebilir.
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return { ok: false, reason: 'Yalnızca http ve https adresleri kısaltılabilir' };
  }

  const hostname = normalizeHostname(url.hostname);

  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOSTNAME_PATTERNS.some((p) => p.test(hostname))) {
    return { ok: false, reason: 'Yerel ve iç ağ adresleri kısaltılamaz' };
  }

  if (BLOCKED_SHORTENERS.has(hostname)) {
    return { ok: false, reason: 'Başka bir kısaltma servisinin linki kısaltılamaz' };
  }

  // Kendi kendine yönlendiren zincir oluşmasın.
  if (selfHost && hostname === selfHost.toLowerCase()) {
    return { ok: false, reason: 'Bu sitenin kendi kısa linki tekrar kısaltılamaz' };
  }

  return { ok: true, url: url.toString() };
}
