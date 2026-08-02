import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

/** Araç sayfaları yeşil, geri kalan her yer amber odak rengi kullanır. */
export type FieldTone = 'amber' | 'green';

const toneRing: Record<FieldTone, string> = {
  amber: 'focus:border-amber',
  green: 'focus:border-green',
};

const control =
  'w-full bg-inset border border-line text-fg rounded-sm px-3 py-2.5 font-mono text-[13px] placeholder:text-dim focus:outline-none transition-colors disabled:opacity-50';

export function Label({
  children,
  htmlFor,
  className = '',
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block font-mono text-[11.5px] text-dim mb-1.5 ${className}`}
    >
      {children}
    </label>
  );
}

/** Etiket + alan + hata mesajını tek blokta toplar. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = '',
}: {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p className="mt-1.5 font-mono text-[11.5px] text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1.5 font-mono text-[11.5px] text-dim">{hint}</p>
      )}
    </div>
  );
}

export function Input({
  tone = 'amber',
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { tone?: FieldTone }) {
  return <input className={`${control} ${toneRing[tone]} ${className}`} {...props} />;
}

export function Textarea({
  tone = 'amber',
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { tone?: FieldTone }) {
  return (
    <textarea
      className={`${control} ${toneRing[tone]} min-h-[110px] resize-y leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function Select({
  tone = 'amber',
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { tone?: FieldTone }) {
  return (
    <select className={`${control} ${toneRing[tone]} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  );
}

/** Onay kutusu + metin; demo'daki satır içi seçenekler gibi. */
export function Checkbox({
  label,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label
      className={`inline-flex items-center gap-2 font-mono text-[12.5px] text-muted cursor-pointer select-none ${className}`}
    >
      <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" {...props} />
      {label}
    </label>
  );
}
