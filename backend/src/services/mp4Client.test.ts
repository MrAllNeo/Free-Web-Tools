import { describe, expect, it, vi } from 'vitest';
import { createMp4Client, Mp4ServiceError, sanitizeDiagnostic } from './mp4Client';

const config = {
  MP4_SERVICE_URL: 'https://mp4.example.com/',
  MP4_SERVICE_USER: 'service-user',
  MP4_SERVICE_PASSWORD: 'super-secret',
  MP4_SERVICE_TOKEN: null,
};

describe('MP4 service client', () => {
  it('kimlik bilgisini yalnız Authorization başlığında gönderir', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    const client = createMp4Client(config, fetchMock);

    await client.requestJson('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://videos.example/watch/1' }),
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe('https://mp4.example.com/api/analyze');
    expect(requestUrl).not.toContain('super-secret');
    expect(requestInit?.headers).toMatchObject({
      Authorization: `Basic ${Buffer.from('service-user:super-secret').toString('base64')}`,
    });
  });

  it('sunucular-arası tokenı özel başlıkta gönderir ve Basic Auth üretmez', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    const client = createMp4Client({
      MP4_SERVICE_URL: 'https://mp4.example.com',
      MP4_SERVICE_USER: null,
      MP4_SERVICE_PASSWORD: null,
      MP4_SERVICE_TOKEN: 'server-to-server-secret',
    }, fetchMock);

    await client.requestJson('/api/analyze');

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit?.headers).toMatchObject({
      'X-MP4-Internal-Token': 'server-to-server-secret',
    });
    expect(requestInit?.headers).not.toHaveProperty('Authorization');
  });

  it('yapılandırma yoksa açık bir 503 hatası üretir', async () => {
    const client = createMp4Client({
      MP4_SERVICE_URL: null,
      MP4_SERVICE_USER: null,
      MP4_SERVICE_PASSWORD: null,
      MP4_SERVICE_TOKEN: null,
    });
    await expect(client.requestJson('/api/analyze')).rejects.toMatchObject({
      statusCode: 503,
      code: 'service_unconfigured',
      retryable: false,
    });
  });

  it('uzak hata gövdesini sınırlı uygulama hatasına çevirir', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        detail: 'Kaynak isteği reddetti.',
        code: 'access_denied',
        retryable: true,
        diagnostic: { stage: 'extract', http_status: 403, url: 'https://secret.example' },
      }), { status: 403, headers: { 'content-type': 'application/json' } })
    );
    const client = createMp4Client(config, fetchMock);

    try {
      await client.requestJson('/api/analyze');
      throw new Error('expected rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(Mp4ServiceError);
      expect(error).toMatchObject({
        statusCode: 403,
        code: 'access_denied',
        retryable: true,
        diagnostic: { stage: 'extract', http_status: 403 },
      });
      expect(JSON.stringify(error)).not.toContain('secret.example');
    }
  });
});

describe('sanitizeDiagnostic', () => {
  it('izin verilmeyen URL, cookie ve token alanlarını çıkarır', () => {
    expect(sanitizeDiagnostic({
      event: 'request_failed',
      route: 'direct',
      url: 'https://secret.example',
      cookie: 'session=secret',
      token: 'secret',
    })).toEqual({ event: 'request_failed', route: 'direct' });
  });
});
