import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { QrGenerator } from '@/components/tools/QrGenerator';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['qr-generator'];

export const metadata: Metadata = {
  title: 'QR Kod Üretici — Metin ve bağlantıdan QR oluştur',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/qr-generator' },
};

export default function QrGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          QR kod tarayıcında üretilir; içeriğin hiçbir sunucuya gitmez ve üretilen kodun son
          kullanma tarihi yoktur. Baskı için <strong className="text-fg">SVG</strong> tercih et —
          vektör olduğu için her boyutta keskin kalır. Uzun metinler kodu sıklaştırır; bağlantılar
          için kısa URL kullanmak okunurluğu artırır.
        </>
      }
    >
      <QrGenerator />
    </ToolPageLayout>
  );
}
