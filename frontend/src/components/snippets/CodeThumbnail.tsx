'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { fwtCodeTheme } from '@/lib/codeTheme';

/**
 * Canlı çalıştırılamayan snippet'ler için kart kapağı: kodun ilk satırlarını
 * gerçek syntax highlighting ile terminal görünümünde gösterir.
 */
export function CodeThumbnail({ code, language }: { code: string; language: string }) {
  const lines = code.split('\n').slice(0, 12).join('\n');

  return (
    <div className="relative aspect-video bg-inset border-b border-line-soft overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-dim/60 to-transparent" />
      <SyntaxHighlighter
        language={language}
        style={fwtCodeTheme}
        showLineNumbers
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          minHeight: '100%',
          padding: '2.35rem 1rem 1rem',
          background: 'transparent',
          fontSize: '9px',
          lineHeight: '1.65',
        }}
        lineNumberStyle={{
          color: '#635c4d',
          fontSize: '8px',
          minWidth: '1.5rem',
          paddingRight: '0.65rem',
          userSelect: 'none',
        }}
      >
        {lines}
      </SyntaxHighlighter>

      {/* Alt kenara doğru sönümlenerek kesiliyor hissi verir. */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-inset to-transparent pointer-events-none" />

      <span className="absolute top-2.5 left-2.5 font-mono text-[10px] bg-black/75 border border-line-soft text-amber px-1.5 py-0.5 rounded-xs uppercase">
        {language}
      </span>
      <span className="absolute top-2.5 right-2.5 font-mono text-[9px] tracking-[0.08em] text-dim">KOD</span>
    </div>
  );
}
