'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Panel';
import type { Snippet } from '@/lib/types';

/**
 * Kaydedilen snippet'ler.
 *
 * Kaydetme düğmesi uzun süre hiçbir yere gitmiyordu: uç nokta hazırdı ama listeyi
 * gösteren sayfa yoktu, yani kullanıcı kaydettiğini bir daha bulamıyordu.
 */
export default function SavedSnippetsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-snippets'],
    queryFn: () => api.get<{ snippets: Snippet[] }>('/users/me/saved'),
  });

  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const snippets = data?.snippets ?? [];

  return (
    <Container className="py-10">
      <div className="mb-8">
        <div className="eyebrow mb-4">hesabım</div>
        <h1 className="font-mono text-[28px] font-bold tracking-[-0.02em]">Kaydedilenler</h1>
        <p className="text-muted text-[13.5px] mt-2">{snippets.length} snippet</p>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-6 h-6 text-amber animate-spin" />
        </div>
      ) : snippets.length === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="w-7 h-7 text-dim mx-auto mb-4" />
          <h2 className="font-mono text-[15px] font-semibold mb-2">Henüz bir şey kaydetmedin</h2>
          <p className="text-[13px] text-muted mb-6">
            Beğendiğin snippet&apos;i kaydet, buradan kolayca geri dön.
          </p>
          <ButtonLink href="/snippets">Arşive göz at</ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {snippets.map((snippet, index) => (
            <SnippetCard key={snippet.id} snippet={snippet} index={index} />
          ))}
        </div>
      )}
    </Container>
  );
}
