/**
 * Snippet kodunu iframe içinde çalıştırılabilir tam bir HTML belgesine sarar.
 * Kod zaten tam bir belge ise olduğu gibi bırakılır.
 */
export function buildPreviewDocument(code: string): string {
  const lower = code.toLowerCase();
  if (lower.includes('<!doctype html>') || lower.includes('<html')) return code;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html, body {
    margin: 0;
    padding: 16px;
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
</head>
<body>
${code}
</body>
</html>`;
}

/**
 * Önizleme iframe'i için sandbox izinleri.
 *
 * `allow-same-origin` bilinçli olarak VERİLMEZ: srcDoc ile yüklenen belge aksi hâlde
 * üst sayfayla aynı kaynağı paylaşır ve topluluktan gelen snippet kodu ana sayfanın
 * DOM'una ve localStorage'daki JWT'ye erişebilirdi.
 */
export const PREVIEW_SANDBOX = 'allow-scripts allow-modals';
