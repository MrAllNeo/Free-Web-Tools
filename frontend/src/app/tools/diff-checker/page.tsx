import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { DiffChecker } from '@/components/tools/DiffChecker';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['diff-checker'];

export const metadata: Metadata = {
  title: 'Diff Checker — İki metni karşılaştır, farkları gör',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/diff-checker' },
};

export default function DiffCheckerPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Satır bazlı karşılaştırma kod ve yapılandırma dosyaları için, kelime bazlı karşılaştırma
          ise düz metin ve dokümantasyon için daha okunaklıdır. Karşılaştırma tarayıcında çalışır —
          gizli sözleşme veya üretim yapılandırması yapıştırman güvenlidir.
        </>
      }
    >
      <DiffChecker />
    </ToolPageLayout>
  );
}
