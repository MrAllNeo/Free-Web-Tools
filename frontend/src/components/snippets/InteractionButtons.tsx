'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

interface InteractionState {
  liked: boolean;
  saved: boolean;
}

export function InteractionButtons({
  snippetId,
  snippetSlug,
  likesCount,
}: {
  snippetId: string;
  snippetSlug: string;
  likesCount: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data } = useQuery<InteractionState>({
    queryKey: ['interaction', snippetId],
    queryFn: () => api.get<InteractionState>(`/snippets/${snippetId}/interaction`),
    enabled: isAuthenticated,
  });

  const liked = data?.liked ?? false;
  const saved = data?.saved ?? false;

  const toggle = useMutation({
    mutationFn: (action: 'like' | 'save') =>
      api.post<{ active: boolean; likesCount?: number }>(`/snippets/${snippetId}/${action}`),
    onSuccess: (result, action) => {
      queryClient.invalidateQueries({ queryKey: ['interaction', snippetId] });
      // Beğeni sayacı snippet üzerinde tutulduğu için detayı da tazele.
      if (action === 'like') {
        queryClient.invalidateQueries({ queryKey: ['snippet', snippetSlug] });
      }
      toast.success(
        action === 'like'
          ? result.active
            ? 'Beğenildi'
            : 'Beğeni geri alındı'
          : result.active
            ? 'Kaydedildi'
            : 'Kayıt kaldırıldı'
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'İşlem tamamlanamadı')),
  });

  const handle = (action: 'like' | 'save') => () => {
    if (!isAuthenticated) {
      toast.error('Bunun için giriş yapman gerekiyor');
      router.push('/auth/login');
      return;
    }
    toggle.mutate(action);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handle('like')}
        disabled={toggle.isPending}
        className={liked ? '!border-danger !text-danger' : ''}
        aria-pressed={liked}
      >
        <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
        {likesCount > 0 ? likesCount : 'Beğen'}
      </Button>

      <Button
        size="sm"
        onClick={handle('save')}
        disabled={toggle.isPending}
        className={saved ? '!border-amber !text-amber' : ''}
        aria-pressed={saved}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
        {saved ? 'Kaydedildi' : 'Kaydet'}
      </Button>
    </div>
  );
}
