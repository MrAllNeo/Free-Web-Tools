import type { ReactNode } from 'react';

/**
 * Yükseltilmiş yüzey — kategori/snippet/araç kartlarının ortak zemini.
 * `interactive` hover'da kenarlığı renklendirip kartı 2px kaldırır (demo davranışı).
 */
export function Card({
  children,
  className = '',
  interactive = false,
  accent = 'amber',
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  accent?: 'amber' | 'blue' | 'green' | 'none';
}) {
  const hover = interactive
    ? {
        amber: 'hover:border-amber-dim hover:-translate-y-0.5',
        blue: 'hover:border-blue-dim hover:-translate-y-0.5',
        green: 'hover:border-green-dim hover:-translate-y-0.5',
        none: 'hover:border-line hover:-translate-y-0.5',
      }[accent]
    : '';

  return (
    <div
      className={`bg-raised border border-line-soft rounded-md transition-all duration-200 ${hover} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Başlık çubuğu olan panel — demo'daki "çalışan demo" ve terminal kutuları gibi.
 */
export function Panel({
  bar,
  children,
  className = '',
  bodyClassName = 'p-6',
}: {
  bar?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`bg-raised border border-line rounded-md overflow-hidden ${className}`}>
      {bar && (
        <div className="bg-inset px-4 py-3 border-b border-line-soft flex items-center justify-between gap-4 flex-wrap">
          {bar}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

/**
 * Sonuç kutusu — araç çıktıları ve salt-okunur değerler için.
 */
export function ResultBox({
  children,
  className = '',
  tone = 'green',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'green' | 'amber' | 'muted' | 'danger';
}) {
  const toneClass = {
    green: 'text-green',
    amber: 'text-amber',
    muted: 'text-muted',
    danger: 'text-danger',
  }[tone];

  return (
    <div
      className={`bg-inset border border-line-soft rounded-sm px-4 py-3.5 font-mono text-[13px] break-all min-h-[20px] ${toneClass} ${className}`}
    >
      {children}
    </div>
  );
}
