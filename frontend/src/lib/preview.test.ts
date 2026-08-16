import { describe, expect, it } from 'vitest';
import {
  buildPreviewDocument,
  canRenderLive,
  escapeForScript,
  liveBlocker,
  looksLikeReact,
  needsCompilation,
  PREVIEW_SANDBOX,
} from './preview';

/**
 * Önizleme kuralları bu projede en çok hata çıkan yer oldu. Buradaki testlerin
 * çoğu gerçekten yaşanmış bir hatanın tekrarını engellemek için var.
 */

describe('PREVIEW_SANDBOX', () => {
  it('allow-same-origin vermez', () => {
    // Güvenlik gerilemesi testi: srcDoc ile yüklenen belge aynı kaynağı paylaşırsa
    // topluluktan gelen snippet kodu localStorage'daki JWT'yi okuyabilir.
    expect(PREVIEW_SANDBOX).not.toContain('allow-same-origin');
    expect(PREVIEW_SANDBOX).toContain('allow-scripts');
  });
});

describe('looksLikeReact', () => {
  it('tsx dilini React sayar', () => {
    expect(looksLikeReact('const a = 1;', 'tsx')).toBe(true);
  });

  it('typescript içinde JSX etiketi varsa React sayar', () => {
    expect(looksLikeReact('const A = () => <Button />;', 'typescript')).toBe(true);
  });

  it('React kancası kullanan javascript React sayılır', () => {
    expect(looksLikeReact('const [a, b] = useState(0);', 'javascript')).toBe(true);
  });

  it('düz typescript React değildir', () => {
    expect(looksLikeReact('export function add(a: number, b: number) { return a + b; }', 'typescript')).toBe(
      false
    );
  });

  it('css React değildir', () => {
    expect(looksLikeReact('.a { color: red }', 'css')).toBe(false);
  });
});

describe('canRenderLive', () => {
  it('tam HTML belgesini çalıştırılabilir sayar', () => {
    expect(canRenderLive('<!DOCTYPE html><html><body>hi</body></html>', 'html')).toBe(true);
  });

  it('html parçasını çalıştırılabilir sayar', () => {
    expect(canRenderLive('<div>merhaba</div>', 'html')).toBe(true);
  });

  it('boş kodu reddeder', () => {
    expect(canRenderLive('', 'html')).toBe(false);
  });

  it('React kodunu doğrudan çalıştırılabilir SAYMAZ (derleme gerekir)', () => {
    expect(canRenderLive('export default function A() { return <b>x</b>; }', 'tsx')).toBe(false);
  });

  it('tarayıcının çalıştıramayacağı dilleri reddeder', () => {
    expect(canRenderLive('print("selam")', 'python')).toBe(false);
    expect(canRenderLive('SELECT 1;', 'sql')).toBe(false);
  });

  describe('demo markup', () => {
    const css = '.btn { color: red }';

    it('markup olmadan saf CSS çalıştırılamaz', () => {
      expect(canRenderLive(css, 'css')).toBe(false);
    });

    it('demo markup verilince saf CSS çalıştırılabilir', () => {
      expect(canRenderLive(css, 'css', '<button class="btn">x</button>')).toBe(true);
    });

    it('yalnızca boşluktan oluşan demo markup sayılmaz', () => {
      expect(canRenderLive(css, 'css', '   \n  ')).toBe(false);
    });

    it('demo markup verilince saf JS çalıştırılabilir', () => {
      expect(canRenderLive('document.body.style.background = "red";', 'javascript', '<div id="a"></div>')).toBe(
        true
      );
    });
  });

  it('JSX içindeki "<html" dizesi belge sanılmamalı', () => {
    // Gerçek hata: isFullDocument metnin herhangi bir yerinde <html arıyordu,
    // bu yüzden JSX içinde geçen bir dize React bileşenini çalıştırılabilir gösteriyordu.
    const jsx = 'export default () => <pre>{"<html>"}</pre>;';
    expect(canRenderLive(jsx, 'tsx')).toBe(false);
    expect(needsCompilation(jsx, 'tsx')).toBe(true);
  });
});

describe('liveBlocker', () => {
  it('çalışabilen kod için engel döndürmez', () => {
    expect(liveBlocker('<div>x</div>', 'html')).toBeNull();
  });

  it('derlenebilir React için engel döndürmez', () => {
    expect(liveBlocker('export default () => <b>x</b>;', 'tsx')).toBeNull();
  });

  it('markupsuz CSS için düzeltilebilir eksikliği bildirir', () => {
    expect(liveBlocker('.a { color: red }', 'css')).toBe('needs-demo-html');
  });

  it('tarayıcıda çalışmayan dili ayrı bildirir', () => {
    expect(liveBlocker('print(1)', 'python')).toBe('not-browser-language');
  });
});

describe('buildPreviewDocument', () => {
  it('tam belgeyi olduğu gibi bırakır', () => {
    const doc = '<!DOCTYPE html><html><body>x</body></html>';
    expect(buildPreviewDocument(doc, 'html')).toBe(doc);
  });

  it('saf CSS i <style> içine sarar', () => {
    // <body> içine düz yazılırsa ekranda metin olarak görünüyordu.
    const out = buildPreviewDocument('.a { color: red }', 'css', '<div class="a">x</div>');
    expect(out).toContain('<style>.a { color: red }</style>');
    expect(out).toContain('<div class="a">x</div>');
  });

  it('saf JS i <script> içine sarar ve demo markup u öne alır', () => {
    const out = buildPreviewDocument('console.log(1)', 'javascript', '<div id="root"></div>');
    expect(out.indexOf('<div id="root"></div>')).toBeLessThan(out.indexOf('<script>'));
    expect(out).toContain('<script>console.log(1)</script>');
  });

  it('Tailwind CDN ini yalnızca gerektiğinde ekler', () => {
    expect(buildPreviewDocument('<div class="flex gap-2">x</div>', 'html')).toContain('cdn.tailwindcss.com');
    expect(buildPreviewDocument('<div class="kart">x</div>', 'html')).not.toContain('cdn.tailwindcss.com');
  });
});

describe('escapeForScript', () => {
  it('script kapanışını etkisizleştirir', () => {
    // Kaçırılmazsa gömülü kod script bloğunu erken kapatır ve önizleme bozulur.
    expect(escapeForScript('const a = "</script>";')).toBe('const a = "<\\/script>";');
  });

  it('büyük/küçük harf farkını da yakalar', () => {
    expect(escapeForScript('</SCRIPT>')).toBe('<\\/SCRIPT>');
  });
});
