import type { Metadata } from 'next';
import Link from 'next/link';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { Base64Tool } from '@/components/tools/Base64Tool';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['base64'];

export const metadata: Metadata = {
  title: 'Base64 Çevirici — Metni kodla ve çöz',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/base64' },
};

export default function Base64Page() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Base64 bir <strong className="text-fg">şifreleme değil kodlamadır</strong> — herkes geri
          çevirebilir, gizli veri saklamak için kullanma. Amacı ikili veriyi metin taşıyan
          kanallardan (JSON, e-posta, data URI) geçirebilmektir. Görsel dönüştürmek için{' '}
          <Link href="/tools/image-to-base64" className="text-green hover:underline">
            Image to Base64
          </Link>{' '}
          aracına bak.
        </>
      }
    >
      <Base64Tool />
    </ToolPageLayout>
  );
}
