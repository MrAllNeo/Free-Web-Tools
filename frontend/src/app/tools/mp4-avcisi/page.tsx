import type { Metadata } from 'next';
import { Mp4Hunter } from '@/components/tools/Mp4Hunter';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['mp4-avcisi'];

export const metadata: Metadata = {
  title: 'MP4 Avcısı — Video bağlantısını MP4 olarak hazırla',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/mp4-avcisi' },
};

export default function Mp4HunterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Bağlantı FWT sunucusu üzerinden MP4 Avcısı servisine gönderilir; servis giriş bilgileri
          tarayıcıya verilmez. Yalnızca indirme iznin olan, herkese açık ve DRM ile korunmayan
          içerikleri kullan. Kaynak sitenin koşulları ve yerel mevzuat geçerlidir.
        </>
      }
    >
      <Mp4Hunter />
    </ToolPageLayout>
  );
}
