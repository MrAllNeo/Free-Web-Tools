import { describe, expect, it } from 'vitest';
import { describeJson, formatJson, minifyJson, parseJson } from './json';

describe('parseJson', () => {
  it('geçerli JSON u çözer', () => {
    expect(parseJson('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
  });

  it('boş girdiyi ayrı bir hata olarak bildirir', () => {
    const result = parseJson('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('Girdi boş');
  });

  it('konum bildiren hatada satır ve sütunu çıkarır', () => {
    // V8 "... at position 7" derse bunu satır/sütuna çeviriyoruz.
    const result = parseJson('{\n  "a": 1,\n}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(3);
      expect(result.error.column).toBeGreaterThan(0);
    }
  });

  it('konum bildirmeyen hatada da anlamlı mesaj döner', () => {
    // V8 her hata için konum vermiyor (örn. "Unexpected end of JSON input").
    // Bu durumda satır/sütun yokluğu normal; mesajın kaybolmaması önemli.
    const result = parseJson('[1,2,');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message.length).toBeGreaterThan(0);
  });
});

describe('formatJson / minifyJson', () => {
  it('girintiyi uygular', () => {
    expect(formatJson({ a: 1 }, 2)).toBe('{\n  "a": 1\n}');
  });

  it('küçültürken boşluk bırakmaz', () => {
    expect(minifyJson({ a: 1, b: [1, 2] })).toBe('{"a":1,"b":[1,2]}');
  });
});

describe('describeJson', () => {
  it('dizi, nesne ve ilkel türleri ayırt eder', () => {
    expect(describeJson([1, 2, 3])).toBe('dizi · 3 öğe');
    expect(describeJson({ a: 1, b: 2 })).toBe('nesne · 2 anahtar');
    expect(describeJson(null)).toBe('null');
    expect(describeJson('x')).toBe('string');
    expect(describeJson(5)).toBe('number');
  });
});
