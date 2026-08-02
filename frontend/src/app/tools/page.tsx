import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { TOOLS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Geliştirici Araçları — JSON, Hash, Base64, QR ve dahası',
  description: `Kayıt gerektirmeyen, tarayıcıda anında çalışan ${TOOLS.length} ücretsiz geliştirici aracı: JSON formatter, hash generator, base64 çevirici, regex tester, QR kod üretici ve daha fazlası.`,
  alternates: { canonical: '/tools' },
};

export default function ToolsIndexPage() {
  return (
    <Container>
      <div className="py-12 border-b border-line-soft">
        <div className="eyebrow mb-5">04 — anlık kullanım</div>
        <h1 className="font-mono text-[30px] sm:text-[38px] font-bold leading-[1.14] tracking-[-0.02em]">
          Geliştirici <span className="text-green">araçları</span>
        </h1>
        <p className="text-muted text-[15px] max-w-[560px] mt-4">
          Kayıt gerekmez, veri sunucuya gitmez. {TOOLS.length} aracın{' '}
          {TOOLS.filter((t) => !t.needsBackend).length} tanesi tamamen tarayıcında çalışır.
        </p>
      </div>

      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 py-8">
        {TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group bg-raised border border-line-soft rounded-md p-5 flex flex-col transition-all duration-150 hover:border-green hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="font-mono text-[20px] text-green leading-none">{tool.glyph}</span>
              {!tool.ready && <Badge>yakında</Badge>}
              {tool.ready && tool.needsBackend && <Badge tone="blue">sunucu</Badge>}
            </div>

            <h2 className="text-[14.5px] font-semibold mb-1.5 group-hover:text-green transition-colors">
              {tool.name}
            </h2>
            <p className="text-[12.5px] text-muted leading-relaxed flex-1">{tool.description}</p>

            <span className="font-mono text-[11.5px] text-dim mt-4 group-hover:text-green transition-colors">
              {tool.short} →
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
