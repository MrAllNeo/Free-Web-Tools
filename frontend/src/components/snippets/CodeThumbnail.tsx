/**
 * Canlı çalıştırılamayan snippet'ler için kart kapağı: kodun ilk satırlarını
 * terminal görünümünde gösterir. Boş beyaz bir çerçeveden çok daha bilgilendirici.
 */
export function CodeThumbnail({ code, language }: { code: string; language: string }) {
  const lines = code.split('\n').slice(0, 10);

  return (
    <div className="relative aspect-video bg-inset border-b border-line-soft overflow-hidden px-4 py-3">
      <pre className="font-mono text-[8.5px] leading-[1.6] text-muted whitespace-pre overflow-hidden">
        {lines.join('\n')}
      </pre>

      {/* Alt kenara doğru sönümlenerek kesiliyor hissi verir. */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-inset to-transparent" />

      <span className="absolute top-2.5 left-2.5 font-mono text-[10px] bg-black/70 text-amber px-1.5 py-0.5 rounded-xs uppercase">
        {language}
      </span>
    </div>
  );
}
