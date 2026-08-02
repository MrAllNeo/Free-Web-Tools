'use client';

import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { fwtCodeTheme } from '@/lib/codeTheme';
import { describeJson, formatJson, minifyJson, parseJson } from '@/lib/tools/json';

const SAMPLE = `{"ad":"Kerem","roller":["admin","contributor"],"aktif":true,"puan":1240}`;

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => parseJson(input), [input]);

  const output = result.ok
    ? indent === 0
      ? minifyJson(result.value)
      : formatJson(result.value, indent)
    : '';

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5 gap-3 flex-wrap">
          <label htmlFor="json-input" className="font-mono text-[11.5px] text-dim">
            JSON girdisi
          </label>
          <button
            type="button"
            onClick={() => setInput(SAMPLE)}
            className="font-mono text-[11px] text-dim hover:text-green transition-colors cursor-pointer"
          >
            örnek doldur
          </button>
        </div>
        <Textarea
          id="json-input"
          tone="green"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"anahtar": "değer"}'
          spellCheck={false}
          className="min-h-[180px] font-mono"
        />
      </div>

      {/* Durum satırı */}
      {input.trim() !== '' && (
        <div
          className={`flex items-start gap-2 font-mono text-[12px] ${
            result.ok ? 'text-green' : 'text-danger'
          }`}
        >
          {result.ok ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>geçerli JSON · {describeJson(result.value)}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {result.error.line
                  ? `satır ${result.error.line}, sütun ${result.error.column} — `
                  : ''}
                {result.error.message}
              </span>
            </>
          )}
        </div>
      )}

      {result.ok && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11.5px] text-dim mr-1">girinti:</span>
            {[2, 4, 0].map((value) => (
              <Button
                key={value}
                size="sm"
                onClick={() => setIndent(value)}
                className={indent === value ? '!border-green !text-green' : ''}
              >
                {value === 0 ? 'sıkıştır' : `${value} boşluk`}
              </Button>
            ))}
            <CopyButton value={output} className="ml-auto" />
          </div>

          <div className="bg-inset border border-line-soft rounded-sm overflow-auto max-h-[420px]">
            <SyntaxHighlighter
              language="json"
              style={fwtCodeTheme}
              customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
              wrapLongLines={indent === 0}
            >
              {output}
            </SyntaxHighlighter>
          </div>
        </>
      )}
    </div>
  );
}
