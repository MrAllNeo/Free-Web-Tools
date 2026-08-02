import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Snippet Arşivi — Frontend, backend ve güvenlik kod örnekleri',
  description:
    'Video anlatımlı, topluluk tarafından puanlanmış kod snippet arşivi. Frontend bileşenleri canlı önizlemeyle test edilebilir, güvenlik içerikleri moderasyondan geçer.',
  alternates: { canonical: '/snippets' },
};

export default function SnippetsLayout({ children }: { children: ReactNode }) {
  return children;
}
