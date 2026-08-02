import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { API_URL } from '@/lib/constants';

interface SnippetMeta {
  title: string;
  description?: string;
  codeLanguage: string;
  category: string;
  tags: string[];
  videoUrl?: string;
  publishedAt?: string;
  author: { username: string };
}

/**
 * Detay sayfası etkileşim yüzünden istemci bileşeni olduğundan metadata'yı
 * bu layout üretiyor — arama motorları ve link önizlemeleri için kritik.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await fetch(`${API_URL}/snippets/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return { title: 'Snippet bulunamadı' };

    const { snippet } = (await response.json()) as { snippet: SnippetMeta };

    const description =
      snippet.description ??
      `${snippet.codeLanguage} ile yazılmış ${snippet.category} snippet'i, @${snippet.author.username} tarafından paylaşıldı.`;

    return {
      title: snippet.title,
      description,
      keywords: [...snippet.tags, snippet.codeLanguage, snippet.category],
      alternates: { canonical: `/snippets/${slug}` },
      openGraph: {
        type: 'article',
        title: snippet.title,
        description,
        publishedTime: snippet.publishedAt,
        authors: [snippet.author.username],
      },
    };
  } catch {
    // API kapalıyken build ve render kırılmasın.
    return { title: 'Snippet' };
  }
}

export default function SnippetDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
