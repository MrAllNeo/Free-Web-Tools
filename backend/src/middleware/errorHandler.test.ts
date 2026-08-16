import { describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler, type AppError } from './errorHandler';

/**
 * Bu testler gerçek bir hatadan doğdu: Zod v4 `error.errors` alanını `error.issues`
 * yaptı, kod eskisini okumaya devam etti ve `as any` cast'i tip hatasını gizledi.
 * Sonuç, API'deki HER doğrulama hatasının 400 yerine 500 dönmesiydi — kullanıcı
 * "parolan çok kısa" yerine "Internal server error" görüyordu.
 */
function fakeResponse() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: any };
}

const run = (error: unknown) => {
  const res = fakeResponse();
  errorHandler(error as AppError, {} as Request, res, vi.fn() as unknown as NextFunction);
  return res;
};

describe('errorHandler — doğrulama hataları', () => {
  const schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

  it('Zod hatasını 400 olarak döndürür', () => {
    const parsed = schema.safeParse({ password: 'kisa' });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const res = run(parsed.error);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('hangi alanın neden geçersiz olduğunu bildirir', () => {
    const parsed = schema.safeParse({ password: 'kisa' });
    if (parsed.success) return;

    const res = run(parsed.error);
    expect(res.body.details).toEqual([
      { field: 'password', message: 'Password must be at least 8 characters' },
    ]);
  });

  it('iç içe alan yolunu noktayla birleştirir', () => {
    const nested = z.object({ user: z.object({ email: z.string().email('Invalid email') }) });
    const parsed = nested.safeParse({ user: { email: 'gecersiz' } });
    if (parsed.success) return;

    const res = run(parsed.error);
    expect(res.body.details[0].field).toBe('user.email');
  });
});

describe('errorHandler — diğer hatalar', () => {
  it('benzersizlik ihlalini 409 yapar', () => {
    const res = run(Object.assign(new Error('unique'), { code: 'P2002' }));
    expect(res.statusCode).toBe(409);
  });

  it('kayıt bulunamadı hatasını 404 yapar', () => {
    const res = run(Object.assign(new Error('missing'), { code: 'P2025' }));
    expect(res.statusCode).toBe(404);
  });

  it('statusCode taşıyan hatanın mesajını korur', () => {
    const res = run(Object.assign(new Error('Bu snippet senin değil'), { statusCode: 403 }));
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Bu snippet senin değil');
  });

  it('beklenmedik hatada iç ayrıntıyı sızdırmaz', () => {
    // Yığın izi ya da veritabanı mesajı istemciye gitmemeli.
    const res = run(new Error('connect ECONNREFUSED 127.0.0.1:5432'));
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});
