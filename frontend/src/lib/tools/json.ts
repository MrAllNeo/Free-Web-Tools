export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

export type JsonResult =
  | { ok: true; value: unknown }
  | { ok: false; error: JsonError };

/**
 * V8'in SyntaxError mesajı hatanın karakter konumunu içerir
 * ("... at position 42" ya da yeni sürümlerde "(line 3 column 5)").
 * Kullanıcıya satır/sütun göstermek için bu bilgiyi çıkarıyoruz.
 */
function locate(input: string, message: string): { line?: number; column?: number } {
  const lineColumn = message.match(/line (\d+) column (\d+)/i);
  if (lineColumn) {
    return { line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  }

  const position = message.match(/position (\d+)/i);
  if (position) {
    const index = Math.min(Number(position[1]), input.length);
    const before = input.slice(0, index);
    const lines = before.split('\n');
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }

  return {};
}

export function parseJson(input: string): JsonResult {
  if (input.trim() === '') {
    return { ok: false, error: { message: 'Girdi boş' } };
  }

  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Geçersiz JSON';
    return { ok: false, error: { message, ...locate(input, message) } };
  }
}

export function formatJson(value: unknown, indent: number): string {
  return JSON.stringify(value, null, indent);
}

export function minifyJson(value: unknown): string {
  return JSON.stringify(value);
}

/** Ağaç görünümünde özet göstermek için basit sayım. */
export function describeJson(value: unknown): string {
  if (Array.isArray(value)) return `dizi · ${value.length} öğe`;
  if (value === null) return 'null';
  if (typeof value === 'object') return `nesne · ${Object.keys(value).length} anahtar`;
  return typeof value;
}
