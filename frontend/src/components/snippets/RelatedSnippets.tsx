'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SnippetCard } from './SnippetCard';
import type { Snippet } from '@/lib/types';

/**
 * Detay sayfasının çıkmaz sokak olmaması için. Kullanıcı okuduğu snippet'ten
 * sonra gidecek bir yer görmeliydi; aksi hâlde sekmeyi kapatıyor.
 */
export function RelatedSnippets({ slug, authorUsername }: { slug: string; authorUsername: string }) {
  const { data } = useQuery({
    queryKey: ['related', slug],
    queryFn: () => api.get<{ byAuthor: Snippet[]; similar: Snippet[] }>(`/snippets/${slug}/related`),
    staleTime: 5 * 60 * 1000,
  });

  const byAuthor = data?.byAuthor ?? [];
  const similar = data?.similar ?? [];

  if (byAuthor.length === 0 && similar.length === 0) return null;

  return (
    <div className="space-y-10">
      {byAuthor.length > 0 && (
        <section>
          <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] mb-5">
            @{authorUsername} kullanıcısından diğerleri
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {byAuthor.map((snippet, index) => (
              <SnippetCard key={snippet.id} snippet={snippet} index={index} />
            ))}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section>
          <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] mb-5">
            Benzer snippet&apos;ler
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((snippet, index) => (
              <SnippetCard key={snippet.id} snippet={snippet} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
