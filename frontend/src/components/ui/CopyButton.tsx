'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Panoya kopyalama butonu. Kopyalandığında 2 saniye onay durumunda kalır.
 * Pano API'si olmayan/izin verilmeyen ortamlarda hata bildirimi gösterir.
 */
export function CopyButton({
  value,
  label = 'Kopyala',
  copiedLabel = 'Kopyalandı',
  className = '',
  disabled = false,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Panoya kopyalanamadı');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !value}
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-xs border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        copied
          ? 'border-green text-green'
          : 'border-line text-muted hover:border-green hover:text-green'
      } ${className}`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
