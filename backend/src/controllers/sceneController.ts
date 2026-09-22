import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { sahneClient } from '../services/sahneClient';

const CATEGORIES = ['all', 'movie-tv', 'anime', 'adult', 'adult-animation'] as const;

// Sahne Avcısı'nın kendi 20 MB gövde sınırıyla eşleşir (base64, ~12 MB'lık bir
// ekran görüntüsünün kodlanmış hâlini kapsar).
const searchSchema = z.object({
  image_base64: z.string().min(1).max(28_000_000),
  category: z.enum(CATEGORIES).default('all'),
  allow_adult: z.boolean().optional().default(false),
  use_trace_moe: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(25).optional().default(8),
});

const stringValue = (value: unknown, max = 300) =>
  typeof value === 'string' ? value.slice(0, max) : undefined;
const numberValue = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const booleanValue = (value: unknown) =>
  typeof value === 'boolean' ? value : undefined;

function safeResult(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    title: stringValue(body.title, 300) || 'Bilinmeyen',
    episode: stringValue(body.episode, 100) ?? null,
    category: stringValue(body.category, 32) || 'movie-tv',
    adult: booleanValue(body.adult) ?? false,
    source_name: stringValue(body.source_name, 150),
    source_url: stringValue(body.source_url, 2048),
    timestamp_ms: numberValue(body.timestamp_ms),
    timestamp: stringValue(body.timestamp, 20),
    similarity: numberValue(body.similarity),
    provider: stringValue(body.provider, 50),
    external: booleanValue(body.external),
    anilist_id: numberValue(body.anilist_id) ?? null,
    filename: stringValue(body.filename, 300),
    preview_image: stringValue(body.preview_image, 500) ?? null,
    preview_video: stringValue(body.preview_video, 500) ?? null,
  };
}

function safeSearchResponse(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const query = body.query && typeof body.query === 'object' ? body.query as Record<string, unknown> : {};
  const providers = body.providers && typeof body.providers === 'object'
    ? body.providers as Record<string, unknown>
    : {};
  const traceMoe = providers.trace_moe && typeof providers.trace_moe === 'object'
    ? providers.trace_moe as Record<string, unknown>
    : {};
  return {
    query: { width: numberValue(query.width), height: numberValue(query.height) },
    results: Array.isArray(body.results) ? body.results.slice(0, 25).map(safeResult) : [],
    indexed_frames: numberValue(body.indexed_frames) ?? 0,
    providers: {
      trace_moe: {
        requested: booleanValue(traceMoe.requested) ?? false,
        enabled: booleanValue(traceMoe.enabled) ?? false,
        searched_frames: numberValue(traceMoe.searched_frames) ?? 0,
      },
    },
    external_error: stringValue(body.external_error, 300) ?? null,
  };
}

export async function searchScene(req: Request, res: Response, next: NextFunction) {
  try {
    const body = searchSchema.parse(req.body);
    const result = await sahneClient.requestJson('/api/search', {
      method: 'POST',
      body: JSON.stringify(body),
    }, 60_000);
    res.json(safeSearchResponse(result));
  } catch (error) {
    next(error);
  }
}
