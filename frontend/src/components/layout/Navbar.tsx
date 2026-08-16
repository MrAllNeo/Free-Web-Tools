'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { NAV_SECTIONS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { NotificationBell } from './NotificationBell';

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const isActive = (id: string) =>
    id === 'tools' ? pathname.startsWith('/tools') : activeCategory === id;

  return (
    <>
      {NAV_SECTIONS.map((section) => (
        <Link
          key={section.id}
          href={section.href}
          onClick={onNavigate}
          className={`font-mono text-[13.5px] pb-0.5 border-b transition-colors ${
            isActive(section.id)
              ? 'text-amber border-amber-dim'
              : 'text-muted border-transparent hover:text-amber hover:border-amber-dim'
          }`}
        >
          {section.label}
        </Link>
      ))}
    </>
  );
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-bg/90 backdrop-blur-[10px]">
      <Container>
        <nav className="flex items-center justify-between gap-6 py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_var(--amber)]" />
            <span className="font-mono font-bold text-[17px] tracking-[-0.02em]">
              free<span className="text-dim font-normal">/</span>web
              <span className="text-dim font-normal">/</span>tools
            </span>
          </Link>

          {/* Masaüstü bağlantıları */}
          <div className="hidden md:flex items-center gap-7">
            {/* useSearchParams istemci tarafı navigasyona bağlı olduğu için Suspense şart */}
            <Suspense fallback={null}>
              <NavLinks />
            </Suspense>
          </div>

          {/* Sağ taraf */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-3">
                <NotificationBell />
                <Link
                  href="/profile"
                  className="flex items-center gap-2 font-mono text-[13px] text-muted hover:text-fg transition-colors"
                >
                  <span className="w-7 h-7 rounded-xs bg-amber/15 border border-amber-dim flex items-center justify-center text-amber text-[12px] font-bold">
                    {user.username[0].toUpperCase()}
                  </span>
                  <span className="hidden lg:inline">{user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  aria-label="Çıkış yap"
                  className="p-2 text-dim hover:text-danger transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <ButtonLink href="/auth/login" variant="ghost">
                  giriş yap
                </ButtonLink>
                <ButtonLink href="/auth/register" variant="solid">
                  katkı sağla
                </ButtonLink>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-muted hover:text-fg transition-colors cursor-pointer"
              aria-label="Menü"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobil menü */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-line-soft"
            >
              <div className="flex flex-col gap-4 py-5">
                <Suspense fallback={null}>
                  <NavLinks onNavigate={() => setIsMenuOpen(false)} />
                </Suspense>

                <hr className="border-line-soft" />

                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="font-mono text-[13.5px] text-muted"
                    >
                      {user.username}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="font-mono text-[13.5px] text-danger cursor-pointer"
                    >
                      çıkış yap
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <ButtonLink href="/auth/login" variant="ghost" className="flex-1">
                      giriş yap
                    </ButtonLink>
                    <ButtonLink href="/auth/register" variant="solid" className="flex-1">
                      katkı sağla
                    </ButtonLink>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
}
