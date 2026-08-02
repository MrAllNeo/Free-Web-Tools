import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Yönlendiriliyor…',
  // Kısa linkler arama sonuçlarında görünmemeli.
  robots: { index: false, follow: false },
};

/**
 * Kısa link çözümleyici. Hedef her istekte API'den okunur ki
 * tıklanma sayacı doğru artsın ve süresi dolan linkler hemen kapansın.
 */
export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let target: string | null = null;
  let missing = false;
  let reason = 'Bu kısa link kullanılamıyor.';

  try {
    const response = await fetch(`${API_URL}/links/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = (await response.json()) as { url: string };
      target = data.url;
    } else if (response.status === 410) {
      reason = 'Bu kısa linkin süresi dolmuş.';
    } else if (response.status === 404) {
      missing = true;
    }
  } catch {
    reason = 'Yönlendirme servisine şu anda ulaşılamıyor.';
  }

  // redirect() ve notFound() istisna fırlatarak çalışır; try bloğunun dışında çağrılmalı.
  if (target) redirect(target);
  // Var olmayan slug gerçek 404 dönmeli — arama motorları ve istemciler için doğru sinyal.
  if (missing) notFound();

  return (
    <Container>
      <div className="py-24 text-center">
        <div className="font-mono text-[28px] text-dim mb-3">⇗</div>
        <h1 className="font-mono text-[20px] font-semibold mb-2">Yönlendirme yapılamadı</h1>
        <p className="text-[13.5px] text-muted mb-2">{reason}</p>
        <p className="font-mono text-[12px] text-dim mb-8">/s/{slug}</p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <ButtonLink href="/tools/link-shortener" variant="solid">
            Yeni kısa link oluştur
          </ButtonLink>
          <Link
            href="/"
            className="font-mono text-[12.5px] text-muted hover:text-amber transition-colors"
          >
            ana sayfa
          </Link>
        </div>
      </div>
    </Container>
  );
}
