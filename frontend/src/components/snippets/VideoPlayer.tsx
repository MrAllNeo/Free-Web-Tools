'use client';

import { getYouTubeId } from '@/lib/video';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const youtubeId = getYouTubeId(url);

  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-line bg-inset">
      {youtubeId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={title || 'Video anlatım'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      ) : (
        <video src={url} controls preload="metadata" className="absolute inset-0 w-full h-full object-contain">
          Tarayıcınız video etiketini desteklemiyor.
        </video>
      )}
    </div>
  );
}
