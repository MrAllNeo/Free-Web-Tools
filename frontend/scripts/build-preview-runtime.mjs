import { build } from 'esbuild';
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Önizleme iframe'i için React çalışma zamanını paketler.
 *
 * `predev` ve `prebuild` üzerinden çalışır. Çıktı git'e girmez (üretilmiş dosya),
 * bu yüzden temiz bir checkout'ta da kendiliğinden oluşması gerekir.
 *
 * Yavaş makinelerde her `npm run dev` başlangıcına saniyeler eklememek için
 * çıktı girdilerden yeniye ise atlanıyor.
 */
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const entry = join(root, 'scripts', 'preview-runtime-entry.js');
const outfile = join(root, 'public', 'preview', 'react-runtime.js');

const isUpToDate = () => {
  if (!existsSync(outfile)) return false;
  const built = statSync(outfile).mtimeMs;
  // React sürümü değişirse paket de yenilenmeli.
  const lockfile = join(root, 'package-lock.json');
  const inputs = [entry, ...(existsSync(lockfile) ? [lockfile] : [])];
  return inputs.every((file) => statSync(file).mtimeMs < built);
};

if (isUpToDate()) {
  process.exit(0);
}

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  // React geliştirme modunda çok daha yavaş ve konsolu uyarıyla doldurur;
  // önizleme her zaman production build'i kullanmalı.
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});

console.log('[preview-runtime] public/preview/react-runtime.js üretildi.');
