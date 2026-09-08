import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Free Web Tools — ücretsiz geliştirici araçları ve kod snippetleri';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#0b0d10',
          color: '#f5f7fa',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: '#f4b942' }}>FREE WEB TOOLS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 66, fontWeight: 700, lineHeight: 1.08 }}>
            Kodu gör. Aracı kullan. Ücretsiz kal.
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#a9b0bb' }}>
            Geliştirici araçları, kod snippetleri ve topluluk içerikleri tek yerde.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#7f8792' }}>free web tools • TOYWES</div>
      </div>
    ),
    size,
  );
}
