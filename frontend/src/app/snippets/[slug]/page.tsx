'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Eye,
  Heart,
  Loader2,
  MessageSquare,
  Shield,
  Star,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CodeViewer } from '@/components/snippets/CodeViewer';
import { SnippetMedia, mediaHeading } from '@/components/snippets/SnippetMedia';
import { CommentSection } from '@/components/snippets/CommentSection';
import { InteractionButtons } from '@/components/snippets/InteractionButtons';
import { DIFFICULTIES } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Panel';
import type { Snippet } from '@/lib/types';

const CATEGORY_LABEL: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  hacking: 'Hacking',
};

const DIFFICULTY_TONE = {
  green: 'green',
  amber: 'amber',
  danger: 'danger',
} as const;

const timeAgo = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });

interface SnippetPageProps {
  params: Promise<{ slug: string }>;
}

export default function SnippetDetailPage({ params }: SnippetPageProps) {
  const { slug } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ['snippet', slug],
    queryFn: () => api.get<{ snippet: Snippet }>(`/snippets/${slug}`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-amber animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Container>
        <div className="py-24 text-center">
          <div className="font-mono text-[28px] text-dim mb-3">404</div>
          <h1 className="font-mono text-[20px] font-semibold mb-2">Snippet bulunamadı</h1>
          <p className="text-[13px] text-muted mb-7">
            Bu snippet kaldırılmış olabilir ya da adres hatalı.
          </p>
          <ButtonLink href="/snippets" variant="solid">
            <ArrowLeft className="w-4 h-4" />
            Arşive dön
          </ButtonLink>
        </div>
      </Container>
    );
  }

  const snippet = data.snippet;
  const difficulty = DIFFICULTIES.find((d) => d.id === snippet.difficulty);
  const isHacking = snippet.category === 'hacking';

  return (
    <Container>
      <div className="py-10">
        <Link
          href="/snippets"
          className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted hover:text-amber transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          arşive dön
        </Link>

        {/* Başlık */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone={isHacking ? 'blue' : 'amber'}>{snippet.codeLanguage}</Badge>
              <Badge>{CATEGORY_LABEL[snippet.category] ?? snippet.category}</Badge>
              {difficulty && (
                <Badge tone={DIFFICULTY_TONE[difficulty.tone]}>{difficulty.label}</Badge>
              )}
              {isHacking && (
                <Badge tone="danger">
                  <Shield className="w-3 h-3" />
                  Yalnızca eğitim amaçlı
                </Badge>
              )}
            </div>

            <InteractionButtons
              snippetId={snippet.id}
              snippetSlug={snippet.slug}
              likesCount={snippet.likesCount}
            />
          </div>

          <h1 className="font-mono text-[26px] sm:text-[32px] font-bold leading-[1.18] tracking-[-0.02em] mb-3">
            {snippet.title}
          </h1>

          {snippet.description && (
            <p className="text-[15px] text-muted leading-relaxed max-w-3xl mb-6">
              {snippet.description}
            </p>
          )}

          <div className="flex items-center gap-5 flex-wrap font-mono text-[12px] text-muted py-3.5 border-y border-line-soft">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {snippet.viewsCount} görüntülenme
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              {snippet.likesCount} beğeni
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {snippet.commentsCount} yorum
            </span>
            {snippet.averageRating > 0 && (
              <span className="flex items-center gap-1.5 text-amber">
                <Star className="w-3.5 h-3.5 fill-current" />
                {snippet.averageRating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {timeAgo(snippet.createdAt)}
            </span>
          </div>
        </motion.div>

        {/* Vitrin: önizleme/video + kod */}
        <div className="grid lg:grid-cols-2 gap-6 items-start mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] mb-3">
              {mediaHeading(snippet)}
            </h2>

            <SnippetMedia snippet={snippet} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] mb-3">
              Kaynak kod
            </h2>
            <CodeViewer
              code={snippet.codeContent}
              language={snippet.codeLanguage}
              title={snippet.title}
              canDownload={snippet.canDownload}
            />
          </motion.div>
        </div>

        {/* Alt bölüm */}
        <div className="grid lg:grid-cols-3 gap-8 pt-10 mt-10 border-t border-line-soft">
          <div className="lg:col-span-2 space-y-8">
            {snippet.prerequisites && (
              <Card className="p-6">
                <h3 className="font-mono text-[13px] font-semibold flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-amber" />
                  Ön koşullar
                </h3>
                <p className="text-[13.5px] text-muted leading-relaxed whitespace-pre-line">
                  {snippet.prerequisites}
                </p>
              </Card>
            )}

            <CommentSection snippetId={snippet.id} snippetSlug={snippet.slug} />
          </div>

          {/* Kenar çubuğu */}
          <aside className="space-y-5">
            <Card className="p-5">
              <h3 className="font-mono text-[11px] text-dim uppercase tracking-[0.08em] mb-4">
                Ekleyen
              </h3>
              <Link
                href={`/profile/${snippet.author.username}`}
                className="flex items-center gap-3 mb-4 group/author rounded-xs -m-1 p-1 hover:bg-line-soft/50 transition-colors"
              >
                <span className="w-11 h-11 rounded-xs bg-amber/15 border border-amber-dim flex items-center justify-center text-amber font-mono text-[16px] font-bold shrink-0">
                  {snippet.author.username[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <span className="block text-[14px] font-semibold truncate group-hover/author:text-amber transition-colors">
                    {snippet.author.fullName || snippet.author.username}
                  </span>
                  <span className="font-mono text-[12px] text-dim">@{snippet.author.username}</span>
                </div>
              </Link>
              {snippet.author.reputationScore !== undefined && (
                <div className="flex items-center gap-2 font-mono text-[12px] text-amber bg-amber/8 border border-amber-dim/40 px-3 py-2 rounded-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {snippet.author.reputationScore} itibar puanı
                </div>
              )}
            </Card>

            {snippet.tags.length > 0 && (
              <Card className="p-5">
                <h3 className="font-mono text-[11px] text-dim uppercase tracking-[0.08em] mb-4">
                  Etiketler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/snippets?search=${encodeURIComponent(tag)}`}
                      className="font-mono text-[11.5px] text-muted bg-inset border border-line-soft px-2.5 py-1 rounded-xs hover:border-amber-dim hover:text-amber transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {snippet.documentationUrl && (
              <Card className="p-5">
                <h3 className="font-mono text-[11px] text-dim uppercase tracking-[0.08em] mb-3">
                  Kaynak
                </h3>
                <a
                  href={snippet.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[12.5px] text-amber hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Resmî dokümantasyon
                </a>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </Container>
  );
}
