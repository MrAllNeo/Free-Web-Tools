import type { Metadata } from 'next';
import { SceneHunter } from '@/components/tools/SceneHunter';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['sahne-avcisi'];

export const metadata: Metadata = {
  title: 'Sahne Avcısı — Ekran görüntüsünden sahne bul',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/sahne-avcisi' },
};

export default function SceneHunterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Görsel yalnızca eşleştirme için sunucu belleğinde işlenir, diske kaydedilmez. 18+ içerik
          varsayılan olarak gizlidir ve yalnızca reşit onayıyla açılır. trace.moe seçeneği
          açıldığında görsel eşleştirme için üçüncü taraf bir API&apos;ye gönderilir. Sahne Avcısı gerçek
          kişileri teşhis etmeye çalışmaz; yalnızca sahne ve kaynağı eşleştirir.
        </>
      }
    >
      <SceneHunter />
    </ToolPageLayout>
  );
}
