import { env, type AppEnv } from '../config/env';

type FetchLike = typeof fetch;

export interface Mp4Client {
  requestJson(path: string, init?: RequestInit, timeoutMs?: number): Promise<unknown>;
  requestFile(path: string): Promise<Response>;
  configured: boolean;
}

const ALLOWED_UPSTREAM_STATUSES = new Set([400, 403, 404, 409, 410, 413, 422, 429, 502, 503, 504]);
const SAFE_DIAGNOSTIC_KEYS = new Set([
  'time', 'event', 'resource', 'method', 'origin_relation', 'source_hint', 'route', 'stage',
  'mode', 'status', 'basis', 'reason', 'downloaded_bytes', 'total_bytes', 'estimated_bytes',
  'limit_bytes', 'size', 'height', 'percent', 'elapsed_ms', 'timeout_seconds', 'returncode',
  'stderr_bytes', 'errno', 'line', 'count', 'request_number', 'cookie_count', 'attempt',
  'job_id', 'operation_id', 'request_id', 'target_ref', 'engine_version', 'http_status', 'code',
  'exception_type', 'retryable', 'redirected', 'has_referer', 'user_agent_changed', 'enabled',
  'causes', 'stack', 'file', 'function',
]);

/** Uzak servisin tanı alanlarını ikinci kez süzer; URL/cookie/token gibi alanlar geçemez. */
export function sanitizeDiagnostic(value: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;
  if (typeof value === 'string') return value.slice(0, 200);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 200).map((item) => sanitizeDiagnostic(item, depth + 1));
  }
  if (!value || typeof value !== 'object') return undefined;

  const clean: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!SAFE_DIAGNOSTIC_KEYS.has(key)) continue;
    const sanitized = sanitizeDiagnostic(item, depth + 1);
    if (sanitized !== undefined) clean[key] = sanitized;
  }
  return clean;
}

export class Mp4ServiceError extends Error {
  statusCode: number;
  code?: string;
  retryable?: boolean;
  diagnostic?: unknown;

  constructor(message: string, statusCode: number, payload?: Record<string, unknown>) {
    super(message);
    this.name = 'Mp4ServiceError';
    this.statusCode = statusCode;
    if (typeof payload?.code === 'string') this.code = payload.code.slice(0, 64);
    if (typeof payload?.retryable === 'boolean') this.retryable = payload.retryable;
    if (payload?.diagnostic) this.diagnostic = sanitizeDiagnostic(payload.diagnostic);
  }
}

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

export function createMp4Client(
  config: Pick<AppEnv,
    'MP4_SERVICE_URL' | 'MP4_SERVICE_USER' | 'MP4_SERVICE_PASSWORD' | 'MP4_SERVICE_TOKEN'>,
  fetchImpl: FetchLike = fetch
): Mp4Client {
  const configured = Boolean(
    config.MP4_SERVICE_URL && (
      config.MP4_SERVICE_TOKEN || (config.MP4_SERVICE_USER && config.MP4_SERVICE_PASSWORD)
    )
  );

  const call = async (path: string, init: RequestInit = {}, timeoutMs = 95_000) => {
    if (!configured) {
      throw new Mp4ServiceError('MP4 Avcısı servisi henüz yapılandırılmamış.', 503, {
        code: 'service_unconfigured',
        retryable: false,
      });
    }

    const base = config.MP4_SERVICE_URL!.replace(/\/$/, '');
    const authorization = config.MP4_SERVICE_USER && config.MP4_SERVICE_PASSWORD
      ? Buffer.from(`${config.MP4_SERVICE_USER}:${config.MP4_SERVICE_PASSWORD}`).toString('base64')
      : null;

    let response: Response;
    try {
      response = await fetchImpl(`${base}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(config.MP4_SERVICE_TOKEN
            ? { 'X-MP4-Internal-Token': config.MP4_SERVICE_TOKEN }
            : authorization
              ? { Authorization: `Basic ${authorization}` }
              : {}),
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(init.headers || {}),
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'TimeoutError';
      throw new Mp4ServiceError(
        timedOut ? 'MP4 servisi zamanında yanıt vermedi.' : 'MP4 servisine ulaşılamadı.',
        timedOut ? 504 : 503,
        { code: timedOut ? 'upstream_timeout' : 'upstream_unavailable', retryable: true }
      );
    }

    return response;
  };

  const ensureSuccess = async (response: Response) => {
    if (response.ok) return response;
    const payload = await readJson(response);
    const rawMessage = typeof payload.detail === 'string'
      ? payload.detail
      : typeof payload.message === 'string'
        ? payload.message
        : 'MP4 servisi işlemi tamamlayamadı.';
    const statusCode = ALLOWED_UPSTREAM_STATUSES.has(response.status) ? response.status : 502;
    throw new Mp4ServiceError(rawMessage.slice(0, 500), statusCode, payload);
  };

  return {
    configured,
    async requestJson(path, init, timeoutMs) {
      const response = await ensureSuccess(await call(path, init, timeoutMs));
      return readJson(response);
    },
    async requestFile(path) {
      return ensureSuccess(await call(path, { headers: { Accept: 'video/mp4' } }, 30_000));
    },
  };
}

export const mp4Client = createMp4Client(env);
