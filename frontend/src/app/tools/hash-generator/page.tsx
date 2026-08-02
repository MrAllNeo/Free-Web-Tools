import type { Metadata } from 'next';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { HashGenerator } from '@/components/tools/HashGenerator';
import { TOOLS_BY_SLUG } from '@/lib/constants';

const tool = TOOLS_BY_SLUG['hash-generator'];

export const metadata: Metadata = {
  title: 'Hash Generator — MD5, SHA-1, SHA-256, SHA-512 hesapla',
  description: tool.description,
  keywords: tool.keywords,
  alternates: { canonical: '/tools/hash-generator' },
};

export default function HashGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      note={
        <>
          Dört algoritma aynı anda hesaplanır, hepsi tarayıcında. <strong className="text-fg">Şifre
          saklamak için hash yeterli değildir</strong> — bunun için bcrypt, scrypt veya Argon2 gibi
          kasıtlı olarak yavaş ve tuzlu (salted) algoritmalar kullanılmalıdır. MD5 ve SHA-1 burada
          dosya bütünlüğü ve eski sistemlerle uyumluluk için var; güvenlik amacıyla kullanma.
        </>
      }
    >
      <HashGenerator />
    </ToolPageLayout>
  );
}
