import { env, type AppEnv } from '../config/env';

type FetchLike = typeof fetch;

export interface SahneClient {
  requestJson(path: string, init?: RequestInit, timeoutMs?: number): Promise<unknown>;
  configured: boolean;
}

export class SahneServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'SahneServiceError';
    this.statusCode = statusCode;
  }
}

/** Sahne Avcısı'nın kendi `/api/search` yanıtındaki hata şekli: `{ error: string }`. */
async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await response.json();
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Servis token tanımlıysa her istek `X-Sahne-Internal-Token` ile imzalanır;
 * servis kendi genel adresiyle yayında olduğu için doğrudan çağrılara karşı
 * korunması buna bağlı. Yönetici korumalı uçlara (FMHY eşitleme, indeksleme
 * kuyruğu) bu istemci üzerinden erişilmez.
 */
export function createSahneClient(
  config: Pick<AppEnv, 'SAHNE_SERVICE_URL' | 'SAHNE_SERVICE_TOKEN'>,
  fetchImpl: FetchLike = fetch
): SahneClient {
  const configured = Boolean(config.SAHNE_SERVICE_URL);

  return {
    configured,
    async requestJson(path, init = {}, timeoutMs = 30_000) {
      if (!configured) {
        throw new SahneServiceError('Sahne Avcısı servisi henüz yapılandırılmamış.', 503);
      }
      const base = config.SAHNE_SERVICE_URL!.replace(/\/$/, '');

      let response: Response;
      try {
        response = await fetchImpl(`${base}${path}`, {
          ...init,
          headers: {
            Accept: 'application/json',
            ...(init.body ? { 'Content-Type': 'application/json' } : {}),
            ...(config.SAHNE_SERVICE_TOKEN
              ? { 'X-Sahne-Internal-Token': config.SAHNE_SERVICE_TOKEN }
              : {}),
            ...(init.headers || {}),
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        const timedOut = error instanceof Error && error.name === 'TimeoutError';
        throw new SahneServiceError(
          timedOut ? 'Sahne Avcısı servisi zamanında yanıt vermedi.' : 'Sahne Avcısı servisine ulaşılamadı.',
          timedOut ? 504 : 503
        );
      }

      if (!response.ok) {
        const payload = await readJson(response);
        const message = typeof payload.error === 'string' ? payload.error : 'Sahne araması tamamlanamadı.';
        // Yalnızca 400 (istemci hatası) ile diğerlerini (5xx, yapılandırma
        // hatası vb.) ayır; upstream'in kesin durum kodunu geçirmiyoruz.
        throw new SahneServiceError(message.slice(0, 500), response.status === 400 ? 400 : 502);
      }

      return readJson(response);
    },
  };
}

export const sahneClient = createSahneClient(env);
