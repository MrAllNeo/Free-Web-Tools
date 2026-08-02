import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { Panel } from '@/components/ui/Panel';
import { TOOLS, type ToolMeta } from '@/lib/constants';

/**
 * Her araç sayfasının ortak iskeleti: başlık, çalışma paneli ve
 * diğer araçlara iç bağlantılar (SEO için önemli).
 */
export function ToolPageLayout({
  tool,
  children,
  note,
}: {
  tool: ToolMeta;
  children: ReactNode;
  note?: ReactNode;
}) {
  const related = TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 6);

  return (
    <Container>
      <div className="py-10">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted hover:text-green transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          tüm araçlar
        </Link>

        <div className="flex items-start gap-4 mb-3">
          <span className="font-mono text-[26px] text-green leading-none mt-1">{tool.glyph}</span>
          <div>
            <h1 className="font-mono text-[26px] sm:text-[30px] font-bold tracking-[-0.02em]">
              {tool.name}
            </h1>
            <p className="text-muted text-[14px] mt-2 max-w-[600px]">{tool.description}</p>
          </div>
        </div>

        <Panel
          className="mt-8"
          bar={
            <>
              <span className="font-mono text-[12px] text-green">● {tool.short}</span>
              <span className="font-mono text-[11px] text-dim">
                {tool.needsBackend ? 'sunucu taraflı' : 'veri tarayıcıdan çıkmaz'}
              </span>
            </>
          }
        >
          {children}
        </Panel>

        {note && <div className="mt-5 text-[12.5px] text-muted leading-relaxed">{note}</div>}

        <div className="mt-12 pt-8 border-t border-line-soft">
          <h2 className="font-mono text-[11px] text-dim uppercase tracking-[0.08em] mb-4">
            Diğer araçlar
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={`/tools/${other.slug}`}
                className="font-mono text-[12.5px] text-muted hover:text-green transition-colors"
              >
                {other.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
