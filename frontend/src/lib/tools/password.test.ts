import { describe, expect, it } from 'vitest';
import { buildCharset, generatePassword, passwordStrength } from './password';

const opts = (over: Partial<Parameters<typeof buildCharset>[0]> = {}) => ({
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  ...over,
});

describe('buildCharset', () => {
  it('yalnızca seçilen kümeleri birleştirir', () => {
    const charset = buildCharset(opts({ uppercase: false, numbers: false, symbols: false }));
    expect(charset).toBe('abcdefghijklmnopqrstuvwxyz');
  });

  it('hiçbir küme seçilmezse boş döner', () => {
    const charset = buildCharset(
      opts({ lowercase: false, uppercase: false, numbers: false, symbols: false })
    );
    expect(charset).toBe('');
  });
});

describe('generatePassword', () => {
  it('istenen uzunlukta üretir', () => {
    expect(generatePassword(opts({ length: 32 })).length).toBe(32);
  });

  it('havuş boşsa boş dize döner (sonsuz döngüye girmez)', () => {
    const empty = opts({ lowercase: false, uppercase: false, numbers: false, symbols: false });
    expect(generatePassword(empty)).toBe('');
  });

  it('yalnızca seçilen havuzdaki karakterleri kullanır', () => {
    const only = opts({ length: 200, uppercase: false, symbols: false });
    expect(generatePassword(only)).toMatch(/^[a-z0-9]+$/);
  });

  it('ardışık çağrılar farklı sonuç verir', () => {
    expect(generatePassword(opts())).not.toBe(generatePassword(opts()));
  });

  it('küçük bir havuzda tüm karakterler makul dengede dağılır', () => {
    // Modulo sapması testi: reddetme örneklemesi kaldırılırsa alfabenin ilk
    // karakterleri belirgin şekilde daha sık çıkar.
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const sample = generatePassword(opts({ length: 20000, uppercase: false, symbols: false }));
    const counts = new Map<string, number>();
    for (const char of sample) counts.set(char, (counts.get(char) ?? 0) + 1);

    expect(counts.size).toBe(charset.length);
    const expected = sample.length / charset.length;
    for (const count of counts.values()) {
      // Geniş bir bant: amaç istatistiksel kesinlik değil, sistematik sapmayı yakalamak.
      expect(count).toBeGreaterThan(expected * 0.7);
      expect(count).toBeLessThan(expected * 1.3);
    }
  });
});

describe('passwordStrength', () => {
  it('küçük havuz ve kısa uzunluk zayıf sayılır', () => {
    expect(passwordStrength(6, 26).tone).toBe('danger');
  });

  it('uzun ve geniş havuzlu parola güçlü sayılır', () => {
    expect(passwordStrength(24, 94).tone).toBe('green');
  });

  it('tek karakterlik havuzda entropi sıfırdır', () => {
    expect(passwordStrength(10, 1).bits).toBe(0);
  });
});
