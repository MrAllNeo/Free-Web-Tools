'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import type { User } from '@/lib/types';

const profileSchema = z.object({
  fullName: z.string().max(255).optional(),
  bio: z.string().max(500, 'Biyografi en fazla 500 karakter').optional(),
  websiteUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  githubUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  avatarUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
});

type ProfileData = z.infer<typeof profileSchema>;

const ROLE_LABEL: Record<User['role'], string> = {
  guest: 'misafir',
  user: 'kullanıcı',
  contributor: 'katkıcı',
  admin: 'yönetici',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loadUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        bio: user.bio || '',
        websiteUrl: user.websiteUrl || '',
        githubUrl: user.githubUrl || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user, reset]);

  // Token yoksa oturum hiç açılmamış demektir; token varsa loadUser sonucu beklenir.
  useEffect(() => {
    if (!isAuthenticated && !useAuthStore.getState().token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: ProfileData) => {
    setIsSaving(true);
    try {
      await api.put('/users/me', data);
      await loadUser();
      toast.success('Profil güncellendi');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Profil güncellenemedi'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-6 h-6 text-amber animate-spin" />
        <p className="font-mono text-[12.5px] text-dim">profil yükleniyor…</p>
      </div>
    );
  }

  return (
    <Container>
      <div className="py-12 border-b border-line-soft">
        <div className="eyebrow mb-5">hesap</div>
        <h1 className="font-mono text-[28px] sm:text-[32px] font-bold tracking-[-0.02em]">
          Profilim
        </h1>
        <p className="text-muted text-[14px] mt-3">
          Kişisel bilgilerini yönet ve istatistiklerini gör.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 py-8">
        {/* Özet kart */}
        <Card className="p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-md bg-amber/15 border border-amber-dim flex items-center justify-center text-amber font-mono font-bold text-[30px] mb-4 overflow-hidden">
              {user.avatarUrl ? (
                // Kullanıcı serbest URL girebildiği için next/image yerine düz img kullanılıyor.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>

            <h2 className="text-[17px] font-semibold">{user.fullName || user.username}</h2>
            <p className="font-mono text-[12.5px] text-dim mb-4">@{user.username}</p>

            <Badge tone={user.role === 'admin' ? 'danger' : 'amber'}>{ROLE_LABEL[user.role]}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-line-soft mt-6 pt-5">
            <div>
              <p className="font-mono text-[10.5px] text-dim uppercase tracking-[0.06em] mb-1">
                İtibar
              </p>
              <p className="font-mono text-[20px] font-bold text-amber">
                {user.reputationScore || 0}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10.5px] text-dim uppercase tracking-[0.06em] mb-1">
                Snippet
              </p>
              <p className="font-mono text-[20px] font-bold">{user._count?.snippets ?? 0}</p>
            </div>
          </div>
        </Card>

        {/* Ayarlar */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] pb-4 mb-5 border-b border-line-soft">
            Profil ayarları
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Ad soyad" htmlFor="fullName" error={errors.fullName?.message}>
                <Input id="fullName" {...register('fullName')} placeholder="Kerem Yılmaz" />
              </Field>

              <Field label="E-posta (değiştirilemez)" htmlFor="email">
                <Input id="email" value={user.email} disabled readOnly />
              </Field>
            </div>

            <Field label="Biyografi" htmlFor="bio" error={errors.bio?.message}>
              <Textarea
                id="bio"
                rows={3}
                {...register('bio')}
                placeholder="Kendinden kısaca bahset…"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="GitHub" htmlFor="githubUrl" error={errors.githubUrl?.message}>
                <Input
                  id="githubUrl"
                  type="url"
                  {...register('githubUrl')}
                  placeholder="https://github.com/…"
                />
              </Field>

              <Field label="Web sitesi" htmlFor="websiteUrl" error={errors.websiteUrl?.message}>
                <Input
                  id="websiteUrl"
                  type="url"
                  {...register('websiteUrl')}
                  placeholder="https://siten.com"
                />
              </Field>
            </div>

            <Field label="Avatar adresi" htmlFor="avatarUrl" error={errors.avatarUrl?.message}>
              <Input
                id="avatarUrl"
                type="url"
                {...register('avatarUrl')}
                placeholder="https://ornek.com/avatar.png"
              />
            </Field>

            <div className="flex justify-end pt-4 border-t border-line-soft">
              <Button type="submit" variant="solid" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Değişiklikleri kaydet
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}
