import { existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * `next build` ve `next dev` aynı `.next` klasörünü paylaşır. Production build'inden
 * sonra dev sunucusu başlatıldığında kalan production manifestleri dev'in rota
 * çözümlemesini bozuyor: sayfalar derlendikçe teker teker 404 dönmeye başlıyor.
 *
 * `.next/BUILD_ID` yalnızca production build'i tarafından yazılır — varsa önbelleği
 * temizliyoruz. Yoksa dokunmuyoruz ki normal dev başlangıçları artımlı önbellekten
 * yararlanmaya devam etsin.
 */
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const nextDir = join(root, 'frontend', '.next');
const productionMarker = join(nextDir, 'BUILD_ID');

if (existsSync(productionMarker)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('[dev-cache-guard] Production build artefaktları bulundu, .next temizlendi.');
}
