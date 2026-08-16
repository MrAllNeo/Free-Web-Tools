import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64, formatBytes } from './base64';

describe('base64 gidiş-dönüş', () => {
  it('ascii metni kodlar', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('Türkçe karakterleri kaybetmeden çevirir', () => {
    // btoa doğrudan Latin-1 dışını kabul etmez; UTF-8'e çevirmezsek burada patlardı.
    const text = 'ıspanaklı börek şöyle güzeldir ÇĞİÖŞÜ';
    const decoded = decodeBase64(encodeBase64(text));
    expect(decoded).toEqual({ ok: true, value: text });
  });

  it('emoji gidiş-dönüşü bozulmaz', () => {
    const text = '🚀 kod 🎉';
    expect(decodeBase64(encodeBase64(text))).toEqual({ ok: true, value: text });
  });

  it('satır sonlarını yok sayar', () => {
    expect(decodeBase64('aGVs\nbG8=')).toEqual({ ok: true, value: 'hello' });
  });

  it('boş girdiyi reddeder', () => {
    expect(decodeBase64('   ').ok).toBe(false);
  });

  it('bozuk UTF-8 dizisini sessizce kabul etmez', () => {
    // fatal: true olmasaydı burada � üretip "başarılı" derdi.
    expect(decodeBase64('///').ok).toBe(false);
  });
});

describe('formatBytes', () => {
  it('bayt, KB ve MB eşiklerini doğru biçimlendirir', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
  });
});
