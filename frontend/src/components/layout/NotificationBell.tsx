'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { NotificationList } from '@/lib/types';

/**
 * Okunmamış bildirim sayacı.
 *
 * Yalnızca sayıyı gösterip listeye yönlendiriyor — açılır panel bu ölçekte
 * gereksiz karmaşa. Sayaç 60 saniyede bir tazeleniyor; anlık olması gerekmiyor,
 * sürekli istek atmak zayıf makinelerde ve sunucuda boşuna yük.
 */
export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<NotificationList>('/notifications'),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (!isAuthenticated) return null;

  const unread = data?.unreadCount ?? 0;

  return (
    <Link
      href="/my/notifications"
      className="relative p-2 text-dim hover:text-amber transition-colors"
      aria-label={unread > 0 ? `${unread} okunmamış bildirim` : 'Bildirimler'}
      title="Bildirimler"
    >
      <Bell className="w-4 h-4" />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-amber text-bg font-mono text-[9.5px] font-bold flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
