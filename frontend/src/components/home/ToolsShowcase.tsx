'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHead } from '@/components/ui/SectionHead';
import { Panel } from '@/components/ui/Panel';
import { TOOLS, TOOLS_BY_SLUG } from '@/lib/constants';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { UuidGenerator } from '@/components/tools/UuidGenerator';
import { ColorConverter } from '@/components/tools/ColorConverter';

/** Ana sayfada gömülü çalışan üç araç. */
const LIVE_DEMOS = [
  { slug: 'password-generator', tab: 'password', render: () => <PasswordGenerator /> },
  { slug: 'uuid-generator', tab: 'uuid', render: () => <UuidGenerator /> },
  { slug: 'color-converter', tab: 'color', render: () => <ColorConverter /> },
] as const;

const DEMO_SLUGS = new Set<string>(LIVE_DEMOS.map((d) => d.slug));

export function ToolsShowcase() {
  const [activeTab, setActiveTab] = useState<string>(LIVE_DEMOS[0].tab);
  const active = LIVE_DEMOS.find((d) => d.tab === activeTab) ?? LIVE_DEMOS[0];

  // Izgarada ilk sekiz araç gösteriliyor; tamamı /tools sayfasında.
  const gridTools = TOOLS.slice(0, 8);

  return (
    <section id="tools" className="py-16">
      <Container>
        <SectionHead
          title="Tools — anlık kullan"
          description="Aşağıdaki üç örnek gerçekten çalışıyor, deneyin:"
          action={{ href: '/tools', label: `${TOOLS.length} aracın tümü` }}
        />

        <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-4">
          {gridTools.map((tool) => {
            const isDemo = DEMO_SLUGS.has(tool.slug);
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={`bg-raised border rounded-md p-4 transition-all duration-150 hover:border-green hover:-translate-y-0.5 ${
                  isDemo ? 'border-green bg-green/6' : 'border-line-soft'
                }`}
              >
                <div className="font-mono text-[18px] text-green mb-2.5 leading-none">
                  {tool.glyph}
                </div>
                <h3 className="text-[13.5px] font-semibold mb-1">{tool.name}</h3>
                <p className="text-[11.5px] text-dim">{tool.short}</p>
              </Link>
            );
          })}
        </div>

        {/* Canlı demo paneli */}
        <Panel
          className="mt-6"
          bodyClassName="p-6"
          bar={
            <>
              <span className="font-mono text-[12px] text-green">● çalışan demo</span>
              <div className="flex gap-1.5">
                {LIVE_DEMOS.map((demo) => (
                  <button
                    key={demo.tab}
                    type="button"
                    onClick={() => setActiveTab(demo.tab)}
                    className={`font-mono text-[11.5px] px-3 py-1.5 rounded-xs border cursor-pointer transition-colors ${
                      activeTab === demo.tab
                        ? 'bg-green text-bg border-green font-semibold'
                        : 'border-line text-muted hover:text-fg'
                    }`}
                  >
                    {demo.tab}
                  </button>
                ))}
              </div>
            </>
          }
        >
          {/* key ile sekme değişiminde bileşen sıfırlanır */}
          <div key={active.tab}>{active.render()}</div>

          <div className="mt-6 pt-4 border-t border-line-soft">
            <Link
              href={`/tools/${active.slug}`}
              className="font-mono text-[12px] text-muted hover:text-green transition-colors"
            >
              {TOOLS_BY_SLUG[active.slug].name} tam sayfasına git →
            </Link>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
