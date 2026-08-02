import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Bölüm başlığı: solda mono başlık + alt açıklama, sağda opsiyonel "tümünü gör" bağlantısı.
 */
export function SectionHead({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex justify-between items-end gap-6 flex-wrap mb-8">
      <div>
        <h2 className="font-mono text-[22px] font-semibold tracking-[-0.01em]">{title}</h2>
        {description && <p className="text-dim text-[13.5px] mt-1.5">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="font-mono text-[12.5px] text-muted hover:text-amber transition-colors"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

/**
 * Sayfa üstü başlık bloğu — alt sayfalarda (snippets, tools, profil) kullanılır.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-line-soft py-12">
      {eyebrow && <div className="eyebrow mb-5">{eyebrow}</div>}
      <h1 className="font-mono text-[32px] sm:text-[38px] font-bold leading-[1.14] tracking-[-0.02em]">
        {title}
      </h1>
      {description && (
        <p className="text-muted text-[15px] max-w-[560px] mt-4">{description}</p>
      )}
      {children && <div className="mt-7">{children}</div>}
    </div>
  );
}
