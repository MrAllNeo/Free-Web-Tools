import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Giriş ve kayıt sayfalarının ortak kabuğu: ortalanmış dar kart + logo.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_var(--amber)]" />
            <span className="font-mono font-bold text-[15px] tracking-[-0.02em]">
              free<span className="text-dim font-normal">/</span>web
              <span className="text-dim font-normal">/</span>tools
            </span>
          </Link>
          <h1 className="font-mono text-[22px] font-semibold tracking-[-0.01em]">{title}</h1>
          <p className="text-[13.5px] text-muted mt-1.5">{subtitle}</p>
        </div>

        <div className="bg-raised border border-line rounded-md p-7">{children}</div>

        <div className="text-center text-[13px] text-muted mt-6">{footer}</div>
      </div>
    </div>
  );
}
