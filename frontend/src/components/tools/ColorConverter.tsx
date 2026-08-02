'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Field';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  formatHsl,
  formatRgb,
  hslToRgb,
  parseHex,
  parseHsl,
  parseRgb,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
  type Rgb,
} from '@/lib/tools/color';

type FieldName = 'hex' | 'rgb' | 'hsl';

export function ColorConverter() {
  const [rgb, setRgb] = useState<Rgb>({ r: 232, g: 179, b: 74 });
  /** Yazarken kullanıcının girdisini bozmamak için düzenlenen alanın ham metni tutulur. */
  const [draft, setDraft] = useState<{ field: FieldName; value: string } | null>(null);
  const [invalid, setInvalid] = useState<FieldName | null>(null);

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  const display = (field: FieldName, computed: string) =>
    draft?.field === field ? draft.value : computed;

  const handleChange = (field: FieldName) => (value: string) => {
    setDraft({ field, value });

    const parsed =
      field === 'hex'
        ? parseHex(value)
        : field === 'rgb'
          ? parseRgb(value)
          : (() => {
              const h = parseHsl(value);
              return h ? hslToRgb(h) : null;
            })();

    if (parsed) {
      setRgb(parsed);
      setInvalid(null);
    } else {
      setInvalid(field);
    }
  };

  const commit = () => {
    setDraft(null);
    setInvalid(null);
  };

  // Önizleme üzerindeki metin, arka planın parlaklığına göre koyu ya da açık seçilir.
  const isLight = relativeLuminance(rgb) > 0.4;

  const fields: { name: FieldName; label: string; value: string }[] = [
    { name: 'hex', label: 'HEX', value: hex },
    { name: 'rgb', label: 'RGB', value: formatRgb(rgb) },
    { name: 'hsl', label: 'HSL', value: formatHsl(hsl) },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field.name}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`color-${field.name}`} className="font-mono text-[11.5px] text-dim">
                {field.label}
              </label>
              <CopyButton value={field.value} label="" copiedLabel="" className="!px-1.5 !py-1" />
            </div>
            <Input
              id={`color-${field.name}`}
              tone="green"
              value={display(field.name, field.value)}
              onChange={(e) => handleChange(field.name)(e.target.value)}
              onBlur={commit}
              spellCheck={false}
              className={invalid === field.name ? '!border-danger' : ''}
              aria-invalid={invalid === field.name}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <label htmlFor="color-picker" className="font-mono text-[11.5px] text-dim shrink-0">
          Seçici
        </label>
        <input
          id="color-picker"
          type="color"
          value={hex}
          onChange={(e) => {
            const parsed = parseHex(e.target.value);
            if (parsed) {
              setRgb(parsed);
              commit();
            }
          }}
          className="w-12 h-9 bg-inset border border-line rounded-sm cursor-pointer p-1"
        />
      </div>

      <div
        className="w-full h-[72px] rounded-sm border border-line mt-4 flex items-center justify-center font-mono text-[13px] transition-colors"
        style={{ background: hex, color: isLight ? '#13110e' : '#ede9e1' }}
      >
        {hex}
      </div>
    </div>
  );
}
