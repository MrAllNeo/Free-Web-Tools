'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Snippet bağlantısını kopyalar.
 *
 * `navigator.share` mobilde işletim sisteminin paylaşım penceresini açar; yoksa
 * panoya kopyalıyoruz. Kullanıcılar bugüne kadar adres çubuğundan kopyalıyordu.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Kullanıcı vazgeçtiyse ya da paylaşım reddedildiyse kopyalamaya düşüyoruz.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Bağlantı kopyalandı');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Bağlantı kopyalanamadı');
    }
  };

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-dim hover:text-amber transition-colors px-2.5 py-1.5 rounded-xs border border-line hover:border-amber-dim cursor-pointer"
      title="Bağlantıyı paylaş"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green" /> : <Share2 className="w-3.5 h-3.5" />}
      paylaş
    </button>
  );
}
