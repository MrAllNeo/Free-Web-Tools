import { describe, expect, it } from 'vitest';
import { hslToRgb, parseHex, parseHsl, parseRgb, rgbToHex, rgbToHsl } from './color';

describe('parseHex', () => {
  it('kısa biçimi genişletir', () => {
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('# olmadan da kabul eder', () => {
    expect(parseHex('e8b34a')).toEqual({ r: 232, g: 179, b: 74 });
  });

  it('geçersiz uzunluğu reddeder', () => {
    expect(parseHex('#abcd')).toBeNull();
    expect(parseHex('zzzzzz')).toBeNull();
  });
});

describe('parseRgb', () => {
  it('virgüllü ve fonksiyon yazımını çözer', () => {
    expect(parseRgb('232, 179, 74')).toEqual({ r: 232, g: 179, b: 74 });
    expect(parseRgb('rgb(232 179 74)')).toEqual({ r: 232, g: 179, b: 74 });
  });

  it('aralık dışı değeri reddeder', () => {
    expect(parseRgb('300, 0, 0')).toBeNull();
  });

  it('eksik bileşeni reddeder', () => {
    expect(parseRgb('10, 20')).toBeNull();
  });
});

describe('parseHsl', () => {
  it('yüzdeli yazımı çözer', () => {
    expect(parseHsl('39, 76%, 60%')).toEqual({ h: 39, s: 76, l: 60 });
  });

  it('aralık dışı tonu reddeder', () => {
    expect(parseHsl('400, 50%, 50%')).toBeNull();
  });
});

describe('dönüşüm gidiş-dönüşü', () => {
  it('rgb -> hex -> rgb aynı değeri verir', () => {
    const rgb = { r: 232, g: 179, b: 74 };
    expect(parseHex(rgbToHex(rgb))).toEqual(rgb);
  });

  it('rgb -> hsl -> rgb yuvarlama payıyla korunur', () => {
    const rgb = { r: 95, g: 168, b: 211 };
    const back = hslToRgb(rgbToHsl(rgb));
    // Yuvarlama nedeniyle birebir eşitlik beklenmez; 2 birimlik sapma kabul edilir.
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
  });

  it('gri tonlarında doygunluk sıfırdır', () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 }).s).toBe(0);
  });

  it('hex çıktısı büyük harf ve iki basamaklıdır', () => {
    expect(rgbToHex({ r: 0, g: 10, b: 255 })).toBe('#000AFF');
  });
});
