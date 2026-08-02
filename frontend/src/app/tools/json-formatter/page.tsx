import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['json-formatter'];

export const metadata: Metadata = {
  title: 'JSON Formatter — JSON güzelleştir, doğrula ve sıkıştır',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/json-formatter' },
};

export default function JsonFormatterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Doğrulama tarayıcının kendi <code className="font-mono text-green">JSON.parse</code>{' '}
          motoruyla yapılır — hata varsa tam olarak hangi satır ve sütunda bozulduğunu gösterir.
          Veri hiçbir sunucuya gönderilmez, bu yüzden üretim yapılandırmalarını ve API yanıtlarını
          güvenle yapıştırabilirsin.
        </>
      }
    >
      <JsonFormatter />
    </ToolPageLayout>
  );
}
