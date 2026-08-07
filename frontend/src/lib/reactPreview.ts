import { escapeForScript, usesTailwind, wrapPreviewDocument } from './preview';

/**
 * React/JSX snippet'lerini iframe'de çalıştırılabilir hâle getirir.
 *
 * Tarayıcı JSX'i ve TypeScript'i anlamaz; bu kodu iframe'e olduğu gibi vermek
 * ekrana ham kaynak basıyordu. Burada Sucrase ile JS'e çeviriyor, React'i de
 * kendi sunduğumuz çalışma zamanından yüklüyoruz.
 *
 * Derleme üst sayfada yapılır, iframe'e yalnızca düz JavaScript girer — böylece
 * derleyici oturum başına bir kez indirilir, her önizlemede değil.
 */

/** Aynı kodu tekrar tekrar derlememek için. Yenile düğmesi ve yeniden render ucuz kalsın. */
const compileCache = new Map<string, string>();

/**
 * Dışa aktarılmamış bileşenleri de bulabilmek için kaynaktaki büyük harfle
 * başlayan üst düzey tanımların adlarını toplar.
 */
function componentCandidates(source: string): string[] {
  const pattern =
    /(?:^|\n)[ \t]*(?:export[ \t]+(?:default[ \t]+)?)?(?:async[ \t]+)?(?:function|const|let|var|class)[ \t]+([A-Z][A-Za-z0-9_]*)/g;

  const names = new Set<string>();
  for (const match of source.matchAll(pattern)) {
    names.add(match[1]);
  }
  return [...names];
}

async function compile(source: string): Promise<string> {
  const cached = compileCache.get(source);
  if (cached) return cached;

  // Sucrase yalnızca React önizlemesi açıldığında indirilsin diye dinamik import.
  const { transform } = await import('sucrase');

  const { code } = transform(source, {
    transforms: ['jsx', 'typescript', 'imports'],
    // Klasik dönüşüm JSX'i `React.createElement`e çevirir; çalışma zamanında
    // `React`i global olarak zaten sağlıyoruz, ayrıca jsx-runtime çözmeye gerek kalmıyor.
    jsxRuntime: 'classic',
    production: true,
    filePath: 'snippet.tsx',
  });

  compileCache.set(source, code);
  return code;
}

/** Hata metnini iframe içinde okunur şekilde gösteren belge. */
export function previewErrorDocument(message: string): string {
  const safe = message.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
  return wrapPreviewDocument(
    `<pre style="margin:0;max-width:100%;overflow:auto;white-space:pre-wrap;font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:#b4261a;background:#fdf1f0;border:1px solid #f2c9c5;border-radius:6px;padding:14px">${safe}</pre>`
  );
}

const runtimeUrl = () =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/preview/react-runtime.js`
    : '/preview/react-runtime.js';

/**
 * JSX/TS snippet'ini derleyip çalıştırılabilir bir HTML belgesi döndürür.
 * Derleme başarısız olursa hatayı gösteren bir belge döner — sessiz boş çerçeve değil.
 */
export async function buildReactPreviewDocument(
  source: string,
  demoHtml?: string
): Promise<string> {
  let compiled: string;
  try {
    compiled = await compile(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return previewErrorDocument(`Kod derlenemedi:\n\n${message}`);
  }

  const candidates = componentCandidates(source)
    .map((name) => `typeof ${name} !== 'undefined' ? ${name} : null`)
    .map((expr) => `(${expr})`)
    .join(', ');

  const demo = demoHtml?.trim() ?? '';

  const runner = `
(function () {
  var rootEl = document.getElementById('root');

  function showError(message) {
    rootEl.textContent = '';
    var box = document.createElement('pre');
    box.style.cssText = 'margin:0;max-width:100%;overflow:auto;white-space:pre-wrap;font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:#b4261a;background:#fdf1f0;border:1px solid #f2c9c5;border-radius:6px;padding:14px';
    box.textContent = message;
    rootEl.appendChild(box);
  }

  var React = window.React;
  var ReactDOMClient = window.ReactDOMClient;
  if (!React || !ReactDOMClient) {
    showError('React çalışma zamanı yüklenemedi.');
    return;
  }

  // React render sırasındaki hatalar try/catch'e düşmez, reportError ile bildirilir.
  window.addEventListener('error', function (event) {
    showError(String((event.error && event.error.stack) || event.message));
  });

  var module = { exports: {} };
  var exports = module.exports;

  function require(name) {
    if (name === 'react' || name === 'react/jsx-runtime') return React;
    if (name === 'react-dom' || name === 'react-dom/client') return ReactDOMClient;
    throw new Error('Önizleme yalnızca react ve react-dom içerir. İstenen paket: ' + name);
  }

  try {
${compiled}

    var locals = [${candidates}];
    var Component = null;

    if (typeof exports.default === 'function') {
      Component = exports.default;
    }
    if (!Component) {
      for (var key in exports) {
        if (typeof exports[key] === 'function' && /^[A-Z]/.test(key)) {
          Component = exports[key];
          break;
        }
      }
    }
    if (!Component) {
      // Sondan başa: iç içe bileşenlerde kök genelde en son tanımlanır.
      for (var i = locals.length - 1; i >= 0; i--) {
        if (typeof locals[i] === 'function') {
          Component = locals[i];
          break;
        }
      }
    }

    if (!Component) {
      showError('Render edilecek bir React bileşeni bulunamadı.\\n\\nBileşeni "export default" ile dışa aktarırsan önizleme onu bulabilir.');
      return;
    }

    ReactDOMClient.createRoot(rootEl).render(React.createElement(Component));
  } catch (err) {
    showError(String((err && err.stack) || err));
  }
})();`;

  const body = `${demo}
<div id="root"></div>
<script src="${runtimeUrl()}"></script>
<script>${escapeForScript(runner)}</script>`;

  return wrapPreviewDocument(body, { tailwind: usesTailwind(`${source}\n${demo}`) });
}
