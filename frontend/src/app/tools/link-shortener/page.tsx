import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { LinkShortener } from '@/components/tools/LinkShortener';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['link-shortener'];

export const metadata: Metadata = {
  title: 'Link Kısaltma — Uzun URL’yi kısa bağlantıya çevir',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/link-shortener' },
};

export default function LinkShortenerPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Bu araç, listedeki tek <strong className="text-fg">sunucu taraflı</strong> araçtır — kısa
          kodun bir yerde saklanması gerekiyor. Kötüye kullanımı sınırlamak için yerel/iç ağ
          adresleri ve başka kısaltma servislerinin linkleri reddedilir. Süre sınırı seçersen link o
          tarihten sonra otomatik olarak geçersiz olur.
        </>
      }
    >
      <LinkShortener />
    </ToolPageLayout>
  );
}
