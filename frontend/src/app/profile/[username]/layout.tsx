import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/constants';

interface ProfileMeta {
  user: { username: string; fullName?: string; bio?: string };
  stats: { snippets: number };
}

/** Aynı istek içinde iki kez çağrılır (metadata + layout); Next fetch'i tekilleştirir. */
const fetchProfile = (username: string) =>
  fetch(`${API_URL}/users/${encodeURIComponent(username)}`, { next: { revalidate: 300 } });

/**
 * Profil sayfası istemci bileşeni olduğu için metadata'yı bu layout üretiyor —
 * paylaşılan profil linklerinin önizlemesi ve arama motorları için gerekli.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  try {
    const response = await fetchProfile(username);

    if (!response.ok) return { title: 'Kullanıcı bulunamadı' };

    const { user, stats } = (await response.json()) as ProfileMeta;
    const name = user.fullName || user.username;
    const description =
      user.bio ?? `@${user.username} kullanıcısının paylaştığı ${stats.snippets} snippet.`;

    return {
      title: `${name} (@${user.username})`,
      description,
      alternates: { canonical: `/profile/${username}` },
      openGraph: { type: 'profile', title: name, description },
    };
  } catch {
    // API kapalıyken build ve render kırılmasın.
    return { title: 'Profil' };
  }
}

/**
 * Olmayan bir kullanıcıda gerçek 404 döndürür.
 *
 * Sayfanın kendisi istemci bileşeni olduğu için orada `notFound()` çağrılamıyor;
 * o yol 200 ile "bulunamadı" ekranı gösterirdi — yani yumuşak 404. Arama motorları
 * bunu geçerli sayfa sanar ve dizine ekler.
 *
 * API kapalıyken 404 basmıyoruz: geçici bir kesinti kalıcı bir "yok" sinyaline dönüşmemeli.
 */
export default async function PublicProfileLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let missing = false;
  try {
    missing = (await fetchProfile(username)).status === 404;
  } catch {
    missing = false;
  }

  // notFound() istisna fırlatarak çalışır; try bloğunun dışında çağrılmalı.
  if (missing) notFound();

  return children;
}
