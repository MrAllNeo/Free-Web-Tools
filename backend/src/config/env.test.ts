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
});
