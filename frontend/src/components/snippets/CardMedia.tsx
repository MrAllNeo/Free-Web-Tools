'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { buildPreviewDocument, canRenderLive, PREVIEW_SANDBOX } from '@/lib/preview';
import { CodeThumbnail } from './CodeThumbnail';
import { formatDuration, getYouTubeThumbnail } from '@/lib/video';
import type { Snippet } from '@/lib/types';

/**
 * Kart kapağı. Frontend snippet'lerinde tasarım ızgarada da canlı çalışır —
 * statik bir kapak görseli yerine kodun kendisi render edilir.
 */
export function CardMedia({ snippet }: { snippet: Snippet }) {
  const mediaType =
    snippet.mediaType ??
    (snippet.category === 'frontend' ? 'live' : snippet.videoUrl ? 'video' : 'none');

  if (mediaType === 'live' && snippet.codeContent) {
    // Kartlarda yalnızca doğrudan çalışan kod canlı gösterilir.
    //
    // React snippet'leri detay sayfasında derlenip çalışıyor, ama bir ızgarada
    // düzinelerce kart var: her biri React çalışma zamanını ayrıştırıp kendi
    // kökünü kurmak zorunda kalırdı. Zayıf makinelerde bu listeyi kilitler.
    // Kartta kod önizlemesi göstermek, detayda canlı çalıştırmak makul takas.
    if (!canRenderLive(snippet.codeContent, snippet.codeLanguage, snippet.demoHtml)) {
      return <CodeThumbnail code={snippet.codeContent} language={snippet.codeLanguage} />;
    }

    return (
      <div className="relative aspect-video bg-white border-b border-line-soft overflow-hidden">
        {/*
          Kart ~380px genişliğinde; tasarımlar ise masaüstü genişliği varsayar
          (max-w-6xl gibi). Iframe'i kabın 3 katı boyutta render edip 1/3 oranında
          küçültüyoruz: içerik masaüstü düzeninde akıyor, karta ise küçültülmüş
          bir vitrin olarak sığıyor. Yüzde tabanlı olduğu için her kırılımda çalışır.

          Kart bir bağlantı olduğundan iframe tıklamaları yutmamalı.
        */}
        <iframe
          srcDoc={buildPreviewDocument(snippet.codeContent, snippet.codeLanguage, snippet.demoHtml)}
          title=""
          aria-hidden="true"
          tabIndex={-1}
          sandbox={PREVIEW_SANDBOX}
          className="absolute top-0 left-0 border-none pointer-events-none origin-top-left"
          style={{ width: '300%', height: '300%', transform: 'scale(0.3333)' }}
        />
        <span className="absolute top-2.5 left-2.5 font-mono text-[10px] bg-black/70 text-green px-1.5 py-0.5 rounded-xs">
          canlı
        </span>
      </div>
    );
  }

  if (mediaType === 'image' && snippet.imageUrl) {
    return (
      <div className="relative aspect-video bg-inset border-b border-line-soft overflow-hidden">
        {/* Katkıcının girdiği serbest URL — next/image yapılandırması kapsamaz. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={snippet.imageUrl}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover opacity-85 transition-opacity group-hover:opacity-100"
        />
      </div>
    );
  }

  const thumbnail = getYouTubeThumbnail(snippet.videoUrl);
  const duration = formatDuration(snippet.videoDurationSeconds);

  return (
    <div className="relative aspect-video bg-inset border-b border-line-soft flex items-center justify-center overflow-hidden">
      {thumbnail && (
        <Image
          src={thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover opacity-70 transition-opacity group-hover:opacity-100"
        />
      )}

      {mediaType === 'video' ? (
        <span className="relative w-10 h-10 rounded-full bg-amber/12 border border-amber-dim flex items-center justify-center text-amber backdrop-blur-sm">
          <Play className="w-3.5 h-3.5 fill-current" />
        </span>
      ) : (
        <span className="relative font-mono text-[22px] text-dim">∅</span>
      )}

      {duration && (
        <span className="absolute top-2.5 right-2.5 font-mono text-[10.5px] bg-black/60 px-1.5 py-0.5 rounded-xs text-muted">
          {duration}
        </span>
      )}
    </div>
  );
}
