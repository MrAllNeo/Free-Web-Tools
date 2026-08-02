'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/ui/Panel';
import { CopyButton } from '@/components/ui/CopyButton';
import { decodeBase64, encodeBase64 } from '@/lib/tools/base64';

type Mode = 'encode' | 'decode';

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');

  const compute = (): { text: string; error: string | null } => {
    if (input.trim() === '') return { text: '', error: null };

    if (mode === 'encode') return { text: encodeBase64(input), error: null };

    const result = decodeBase64(input);
    return result.ok ? { text: result.value, error: null } : { text: '', error: result.error };
  };

  const { text, error } = compute();

  // Çıktıyı girdiye taşıyıp yönü çevirir — gidiş dönüş kontrolünü kolaylaştırır.
  const swap = () => {
    if (text) setInput(text);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={() => setMode('encode')}
          className={mode === 'encode' ? '!border-green !text-green' : ''}
        >
          metin → Base64
        </Button>
        <Button
          size="sm"
          onClick={() => setMode('decode')}
          className={mode === 'decode' ? '!border-green !text-green' : ''}
        >
          Base64 → metin
        </Button>
        <Button size="sm" onClick={swap} disabled={!text} className="ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5" />
          yönü çevir
        </Button>
      </div>

      <div>
        <label htmlFor="b64-input" className="block font-mono text-[11.5px] text-dim mb-1.5">
          {mode === 'encode' ? 'Kodlanacak metin' : 'Çözülecek Base64'}
        </label>
        <Textarea
          id="b64-input"
          tone="green"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Merhaba dünya' : 'TWVyaGFiYSBkw7xueWE='}
          spellCheck={false}
          className="min-h-[140px]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[11.5px] text-dim">Sonuç</span>
          {text && <CopyButton value={text} />}
        </div>
        <ResultBox tone={error ? 'danger' : 'green'} className="whitespace-pre-wrap min-h-[80px]">
          {error || text || ' '}
        </ResultBox>
      </div>

      <p className="font-mono text-[11px] text-dim">
        UTF-8 uyumlu: Türkçe karakterler ve emoji doğru kodlanır.
      </p>
    </div>
  );
}
