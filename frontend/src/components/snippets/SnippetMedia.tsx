'use client';

import { Wrench } from 'lucide-react';
import { LivePreview } from './LivePreview';
import { VideoPlayer } from './VideoPlayer';
import { canRenderLive } from '@/lib/preview';
import type { Snippet } from '@/lib/types';

/**
 * Bir snippet'in üstünde ne gösterileceğine karar verir.
 *
 * Frontend snippet'leri kod iframe içinde canlı çalıştırılır — tasarımı videoda
 * değil bizzat çalışır hâlde görürsün. Backend ve hacking kategorilerinde katkıcı
 * yüklerken video ya da görsel seçer.
 */
export function SnippetMedia({ snippet }: { snippet: Snippet }) {
  // Eski kayıtlarda mediaType boş olabilir; kategoriye bakarak güvenli varsayılan.
  const mediaType =
    snippet.mediaType ??
    (snippet.category === 'frontend' ? 'live' : snippet.videoUrl ? 'video' : 'none');

  if (mediaType === 'live') {
    if (canRenderLive(snippet.codeContent, snippet.codeLanguage)) {
      return (
        <LivePreview
          code={snippet.codeContent}
          title={snippet.title}
          language={snippet.codeLanguage}
        />
      );
    }

    // React/TSX gibi derleme gerektiren kod tarayıcıda olduğu gibi çalışmaz.
    // Sessizce boş bir çerçeve göstermek yerine nedenini açıkça söylüyoruz.
    return (
      <div className="flex flex-col items-center justify-center h-[420px] bg-raised border border-line-soft rounded-md text-center p-8">
        <Wrench className="w-7 h-7 text-dim mb-4" />
        <h3 className="font-mono text-[14px] font-semibold mb-2">Canlı önizleme yok</h3>
        <p className="text-[12.5px] text-muted max-w-sm leading-relaxed">
          Bu snippet{' '}
          <span className="font-mono text-amber">{snippet.codeLanguage}</span> ile yazılmış ve
          tarayıcıda çalışabilmesi için derlenmesi gerekiyor. Kodu sağdaki panelden
          inceleyebilirsin.
        </p>
      </div>
    );
  }

  if (mediaType === 'video' && snippet.videoUrl) {
    return <VideoPlayer url={snippet.videoUrl} title={snippet.title} />;
  }

  if (mediaType === 'image' && snippet.imageUrl) {
    return (
      <figure className="rounded-md overflow-hidden border border-line bg-inset">
        {/* Katkıcı serbest bir URL girebildiği için next/image yerine düz img. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={snippet.imageUrl}
          alt={snippet.imageCaption || snippet.title}
          className="w-full max-h-[420px] object-contain bg-black/20"
          loading="lazy"
        />
        {snippet.imageCaption && (
          <figcaption className="px-4 py-2.5 font-mono text-[11.5px] text-dim border-t border-line-soft">
            {snippet.imageCaption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[420px] bg-raised border border-line-soft rounded-md text-center p-8">
      <div className="font-mono text-[28px] text-dim mb-3">∅</div>
      <h3 className="font-mono text-[14px] font-semibold mb-1.5">Görsel içerik yok</h3>
      <p className="text-[12.5px] text-muted max-w-xs">
        Bu snippet için video anlatım veya görsel eklenmemiş.
      </p>
    </div>
  );
}

/** Detay sayfasındaki medya bölümünün başlığı. */
export function mediaHeading(snippet: Snippet): string {
  const mediaType =
    snippet.mediaType ??
    (snippet.category === 'frontend' ? 'live' : snippet.videoUrl ? 'video' : 'none');

  if (mediaType === 'live') return 'Canlı önizleme';
  if (mediaType === 'video') return 'Video anlatım';
  if (mediaType === 'image') return 'Görsel';
  return 'Önizleme';
}
