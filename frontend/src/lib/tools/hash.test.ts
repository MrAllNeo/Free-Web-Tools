import { describe, expect, it } from 'vitest';
import { computeAllHashes, computeHash, HASH_ALGORITHMS } from './hash';

describe('computeHash', () => {
  // Bilinen standart test vektörleri: kütüphane değişse bile çıktı aynı kalmalı.
  it('"abc" için bilinen özetleri üretir', () => {
    expect(computeHash('abc', 'md5')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(computeHash('abc', 'sha1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(computeHash('abc', 'sha256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('bilinmeyen algoritmada boş döner', () => {
    expect(computeHash('abc', 'sha3')).toBe('');
  });

  it('Türkçe karakterleri UTF-8 olarak yorumlar', () => {
    // Platforma göre değişen bir yorum olsaydı bu iki değer eşit çıkabilirdi.
    expect(computeHash('ş', 'sha256')).not.toBe(computeHash('s', 'sha256'));
    expect(computeHash('ş', 'sha256')).toHaveLength(64);
  });

  it('aynı girdi için kararlıdır', () => {
    expect(computeHash('deneme', 'sha512')).toBe(computeHash('deneme', 'sha512'));
  });
});

describe('computeAllHashes', () => {
  it('tanımlı her algoritma için sonuç döndürür', () => {
    const all = computeAllHashes('abc');
    for (const algorithm of HASH_ALGORITHMS) {
      expect(all[algorithm.id]).toMatch(/^[0-9a-f]+$/);
      // Onaltılık gösterimde her bayt 2 karakter.
      expect(all[algorithm.id]).toHaveLength(algorithm.bits / 4);
    }
  });
});
