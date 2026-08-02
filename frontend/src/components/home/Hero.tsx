'use client';

import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { CodeTerminal, TerminalLine } from '@/components/ui/CodeTerminal';
import { TOOLS } from '@/lib/constants';
import { snippetStatsQuery } from '@/lib/queries';

const kw = 'text-blue';
const fn = 'text-amber';
const str = 'text-green';
const op = 'text-muted';

export function Hero() {
  const { data } = useQuery(snippetStatsQuery);

  const stats = [
    {
      value: data ? data.total.toLocaleString('tr-TR') : '—',
      label: 'SNIPPET',
    },
    { value: String(TOOLS.length), label: 'UTILITY TOOL' },
    {
      value: data?.averageRating != null ? data.averageRating.toFixed(1) : '—',
      label: 'ORT. PUAN',
    },
  ];

  return (
    <section className="border-b border-line-soft py-16 lg:py-20">
      <Container>
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-15 items-center">
          <div>
            <div className="eyebrow mb-5">kod izle · videoyu izle · aracı kullan</div>

            <h1 className="font-mono text-[30px] sm:text-[38px] lg:text-[42px] font-bold leading-[1.14] tracking-[-0.02em] mb-5">
              Kodu <span className="text-amber">gör</span>,
              <br />
              videoda <span className="text-blue">çalışırken izle</span>.
            </h1>

            <p className="text-[16px] text-muted max-w-[480px] mb-7">
              Frontend, backend, güvenlik snippet&apos;leri ve anlık kullanılabilir{' '}
              {TOOLS.length} geliştirici aracı — tek platformda.
            </p>

            <div className="flex flex-wrap gap-3.5">
              <ButtonLink href="/snippets" variant="solid" size="lg">
                Keşfetmeye başla
              </ButtonLink>
              <ButtonLink href="/tools" variant="ghost" size="lg">
                Araçları dene
              </ButtonLink>
            </div>

            <div className="flex gap-8 mt-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-mono text-[21px] font-bold">{stat.value}</div>
                  <div className="font-mono text-[11.5px] text-dim">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <CodeTerminal title="auth-middleware.js" className="hidden sm:block">
            <TerminalLine n={1}>
              <span className={kw}>const</span> jwt <span className={op}>=</span>{' '}
              <span className={kw}>require</span>(<span className={str}>&apos;jsonwebtoken&apos;</span>)
            </TerminalLine>
            <TerminalLine n={2} />
            <TerminalLine n={3}>
              <span className={kw}>function</span> <span className={fn}>verifyToken</span>(req, res,
              next) {'{'}
            </TerminalLine>
            <TerminalLine n={4}>
              {'  '}
              <span className={kw}>const</span> token <span className={op}>=</span> req.headers[
              <span className={str}>&apos;authorization&apos;</span>]
            </TerminalLine>
            <TerminalLine n={5}>
              {'  '}
              <span className={kw}>if</span> (!token) <span className={kw}>return</span> res.
              <span className={fn}>status</span>(<span className={str}>401</span>)
            </TerminalLine>
            <TerminalLine n={6}>
              {'  '}jwt.<span className={fn}>verify</span>(token, SECRET, (err, user){' '}
              <span className={op}>=&gt;</span> {'{'}
            </TerminalLine>
            <TerminalLine n={7}>
              {'    '}req.user <span className={op}>=</span> user
              <span className="cursor-blink" />
            </TerminalLine>
            <TerminalLine n={8}>{'  })'}</TerminalLine>
            <TerminalLine n={9}>{'}'}</TerminalLine>
          </CodeTerminal>
        </div>
      </Container>
    </section>
  );
}
