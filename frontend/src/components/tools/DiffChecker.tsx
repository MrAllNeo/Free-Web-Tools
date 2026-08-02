'use client';

import { useMemo, useState } from 'react';
import { diffLines, diffWords } from 'diff';
import { Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

type Granularity = 'line' | 'word';

const SAMPLE_A = `function topla(a, b) {
  return a + b;
}`;

const SAMPLE_B = `function topla(a, b, c = 0) {
  return a + b + c;
}`;

export function DiffChecker() {
  const [left, setLeft] = useState(SAMPLE_A);
  const [right, setRight] = useState(SAMPLE_B);
  const [granularity, setGranularity] = useState<Granularity>('line');

  const parts = useMemo(
    () => (granularity === 'line' ? diffLines(left, right) : diffWords(left, right)),
    [left, right, granularity]
  );

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const part of parts) {
      // diffLines'ta `count` satır sayısıdır; diffWords'te parça sayısı.
      if (part.added) added += part.count ?? 0;
      if (part.removed) removed += part.count ?? 0;
    }
    return { added, removed };
  }, [parts]);

  const unit = granularity === 'line' ? 'satır' : 'parça';

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="diff-left" className="block font-mono text-[11.5px] text-dim mb-1.5">
            Orijinal
          </label>
          <Textarea
            id="diff-left"
            tone="green"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
            className="min-h-[200px]"
          />
        </div>
        <div>
          <label htmlFor="diff-right" className="block font-mono text-[11.5px] text-dim mb-1.5">
            Değiştirilmiş
          </label>
          <Textarea
            id="diff-right"
            tone="green"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
            className="min-h-[200px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={() => setGranularity('line')}
          className={granularity === 'line' ? '!border-green !text-green' : ''}
        >
          satır bazlı
        </Button>
        <Button
          size="sm"
          onClick={() => setGranularity('word')}
          className={granularity === 'word' ? '!border-green !text-green' : ''}
        >
          kelime bazlı
        </Button>

        <div className="ml-auto flex items-center gap-3 font-mono text-[11.5px]">
          <span className="text-green">+{stats.added} {unit}</span>
          <span className="text-danger">−{stats.removed} {unit}</span>
        </div>
      </div>

      <div>
        <span className="block font-mono text-[11.5px] text-dim mb-1.5">Fark</span>
        <div className="bg-inset border border-line-soft rounded-sm p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap break-words min-h-[120px] max-h-[440px] overflow-auto">
          {parts.map((part, i) => (
            <span
              key={i}
              className={
                part.added
                  ? 'bg-green/18 text-green'
                  : part.removed
                    ? 'bg-danger/18 text-danger line-through decoration-danger/50'
                    : 'text-muted'
              }
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
