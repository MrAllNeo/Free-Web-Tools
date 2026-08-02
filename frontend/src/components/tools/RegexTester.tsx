'use client';

import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Field';
import { REGEX_FLAGS, runRegex, segmentText } from '@/lib/tools/regex';

const SAMPLE_PATTERN = '(\\w+)@(\\w+\\.\\w+)';
const SAMPLE_TEXT = `İletişim: kerem@ornek.com ve destek@fwt.dev
Geçersiz: bu bir e-posta değil
Ekip: admin@toywes.io`;

export function RegexTester() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState('gm');
  const [text, setText] = useState(SAMPLE_TEXT);

  const result = useMemo(() => runRegex(pattern, flags, text), [pattern, flags, text]);
  // Kendi useMemo'suna alınmazsa her render'da yeni dizi referansı üretip
  // aşağıdaki segmentText hesabını gereksiz yere tetikler.
  const matches = useMemo(() => (result.ok ? result.matches : []), [result]);
  const segments = useMemo(() => segmentText(text, matches), [text, matches]);

  const toggleFlag = (flag: string) =>
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="regex-pattern" className="block font-mono text-[11.5px] text-dim mb-1.5">
          Desen
        </label>
        <div className="flex items-stretch gap-0">
          <span className="flex items-center px-2.5 bg-inset border border-r-0 border-line rounded-l-sm font-mono text-[13px] text-dim">
            /
          </span>
          <Input
            id="regex-pattern"
            tone="green"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            placeholder="\\d{4}-\\d{2}-\\d{2}"
            className="!rounded-none"
            aria-invalid={!result.ok}
          />
          <span className="flex items-center px-2.5 bg-inset border border-l-0 border-line rounded-r-sm font-mono text-[13px] text-dim min-w-[52px]">
            /{flags}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {REGEX_FLAGS.map(({ flag, label, hint }) => (
          <button
            key={flag}
            type="button"
            onClick={() => toggleFlag(flag)}
            title={hint}
            className={`font-mono text-[11.5px] px-2.5 py-1.5 rounded-xs border transition-colors cursor-pointer ${
              flags.includes(flag)
                ? 'border-green text-green bg-green/8'
                : 'border-line text-dim hover:text-muted'
            }`}
          >
            {flag} · {label}
          </button>
        ))}
      </div>

      {!result.ok && (
        <div className="flex items-start gap-2 font-mono text-[12px] text-danger">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <div>
        <label htmlFor="regex-text" className="block font-mono text-[11.5px] text-dim mb-1.5">
          Test metni
        </label>
        <Textarea
          id="regex-text"
          tone="green"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="min-h-[130px]"
        />
      </div>

      {/* Vurgulanmış çıktı */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[11.5px] text-dim">Eşleşmeler</span>
          <span className="font-mono text-[11.5px] text-green">
            {matches.length}
            {result.ok && result.truncated ? '+ (ilk 500)' : ''}
          </span>
        </div>
        <div className="bg-inset border border-line-soft rounded-sm p-4 font-mono text-[13px] whitespace-pre-wrap break-words min-h-[80px] leading-relaxed">
          {segments.map((segment, i) =>
            segment.matchIndex === null ? (
              <span key={i} className="text-muted">
                {segment.text}
              </span>
            ) : (
              <mark key={i} className="bg-green/25 text-green rounded-xs px-0.5">
                {segment.text}
              </mark>
            )
          )}
        </div>
      </div>

      {/* Yakalama grupları */}
      {matches.length > 0 && matches.some((m) => m.groups.length > 0) && (
        <div>
          <span className="block font-mono text-[11.5px] text-dim mb-1.5">Yakalama grupları</span>
          <div className="bg-inset border border-line-soft rounded-sm divide-y divide-line-soft max-h-[220px] overflow-y-auto">
            {matches.slice(0, 20).map((match, i) => (
              <div key={i} className="px-4 py-2.5 font-mono text-[12px]">
                <span className="text-dim mr-2">#{i + 1}</span>
                <span className="text-green">{match.value}</span>
                {match.groups.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px]">
                    {match.groups.map((group, g) => (
                      <span key={g} className="text-muted">
                        <span className="text-dim">${g + 1}</span> {group ?? '—'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
