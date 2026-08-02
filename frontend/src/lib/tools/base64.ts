/**
 * btoa/atob yalnızca Latin-1 aralığını kabul eder; Türkçe karakterler veya emoji
 * doğrudan verildiğinde InvalidCharacterError fırlatır. Bu yüzden metni önce
 * TextEncoder ile UTF-8 baytlarına çevirip byte-string üzerinden kodluyoruz.
 */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export type DecodeResult = { ok: true; value: string } | { ok: false; error: string };

export function decodeBase64(encoded: string): DecodeResult {
  // Satır sonları ve boşluklar e-posta/PEM çıktılarında sık görülür, temizlenir.
  const cleaned = encoded.replace(/\s+/g, '');
  if (cleaned === '') return { ok: false, error: 'Girdi boş' };

  try {
    const binary = atob(cleaned);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    // fatal: bozuk UTF-8 dizilerinde sessizce � üretmek yerine hata versin.
    return { ok: true, value: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, error: 'Geçerli bir Base64 metni değil' };
  }
}

/** Dosyayı data URI olarak okur (data:image/png;base64,...). */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
