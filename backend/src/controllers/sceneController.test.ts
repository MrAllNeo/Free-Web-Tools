import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sahneClient } from '../services/sahneClient';
import { searchScene } from './sceneController';

vi.mock('../services/sahneClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/sahneClient')>();
  return { ...actual, sahneClient: { requestJson: vi.fn(), configured: true } };
});

function fakeResponse() {
  const res: { statusCode: number; body: unknown; status: (code: number) => typeof res; json: (body: unknown) => typeof res } = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res;
}

describe('searchScene', () => {
  beforeEach(() => {
    vi.mocked(sahneClient.requestJson).mockReset();
  });

  it('yerel ve trace.moe sonuçlarını beyaz listeden geçirip döndürür', async () => {
    vi.mocked(sahneClient.requestJson).mockResolvedValue({
      query: { width: 1920, height: 1080 },
      results: [
        {
          title: 'Örnek Film', episode: null, category: 'movie-tv', adult: false,
          source_name: 'Örnek Kaynak', source_url: 'https://example.com/watch/1',
          timestamp_ms: 65000, timestamp: '01:05', similarity: 92.5,
        },
        {
          title: 'Örnek Anime', episode: '3', category: 'anime', adult: false,
          source_name: 'trace.moe', source_url: 'https://anilist.co/anime/1',
          timestamp_ms: 12000, timestamp: '00:12', similarity: 88.1,
          provider: 'trace.moe', external: true, anilist_id: 1, filename: 'x.mkv',
          preview_image: 'https://api.trace.moe/image/abc', preview_video: 'https://api.trace.moe/video/abc',
        },
      ],
      indexed_frames: 12345,
      providers: { trace_moe: { requested: true, enabled: true, searched_frames: 42 } },
      external_error: null,
    });
    const req = { body: { image_base64: 'data:image/png;base64,AAAA' } } as any;
    const res = fakeResponse();

    await searchScene(req, res as any, vi.fn());

    expect(sahneClient.requestJson).toHaveBeenCalledWith('/api/search', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: 'data:image/png;base64,AAAA',
        category: 'all', allow_adult: false, use_trace_moe: false, limit: 8,
      }),
    }, 60_000);
    expect(res.body).toMatchObject({
      query: { width: 1920, height: 1080 },
      indexed_frames: 12345,
      providers: { trace_moe: { requested: true, enabled: true, searched_frames: 42 } },
    });
    expect((res.body as any).results).toHaveLength(2);
    expect((res.body as any).results[1]).toMatchObject({
      provider: 'trace.moe', external: true, preview_image: 'https://api.trace.moe/image/abc',
    });
  });

  it('adult sonuçları yalnızca allow_adult iletildiğinde talep edilir', async () => {
    vi.mocked(sahneClient.requestJson).mockResolvedValue({ results: [] });
    const req = { body: { image_base64: 'x', allow_adult: true, category: 'adult' } } as any;
    await searchScene(req, fakeResponse() as any, vi.fn());
    const [, init] = vi.mocked(sahneClient.requestJson).mock.calls[0];
    expect(JSON.parse((init as any).body)).toMatchObject({ allow_adult: true, category: 'adult' });
  });

  it('boş image_base64 doğrulama hatasına düşer, upstream çağrılmaz', async () => {
    const req = { body: { image_base64: '' } } as any;
    const next = vi.fn();
    await searchScene(req, fakeResponse() as any, next);
    expect(sahneClient.requestJson).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it('geçersiz kategori doğrulama hatasına düşer', async () => {
    const req = { body: { image_base64: 'x', category: 'movie' } } as any;
    const next = vi.fn();
    await searchScene(req, fakeResponse() as any, next);
    expect(sahneClient.requestJson).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it('sayısal olmayan alanları yanıttan düşürür, çökme yerine varsayılan döner', async () => {
    vi.mocked(sahneClient.requestJson).mockResolvedValue({
      results: [{ title: 123, similarity: 'yüksek', source_url: null }],
    });
    const req = { body: { image_base64: 'x' } } as any;
    const res = fakeResponse();
    await searchScene(req, res as any, vi.fn());
    expect((res.body as any).results[0]).toMatchObject({
      title: 'Bilinmeyen', similarity: undefined, source_url: undefined,
    });
  });
});
