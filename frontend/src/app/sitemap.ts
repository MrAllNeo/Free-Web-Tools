import type { MetadataRoute } from 'next';
import { API_URL, SNIPPET_CATEGORIES, TOOLS } from '@/lib/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

interface SitemapSnippet {
  slug: string;
  updatedAt?: string;
  createdAt: string;
}

/**
 * Yayınlanmış snippet'leri site haritasına dahil eder.
 * API erişilemezse harita statik sayfalarla üretilmeye devam eder —
 * build'in ayakta olmayan bir backend yüzünden kırılmaması gerekiyor.
 */
async function fetchSnippets(): Promise<SitemapSnippet[]> {
  try {
    const response = await fetch(`${API_URL}/snippets?limit=50&sort=latest`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const data = (await response.json()) as { snippets: SitemapSnippet[] };
    return data.snippets ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/snippets`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];

  const categoryPages: MetadataRoute.Sitemap = SNIPPET_CATEGORIES.map((category) => ({
    url: `${SITE_URL}/snippets?category=${category.id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Araç sayfaları organik aramanın ana giriş kapısı; hazır olanlar öncelikli.
  const toolPages: MetadataRoute.Sitemap = TOOLS.filter((tool) => tool.ready).map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const snippets = await fetchSnippets();
  const snippetPages: MetadataRoute.Sitemap = snippets.map((snippet) => ({
    url: `${SITE_URL}/snippets/${snippet.slug}`,
    lastModified: new Date(snippet.updatedAt ?? snippet.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...toolPages, ...categoryPages, ...snippetPages];
}
