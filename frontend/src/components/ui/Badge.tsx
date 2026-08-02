import type { ReactNode } from 'react';

export type BadgeTone = 'amber' | 'blue' | 'green' | 'danger' | 'muted';

const tones: Record<BadgeTone, string> = {
  amber: 'text-amber border-amber-dim/50 bg-amber/8',
  blue: 'text-blue border-blue-dim/50 bg-blue/8',
  green: 'text-green border-green-dim/50 bg-green/8',
  danger: 'text-danger border-danger/40 bg-danger/8',
  muted: 'text-muted border-line bg-inset',
};

export function Badge({
  children,
  tone = 'muted',
  className = '',
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10.5px] tracking-[0.06em] uppercase px-2 py-1 rounded-xs border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
