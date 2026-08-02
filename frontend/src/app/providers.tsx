'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((s) => s.loadUser);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token, loadUser]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-raised)',
              color: 'var(--fg)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg-inset)' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-inset)' } },
          }}
        />
      </AuthInitializer>
    </QueryClientProvider>
  );
}
