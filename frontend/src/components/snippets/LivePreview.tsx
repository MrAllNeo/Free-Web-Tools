'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { buildPreviewDocument, needsCompilation, PREVIEW_SANDBOX } from '@/lib/preview';
import { buildReactPreviewDocument, previewErrorDocument } from '@/lib/reactPreview';

interface LivePreviewProps {
  code: string;
  title?: string;
  /** Saf CSS'i <style> içine sarmak gibi dile özgü hazırlık için gerekli. */
  language?: string;
  /** Katkıcının verdiği demo markup — kodu görünür kılan iskelet. */
  demoHtml?: string;
}

export function LivePreview({
  code,
  title = 'önizleme',
  language = 'html',
  demoHtml,
}: LivePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // JSX/TS derleme gerektirir ve derleyici dinamik olarak indirilir; bu yüzden
  // React yolu asenkron. Doğrudan çalışan kod ise render sırasında hazırlanır.
  const mustCompile = needsCompilation(code, language);
  const [compiled, setCompiled] = useState<{ source: string; doc: string } | null>(null);

  useEffect(() => {
    if (!mustCompile) return;

    let cancelled = false;
    buildReactPreviewDocument(code, demoHtml)
      .then((doc) => {
        if (!cancelled) setCompiled({ source: code, doc });
      })
      .catch((error: unknown) => {
        // Beklenmedik bir hata yakalanmazsa srcDoc sonsuza kadar null kalır ve
        // kullanıcı dönen bir spinner görür. Sebebini göstermek her zaman daha iyi.
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setCompiled({
          source: code,
          doc: previewErrorDocument(`Önizleme hazırlanamadı:\n\n${message}`),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [mustCompile, code, demoHtml]);

  const srcDoc = mustCompile
    ? // Kod değiştiyse eski derlemeyi gösterme; yenisi gelene kadar bekle.
      (compiled?.source === code ? compiled.doc : null)
    : buildPreviewDocument(code, language, demoHtml);

  const handleRefresh = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {
        // Tarayıcı tam ekranı reddederse önizleme yerinde çalışmaya devam eder.
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-md overflow-hidden border border-line bg-raised ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[420px] w-full relative'
      }`}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-inset border-b border-line-soft">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-danger shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full bg-green shrink-0" />
          <span className="ml-2 font-mono text-[11.5px] text-dim truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-xs text-dim hover:text-fg hover:bg-line-soft transition-colors cursor-pointer"
            title="Önizlemeyi yenile"
            aria-label="Önizlemeyi yenile"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xs text-dim hover:text-fg hover:bg-line-soft transition-colors cursor-pointer"
            title={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekran'}
            aria-label={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekran'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-white overflow-hidden">
        {(isLoading || !srcDoc) && (
          <div className="absolute inset-0 flex items-center justify-center bg-inset z-10">
            <Loader2 className="w-5 h-5 text-amber animate-spin" />
          </div>
        )}
        {srcDoc && (
          <iframe
            key={reloadKey}
            srcDoc={srcDoc}
            title="Canlı önizleme"
            className="w-full h-full border-none"
            sandbox={PREVIEW_SANDBOX}
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
