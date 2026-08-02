import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { RegexTester } from '@/components/tools/RegexTester';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['regex-tester'];

export const metadata: Metadata = {
  title: 'Regex Tester — Düzenli ifadeleri canlı test et',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/regex-tester' },
};

export default function RegexTesterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Desen tarayıcının kendi JavaScript regex motorunda çalışır — yani burada gördüğün sonuç,
          kodunda göreceğinle birebir aynıdır. Yakalama grupları eşleşmelerin altında listelenir.
          Çok geniş desenlerde ilk 500 eşleşme gösterilir.
        </>
      }
    >
      <RegexTester />
    </ToolPageLayout>
  );
}
