import { API_URL } from './constants';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Hata yanıtı her zaman JSON olmayabilir: araya giren bir vekil ya da yük
    // dengeleyici düz metin/HTML dönebilir. json() burada patlarsa gerçek hata
    // "Sunucuya ulaşılamadı"ya dönüşür ve teşhis imkânsızlaşır.
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = { error: response.statusText || 'Sunucu beklenmeyen bir yanıt döndü.' };
    }

    if (!response.ok) {
      // Durum kodunu da taşıyoruz: bazı hataların (429 gibi) kullanıcıya
      // gösterilecek metnini sunucunun İngilizce mesajı değil istemci belirliyor.
      const body = typeof data === 'object' && data !== null ? data : { error: String(data) };
      throw { ...body, status: response.status };
    }

    return data as T;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

/**
 * API hataları gövdedeki JSON olarak fırlatılır ({ error, details }).
 * Ağ hatalarında ise düz bir Error gelir; her iki durumu da tek yerde metne çevirir.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const body = error as {
      error?: unknown;
      status?: number;
      details?: Array<{ message?: string }>;
    };

    // Hız sınırı: sunucunun mesajı İngilizce ve teknik. Arayüz Türkçe olduğu için
    // kullanıcıya ne olduğunu ve ne yapması gerektiğini burada söylüyoruz.
    if (body.status === 429) {
      return 'Çok fazla deneme yaptın. Biraz bekleyip tekrar dene.';
    }

    if (Array.isArray(body.details) && body.details[0]?.message) {
      return String(body.details[0].message);
    }
    if (typeof body.error === 'string') return body.error;
  }

  if (error instanceof TypeError) return 'Sunucuya ulaşılamadı. API çalışıyor mu?';

  return fallback;
}
