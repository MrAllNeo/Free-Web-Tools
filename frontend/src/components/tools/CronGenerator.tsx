'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Field';
import { CopyButton } from '@/components/ui/CopyButton';
import { analyzeCron, CRON_FIELDS, CRON_PRESETS } from '@/lib/tools/cron';

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'full',
  timeStyle: 'short',
});

export function CronGenerator() {
  const [expression, setExpression] = useState('*/15 9-17 * * 1-5');

  const analysis = useMemo(() => analyzeCron(expression), [expression]);
  const fields = expression.trim().split(/\s+/);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="cron-input" className="font-mono text-[11.5px] text-dim">
            Cron ifadesi
          </label>
          <CopyButton value={expression} />
        </div>
        <Input
          id="cron-input"
          tone="green"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          spellCheck={false}
          placeholder="*/15 9-17 * * 1-5"
          className="!text-[15px] !py-3"
          aria-invalid={!analysis.ok}
        />
      </div>

      {/* Alan açıklaması */}
      <div className="grid grid-cols-5 gap-2">
        {CRON_FIELDS.map((field, i) => (
          <div key={field.name} className="bg-inset border border-line-soft rounded-xs p-2.5">
            <div className="font-mono text-[14px] text-green mb-1 truncate">
              {fields[i] ?? '—'}
            </div>
            <div className="font-mono text-[10px] text-dim leading-tight">{field.name}</div>
            <div className="font-mono text-[9.5px] text-dim/70 mt-0.5">{field.range}</div>
          </div>
        ))}
      </div>

      {/* Açıklama / hata */}
      <div
        className={`flex items-start gap-2.5 p-4 rounded-sm border ${
          analysis.ok
            ? 'bg-green/8 border-green-dim/40 text-green'
            : 'bg-danger/8 border-danger/40 text-danger'
        }`}
      >
        {analysis.ok ? (
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium">
            {analysis.ok ? analysis.description : analysis.error}
          </p>
          {!analysis.ok && analysis.description && (
            <p className="font-mono text-[11.5px] text-muted mt-1">{analysis.description}</p>
          )}
        </div>
      </div>

      {/* Sonraki çalışmalar */}
      {analysis.nextRuns.length > 0 && (
        <div>
          <span className="block font-mono text-[11.5px] text-dim mb-1.5">
            Sonraki 5 çalışma (yerel saat)
          </span>
          <div className="bg-inset border border-line-soft rounded-sm divide-y divide-line-soft">
            {analysis.nextRuns.map((date, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <span className="font-mono text-[11px] text-dim w-4 shrink-0">{i + 1}</span>
                <span className="font-mono text-[12.5px] text-muted">
                  {dateFormatter.format(date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hazır şablonlar */}
      <div>
        <span className="block font-mono text-[11.5px] text-dim mb-2">Hazır şablonlar</span>
        <div className="flex flex-wrap gap-2">
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.expression}
              type="button"
              onClick={() => setExpression(preset.expression)}
              className={`text-left px-3 py-2 rounded-xs border transition-colors cursor-pointer ${
                expression === preset.expression
                  ? 'border-green bg-green/8'
                  : 'border-line hover:border-green-dim'
              }`}
            >
              <span className="block text-[12px] text-muted">{preset.label}</span>
              <span className="block font-mono text-[11px] text-green mt-0.5">
                {preset.expression}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
