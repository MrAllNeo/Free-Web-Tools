import { describe, expect, it } from 'vitest';
import { loadEnv } from './env';

const productionBase = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/fwt',
  JWT_SECRET: 'a'.repeat(48),
  FRONTEND_URL: 'https://freewebtools.dev',
} as NodeJS.ProcessEnv;

describe('loadEnv', () => {
  it('geçerli üretim yapılandırmasını kabul eder', () => {
    const env = loadEnv(productionBase);
    expect(env.isProduction).toBe(true);
    expect(env.FRONTEND_URL).toBe('https://freewebtools.dev');
    expect(env.PORT).toBe(3001);
    // Vekil belirtilmediyse kapalı kalmalı: açık olsaydı istemci kendi IP'sini
    // uydurup hız sınırını aşabilirdi.
    expect(env.TRUST_PROXY).toBeNull();
  });

  it('DATABASE_URL olmadan hiçbir ortamda açılmaz', () => {
    expect(() => loadEnv({ NODE_ENV: 'development' })).toThrow(/DATABASE_URL/);
  });

  it('üretimde JWT_SECRET eksikse sunucuyu durdurur', () => {
    const { JWT_SECRET: _omit, ...rest } = productionBase;
    expect(() => loadEnv(rest)).toThrow(/JWT_SECRET/);
  });

  it('üretimde örnek dosyadaki JWT_SECRET değerini reddeder', () => {
    // Bu dize depoda açıkça yazılı; kabul edilseydi herkes yönetici tokenı üretebilirdi.
    expect(() =>
      loadEnv({ ...productionBase, JWT_SECRET: 'your-super-secret-jwt-key-change-in-production' })
    ).toThrow(/örnek dosyadaki/);
  });

  it('üretimde kısa JWT_SECRET değerini reddeder', () => {
    expect(() => loadEnv({ ...productionBase, JWT_SECRET: 'kisa-anahtar' })).toThrow(/en az 32/);
  });

  it('üretimde FRONTEND_URL eksikse durur', () => {
    const { FRONTEND_URL: _omit, ...rest } = productionBase;
    expect(() => loadEnv(rest)).toThrow(/FRONTEND_URL/);
  });

  it('geliştirmede zayıf anahtarla çalışmaya devam eder', () => {
    const env = loadEnv({ NODE_ENV: 'development', DATABASE_URL: 'postgresql://localhost:5432/fwt' });
    expect(env.isProduction).toBe(false);
    expect(env.JWT_SECRET.length).toBeGreaterThan(0);
    expect(env.FRONTEND_URL).toBe('http://localhost:3000');
  });

  it('geçersiz PORT değerini reddeder', () => {
    expect(() => loadEnv({ ...productionBase, PORT: 'abc' })).toThrow(/PORT/);
    expect(() => loadEnv({ ...productionBase, PORT: '99999' })).toThrow(/PORT/);
  });

  it('TRUST_PROXY sayısal verildiğinde sayıya çevirir', () => {
    expect(loadEnv({ ...productionBase, TRUST_PROXY: '1' }).TRUST_PROXY).toBe(1);
    expect(loadEnv({ ...productionBase, TRUST_PROXY: 'loopback' }).TRUST_PROXY).toBe('loopback');
  });

  it('MP4 servis ayarlarının üçünü birlikte kabul eder', () => {
    const result = loadEnv({
      ...productionBase,
      MP4_SERVICE_URL: 'https://mp4.example.com',
      MP4_SERVICE_USER: 'service-user',
      MP4_SERVICE_PASSWORD: 'service-password',
    });
    expect(result.MP4_SERVICE_URL).toBe('https://mp4.example.com');
    expect(result.MP4_SERVICE_USER).toBe('service-user');
  });

  it('MP4 servisini sunucular-arası token ile kabul eder', () => {
    const result = loadEnv({
      ...productionBase,
      MP4_SERVICE_URL: 'https://mp4.example.com',
      MP4_SERVICE_TOKEN: 'server-to-server-secret',
    });
    expect(result.MP4_SERVICE_TOKEN).toBe('server-to-server-secret');
    expect(result.MP4_SERVICE_USER).toBeNull();
  });

  it('eksik MP4 servis ayarını reddeder', () => {
    expect(() => loadEnv({
      ...productionBase,
      MP4_SERVICE_URL: 'https://mp4.example.com',
      MP4_SERVICE_USER: 'service-user',
    })).toThrow(/birlikte tanımlanmalı/);
  });

  it('üretimde şifresiz HTTP MP4 servis adresini reddeder', () => {
    expect(() => loadEnv({
      ...productionBase,
      MP4_SERVICE_URL: 'http://mp4.example.com',
      MP4_SERVICE_USER: 'service-user',
      MP4_SERVICE_PASSWORD: 'service-password',
    })).toThrow(/HTTPS/);
  });

  it('üretimde SAHNE_SERVICE_URL token ile birlikte kabul edilir', () => {
    const result = loadEnv({
      ...productionBase,
      SAHNE_SERVICE_URL: 'https://sahne.example.com',
      SAHNE_SERVICE_TOKEN: 'servis-anahtari',
    });
    expect(result.SAHNE_SERVICE_URL).toBe('https://sahne.example.com');
    expect(result.SAHNE_SERVICE_TOKEN).toBe('servis-anahtari');
  });

  it('üretimde tokensiz SAHNE_SERVICE_URL reddedilir', () => {
    expect(() => loadEnv({
      ...productionBase,
      SAHNE_SERVICE_URL: 'https://sahne.example.com',
    })).toThrow(/SAHNE_SERVICE_TOKEN/);
  });

  it('adres olmadan tek başına SAHNE_SERVICE_TOKEN reddedilir', () => {
    expect(() => loadEnv({
      ...productionBase,
      SAHNE_SERVICE_TOKEN: 'servis-anahtari',
    })).toThrow(/SAHNE_SERVICE_URL/);
  });

  it('SAHNE_SERVICE_URL verilmediğinde null olur', () => {
    expect(loadEnv(productionBase).SAHNE_SERVICE_URL).toBeNull();
  });

  it('üretimde şifresiz HTTP Sahne Avcısı servis adresini reddeder', () => {
    expect(() => loadEnv({
      ...productionBase,
      SAHNE_SERVICE_URL: 'http://sahne.example.com',
    })).toThrow(/HTTPS/);
  });

  it('geçersiz SAHNE_SERVICE_URL adresini reddeder', () => {
    expect(() => loadEnv({
      ...productionBase,
      SAHNE_SERVICE_URL: 'not-a-url',
    })).toThrow(/geçerli bir HTTP/);
  });
});
