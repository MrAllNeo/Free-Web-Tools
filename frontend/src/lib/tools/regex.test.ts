import { describe, expect, it } from 'vitest';
import { runRegex, segmentText } from './regex';

describe('runRegex', () => {
  it('tüm eşleşmeleri konumlarıyla bulur', () => {
    const result = runRegex('\\d+', '', 'a1 b22 c333');
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.matches.map((m) => m.value)).toEqual(['1', '22', '333']);
    expect(result.matches[1]).toMatchObject({ start: 4, end: 6 });
  });

  it('kullanıcı g bayrağını seçmese de tümünü tarar', () => {
    const result = runRegex('a', '', 'aaa');
    expect(result.ok && result.matches.length).toBe(3);
  });

  it('yakalama ve isimli grupları döndürür', () => {
    const result = runRegex('(?<yil>\\d{4})-(\\d{2})', '', '2026-08');
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.matches[0].groups).toEqual(['2026', '08']);
    expect(result.matches[0].named).toEqual({ yil: '2026' });
  });

  it('sıfır uzunluklu eşleşmede sonsuz döngüye girmez', () => {
    // `a*` boş dizeyle eşleşir ve lastIndex ilerlemezse döngü asla bitmez.
    const result = runRegex('a*', '', 'bbb');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.matches.length).toBeLessThan(10);
  });

  it('çok fazla eşleşmede kesip bunu bildirir', () => {
    const result = runRegex('x', '', 'x'.repeat(600));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.truncated).toBe(true);
      expect(result.matches).toHaveLength(500);
    }
  });

  it('boş desende sessizce boş sonuç verir', () => {
    expect(runRegex('', '', 'abc')).toEqual({ ok: true, matches: [], truncated: false });
  });

  it('geçersiz deseni hata olarak bildirir', () => {
    const result = runRegex('(', '', 'abc');
    expect(result.ok).toBe(false);
  });
});

describe('segmentText', () => {
  it('eşleşme yoksa metni tek parça döndürür', () => {
    expect(segmentText('abc', [])).toEqual([{ text: 'abc', matchIndex: null }]);
  });

  it('eşleşen ve eşleşmeyen parçaları sırayla böler', () => {
    const result = runRegex('\\d+', '', 'a1b');
    if (!result.ok) throw new Error('desen çalışmalıydı');

    expect(segmentText('a1b', result.matches)).toEqual([
      { text: 'a', matchIndex: null },
      { text: '1', matchIndex: 0 },
      { text: 'b', matchIndex: null },
    ]);
  });

  it('parçalar birleştirilince özgün metni verir', () => {
    const text = 'yil 2026 ay 08';
    const result = runRegex('\\d+', '', text);
    if (!result.ok) throw new Error('desen çalışmalıydı');

    expect(
      segmentText(text, result.matches)
        .map((s) => s.text)
        .join('')
    ).toBe(text);
  });
});
