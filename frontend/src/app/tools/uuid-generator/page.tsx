import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { UuidGenerator } from '@/components/tools/UuidGenerator';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['uuid-generator'];

export const metadata: Metadata = {
  title: 'UUID Üretici — v4 UUID / GUID oluştur',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/uuid-generator' },
};

export default function UuidGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          v4 UUID&apos;ler 122 bit rastgelelik taşır; çakışma olasılığı pratikte ihmal edilebilir
          düzeydedir. Toplu üretimde tüm değerleri tek seferde kopyalayabilirsin.
        </>
      }
    >
      <UuidGenerator showCount />
    </ToolPageLayout>
  );
}
