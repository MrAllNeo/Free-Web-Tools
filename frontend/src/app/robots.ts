import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/auth/',
        '/my',
        // Yalnızca oturum sahibinin kendi profil ayar sayfası; herkese açık
        // /profile/<username> sayfaları dizine girebilmeli.
        '/profile$',
        '/snippets/new',
        // Kısa linkler yönlendirmedir, dizine girmemeli.
        '/s/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
