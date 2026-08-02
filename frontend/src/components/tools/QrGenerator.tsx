'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

/**
 * Hata düzeltme seviyesi: yükseldikçe QR daha fazla hasara dayanır ama
 * aynı alana daha az veri sığar.
 */
const LEVELS = [
  { id: 'L', label: 'L · %7' },
  { id: 'M', label: 'M · %15' },
  { id: 'Q', label: 'Q · %25' },
  { id: 'H', label: 'H · %30' },
] as const;

type Level = (typeof LEVELS)[number]['id'];

export function QrGenerator() {
  const [text, setText] = useState('https://github.com/MrAllNeo/Free-Web-Tools');
  const [level, setLevel] = useState<Level>('M');
  /** Üretim asenkron olduğu için sonuç tek parça hâlinde tutulur. */
  const [result, setResult] = useState<{ png: string; svg: string; error: string | null } | null>(
    null
  );

  useEffect(() => {
    // Boş girdide state'i temizlemiyoruz; render tarafında zaten gizleniyor.
    // Böylece efekt içinde senkron setState çağrısı hiç olmuyor.
    if (text === '') return;

    // Girdi hızla değişirken eski üretimin sonucu yenisinin üzerine yazmasın.
    let cancelled = false;

    const options = {
      errorCorrectionLevel: level,
      margin: 2,
      color: { dark: '#13110eff', light: '#ffffffff' },
    } as const;

    Promise.all([
      QRCode.toDataURL(text, { ...options, width: 512 }),
      QRCode.toString(text, { ...options, type: 'svg' }),
    ])
      .then(([dataUrl, svgMarkup]) => {
        if (!cancelled) setResult({ png: dataUrl, svg: svgMarkup, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            png: '',
            svg: '',
            error: err instanceof Error ? err.message : 'QR kod üretilemedi',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [text, level]);

  const visible = text === '' ? null : result;
  const png = visible?.png ?? '';
  const svg = visible?.svg ?? '';
  const error = visible?.error ?? null;

  const download = (content: string, filename: string, isSvg: boolean) => {
    const href = isSvg
      ? URL.createObjectURL(new Blob([content], { type: 'image/svg+xml' }))
      : content;

    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();

    if (isSvg) URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="qr-text" className="block font-mono text-[11.5px] text-dim mb-1.5">
          Metin veya bağlantı
        </label>
        <Input
          id="qr-text"
          tone="green"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://ornek.com"
          spellCheck={false}
        />
      </div>

      <div>
        <span className="block font-mono text-[11.5px] text-dim mb-2">
          Hata düzeltme seviyesi
        </span>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setLevel(option.id)}
              className={`font-mono text-[11.5px] px-3 py-1.5 rounded-xs border transition-colors cursor-pointer ${
                level === option.id
                  ? 'border-green text-green bg-green/8'
                  : 'border-line text-dim hover:text-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10.5px] text-dim mt-2">
          Yüksek seviye hasarlı/kirli yüzeylerde okunurluğu artırır, karşılığında kod sıklaşır.
        </p>
      </div>

      {error && <p className="font-mono text-[12px] text-danger">{error}</p>}

      {png && (
        <div className="flex flex-col items-center gap-4 pt-2">
          {/* qrcode kütüphanesi data URI üretir; next/image bunu işleyemez. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={png}
            alt={`QR kod: ${text}`}
            className="w-[240px] h-[240px] rounded-sm border border-line"
          />

          <div className="flex gap-2 flex-wrap justify-center">
            <Button size="sm" onClick={() => download(png, 'qr-kod.png', false)}>
              <Download className="w-3.5 h-3.5" />
              PNG indir
            </Button>
            <Button size="sm" onClick={() => download(svg, 'qr-kod.svg', true)} disabled={!svg}>
              <Download className="w-3.5 h-3.5" />
              SVG indir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
