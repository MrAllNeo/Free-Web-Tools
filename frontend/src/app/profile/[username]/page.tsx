'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
// lucide-react bu sürümde marka ikonu yayınlamıyor; GitHub için genel kod ikonu.
import { ArrowLeft, Code2, Eye, Globe, Heart, Loader2, ShieldCheck, Star } from 'lucide-react';
import { publicProfileQuery } from '@/lib/queries';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Panel';

const ROLE_LABEL: Record<string, string> = {
  admin: 'yönetici',
  contributor: 'katkıcı',
  user: 'üye',
  guest: 'misafir',
};

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);
  const { data, isLoading, error } = useQuery(publicProfileQuery(username));

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
        <div className="font-mono text-[32px] text-dim mb-4">404</div>
        <h1 className="font-mono text-[18px] font-semibold mb-2">Kullanıcı bulunamadı</h1>
        <p className="text-[13px] text-muted mb-6">
          <span className="font-mono text-amber">@{username}</span> adında bir üye yok.
        </p>
        <ButtonLink href="/snippets">Arşive dön</ButtonLink>
      </Container>
    );
  }

  const { user, snippets, stats } = data;
  const joined = format(new Date(user.createdAt), 'MMMM yyyy', { locale: tr });

  const counters = [
    { label: 'snippet', value: stats.snippets },
    { label: 'görüntülenme', value: stats.views, icon: Eye },
    { label: 'beğeni', value: stats.likes, icon: Heart },
    { label: 'itibar', value: user.reputationScore, icon: Star },
  ];

  return (
    <Container className="py-10">
      <Link
        href="/snippets"
        className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-dim hover:text-amber transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        arşive dön
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-5">
            <span className="w-16 h-16 rounded-xs bg-amber/15 border border-amber-dim flex items-center justify-center text-amber font-mono text-[24px] font-bold shrink-0">
              {user.username[0].toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="font-mono text-[20px] font-bold truncate">
                  {user.fullName || user.username}
                </h1>
                {user.profileVerified && (
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-green bg-green/10 border border-green-dim/40 px-1.5 py-0.5 rounded-xs"
                    title="Doğrulanmış profil"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    doğrulanmış
                  </span>
                )}
              </div>

              <p className="font-mono text-[13px] text-dim mb-3">
                @{user.username} · {ROLE_LABEL[user.role] ?? user.role} · {joined} tarihinde katıldı
              </p>

              {user.bio && (
                <p className="text-[13.5px] text-muted leading-relaxed max-w-2xl mb-3">{user.bio}</p>
              )}

              {(user.githubUrl || user.websiteUrl) && (
                <div className="flex flex-wrap items-center gap-4">
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-dim hover:text-amber transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-dim hover:text-amber transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Web sitesi
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-line-soft">
            {counters.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-dim shrink-0" />}
                <span className="font-mono text-[15px] font-semibold text-amber">{value}</span>
                <span className="font-mono text-[11.5px] text-dim">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <h2 className="font-mono text-[13px] text-dim uppercase tracking-[0.08em] mb-5">
        Paylaşılan snippet&apos;ler
      </h2>

      {snippets.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="font-mono text-[26px] text-dim mb-3">∅</div>
          <p className="text-[13px] text-muted">
            {user.username} henüz yayınlanmış bir snippet paylaşmadı.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {snippets.map((snippet, index) => (
            <SnippetCard key={snippet.id} snippet={snippet} index={index} />
          ))}
        </div>
      )}
    </Container>
  );
}
