'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/Field';
import { CopyButton } from '@/components/ui/CopyButton';
import { computeAllHashes, HASH_ALGORITHMS } from '@/lib/tools/hash';

export function HashGenerator() {
  const [input, setInput] = useState('');

  // Dört algoritma da aynı anda hesaplanır; girdi kısa olduğu için maliyeti ihmal edilebilir
  // ve kullanıcı algoritma seçmeden karşılaştırma yapabilir.
  const hashes = useMemo(() => (input === '' ? null : computeAllHashes(input)), [input]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="hash-input" className="block font-mono text-[11.5px] text-dim mb-1.5">
          Özeti alınacak metin
        </label>
        <Textarea
          id="hash-input"
          tone="green"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Merhaba dünya"
          spellCheck={false}
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-3">
        {HASH_ALGORITHMS.map((algorithm) => {
          const value = hashes?.[algorithm.id] ?? '';

          return (
            <div key={algorithm.id}>
              <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12.5px] font-semibold">{algorithm.label}</span>
                  <span className="font-mono text-[11px] text-dim">{algorithm.bits} bit</span>
                  {algorithm.broken && (
                    <span
                      title={algorithm.note}
                      className="inline-flex items-center gap-1 font-mono text-[10.5px] text-danger"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      kırık
                    </span>
                  )}
                </div>
                {value && <CopyButton value={value} />}
              </div>

              <div
                className={`bg-inset border border-line-soft rounded-sm px-4 py-3 font-mono text-[12px] break-all min-h-[42px] ${
                  algorithm.broken ? 'text-amber' : 'text-green'
                }`}
              >
                {value || <span className="text-dim">—</span>}
              </div>

              <p className="font-mono text-[10.5px] text-dim mt-1.5">{algorithm.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
