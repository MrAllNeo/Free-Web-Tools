import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { ColorConverter } from '@/components/tools/ColorConverter';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['color-converter'];

export const metadata: Metadata = {
  title: 'Renk Çevirici — HEX, RGB ve HSL dönüştürücü',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/color-converter' },
};

export default function ColorConverterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Üç alandan herhangi birine yazabilirsin — diğerleri anında güncellenir.{' '}
          <code className="font-mono text-green">#abc</code> gibi kısa HEX yazımı ve{' '}
          <code className="font-mono text-green">rgb(232 179 74)</code> biçimi de kabul edilir.
        </>
      }
    >
      <ColorConverter />
    </ToolPageLayout>
  );
}
