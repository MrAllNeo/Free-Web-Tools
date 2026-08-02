'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle, Clock, Eye, Loader2, ShieldAlert, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import type { Snippet } from '@/lib/types';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'pending-snippets'],
    queryFn: () => api.get<{ snippets: Snippet[] }>('/admin/snippets/pending'),
    enabled: Boolean(isAdmin),
    retry: false,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      api.put(`/admin/snippets/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-snippets'] });
      toast.success('Snippet durumu güncellendi');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Durum güncellenemedi')),
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-5">
        <ShieldAlert className="w-12 h-12 text-danger opacity-80" />
        <h1 className="font-mono text-[22px] font-semibold">Erişim reddedildi</h1>
        <p className="text-[13.5px] text-muted max-w-md">
          Bu sayfa yalnızca yöneticilere açıktır. Gerekli yetkiye sahip değilsin.
        </p>
        <ButtonLink href="/" variant="solid" className="mt-2">
          Ana sayfaya dön
        </ButtonLink>
      </div>
    );
  }

  const snippets = data?.snippets ?? [];

  return (
    <Container>
      <div className="py-12 border-b border-line-soft">
        <div className="eyebrow mb-5">moderasyon</div>
        <h1 className="font-mono text-[28px] sm:text-[32px] font-bold tracking-[-0.02em]">
          Yönetim paneli
        </h1>
        <p className="text-muted text-[14px] mt-3">
          Topluluktan gelen bekleyen gönderileri incele ve karara bağla.
        </p>
      </div>

      <div className="py-8">
        <div className="bg-raised border border-line rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-line-soft bg-inset flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber" />
            <h2 className="font-mono text-[13px] font-semibold">Onay bekleyenler</h2>
            <Badge tone="amber">{snippets.length}</Badge>
          </div>

          {isLoading ? (
            <div className="p-14 flex justify-center">
              <Loader2 className="w-6 h-6 text-amber animate-spin" />
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="font-mono text-[13px] text-danger mb-2">Moderasyon kuyruğu alınamadı</p>
              <p className="text-[12.5px] text-muted max-w-lg mx-auto">
                <code className="font-mono text-amber">/api/admin/snippets/pending</code> uç noktası
                henüz backend&apos;de tanımlı değil — Faz 4&apos;te eklenecek.
              </p>
              <p className="font-mono text-[11.5px] text-dim mt-3">
                {getApiErrorMessage(error, 'Bilinmeyen hata')}
              </p>
            </div>
          ) : snippets.length === 0 ? (
            <div className="p-14 text-center">
              <CheckCircle className="w-10 h-10 text-green mx-auto mb-3 opacity-80" />
              <h3 className="font-mono text-[14px] font-semibold">Kuyruk temiz</h3>
              <p className="text-[12.5px] text-muted mt-1">
                Şu anda incelenmeyi bekleyen snippet yok.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line-soft">
              {snippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="p-5 flex flex-col lg:flex-row gap-5 lg:items-center hover:bg-inset/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge tone="amber">{snippet.codeLanguage}</Badge>
                      <Badge>{snippet.category}</Badge>
                    </div>

                    <h3 className="text-[15px] font-semibold mb-1">{snippet.title}</h3>
                    {snippet.description && (
                      <p className="text-[12.5px] text-muted line-clamp-2 mb-3 max-w-3xl">
                        {snippet.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 font-mono text-[11.5px] text-dim flex-wrap">
                      <span>@{snippet.author.username}</span>
                      <span>
                        {formatDistanceToNow(new Date(snippet.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}{' '}
                        gönderildi
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Link
                      href={`/snippets/${snippet.slug}`}
                      className="inline-flex items-center gap-1.5 font-mono text-[12px] px-3 py-2 rounded-xs border border-line text-muted hover:border-muted hover:text-fg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      İncele
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: snippet.id, status: 'approved' })}
                      disabled={updateStatus.isPending}
                      className="!border-green !text-green hover:!bg-green/10"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Onayla
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateStatus.mutate({ id: snippet.id, status: 'rejected' })}
                      disabled={updateStatus.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reddet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
