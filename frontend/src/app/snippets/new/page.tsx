'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';
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
  mediaType: z.enum(['video', 'image', 'none']),
  videoUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  imageUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  imageCaption: z.string().max(300).optional(),
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
    defaultValues: {
      category: 'frontend',
      difficulty: 'beginner',
      codeLanguage: 'html',
      mediaType: 'video',
    },
  });

  const category = watch('category');
  const mediaType = watch('mediaType');
  // Frontend snippet'leri her zaman canlı çalıştırılır; seçici yalnızca diğerlerinde anlamlı.
  const isLive = category === 'frontend';

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
        // Frontend'de sunucu zaten 'live'a çeviriyor; yine de niyeti açıkça gönderiyoruz.
        mediaType: isLive ? 'live' : data.mediaType,
        videoUrl: data.mediaType === 'video' ? data.videoUrl || undefined : undefined,
        imageUrl: data.mediaType === 'image' ? data.imageUrl || undefined : undefined,
        imageCaption: data.mediaType === 'image' ? data.imageCaption || undefined : undefined,
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

        {/* Gösterim */}
        <Card className="p-6">
          <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] pb-4 mb-5 border-b border-line-soft">
            Gösterim ve ek bilgiler
          </h2>

          {isLive ? (
            <div className="flex gap-3 mb-5 p-4 bg-green/8 border border-green-dim/40 rounded-sm">
              <Sparkles className="w-4 h-4 text-green shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-muted">
                <strong className="text-fg">Frontend snippet&apos;leri canlı gösterilir.</strong>{' '}
                Kodun hem detay sayfasında hem de listedeki kartta bir çerçeve içinde gerçekten
                çalışır — video ya da ekran görüntüsü eklemene gerek yok.
              </p>
            </div>
          ) : (
            <div className="mb-5">
              <span className="block font-mono text-[11.5px] text-dim mb-2">
                Bu snippet nasıl gösterilsin?
              </span>
              <div className="grid sm:grid-cols-3 gap-2">
                {[
                  { value: 'video', label: 'Video', hint: 'YouTube anlatımı' },
                  { value: 'image', label: 'Görsel', hint: 'Ekran görüntüsü / diyagram' },
                  { value: 'none', label: 'Yok', hint: 'Yalnızca kod' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-sm border cursor-pointer transition-colors ${
                      mediaType === option.value
                        ? 'border-green bg-green/8'
                        : 'border-line hover:border-green-dim'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={option.value}
                        {...register('mediaType')}
                        className="w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[12.5px]">{option.label}</span>
                    </span>
                    <span className="text-[11px] text-dim pl-5">{option.hint}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isLive && mediaType === 'video' && (
              <Field
                label="YouTube video adresi"
                htmlFor="videoUrl"
                error={errors.videoUrl?.message}
              >
                <Input
                  id="videoUrl"
                  type="url"
                  {...register('videoUrl')}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
              </Field>
            )}

            {!isLive && mediaType === 'image' && (
              <>
                <Field label="Görsel adresi" htmlFor="imageUrl" error={errors.imageUrl?.message}>
                  <Input
                    id="imageUrl"
                    type="url"
                    {...register('imageUrl')}
                    placeholder="https://ornek.com/ekran-goruntusu.png"
                  />
                </Field>

                <Field
                  label="Görsel açıklaması"
                  htmlFor="imageCaption"
                  hint="görselin altında gösterilir"
                >
                  <Input
                    id="imageCaption"
                    {...register('imageCaption')}
                    placeholder="Nmap taraması sonucu"
                  />
                </Field>
              </>
            )}

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
