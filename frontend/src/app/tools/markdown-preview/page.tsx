import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { MarkdownPreview } from '@/components/tools/MarkdownPreview';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['markdown-preview'];

export const metadata: Metadata = {
  title: 'Markdown Preview — Markdown’ı canlı HTML olarak gör',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/markdown-preview' },
};

export default function MarkdownPreviewPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          CommonMark söz dizimi desteklenir. Ham HTML bilinçli olarak render edilmez — yapıştırdığın
          metindeki <code className="font-mono text-green">&lt;script&gt;</code> etiketleri düz metin
          olarak kalır, yani güvenmediğin bir markdown&apos;ı da rahatça önizleyebilirsin.
        </>
      }
    >
      <MarkdownPreview />
    </ToolPageLayout>
  );
}
