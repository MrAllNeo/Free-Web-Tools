import type { ReactNode } from 'react';

/**
 * Demo'daki `.wrap` kabı: 1180px maksimum genişlik, 32px yan boşluk.
 * Tüm bölümler bunun içine sarılır ki dikey hizalama sayfalar arası tutarlı kalsın.
 */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
