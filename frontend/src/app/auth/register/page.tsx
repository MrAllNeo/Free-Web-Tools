'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff, Loader2, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { getApiErrorMessage } from '@/lib/api';
import { AuthShell } from '@/components/auth/AuthShell';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

/** Backend'deki registerSchema ile birebir aynı kurallar (utils/validators.ts). */
const PASSWORD_RULES = [
  { label: 'En az 8 karakter', test: (p: string) => p.length >= 8 },
  { label: 'En az bir büyük harf', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'En az bir rakam', test: (p: string) => /[0-9]/.test(p) },
  { label: 'En az bir özel karakter', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({ email: '', username: '', password: '', fullName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateField =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const allRulesPass = PASSWORD_RULES.every((rule) => rule.test(form.password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRulesPass) {
      toast.error('Şifre gereksinimlerinin tümünü karşılayın');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        // Boş metin backend'de max(255) doğrulamasına takılmasın diye gönderilmez.
        fullName: form.fullName.trim() || undefined,
      });
      toast.success('Hesabın oluşturuldu, hoş geldin!');
      router.push('/');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Kayıt başarısız'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Katkı sağlamaya başla"
      subtitle="Ücretsiz hesap oluştur"
      footer={
        <>
          Zaten hesabın var mı?{' '}
          <Link href="/auth/login" className="text-amber hover:underline">
            giriş yap
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-posta" htmlFor="reg-email">
          <Input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="sen@ornek.com"
          />
        </Field>

        <Field
          label="Kullanıcı adı"
          htmlFor="reg-username"
          hint="harf, rakam, tire ve alt çizgi"
        >
          <Input
            id="reg-username"
            type="text"
            required
            minLength={3}
            maxLength={100}
            pattern="[a-zA-Z0-9_\-]+"
            autoComplete="username"
            value={form.username}
            onChange={updateField('username')}
            placeholder="devkerem"
          />
        </Field>

        <Field label="Ad soyad (isteğe bağlı)" htmlFor="reg-fullname">
          <Input
            id="reg-fullname"
            type="text"
            maxLength={255}
            autoComplete="name"
            value={form.fullName}
            onChange={updateField('fullName')}
            placeholder="Kerem Yılmaz"
          />
        </Field>

        <Field label="Şifre" htmlFor="reg-password">
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="••••••••"
              className="!pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-dim hover:text-fg transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        <ul className="space-y-1.5">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(form.password);
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-2 font-mono text-[11.5px] ${
                  passed ? 'text-green' : 'text-dim'
                }`}
              >
                {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {rule.label}
              </li>
            );
          })}
        </ul>

        <Button
          type="submit"
          variant="solid"
          size="lg"
          disabled={isLoading || !allRulesPass}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Hesap oluştur
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
