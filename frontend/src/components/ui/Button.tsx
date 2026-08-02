import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'solid' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-mono rounded-xs border transition-all duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap';

const variants: Record<ButtonVariant, string> = {
  solid:
    'bg-amber text-bg border-amber font-semibold hover:bg-amber-bright hover:shadow-[0_0_20px_rgba(232,179,74,0.35)]',
  ghost:
    'bg-transparent text-fg border-line font-medium hover:border-muted hover:text-fg',
  danger:
    'bg-transparent text-danger border-danger/40 font-medium hover:border-danger hover:bg-danger/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-[11.5px] px-3 py-1.5',
  md: 'text-[13px] px-4 py-2',
  lg: 'text-[14px] px-6 py-3.5',
};

export function buttonClass(
  variant: ButtonVariant = 'ghost',
  size: ButtonSize = 'md',
  className = ''
) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
