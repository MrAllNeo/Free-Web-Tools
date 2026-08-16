'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Container } from '@/components/ui/Container';
import { SnippetForm, type SnippetPayload } from '@/components/snippets/SnippetForm';

export default function NewSnippetPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Snippet oluşturma yetkisi backend'de contributor/admin ile sınırlı;
  // formu boşuna doldurtmamak için giriş yapmamış kullanıcı girişe yönlendirilir.
  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (payload: SnippetPayload) => {
    try {
      const res = await api.post<{ snippet: { slug: string; status: string } }>(
        '/snippets',
        payload
      );
      // Gönderim doğrudan yayımlanabilir de, kuyruğa da girebilir; kullanıcıya
      // hangisinin olduğunu söylemek gerek — yoksa "kayboldu" hissi geri gelir.
      toast.success(
        res.snippet.status === 'approved'
          ? 'Snippet yayımlandı.'
          : 'Snippet gönderildi, moderasyon onayı bekleniyor.'
      );
      router.push(`/snippets/${res.snippet.slug}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Snippet oluşturulamadı'));
    }
  };

  // Yönetici her şeyi doğrudan yayımlar; katkıcı hacking dışında doğrudan yayımlar.
  const reviewNote =
    user?.role === 'admin'
      ? null
      : user?.role === 'contributor'
        ? 'Gönderilerin doğrudan yayımlanır. Hacking kategorisi bunun istisnası: o içerik her zaman incelemeden geçer.'
        : 'Gönderin moderasyon onayından sonra yayımlanır. Onaya kadar snippet’ini “Snippet’lerim” sayfasında görebilirsin.';

  return (
    <Container className="max-w-[860px]">
      <div className="py-12 border-b border-line-soft">
        <div className="eyebrow mb-5">katkı sağla</div>
        <h1 className="font-mono text-[28px] sm:text-[32px] font-bold tracking-[-0.02em]">
          Snippet paylaş
        </h1>
        <p className="text-muted text-[14px] mt-3 max-w-[520px]">
          Kodunu, UI bileşenini veya güvenlik ipucunu toplulukla paylaş.
        </p>
      </div>

      {isAuthenticated && reviewNote && (
        <div className="flex gap-3 mt-8 p-4 bg-amber/8 border border-amber-dim/40 rounded-sm">
          <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <p className="text-[13px] text-muted">{reviewNote}</p>
        </div>
      )}

      <SnippetForm submitLabel="Snippet gönder" pendingLabel="Gönderiliyor…" onSubmit={handleSubmit} />
    </Container>
  );
}
