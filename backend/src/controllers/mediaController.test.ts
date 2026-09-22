import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mp4Client } from '../services/mp4Client';
import { createMediaDownload } from './mediaController';

vi.mock('../services/mp4Client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/mp4Client')>();
  return { ...actual, mp4Client: { requestJson: vi.fn(), requestFile: vi.fn(), configured: true } };
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

describe('createMediaDownload', () => {
  beforeEach(() => {
    vi.mocked(mp4Client.requestJson).mockReset();
  });

  it('forwards a valid compatibility preference and surfaces strategy/cost fields', async () => {
    vi.mocked(mp4Client.requestJson).mockResolvedValue({
      id: 'a'.repeat(32), title: 'Video', status: 'queued', route: 'direct',
      compatibility: 'compatible', strategy: 'REMUX', cost_weight: 4,
    });
    const req = { body: { analysis_id: 'a'.repeat(32), compatibility: 'compatible' } } as any;
    const res = fakeResponse();
    const next = vi.fn();

    await createMediaDownload(req, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(mp4Client.requestJson).toHaveBeenCalledWith('/api/downloads', {
      method: 'POST',
      body: JSON.stringify({ analysis_id: 'a'.repeat(32), compatibility: 'compatible' }),
    });
    expect(res.statusCode).toBe(202);
    expect((res.body as any).job).toMatchObject({
      compatibility: 'compatible', strategy: 'REMUX', cost_weight: 4,
    });
  });

  it('defaults compatibility to fast in the sanitized job when upstream omits it', async () => {
    vi.mocked(mp4Client.requestJson).mockResolvedValue({
      id: 'b'.repeat(32), title: 'Video', status: 'queued', route: 'direct',
    });
    const req = { body: { analysis_id: 'b'.repeat(32) } } as any;
    const res = fakeResponse();
    await createMediaDownload(req, res as any, vi.fn());
    expect((res.body as any).job.compatibility).toBe('fast');
  });

  it('rejects an invalid compatibility value before calling the upstream service', async () => {
    const req = { body: { analysis_id: 'c'.repeat(32), compatibility: 'ultra-fast' } } as any;
    const res = fakeResponse();
    const next = vi.fn();

    await createMediaDownload(req, res as any, next);

    expect(mp4Client.requestJson).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
