'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/Field';
import { ResultBox } from '@/components/ui/Panel';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  buildCharset,
  generatePassword,
  passwordStrength,
  type PasswordOptions,
} from '@/lib/tools/password';

const TONE_BG = {
  danger: 'bg-danger',
  amber: 'bg-amber',
  green: 'bg-green',
} as const;

const TONE_TEXT = {
  danger: 'text-danger',
  amber: 'text-amber',
  green: 'text-green',
} as const;

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
};

export function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [password, setPassword] = useState('');

  const charsetSize = buildCharset(options).length;
  const strength = useMemo(
    () => passwordStrength(options.length, charsetSize),
    [options.length, charsetSize]
  );

  // İlk şifre yalnızca mount sonrası üretilebilir: crypto sunucuda yok ve
  // render sırasında rastgele değer üretmek hidrasyon uyuşmazlığı yaratırdı.
  // Sonraki üretimler tamamen olay işleyicilerinden tetiklenir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- istemciye özgü ilk değer
    setPassword(generatePassword(DEFAULT_OPTIONS));
  }, []);

  const applyOptions = (next: PasswordOptions) => {
    setOptions(next);
    setPassword(generatePassword(next));
  };

  const regenerate = () => setPassword(generatePassword(options));

  const toggle = (key: 'lowercase' | 'uppercase' | 'numbers' | 'symbols') => () =>
    applyOptions({ ...options, [key]: !options[key] });

  const noCharsetSelected = charsetSize === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="pw-length" className="font-mono text-[11.5px] text-dim">
          Şifre uzunluğu
        </label>
        <span className="font-mono text-[12.5px] text-amber">{options.length}</span>
      </div>
      <input
        id="pw-length"
        type="range"
        min={6}
        max={64}
        value={options.length}
        onChange={(e) => applyOptions({ ...options, length: Number(e.target.value) })}
        className="w-full mb-4"
      />

      <div className="flex flex-wrap gap-x-5 gap-y-2.5 mb-4">
        <Checkbox label="Küçük harf" checked={options.lowercase} onChange={toggle('lowercase')} />
        <Checkbox label="Büyük harf" checked={options.uppercase} onChange={toggle('uppercase')} />
        <Checkbox label="Rakam" checked={options.numbers} onChange={toggle('numbers')} />
        <Checkbox label="Sembol" checked={options.symbols} onChange={toggle('symbols')} />
      </div>

      <ResultBox tone={noCharsetSelected ? 'danger' : 'green'}>
        {noCharsetSelected ? 'En az bir karakter seti seçin' : password || ' '}
      </ResultBox>

      <div className="h-[5px] rounded-sm mt-2.5 bg-line-soft overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${TONE_BG[strength.tone]}`}
          style={{ width: noCharsetSelected ? '0%' : `${strength.percent}%` }}
        />
      </div>
      <p className="font-mono text-[11px] text-dim mt-2">
        {noCharsetSelected ? (
          'entropi hesaplanamıyor'
        ) : (
          <>
            <span className={TONE_TEXT[strength.tone]}>{strength.label}</span> · ~{strength.bits} bit
            entropi
          </>
        )}
      </p>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={regenerate}
          disabled={noCharsetSelected}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-xs border border-line text-muted hover:border-green hover:text-green transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-3 h-3" />
          Yeniden üret
        </button>
        <CopyButton value={password} disabled={noCharsetSelected} />
      </div>
    </div>
  );
}
