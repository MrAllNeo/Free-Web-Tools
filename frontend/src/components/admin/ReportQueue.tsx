'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Check, Flag, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { Card } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import type { ReportReason } from '@/lib/types';

interface Report {
  id: string;
  reason: ReportReason;
  details?: string | null;
  status: string;
  createdAt: string;
  reporter?: { username: string } | null;
  snippet?: { id: string; title: string; slug: string; category: string } | null;
  comment?: { id: string; content: string; snippet: { title: string; slug: string } } | null;
}

const REASON_LABEL: Record<ReportReason, string> = {
  malicious: 'Zararlı kod',
  spam: 'Spam',
  offensive: 'Uygunsuz',
  copyright: 'Telif',
  other: 'Diğer',
};

/**
 * Yayımlandıktan sonra gelen şikayetler. Moderasyon kuyruğu yalnızca yayın
 * öncesini kapsıyor; bu liste sonrasını kapatıyor.
 */
export function ReportQueue() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get<{ reports: Report[] }>('/admin/reports'),
  });

  const resolve = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'resolved' | 'dismissed' }) =>
      api.put(`/admin/reports/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Şikayet kapatıldı');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Şikayet kapatılamadı')),
  });

  const reports = data?.reports ?? [];

  return (
    <section className="mb-10">
      <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] mb-4">
        Şikayetler {reports.length > 0 && <span className="text-danger">({reports.length})</span>}
      </h2>

      {isLoading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="w-5 h-5 text-amber animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <Flag className="w-6 h-6 text-dim mx-auto mb-3" />
          <p className="text-[13px] text-muted">Açık şikayet yok.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const target = report.snippet ?? report.comment?.snippet;
            return (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-[11px] text-danger bg-danger/10 border border-danger/40 px-1.5 py-0.5 rounded-xs">
                        {REASON_LABEL[report.reason]}
                      </span>
                      <span className="font-mono text-[11.5px] text-dim">
                        @{report.reporter?.username ?? 'silinmiş kullanıcı'} ·{' '}
                        {formatDistanceToNow(new Date(report.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                      {report.comment && (
                        <span className="font-mono text-[11px] text-blue">yorum</span>
                      )}
                    </div>

                    {target ? (
                      <Link
                        href={`/snippets/${target.slug}`}
                        className="text-[13.5px] font-semibold hover:text-amber transition-colors"
                      >
                        {target.title}
                      </Link>
                    ) : (
                      <span className="text-[13px] text-dim">İçerik silinmiş</span>
                    )}

                    {report.comment && (
                      <p className="mt-1 text-[12.5px] text-muted line-clamp-2">
                        “{report.comment.content}”
                      </p>
                    )}

                    {report.details && (
                      <p className="mt-1.5 text-[12.5px] text-muted">{report.details}</p>
                    )}
                  </div>

                  {/* Kapatmak yalnızca kuyruğu temizler; içeriğe müdahale ayrı iş. */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => resolve.mutate({ id: report.id, status: 'dismissed' })}
                      disabled={resolve.isPending}
                    >
                      <X className="w-3.5 h-3.5" />
                      Yok say
                    </Button>
                    <Button
                      variant="solid"
                      onClick={() => resolve.mutate({ id: report.id, status: 'resolved' })}
                      disabled={resolve.isPending}
                    >
                      <Check className="w-3.5 h-3.5" />
                      İşlem yapıldı
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
