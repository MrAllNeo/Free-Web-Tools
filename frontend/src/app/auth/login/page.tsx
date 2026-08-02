'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { getApiErrorMessage } from '@/lib/api';
import { AuthShell } from '@/components/auth/AuthShell';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Tekrar hoş geldin!');
      router.push('/');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'E-posta veya şifre hatalı'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Tekrar hoş geldin"
      subtitle="Hesabına giriş yap"
      footer={
        <>
          Hesabın yok mu?{' '}
          <Link href="/auth/register" className="text-amber hover:underline">
            ücretsiz kayıt ol
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-posta" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sen@ornek.com"
          />
        </Field>

        <Field label="Şifre" htmlFor="login-password">
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <Button type="submit" variant="solid" size="lg" disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Giriş yap
            </>
          )}
        </Button>
      </form>

      {/* Seed verisindeki yönetici hesabı — üretimde kaldırılmalı */}
      <div className="mt-5 p-3 bg-inset border border-line-soft rounded-xs">
        <p className="font-mono text-[11px] text-dim text-center break-all">
          demo: admin@freewebtools.dev / Admin123!@#
        </p>
      </div>
    </AuthShell>
  );
}
