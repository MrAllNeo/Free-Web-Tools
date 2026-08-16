import Link from 'next/link';
import { NAV_SECTIONS, TOOLS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';

/**
 * Demo'daki iki satırlık minimal alt bilgi + araç sayfalarına iç bağlantı satırı.
 * Bağlantılar SEO için kritik: her araç sayfası organik aramadan trafik alacak.
 */
export function Footer() {
  const popularTools = TOOLS.slice(0, 6);

  return (
    <footer className="border-t border-line-soft mt-auto">
      <Container>
        <div className="py-9 flex flex-col gap-7">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] text-dim tracking-[0.08em] uppercase mb-3">
                Bölümler
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {NAV_SECTIONS.map((section) => (
                  <Link
                    key={section.id}
                    href={section.href}
                    className="font-mono text-[12.5px] text-muted hover:text-amber transition-colors"
                  >
                    {section.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-[11px] text-dim tracking-[0.08em] uppercase mb-3">
                Popüler araçlar
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {popularTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="font-mono text-[12.5px] text-muted hover:text-green transition-colors"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-line-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="font-mono text-[12px] text-dim">
              free/web/tools — kodu gör, videoda izle, aracı kullan
            </p>
            <p className="font-mono text-[12px] text-dim">
              TOYWES · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
