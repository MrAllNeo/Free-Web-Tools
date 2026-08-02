import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/profile',
        '/auth/',
        '/snippets/new',
        // Kısa linkler yönlendirmedir, dizine girmemeli.
        '/s/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
