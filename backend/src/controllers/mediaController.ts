import { Readable } from 'node:stream';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { mp4Client, sanitizeDiagnostic } from '../services/mp4Client';

const jobIdSchema = z.string().regex(/^[a-f0-9]{32}$/, 'Geçersiz işlem kimliği.');
const analyzeSchema = z.object({
  url: z.url('Geçerli bir HTTP(S) bağlantısı gir.').max(4096),
}).refine(({ url }) => ['http:', 'https:'].includes(new URL(url).protocol), {
  message: 'Yalnızca HTTP(S) bağlantıları kabul edilir.',
  path: ['url'],
});
const downloadSchema = z.object({
  analysis_id: jobIdSchema,
  height: z.number().int().min(1).max(16384).nullable().optional(),
});

const stringValue = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.slice(0, max) : undefined;
const numberValue = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

function safeAnalysis(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const id = jobIdSchema.parse(body.id);
  return {
    id,
    title: stringValue(body.title, 300) || 'Adsız video',
    duration: numberValue(body.duration),
    source: stringValue(body.source, 120),
    qualities: Array.isArray(body.qualities)
      ? body.qualities.filter((item): item is number => Number.isInteger(item) && item > 0).slice(0, 20)
      : [],
    size: numberValue(body.size),
    route: body.route === 'proton' ? 'proton' : 'direct',
  };
}

function safeJob(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    id: jobIdSchema.parse(body.id),
    title: stringValue(body.title, 300) || 'Adsız video',
    height: numberValue(body.height),
    created: numberValue(body.created),
    queued_at: numberValue(body.queued_at),
    status: stringValue(body.status, 32) || 'unknown',
    message: stringValue(body.message, 500),
    percent: numberValue(body.percent),
    size: numberValue(body.size),
    code: stringValue(body.code, 64),
    retryable: typeof body.retryable === 'boolean' ? body.retryable : undefined,
    expires_at: numberValue(body.expires_at),
    route: body.route === 'proton' ? 'proton' : 'direct',
    queue_position: numberValue(body.queue_position),
  };
}

export async function analyzeMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const body = analyzeSchema.parse(req.body);
    const result = await mp4Client.requestJson('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    res.json({ analysis: safeAnalysis(result) });
  } catch (error) {
    next(error);
  }
}

export async function createMediaDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const body = downloadSchema.parse(req.body);
    const result = await mp4Client.requestJson('/api/downloads', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    res.status(202).json({ job: safeJob(result) });
  } catch (error) {
    next(error);
  }
}

export async function getMediaDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const id = jobIdSchema.parse(req.params.id);
    const result = await mp4Client.requestJson(`/api/downloads/${id}`);
    res.json({ job: safeJob(result) });
  } catch (error) {
    next(error);
  }
}

export async function getMediaEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const id = jobIdSchema.parse(req.params.id);
    const result = await mp4Client.requestJson(`/api/downloads/${id}/events`);
    res.json({ details: sanitizeDiagnostic(result) });
  } catch (error) {
    next(error);
  }
}

export async function cancelMediaDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const id = jobIdSchema.parse(req.params.id);
    const result = await mp4Client.requestJson(`/api/downloads/${id}`, { method: 'DELETE' });
    res.json({ job: safeJob(result) });
  } catch (error) {
    next(error);
  }
}

export async function streamMediaFile(req: Request, res: Response, next: NextFunction) {
  try {
    const id = jobIdSchema.parse(req.params.id);
    const upstream = await mp4Client.requestFile(`/api/downloads/${id}/file`);

    res.status(upstream.status);
    for (const header of ['content-type', 'content-length', 'content-disposition'] as const) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    res.setHeader('Cache-Control', 'private, no-store');
    if (!upstream.body) {
      res.end();
      return;
    }
    Readable.fromWeb(upstream.body).on('error', next).pipe(res);
  } catch (error) {
    next(error);
  }
}
