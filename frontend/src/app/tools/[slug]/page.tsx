import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { TOOLS, TOOLS_BY_SLUG } from '@/lib/constants';

/**
 * Henüz yazılmamış araçlar için "yakında" sayfası.
 * Tamamlanan araçlar kendi statik klasörlerinde yer alır ve App Router'da
 * statik segment bu dinamik segmentten önce eşleşir.
 */
export function generateStaticParams() {
  return TOOLS.filter((tool) => !tool.ready).map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG[slug];

  if (!tool) return { title: 'Araç bulunamadı' };

  return {
    title: `${tool.name} — yakında`,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    // Henüz içerik yok; hazır olmayan sayfalar dizine eklenmesin.
    robots: { index: false, follow: true },
  };
}

export default async function UpcomingToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG[slug];

  if (!tool) notFound();

  return (
    <ToolPageLayout tool={tool}>
      <div className="text-center py-10">
        <div className="font-mono text-[26px] text-dim mb-3">⧗</div>
        <h2 className="font-mono text-[15px] font-semibold mb-2">Bu araç henüz hazır değil</h2>
        <p className="text-[13px] text-muted max-w-md mx-auto">
          {tool.name} geliştirme sırasında.{' '}
          {tool.needsBackend
            ? 'Sunucu tarafı gerektirdiği için son sırada planlandı.'
            : 'Tamamen tarayıcıda çalışacak şekilde yakında eklenecek.'}
        </p>
      </div>
    </ToolPageLayout>
  );
}
