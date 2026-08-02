import type { ReactNode } from 'react';

/**
 * Üç noktalı başlık çubuğu olan terminal kutusu.
 * Ana sayfa hero'sunda ve kod önizlemelerinde kullanılır.
 */
export function CodeTerminal({
  title,
  children,
  className = '',
  bodyClassName = 'px-5 py-5',
}: {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={`bg-inset border border-line rounded-md overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="bg-raised px-3.5 py-2.5 flex items-center gap-2 border-b border-line-soft">
        <span className="w-2.5 h-2.5 rounded-full bg-danger" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber" />
        <span className="w-2.5 h-2.5 rounded-full bg-green" />
        <span className="font-mono text-[12px] text-dim ml-2 truncate">{title}</span>
      </div>
      <div className={`font-mono text-[12.5px] leading-[1.75] ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/** Satır numaralı tek kod satırı. */
export function TerminalLine({ n, children }: { n: number; children?: ReactNode }) {
  return (
    <div className="flex gap-3.5">
      <span className="text-dim select-none w-4 text-right shrink-0">{n}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}
