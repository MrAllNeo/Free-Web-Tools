import { existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * `next build` ve `next dev` aynı `.next` klasörünü paylaşır.
 *
 * Turbopack burada kalıcı bir önbellek veritabanı tutuyor ve bu veritabanı,
 * üzerine production build'i yazıldığında ya da iki dev sunucusu aynı anda
 * çalıştığında tutarsız kalabiliyor. Sonuç sinsi: sayfalar derlendikçe teker teker
 * 404/500 dönmeye başlıyor ve `next-development.log` içine
 * "Failed to restore task data" hatası düşüyor.
 *
 * `.next/BUILD_ID` yalnızca production build'i tarafından yazılır — varsa önbelleği
 * temizliyoruz. Yoksa dokunmuyoruz ki normal dev başlangıçları artımlı önbellekten
 * yararlanmaya devam etsin. Elle kurtarma için: `npm run clean`.
 */
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const nextDir = join(root, 'frontend', '.next');
const productionMarker = join(nextDir, 'BUILD_ID');

if (existsSync(productionMarker)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('[dev-cache-guard] Production build artefaktları bulundu, .next temizlendi.');
}
