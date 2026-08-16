'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Container } from '@/components/ui/Container';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SnippetForm, type SnippetPayload } from '@/components/snippets/SnippetForm';
import type { Snippet } from '@/lib/types';

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default function EditSnippetPage({ params }: EditPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['snippet', slug],
    queryFn: () => api.get<{ snippet: Snippet }>(`/snippets/${slug}`),
  });

  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <Container className="py-24 flex justify-center">
        <Loader2 className="w-6 h-6 text-amber animate-spin" />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-mono text-[18px] font-semibold mb-2">Snippet bulunamadı</h1>
        <ButtonLink href="/snippets">Arşive dön</ButtonLink>
      </Container>
    );
  }

  const snippet = data.snippet;
  const isOwner = user?.id === snippet.author.id;
  const canEdit = isOwner || user?.role === 'admin';

  // Sunucu da aynı kontrolü yapıyor; buradaki amaç kullanıcıyı dolduramayacağı
  // bir formla uğraştırmamak.
  if (!canEdit) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-mono text-[18px] font-semibold mb-2">Bu snippet senin değil</h1>
        <p className="text-[13px] text-muted mb-6">Yalnızca kendi snippet&apos;lerini düzenleyebilirsin.</p>
        <ButtonLink href={`/snippets/${snippet.slug}`}>Snippet&apos;e dön</ButtonLink>
      </Container>
    );
  }

  const handleSubmit = async (payload: SnippetPayload) => {
    try {
      const res = await api.put<{ snippet: { slug: string } }>(`/snippets/${snippet.id}`, payload);
      toast.success('Snippet güncellendi.');
      // Başlık değişince sunucu slug'ı yeniden üretiyor; dönen slug'a gidiyoruz.
      router.push(`/snippets/${res.snippet.slug}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Snippet güncellenemedi'));
    }
  };

  const handleDelete = async () => {
    // Silme geri alınamaz; tarayıcının kendi onayı bu ölçekte yeterli.
    if (!window.confirm(`"${snippet.title}" kalıcı olarak silinecek. Emin misin?`)) return;

    setIsDeleting(true);
    try {
      await api.delete(`/snippets/${snippet.id}`);
      toast.success('Snippet silindi.');
      router.push('/my/snippets');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Snippet silinemedi'));
      setIsDeleting(false);
    }
  };

  return (
    <Container className="max-w-[860px]">
      <div className="py-12 border-b border-line-soft">
        <Link
          href={`/snippets/${snippet.slug}`}
          className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-dim hover:text-amber transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          snippet&apos;e dön
        </Link>
        <h1 className="font-mono text-[28px] sm:text-[32px] font-bold tracking-[-0.02em]">
          Snippet düzenle
        </h1>
        <p className="text-muted text-[14px] mt-3 max-w-[520px]">{snippet.title}</p>
      </div>

      <SnippetForm
        submitLabel="Değişiklikleri kaydet"
        pendingLabel="Kaydediliyor…"
        onSubmit={handleSubmit}
        defaultValues={{
          title: snippet.title,
          description: snippet.description ?? '',
          codeContent: snippet.codeContent,
          codeLanguage: snippet.codeLanguage,
          demoHtml: snippet.demoHtml ?? '',
          category: snippet.category,
          difficulty: snippet.difficulty,
          tagsInput: snippet.tags.join(', '),
          // Form yalnızca video/image/none sunar; 'live' kategoriye göre türetilir.
          mediaType: snippet.mediaType === 'live' ? 'video' : snippet.mediaType,
          videoUrl: snippet.videoUrl ?? '',
          imageUrl: snippet.imageUrl ?? '',
          imageCaption: snippet.imageCaption ?? '',
          prerequisites: snippet.prerequisites ?? '',
        }}
        extraActions={
          <Button type="button" variant="ghost" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Snippet&apos;i sil
          </Button>
        }
      />
    </Container>
  );
}
