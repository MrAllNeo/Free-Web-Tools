'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ResultBox } from '@/components/ui/Panel';
import { CopyButton } from '@/components/ui/CopyButton';

/**
 * crypto.randomUUID yalnızca güvenli bağlamlarda (https / localhost) tanımlıdır.
 * LAN üzerinden http ile açıldığında geri düşmek için RFC 4122 v4'ü elle kuruyoruz.
 */
function randomUuidV4(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // sürüm 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // varyant 10xx

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function UuidGenerator({ defaultCount = 1, showCount = false }: {
  defaultCount?: number;
  showCount?: boolean;
}) {
  const [count, setCount] = useState(defaultCount);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = (howMany: number) => Array.from({ length: howMany }, randomUuidV4);

  // İlk değerler mount sonrası üretilir; crypto sunucuda yok ve render sırasında
  // rastgele üretmek hidrasyon uyuşmazlığı yaratırdı.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- istemciye özgü ilk değer
    setUuids(generate(defaultCount));
    // defaultCount bir prop sabiti; yalnızca mount'ta okunması yeterli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCount = (next: number) => {
    setCount(next);
    setUuids(generate(next));
  };

  const regenerate = () => setUuids(generate(count));

  return (
    <div>
      {showCount && (
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="uuid-count" className="font-mono text-[11.5px] text-dim">
            Adet
          </label>
          <span className="font-mono text-[12.5px] text-amber">{count}</span>
        </div>
      )}
      {showCount && (
        <input
          id="uuid-count"
          type="range"
          min={1}
          max={100}
          value={count}
          onChange={(e) => applyCount(Number(e.target.value))}
          className="w-full mb-4"
        />
      )}

      <ResultBox className={uuids.length > 1 ? 'max-h-[280px] overflow-y-auto' : ''}>
        <div className="flex flex-col gap-1">
          {uuids.map((uuid, i) => (
            <span key={`${uuid}-${i}`}>{uuid}</span>
          ))}
        </div>
      </ResultBox>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={regenerate}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-xs border border-line text-muted hover:border-green hover:text-green transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          {count > 1 ? 'Yeniden üret' : 'Yeni UUID üret'}
        </button>
        <CopyButton value={uuids.join('\n')} />
      </div>
    </div>
  );
}
