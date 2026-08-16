'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, Check, CheckCircle2, Loader2, MessageSquare, Reply, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Container } from '@/components/ui/Container';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Panel';
import type { AppNotification, NotificationList } from '@/lib/types';

const ICONS = {
  comment_on_snippet: MessageSquare,
  reply_to_comment: Reply,
  snippet_approved: CheckCircle2,
  snippet_rejected: XCircle,
} as const;

const TONE = {
  comment_on_snippet: 'text-amber',
  reply_to_comment: 'text-amber',
  snippet_approved: 'text-green',
  snippet_rejected: 'text-danger',
} as const;

function describe(notification: AppNotification): string {
  const who = notification.actor?.username ?? 'birisi';
  const what = notification.snippet?.title ?? 'bir snippet';

  switch (notification.type) {
    case 'comment_on_snippet':
      return `@${who}, "${what}" snippet'ine yorum yaptı.`;
    case 'reply_to_comment':
      return `@${who}, "${what}" altındaki yorumuna yanıt verdi.`;
    case 'snippet_approved':
      return `"${what}" onaylandı ve yayımlandı.`;
    case 'snippet_rejected':
      return `"${what}" reddedildi. Gerekçeyi snippet sayfasında görebilirsin.`;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<NotificationList>('/notifications'),
    enabled: isAuthenticated,
  });

  const markRead = useMutation({
    mutationFn: () => api.put('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="eyebrow mb-4">hesabım</div>
          <h1 className="font-mono text-[28px] font-bold tracking-[-0.02em]">Bildirimler</h1>
          <p className="text-muted text-[13.5px] mt-2">
            {unread > 0 ? `${unread} okunmamış` : 'hepsi okundu'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" onClick={() => markRead.mutate()} disabled={markRead.isPending}>
            {markRead.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Tümünü okundu işaretle
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-6 h-6 text-amber animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-7 h-7 text-dim mx-auto mb-4" />
          <h2 className="font-mono text-[15px] font-semibold mb-2">Henüz bildirim yok</h2>
          <p className="text-[13px] text-muted mb-6">
            Snippet&apos;ine yorum geldiğinde ya da moderasyon kararı verildiğinde burada görürsün.
          </p>
          <ButtonLink href="/snippets">Arşive göz at</ButtonLink>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = ICONS[notification.type];
            const isUnread = !notification.readAt;
            const href = notification.snippet ? `/snippets/${notification.snippet.slug}` : '#';

            return (
              <Link
                key={notification.id}
                href={href}
                className={`flex items-start gap-3 p-4 rounded-sm border transition-colors ${
                  isUnread
                    ? 'bg-raised border-amber-dim/40 hover:border-amber-dim'
                    : 'bg-raised/50 border-line-soft hover:border-line'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${TONE[notification.type]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] text-fg leading-relaxed">{describe(notification)}</p>
                  <span className="font-mono text-[11.5px] text-dim">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
                {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0 mt-2" />}
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
