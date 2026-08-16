import { describe, expect, it } from 'vitest';
import { createSnippetSchema, registerSchema, snippetQuerySchema } from './validators';

const validSnippet = {
  title: 'Glassmorphism kart',
  codeContent: '.card { backdrop-filter: blur(8px) }',
  codeLanguage: 'css',
  category: 'frontend' as const,
};

describe('registerSchema — parola kuralları', () => {
  const base = { email: 'a@b.com', username: 'berkay' };

  it('kuralların hepsini sağlayan parolayı kabul eder', () => {
    expect(registerSchema.safeParse({ ...base, password: 'Gecerli1!' }).success).toBe(true);
  });

  it('kısa parolayı reddeder', () => {
    expect(registerSchema.safeParse({ ...base, password: 'Ab1!' }).success).toBe(false);
  });

  it('büyük harf, rakam ve özel karakter eksikliğini ayrı ayrı yakalar', () => {
    expect(registerSchema.safeParse({ ...base, password: 'gecerli1!' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'Gecerlia!' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'Gecerli12' }).success).toBe(false);
  });
});

describe('registerSchema — kullanıcı adı', () => {
  const base = { email: 'a@b.com', password: 'Gecerli1!' };

  it('harf, rakam, tire ve alt çizgiye izin verir', () => {
    expect(registerSchema.safeParse({ ...base, username: 'berkay_01-x' }).success).toBe(true);
  });

  it('boşluk ve özel karakteri reddeder', () => {
    expect(registerSchema.safeParse({ ...base, username: 'berkay dev' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, username: 'berkay<>' }).success).toBe(false);
  });

  it('geçersiz e-postayı reddeder', () => {
    expect(registerSchema.safeParse({ ...base, username: 'berkay', email: 'bu-eposta-degil' }).success).toBe(
      false
    );
  });
});

describe('createSnippetSchema', () => {
  it('zorunlu alanlarla geçer ve varsayılanları doldurur', () => {
    const result = createSnippetSchema.safeParse(validSnippet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.difficulty).toBe('beginner');
      expect(result.data.tags).toEqual([]);
      expect(result.data.canDownload).toBe(true);
    }
  });

  it('boş kod içeriğini reddeder', () => {
    expect(createSnippetSchema.safeParse({ ...validSnippet, codeContent: '' }).success).toBe(false);
  });

  it('tanımsız kategoriyi reddeder', () => {
    expect(createSnippetSchema.safeParse({ ...validSnippet, category: 'devops' }).success).toBe(false);
  });

  it('demo markup u isteğe bağlı kabul eder', () => {
    expect(
      createSnippetSchema.safeParse({ ...validSnippet, demoHtml: '<button class="btn">x</button>' }).success
    ).toBe(true);
    expect(createSnippetSchema.safeParse(validSnippet).success).toBe(true);
  });

  it('aşırı uzun demo markup u reddeder', () => {
    // Sınırsız bırakılırsa her snippet isteği keyfi büyüklükte veri taşıyabilir.
    expect(createSnippetSchema.safeParse({ ...validSnippet, demoHtml: 'x'.repeat(20001) }).success).toBe(false);
  });

  it('geçersiz video adresini reddeder ama boş dizeye izin verir', () => {
    expect(createSnippetSchema.safeParse({ ...validSnippet, videoUrl: 'url-degil' }).success).toBe(false);
    expect(createSnippetSchema.safeParse({ ...validSnippet, videoUrl: '' }).success).toBe(true);
  });
});

describe('snippetQuerySchema', () => {
  it('sayfalama varsayılanlarını uygular', () => {
    const result = snippetQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
      expect(result.data.sort).toBe('latest');
    }
  });

  it('metin olarak gelen sayıları çevirir', () => {
    const result = snippetQuerySchema.safeParse({ page: '3', limit: '24' });
    expect(result.success && result.data.page).toBe(3);
  });

  it('sayfa boyutunu üst sınırla kısıtlar', () => {
    // Sınır olmasa tek istekle tüm tablo çekilebilirdi.
    expect(snippetQuerySchema.safeParse({ limit: '500' }).success).toBe(false);
  });

  it('sıfır ve negatif sayfayı reddeder', () => {
    expect(snippetQuerySchema.safeParse({ page: '0' }).success).toBe(false);
    expect(snippetQuerySchema.safeParse({ page: '-1' }).success).toBe(false);
  });
});
