import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { CronGenerator } from '@/components/tools/CronGenerator';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['cron-generator'];

export const metadata: Metadata = {
  title: 'Cron Generator — Cron ifadesi oluştur ve çöz',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/cron-generator' },
};

export default function CronGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Sonraki çalışma zamanları <strong className="text-fg">senin tarayıcının saat dilimine</strong>{' '}
          göre hesaplanır. Sunucun farklı bir dilimdeyse (çoğu zaman UTC) gerçek çalışma saati
          kayacaktır — dağıtımdan önce sunucunun <code className="font-mono text-green">TZ</code>{' '}
          değerini kontrol et.
        </>
      }
    >
      <CronGenerator />
    </ToolPageLayout>
  );
}
