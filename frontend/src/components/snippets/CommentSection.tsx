'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Loader2, MessageSquare, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Card } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Field';
import type { Comment } from '@/lib/types';

const timeAgo = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < value ? 'text-amber fill-amber' : 'text-line'}`} />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  onDelete,
  canDelete,
  isDeleting,
  nested = false,
}: {
  comment: Comment;
  onDelete: (id: string) => void;
  canDelete: (comment: Comment) => boolean;
  isDeleting: boolean;
  nested?: boolean;
}) {
  return (
    <Card className={`p-5 ${nested ? 'ml-6 border-l-2 border-l-line' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-xs bg-amber/15 border border-amber-dim flex items-center justify-center text-amber font-mono text-[12px] font-bold shrink-0">
            {comment.user.username[0].toUpperCase()}
          </span>
          <div className="min-w-0">
            <span className="block font-mono text-[12.5px] font-semibold truncate">
              @{comment.user.username}
            </span>
            <span className="font-mono text-[11px] text-dim">{timeAgo(comment.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {comment.rating != null && <Stars value={comment.rating} />}
          {canDelete(comment) && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              aria-label="Yorumu sil"
              className="p-1 text-dim hover:text-danger transition-colors cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-[13.5px] text-muted leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              canDelete={canDelete}
              isDeleting={isDeleting}
              nested
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export function CommentSection({
  snippetId,
  snippetSlug,
}: {
  snippetId: string;
  snippetSlug: string;
}) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ comments: Comment[] }>({
    queryKey: ['comments', snippetId],
    queryFn: () => api.get<{ comments: Comment[] }>(`/snippets/${snippetId}/comments`),
  });

  const comments = data?.comments ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['comments', snippetId] });
    // Ortalama puan ve yorum sayısı snippet üzerinde tutuluyor.
    queryClient.invalidateQueries({ queryKey: ['snippet', snippetSlug] });
  };

  const create = useMutation({
    mutationFn: () =>
      api.post(`/snippets/${snippetId}/comments`, {
        content,
        rating: rating ?? undefined,
      }),
    onSuccess: () => {
      setContent('');
      setRating(null);
      invalidate();
      toast.success('Yorumun eklendi');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Yorum eklenemedi')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/users/comments/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('Yorum silindi');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Yorum silinemedi')),
  });

  const canDelete = (comment: Comment) =>
    isAuthenticated && (user?.id === comment.user.id || user?.role === 'admin');

  return (
    <div>
      <h2 className="font-mono text-[16px] font-semibold mb-5">Yorumlar ({comments.length})</h2>

      {/* Yorum formu */}
      {isAuthenticated ? (
        <Card className="p-5 mb-5">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bu snippet hakkında ne düşünüyorsun?"
            maxLength={2000}
            className="min-h-[90px]"
            aria-label="Yorum metni"
          />

          <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11.5px] text-dim">Puanın:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(rating === value ? null : value)}
                    aria-label={`${value} yıldız`}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        rating != null && value <= rating
                          ? 'text-amber fill-amber'
                          : 'text-line hover:text-amber-dim'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating != null && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="font-mono text-[11px] text-dim hover:text-fg transition-colors cursor-pointer"
                >
                  temizle
                </button>
              )}
            </div>

            <Button
              variant="solid"
              size="sm"
              onClick={() => create.mutate()}
              disabled={create.isPending || content.trim() === ''}
            >
              {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Yorum gönder
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 mb-5 text-center">
          <p className="text-[13px] text-muted">
            Yorum yazmak için{' '}
            <Link href="/auth/login" className="text-amber hover:underline">
              giriş yap
            </Link>{' '}
            ya da{' '}
            <Link href="/auth/register" className="text-amber hover:underline">
              hesap oluştur
            </Link>
            .
          </p>
        </Card>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 text-amber animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={(id) => remove.mutate(id)}
              canDelete={canDelete}
              isDeleting={remove.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-line rounded-md">
          <MessageSquare className="w-8 h-8 text-dim mx-auto mb-3 opacity-40" />
          <h3 className="font-mono text-[13.5px] font-semibold">Henüz yorum yok</h3>
          <p className="text-[12.5px] text-muted mt-1">
            Bu snippet hakkında ilk düşüncesini paylaşan sen ol.
          </p>
        </div>
      )}
    </div>
  );
}
