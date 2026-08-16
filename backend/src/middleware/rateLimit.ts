import rateLimit, { type Options } from 'express-rate-limit';

/**
 * Hız sınırlayıcılar.
 *
 * Sayaçlar süreç belleğinde tutulur. Tek sunucu için doğru çalışır; ileride
 * birden fazla kopya çalıştırılırsa her kopya kendi sayacını tutacağı için
 * gerçek sınır kopya sayısıyla çarpılır — o noktada paylaşımlı bir depo
 * (Redis) gerekir.
 *
 * Mesajlar İngilizce, çünkü API katmanının tamamı öyle. Kullanıcıya gösterilen
 * Türkçe metni istemci 429 durumundan üretiyor (`getApiErrorMessage`).
 */
const base: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Genel tavan. Normal gezinmeyi engellemeyecek kadar yüksek; amacı tek bir
 * istemcinin API'yi taramasını ya da boğmasını sınırlamak.
 */
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});

/**
 * Giriş ve kayıt — kaba kuvvet saldırısının asıl hedefi.
 *
 * `skipSuccessfulRequests` sayesinde başarılı girişler sayaca yazılmaz: parolasını
 * bilen kullanıcı sınıra takılmaz, deneme yanılma yapan takılır.
 */
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many authentication attempts. Try again in 15 minutes.' },
});

/**
 * Link kısaltma misafirlere de açık, yani kimlik doğrulaması olmadan yazma
 * yapılabilen tek uç nokta. Spam üretimini sınırlamak için ayrı ve dar tutuldu.
 */
export const shortenLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: { error: 'Too many links shortened from this address. Try again later.' },
});

/** Snippet ve yorum oluşturma gibi kimliği doğrulanmış yazma işlemleri. */
export const writeLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: { error: 'Too many submissions. Please wait before posting again.' },
});
