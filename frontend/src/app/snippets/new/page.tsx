'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { DIFFICULTIES, LANGUAGES, SNIPPET_CATEGORIES } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';

const formSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı').max(255),
  description: z.string().optional(),
  codeContent: z.string().min(1, 'Kod içeriği zorunlu'),
  codeLanguage: z.string().min(1, 'Dil zorunlu'),
  category: z.enum(['frontend', 'backend', 'hacking']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  tagsInput: z.string().optional(),
  videoUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  prerequisites: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewSnippetPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { category: 'frontend', difficulty: 'beginner', codeLanguage: 'html' },
  });

  const category = watch('category');

  // Snippet oluşturma yetkisi backend'de contributor/admin ile sınırlı;
  // formu boşuna doldurtmamak için giriş yapmamış kullanıcı girişe yönlendirilir.
  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const canContribute = user?.role === 'contributor' || user?.role === 'admin';

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const tags = data.tagsInput
        ? data.tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];

      const res = await api.post<{ snippet: { slug: string } }>('/snippets', {
        title: data.title,
        description: data.description || undefined,
        codeContent: data.codeContent,
        codeLanguage: data.codeLanguage.trim().toLowerCase(),
        category: data.category,
        difficulty: data.difficulty,
        tags,
        videoUrl: data.videoUrl || undefined,
        prerequisites: data.prerequisites || undefined,
      });

      toast.success('Snippet gönderildi, moderasyon onayı bekleniyor.');
      router.push(`/snippets/${res.snippet.slug}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Snippet oluşturulamadı'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="max-w-[860px]">
      <div className="py-12 border-b border-line-soft">
        <div className="eyebrow mb-5">katkı sağla</div>
        <h1 className="font-mono text-[28px] sm:text-[32px] font-bold tracking-[-0.02em]">
          Snippet paylaş
        </h1>
        <p className="text-muted text-[14px] mt-3 max-w-[520px]">
          Kodunu, UI bileşenini veya güvenlik ipucunu toplulukla paylaş. Gönderiler
          yayımlanmadan önce moderasyondan geçer.
        </p>
      </div>

      {isAuthenticated && !canContribute && (
        <div className="flex gap-3 mt-8 p-4 bg-amber/8 border border-amber-dim/40 rounded-sm">
          <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <p className="text-[13px] text-muted">
            Hesabın <span className="font-mono text-amber">{user?.role}</span> rolünde. Snippet
            gönderebilmek için <span className="font-mono text-amber">contributor</span> rolü
            gerekiyor — formu doldurabilirsin ancak gönderim reddedilecektir.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-8">
        {/* Temel bilgiler */}
        <Card className="p-6">
          <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] pb-4 mb-5 border-b border-line-soft">
            Temel bilgiler
          </h2>

          <div className="space-y-4">
            <Field label="Başlık *" htmlFor="title" error={errors.title?.message}>
              <Input id="title" {...register('title')} placeholder="Glassmorphism kart efekti" />
            </Field>

            <Field label="Açıklama" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                {...register('description')}
                placeholder="Bu snippet ne yapıyor, kısaca anlat…"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Kategori *" htmlFor="category">
                <Select id="category" {...register('category')}>
                  {SNIPPET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Seviye *" htmlFor="difficulty">
                <Select id="difficulty" {...register('difficulty')}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Etiketler" htmlFor="tags" hint="virgülle ayırın">
              <Input id="tags" {...register('tagsInput')} placeholder="react, css, auth" />
            </Field>
          </div>
        </Card>

        {/* Kod */}
        <Card className="p-6">
          <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] pb-4 mb-5 border-b border-line-soft">
            Kaynak kod
          </h2>

          {category === 'frontend' && (
            <div className="flex gap-3 mb-5 p-4 bg-blue/8 border border-blue-dim/40 rounded-sm">
              <AlertCircle className="w-4 h-4 text-blue shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-muted">
                <strong className="text-fg">Canlı önizleme için:</strong> tam bir HTML belgesi ver
                ya da stil ve script&apos;leri satır içi{' '}
                <code className="font-mono text-blue">&lt;style&gt;</code> /{' '}
                <code className="font-mono text-blue">&lt;script&gt;</code> etiketleriyle ekle.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Field label="Dil *" htmlFor="codeLanguage" error={errors.codeLanguage?.message}>
              <Input
                id="codeLanguage"
                list="language-options"
                {...register('codeLanguage')}
                placeholder="html, javascript, python…"
              />
              <datalist id="language-options">
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} />
                ))}
              </datalist>
            </Field>

            <Field label="Kod içeriği *" htmlFor="codeContent" error={errors.codeContent?.message}>
              <Textarea
                id="codeContent"
                rows={14}
                spellCheck={false}
                {...register('codeContent')}
                placeholder="Kodunu buraya yapıştır…"
                className="!bg-inset min-h-[300px]"
              />
            </Field>
          </div>
        </Card>

        {/* Medya */}
        <Card className="p-6">
          <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] pb-4 mb-5 border-b border-line-soft">
            Video ve ek bilgiler
          </h2>

          <div className="space-y-4">
            <Field label="YouTube video adresi" htmlFor="videoUrl" error={errors.videoUrl?.message}>
              <Input
                id="videoUrl"
                type="url"
                {...register('videoUrl')}
                placeholder="https://www.youtube.com/watch?v=…"
              />
            </Field>

            <Field label="Ön koşullar" htmlFor="prerequisites">
              <Textarea
                id="prerequisites"
                rows={3}
                {...register('prerequisites')}
                placeholder="Gerekli bağımlılıklar veya ön bilgi…"
              />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="solid" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gönderiliyor…
              </>
            ) : (
              'Snippet gönder'
            )}
          </Button>
        </div>
      </form>
    </Container>
  );
}
