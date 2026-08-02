'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SNIPPET_CATEGORIES, TOOLS } from '@/lib/constants';
import { snippetStatsQuery } from '@/lib/queries';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Panel';
import { SectionHead } from '@/components/ui/SectionHead';

const ACCENT_TEXT = {
  amber: 'text-amber',
  blue: 'text-blue',
  green: 'text-green',
} as const;

export function CategoryGrid() {
  const { data, isLoading } = useQuery(snippetStatsQuery);

  const cards = [
    ...SNIPPET_CATEGORIES.map((category) => ({
      key: category.id,
      href: `/snippets?category=${category.id}`,
      tag: category.tag,
      title: category.label,
      description: category.description,
      accent: category.accent as 'amber' | 'blue',
      count: isLoading ? '…' : `${data?.byCategory[category.id] ?? 0} snippet`,
    })),
    {
      key: 'tools',
      href: '/tools',
      tag: '04 — ANLIK KULLANIM',
      title: 'Tools',
      description: 'JSON formatter, hash generator, QR ve daha fazlası.',
      accent: 'green' as const,
      count: `${TOOLS.length} araç`,
    },
  ];

  return (
    <section className="border-b border-line-soft py-16">
      <Container>
        <SectionHead
          title="Kategoriler"
          description="Dört ana bölüm, farklı kullanım amaçları"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.key} href={card.href} className="group">
              <Card interactive accent={card.accent} className="p-5 h-full flex flex-col">
                <div className="font-mono text-[10.5px] text-dim tracking-[0.08em]">{card.tag}</div>
                <h3 className="text-[17px] font-semibold mt-2 mb-1.5">{card.title}</h3>
                <p className="text-[12.5px] text-muted mb-4 flex-1">{card.description}</p>
                <div className={`font-mono text-[11.5px] ${ACCENT_TEXT[card.accent]}`}>
                  {card.count} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
