import 'dotenv/config';
import { logger } from '../utils/logger';

/**
 * Ortam değişkenlerinin tek doğrulama noktası.
 *
 * Buradan önce her modül `process.env`i doğrudan okuyordu ve eksik değerlerde
 * sessizce güvensiz varsayılanlara düşüyordu. Üretimde bunun bedeli büyük:
 * `JWT_SECRET` tanımsızken imzalama `'fallback-secret'` ile yapılıyordu — bu dize
 * deponun içinde açıkça yazılı olduğu için herkes kendine yönetici tokenı
 * üretebilirdi. Artık üretimde eksik değer sunucuyu açılışta durduruyor:
 * çalışmayan sunucu, sessizce herkese açık olan sunucudan iyidir.
 */

/** Depoda, örneklerde ya da eski kodda geçmiş; yani gizli sayılamaz. */
const KNOWN_INSECURE_SECRETS = new Set([
  'fallback-secret',
  'your-super-secret-jwt-key-change-in-production',
  'secret',
  'changeme',
  'change-me',
]);

const MIN_SECRET_LENGTH = 32;

export interface AppEnv {
  NODE_ENV: string;
  isProduction: boolean;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  /** `app.set('trust proxy', ...)` değeri; vekil yoksa null. */
  TRUST_PROXY: number | string | null;
  LOG_LEVEL: string;
}

/**
 * Verilen kaynaktan yapılandırmayı üretir.
 *
 * Saf bir fonksiyon olarak duruyor ki testler `process.env`i kirletmeden
 * üretim davranışını doğrulayabilsin.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const nodeEnv = source.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const problems: string[] = [];

  const databaseUrl = source.DATABASE_URL?.trim();
  // Veritabanı olmadan tek bir uç bile çalışmaz; ortamdan bağımsız zorunlu.
  if (!databaseUrl) {
    problems.push('DATABASE_URL tanımlı değil.');
  }

  const rawSecret = source.JWT_SECRET?.trim();
  let jwtSecret = rawSecret ?? '';
  if (isProduction) {
    if (!rawSecret) {
      problems.push('JWT_SECRET tanımlı değil.');
    } else if (KNOWN_INSECURE_SECRETS.has(rawSecret)) {
      problems.push('JWT_SECRET örnek dosyadaki değerle aynı; herkesin bildiği bir dize.');
    } else if (rawSecret.length < MIN_SECRET_LENGTH) {
      problems.push(`JWT_SECRET en az ${MIN_SECRET_LENGTH} karakter olmalı (şu an ${rawSecret.length}).`);
    }
  } else if (!rawSecret) {
    // Geliştirmede akışı kesmiyoruz ama sessiz de kalmıyoruz.
    jwtSecret = 'development-only-insecure-secret';
    logger.warn('JWT_SECRET tanımlı değil; geliştirmeye özel geçici anahtar kullanılıyor.');
  }

  // CORS kaynağı yanlışsa tarayıcı her isteği engeller ve hata sunucu
  // günlüklerinde görünmez — üretimde tahmin etmek yerine zorunlu tutuyoruz.
  const frontendUrl = source.FRONTEND_URL?.trim();
  if (isProduction && !frontendUrl) {
    problems.push('FRONTEND_URL tanımlı değil; CORS localhost\'a düşer ve site API\'ye erişemez.');
  }

  const rawPort = source.PORT?.trim();
  const port = rawPort ? Number(rawPort) : 3001;
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    problems.push(`PORT geçerli bir port numarası değil: ${rawPort}`);
  }

  if (problems.length > 0) {
    throw new Error(
      `Ortam yapılandırması geçersiz (NODE_ENV=${nodeEnv}):\n` +
        problems.map((p) => `  - ${p}`).join('\n') +
        '\nbackend/.env.example dosyasına bakın.'
    );
  }

  // Vekil arkasında değilsek bu başlığa güvenmek, istemcinin kendi IP'sini
  // uydurup hız sınırını aşmasına izin verirdi. Varsayılan kapalı.
  const rawTrustProxy = source.TRUST_PROXY?.trim();
  let trustProxy: number | string | null = null;
  if (rawTrustProxy) {
    const asNumber = Number(rawTrustProxy);
    trustProxy = Number.isInteger(asNumber) ? asNumber : rawTrustProxy;
  }

  return Object.freeze({
    NODE_ENV: nodeEnv,
    isProduction,
    PORT: port,
    DATABASE_URL: databaseUrl!,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: source.JWT_EXPIRES_IN?.trim() || '24h',
    FRONTEND_URL: frontendUrl || 'http://localhost:3000',
    TRUST_PROXY: trustProxy,
    LOG_LEVEL: source.LOG_LEVEL?.trim() || 'info',
  });
}

export const env = loadEnv();
