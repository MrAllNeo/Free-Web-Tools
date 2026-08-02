export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

export function buildCharset(options: PasswordOptions): string {
  return (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((key) => options[key])
    .map((key) => SETS[key])
    .join('');
}

/**
 * crypto.getRandomValues ile şifre üretir.
 *
 * Modulo sapmasını önlemek için havuz boyutunun tam katı olmayan değerler atılır —
 * aksi hâlde alfabenin ilk karakterleri istatistiksel olarak daha sık seçilirdi.
 */
export function generatePassword(options: PasswordOptions): string {
  const charset = buildCharset(options);
  if (charset.length === 0) return '';

  const max = Math.floor(0xffffffff / charset.length) * charset.length;
  let result = '';

  while (result.length < options.length) {
    const batch = new Uint32Array(options.length - result.length);
    crypto.getRandomValues(batch);
    for (const value of batch) {
      if (value >= max) continue;
      result += charset[value % charset.length];
      if (result.length === options.length) break;
    }
  }

  return result;
}

export interface PasswordStrength {
  label: string;
  percent: number;
  tone: 'danger' | 'amber' | 'green';
  bits: number;
}

/** Entropi (uzunluk × log2(havuz)) üzerinden güç değerlendirmesi. */
export function passwordStrength(length: number, charsetSize: number): PasswordStrength {
  const bits = charsetSize > 1 ? Math.round(length * Math.log2(charsetSize)) : 0;

  if (bits < 50) return { label: 'zayıf', percent: 33, tone: 'danger', bits };
  if (bits < 80) return { label: 'orta', percent: 66, tone: 'amber', bits };
  return { label: 'güçlü', percent: 100, tone: 'green', bits };
}
