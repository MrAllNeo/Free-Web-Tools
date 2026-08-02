import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { ImageToBase64 } from '@/components/tools/ImageToBase64';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['image-to-base64'];

export const metadata: Metadata = {
  title: 'Image to Base64 — Görseli data URI’ye çevir',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/image-to-base64' },
};

export default function ImageToBase64Page() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Görsel tarayıcının <code className="font-mono text-green">FileReader</code> API&apos;siyle
          okunur ve hiçbir yere yüklenmez. Data URI&apos;ler ek bir HTTP isteği kurtarır ama dosyayı
          yaklaşık %33 büyütür ve önbelleklenemez — bu yüzden yalnızca küçük ikonlar ve tek seferlik
          gömmeler için mantıklıdır.
        </>
      }
    >
      <ImageToBase64 />
    </ToolPageLayout>
  );
}
