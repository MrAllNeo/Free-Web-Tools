import { api } from '@/lib/api';
import type { PublicProfile, SnippetStats } from '@/lib/types';

/**
 * Ana sayfada hem hero istatistikleri hem kategori sayaçları aynı yanıtı kullanır.
 * Ortak seçenek nesnesi sayesinde react-query tek istek atıp önbelleği paylaşır.
 */
export const snippetStatsQuery = {
  queryKey: ['snippet-stats'] as const,
  queryFn: () => api.get<SnippetStats>('/snippets/stats'),
  staleTime: 5 * 60 * 1000,
};

export const publicProfileQuery = (username: string) => ({
  queryKey: ['profile', username] as const,
  queryFn: () => api.get<PublicProfile>(`/users/${encodeURIComponent(username)}`),
  staleTime: 60 * 1000,
});
