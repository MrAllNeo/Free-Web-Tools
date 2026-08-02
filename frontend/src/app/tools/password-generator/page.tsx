import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['password-generator'];

export const metadata: Metadata = {
  title: 'Şifre Üretici — Güçlü ve rastgele parola oluştur',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/password-generator' },
};

export default function PasswordGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Şifreler tarayıcının <code className="font-mono text-green">crypto.getRandomValues</code>{' '}
          kriptografik rastgelelik kaynağıyla üretilir ve hiçbir zaman sunucuya gönderilmez.
          Entropi değeri, şifrenin kaba kuvvet saldırısına karşı direncini bit cinsinden gösterir —
          80 bit ve üzeri günümüz koşullarında güçlü kabul edilir.
        </>
      }
    >
      <PasswordGenerator />
    </ToolPageLayout>
  );
}
