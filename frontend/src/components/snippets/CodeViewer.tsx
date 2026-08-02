'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Check, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { fwtCodeTheme } from '@/lib/codeTheme';

const EXTENSIONS: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  css: 'css',
  html: 'html',
  bash: 'sh',
  sql: 'sql',
  go: 'go',
  rust: 'rs',
  java: 'java',
  php: 'php',
  ruby: 'rb',
};

interface CodeViewerProps {
  code: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
  canDownload?: boolean;
  /** Detay sayfasında kod ve önizleme aynı yükseklikte durur. */
  maxHeight?: string;
}

export function CodeViewer({
  code,
  language,
  title,
  showLineNumbers = true,
  canDownload = true,
  maxHeight = '420px',
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Kod panoya kopyalandı');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Panoya kopyalanamadı');
    }
  };

  const handleDownload = () => {
    const ext = EXTENSIONS[language] || 'txt';
    const filename = title
      ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.${ext}`
      : `snippet.${ext}`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dosya indirildi');
  };

  return (
    <div className="rounded-md overflow-hidden border border-line bg-inset">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-raised border-b border-line-soft">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-danger" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber" />
          <span className="w-2.5 h-2.5 rounded-full bg-green" />
          <span className="ml-2 font-mono text-[11.5px] text-dim uppercase tracking-[0.06em]">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {canDownload && (
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-xs text-dim hover:text-fg hover:bg-line-soft transition-colors cursor-pointer"
              title="Dosyayı indir"
              aria-label="Dosyayı indir"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xs text-dim hover:text-fg hover:bg-line-soft transition-colors cursor-pointer"
            title="Kodu kopyala"
            aria-label="Kodu kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div style={{ maxHeight }} className="overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={fwtCodeTheme}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
          }}
          lineNumberStyle={{
            color: '#635c4d',
            fontSize: '11px',
            paddingRight: '1rem',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
