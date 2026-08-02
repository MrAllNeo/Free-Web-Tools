'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageSquare, Play, Star } from 'lucide-react';
import { DIFFICULTIES } from '@/lib/constants';
import { formatDuration, getYouTubeThumbnail } from '@/lib/video';
import type { Snippet } from '@/lib/types';

const CATEGORY_LABEL: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  hacking: 'Hacking',
};

/** Hacking snippet'leri mavi, diğerleri amber aksanla ayrışır (demo davranışı). */
const isHacking = (category: string) => category === 'hacking';

interface SnippetCardProps {
  snippet: Snippet;
  index?: number;
}

export function SnippetCard({ snippet, index = 0 }: SnippetCardProps) {
  const difficulty = DIFFICULTIES.find((d) => d.id === snippet.difficulty);
  const thumbnail = getYouTubeThumbnail(snippet.videoUrl);
  const duration = formatDuration(snippet.videoDurationSeconds);
  const accent = isHacking(snippet.category) ? 'text-blue-dim' : 'text-amber-dim';
  const hoverBorder = isHacking(snippet.category)
    ? 'hover:border-blue-dim'
    : 'hover:border-amber-dim';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.05 }}
    >
      <Link href={`/snippets/${snippet.slug}`} className="group block h-full">
        <article
          className={`bg-raised border border-line-soft rounded-md overflow-hidden h-full flex flex-col transition-all duration-150 hover:-translate-y-[3px] ${hoverBorder}`}
        >
          {/* Video kapağı */}
          <div className="relative aspect-video bg-inset border-b border-line-soft flex items-center justify-center overflow-hidden">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                className="object-cover opacity-70 transition-opacity group-hover:opacity-100"
              />
            ) : null}

            <span className="relative w-10 h-10 rounded-full bg-amber/12 border border-amber-dim flex items-center justify-center text-amber backdrop-blur-sm">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>

            {duration && (
              <span className="absolute top-2.5 right-2.5 font-mono text-[10.5px] bg-black/60 px-1.5 py-0.5 rounded-xs text-muted">
                {duration}
              </span>
            )}
          </div>

          {/* Gövde */}
          <div className="p-4 flex flex-col flex-1">
            <div className={`font-mono text-[10.5px] uppercase tracking-[0.06em] ${accent}`}>
              {snippet.codeLanguage} · {CATEGORY_LABEL[snippet.category] ?? snippet.category}
            </div>

            <h3 className="text-[14.5px] font-semibold mt-1.5 mb-1.5 line-clamp-2 group-hover:text-amber transition-colors">
              {snippet.title}
            </h3>

            {snippet.description && (
              <p className="text-[12.5px] text-muted line-clamp-2 leading-relaxed">
                {snippet.description}
              </p>
            )}

            {difficulty && (
              <div className="mt-3">
                <span className="font-mono text-[10.5px] text-dim">{difficulty.label}</span>
              </div>
            )}

            {/* Alt bilgi */}
            <div className="flex items-center justify-between gap-2 mt-auto pt-3">
              <span className="text-[11.5px] text-dim truncate">@{snippet.author.username}</span>

              <div className="flex items-center gap-2.5 font-mono text-[11.5px] text-muted shrink-0">
                <span className="hidden sm:flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {snippet.viewsCount}
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {snippet.likesCount}
                </span>
                <span className="hidden md:flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {snippet.commentsCount}
                </span>
                {snippet.averageRating > 0 && (
                  <span className="flex items-center gap-1 text-amber">
                    <Star className="w-3 h-3 fill-current" />
                    {snippet.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
