import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';
import SHA256 from 'crypto-js/sha256';
import SHA512 from 'crypto-js/sha512';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';

export interface HashAlgorithm {
  id: string;
  label: string;
  bits: number;
  /** Çakışma saldırılarına açık algoritmalar arayüzde uyarıyla işaretlenir. */
  broken: boolean;
  note: string;
}

export const HASH_ALGORITHMS: HashAlgorithm[] = [
  {
    id: 'md5',
    label: 'MD5',
    bits: 128,
    broken: true,
    note: 'Çakışma saldırılarına açık — yalnızca sağlama toplamı (checksum) için kullanın, güvenlik amacıyla asla.',
  },
  {
    id: 'sha1',
    label: 'SHA-1',
    bits: 160,
    broken: true,
    note: 'Pratikte kırıldı (SHAttered, 2017). Yeni sistemlerde kullanmayın.',
  },
  {
    id: 'sha256',
    label: 'SHA-256',
    bits: 256,
    broken: false,
    note: 'Genel amaçlı kullanım için güvenli kabul edilir.',
  },
  {
    id: 'sha512',
    label: 'SHA-512',
    bits: 512,
    broken: false,
    note: '64 bit sistemlerde SHA-256’dan hızlı olabilir, güvenlik payı daha yüksektir.',
  },
];

const HASHERS = { md5: MD5, sha1: SHA1, sha256: SHA256, sha512: SHA512 } as const;

export function computeHash(text: string, algorithm: string): string {
  const hasher = HASHERS[algorithm as keyof typeof HASHERS];
  if (!hasher) return '';

  // Utf8.parse ile açıkça UTF-8 baytlarına çeviriyoruz; aksi hâlde Türkçe karakterler
  // için crypto-js'in varsayılan yorumu platforma göre değişebilir.
  return hasher(Utf8.parse(text)).toString(Hex);
}

/** Tüm algoritmaları tek seferde hesaplar (karşılaştırma görünümü için). */
export function computeAllHashes(text: string): Record<string, string> {
  return Object.fromEntries(
    HASH_ALGORITHMS.map((algorithm) => [algorithm.id, computeHash(text, algorithm.id)])
  );
}
