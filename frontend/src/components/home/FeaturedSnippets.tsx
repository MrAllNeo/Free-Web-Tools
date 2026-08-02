'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { SectionHead } from '@/components/ui/SectionHead';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import type { SnippetsResponse } from '@/lib/types';

function CardSkeleton() {
  return (
    <div className="bg-raised border border-line-soft rounded-md overflow-hidden">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-24 skeleton rounded-xs" />
        <div className="h-3.5 w-3/4 skeleton rounded-xs" />
        <div className="h-2.5 w-full skeleton rounded-xs" />
      </div>
    </div>
  );
}

export function FeaturedSnippets() {
  const { data, isLoading, isError } = useQuery<SnippetsResponse>({
    queryKey: ['snippets', 'featured'],
    queryFn: () => api.get<SnippetsResponse>('/snippets?limit=3&sort=top-rated'),
    staleTime: 5 * 60 * 1000,
  });

  const snippets = data?.snippets ?? [];

  return (
    <section className="border-b border-line-soft py-16">
      <Container>
        <SectionHead
          title="Bu hafta öne çıkanlar"
          description="Topluluk tarafından en yüksek puanlananlar"
          action={{ href: '/snippets', label: 'tümünü gör' }}
        />

        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <p className="font-mono text-[13px] text-danger">
            Snippet&apos;ler yüklenemedi — API sunucusu çalışıyor mu?
          </p>
        )}

        {!isLoading && !isError && snippets.length === 0 && (
          <p className="font-mono text-[13px] text-dim">Henüz yayınlanmış snippet yok.</p>
        )}

        {snippets.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet, i) => (
              <SnippetCard key={snippet.id} snippet={snippet} index={i} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
