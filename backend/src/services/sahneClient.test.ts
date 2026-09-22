import { describe, expect, it, vi } from 'vitest';
import { createSahneClient, SahneServiceError } from './sahneClient';

describe('Sahne Avcısı servis istemcisi', () => {
  it('token tanımlı değilse kimlik başlığı eklemez', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    const client = createSahneClient({ SAHNE_SERVICE_URL: 'https://sahne.example.com/', SAHNE_SERVICE_TOKEN: null }, fetchMock);

    await client.requestJson('/api/search', {
      method: 'POST',
      body: JSON.stringify({ image_base64: 'data:image/png;base64,AAAA' }),
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe('https://sahne.example.com/api/search');
    expect(requestInit?.headers).not.toHaveProperty('Authorization');
    expect(requestInit?.headers).not.toHaveProperty('X-Admin-Token');
  });

  it('token tanımlıysa her isteği servis başlığıyla imzalar', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    const client = createSahneClient(
      { SAHNE_SERVICE_URL: 'https://sahne.example.com', SAHNE_SERVICE_TOKEN: 'servis-anahtari' },
      fetchMock
    );

    await client.requestJson('/api/search', { method: 'POST', body: '{}' });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit?.headers).toMatchObject({ 'X-Sahne-Internal-Token': 'servis-anahtari' });
  });

  it('yapılandırma yoksa açık bir 503 hatası üretir', async () => {
    const client = createSahneClient({ SAHNE_SERVICE_URL: null, SAHNE_SERVICE_TOKEN: null });
    await expect(client.requestJson('/api/search')).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('upstream hata gövdesindeki mesajı sınırlı biçimde taşır', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Desteklenmeyen veya bozuk görsel.' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    );
    const client = createSahneClient({ SAHNE_SERVICE_URL: 'https://sahne.example.com', SAHNE_SERVICE_TOKEN: null }, fetchMock);

    await expect(client.requestJson('/api/search', { method: 'POST' })).rejects.toMatchObject({
      statusCode: 400,
      message: 'Desteklenmeyen veya bozuk görsel.',
    });
  });

  it('upstream 5xx durumunu 502 olarak sınıflandırır, kaynak kodunu sızdırmaz', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: 'internal detail' }), { status: 500 })
    );
    const client = createSahneClient({ SAHNE_SERVICE_URL: 'https://sahne.example.com', SAHNE_SERVICE_TOKEN: null }, fetchMock);

    await expect(client.requestJson('/api/search', { method: 'POST' })).rejects.toBeInstanceOf(SahneServiceError);
    await expect(client.requestJson('/api/search', { method: 'POST' })).rejects.toMatchObject({ statusCode: 502 });
  });

  it('ağ hatasında 503 üretir', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('network down'));
    const client = createSahneClient({ SAHNE_SERVICE_URL: 'https://sahne.example.com', SAHNE_SERVICE_TOKEN: null }, fetchMock);
    await expect(client.requestJson('/api/search', { method: 'POST' })).rejects.toMatchObject({ statusCode: 503 });
  });
});
