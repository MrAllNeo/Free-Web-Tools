'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, Pencil, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Panel';
import type { Snippet } from '@/lib/types';

/**
 * Kullanıcının kendi snippet'leri — yayındakiler, onay bekleyenler ve reddedilenler.
 *
 * Bu sayfa olmadan katkıcı gönderdiği snippet'i hiçbir yerde göremiyordu: arşiv ve
 * herkese açık profil yalnızca yayındakileri listeliyor.
 */
export default function MySnippetsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-snippets'],
    queryFn: () => api.get<{ snippets: Snippet[] }>('/users/me/snippets'),
  });

  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const snippets = data?.snippets ?? [];
  const published = snippets.filter((s) => s.status === 'approved');
  const waiting = snippets.filter((s) => s.status === 'pending' || s.status === 'draft');
  const rejected = snippets.filter((s) => s.status === 'rejected');

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="eyebrow mb-4">hesabım</div>
          <h1 className="font-mono text-[28px] font-bold tracking-[-0.02em]">Snippet&apos;lerim</h1>
          <p className="text-muted text-[13.5px] mt-2">
            {snippets.length} snippet · {published.length} yayında
          </p>
        </div>
        <ButtonLink href="/snippets/new" variant="solid">
          <Plus className="w-4 h-4" />
          Yeni snippet
        </ButtonLink>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-6 h-6 text-amber animate-spin" />
        </div>
      ) : snippets.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="font-mono text-[28px] text-dim mb-3">∅</div>
          <h2 className="font-mono text-[15px] font-semibold mb-2">Henüz snippet paylaşmadın</h2>
          <p className="text-[13px] text-muted mb-6">
            İlk kodunu paylaş, toplulukta görünsün.
          </p>
          <ButtonLink href="/snippets/new" variant="solid">
            <Plus className="w-4 h-4" />
            İlk snippet&apos;ini paylaş
          </ButtonLink>
        </Card>
      ) : (
        <div className="space-y-10">
          <Section title="Reddedilenler" snippets={rejected} tone="danger" />
          <Section title="Onay bekleyenler" snippets={waiting} tone="amber" />
          <Section title="Yayında" snippets={published} />
        </div>
      )}
    </Container>
  );
}

function Section({
  title,
  snippets,
  tone,
}: {
  title: string;
  snippets: Snippet[];
  tone?: 'amber' | 'danger';
}) {
  if (snippets.length === 0) return null;

  return (
    <section>
      <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] mb-4">
        {title} <span className="text-muted">({snippets.length})</span>
      </h2>

      {tone && (
        <div
          className={`flex gap-3 mb-4 p-3.5 rounded-sm border ${
            tone === 'danger' ? 'bg-danger/8 border-danger/40' : 'bg-amber/8 border-amber-dim/40'
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 shrink-0 mt-0.5 ${tone === 'danger' ? 'text-danger' : 'text-amber'}`}
          />
          <p className="text-[12.5px] text-muted">
            {tone === 'danger'
              ? 'Bu snippet’ler yayında görünmüyor. Düzenleyip tekrar deneyebilirsin.'
              : 'Bu snippet’leri şimdilik yalnızca sen ve yöneticiler görebiliyor.'}
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet, index) => (
          <div key={snippet.id} className="relative">
            <SnippetCard snippet={snippet} index={index} />

            {snippet.status === 'rejected' && snippet.rejectionReason && (
              <p className="mt-2 text-[12px] text-danger">Gerekçe: {snippet.rejectionReason}</p>
            )}

            {/* Kart bir bağlantı; düzenleme bağlantısı onun dışında durmalı. */}
            <Link
              href={`/snippets/${snippet.slug}/edit`}
              className="mt-2 inline-flex items-center gap-1.5 font-mono text-[12px] text-dim hover:text-amber transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              düzenle
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
