'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '@/lib/api';
import { SNIPPET_CATEGORIES, LANGUAGES, DIFFICULTIES, SORT_OPTIONS } from '@/lib/constants';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import type { SnippetsResponse } from '@/lib/types';

export default function SnippetsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-amber animate-spin" />
        </div>
      }
    >
      <SnippetsContent />
    </Suspense>
  );
}

function SnippetsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Kategori adres çubuğunda tutulur: hem navbar'dan gelen ?category= bağlantısı
  // doğrudan çalışır hem de filtrelenmiş liste paylaşılabilir olur.
  const category = searchParams.get('category') ?? '';

  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Her tuş vuruşunda istek atmamak için arama 300ms geciktirilir.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Her filtre değişikliği listeyi baştan başlatır; sayfa sıfırlaması
  // efekt yerine doğrudan olay işleyicilerinde yapılır.
  const selectCategory = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('category', next);
    else params.delete('category');

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const changeLanguage = (value: string) => {
    setLanguage(value);
    setPage(1);
  };

  const changeDifficulty = (value: string) => {
    setDifficulty(value);
    setPage(1);
  };

  const changeSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '12');
    if (category) params.set('category', category);
    if (language) params.set('language', language);
    if (difficulty) params.set('difficulty', difficulty);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sort) params.set('sort', sort);
    return params.toString();
  }, [page, category, language, difficulty, debouncedSearch, sort]);

  const { data, isLoading, error } = useQuery<SnippetsResponse>({
    queryKey: ['snippets', page, category, language, difficulty, debouncedSearch, sort],
    queryFn: () => api.get<SnippetsResponse>(`/snippets?${buildQuery()}`),
  });

  const clearFilters = () => {
    setSearch('');
    setLanguage('');
    setDifficulty('');
    setSort('latest');
    selectCategory('');
  };

  const hasActiveFilters = Boolean(category || language || difficulty || debouncedSearch);

  return (
    <Container>
      {/* Başlık */}
      <div className="py-12 border-b border-line-soft">
        <div className="eyebrow mb-5">arşiv</div>
        <h1 className="font-mono text-[32px] sm:text-[38px] font-bold leading-[1.14] tracking-[-0.02em]">
          Snippet <span className="text-amber">arşivi</span>
        </h1>
        <p className="text-muted text-[15px] mt-3">
          {data ? `${data.pagination.total} snippet listeleniyor` : 'Yükleniyor…'}
        </p>
      </div>

      {/* Arama + sıralama */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="snippet, etiket veya dil ara…"
            className="w-full bg-inset border border-line rounded-sm pl-9 pr-9 py-2.5 font-mono text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-amber transition-colors"
          />
          {search && (
            <button
              onClick={() => changeSearch('')}
              aria-label="Aramayı temizle"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-dim hover:text-fg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtreler
        </Button>

        <Select
          value={sort}
          onChange={(e) => changeSort(e.target.value)}
          aria-label="Sıralama"
          className="sm:w-48"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Filtreler */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-3`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-inset border border-line-soft rounded-sm">
            <button
              onClick={() => selectCategory('')}
              className={`font-mono text-[12px] px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                !category ? 'bg-amber text-bg font-semibold' : 'text-muted hover:text-fg'
              }`}
            >
              tümü
            </button>
            {SNIPPET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(category === cat.id ? '' : cat.id)}
                className={`font-mono text-[12px] px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                  category === cat.id
                    ? 'bg-amber text-bg font-semibold'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {cat.label.toLowerCase()}
              </button>
            ))}
          </div>

          <Select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            aria-label="Dil filtresi"
            className="!w-auto min-w-[150px]"
          >
            <option value="">tüm diller</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Select>

          <Select
            value={difficulty}
            onChange={(e) => changeDifficulty(e.target.value)}
            aria-label="Seviye filtresi"
            className="!w-auto min-w-[150px]"
          >
            <option value="">tüm seviyeler</option>
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </Select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 font-mono text-[12px] text-danger hover:opacity-80 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              filtreleri temizle
            </button>
          )}
        </div>
      </div>

      {/* Sonuçlar */}
      <div className="py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-amber animate-spin" />
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="font-mono text-[14px] text-danger mb-3">Snippet&apos;ler yüklenemedi.</p>
            <p className="text-[13px] text-muted">
              API sunucusu çalışmıyor olabilir:{' '}
              <code className="font-mono text-amber bg-inset border border-line-soft px-1.5 py-0.5 rounded-xs">
                npm run dev:backend
              </code>
            </p>
          </div>
        ) : data && data.snippets.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.snippets.map((snippet, index) => (
                <SnippetCard key={snippet.id} snippet={snippet} index={index} />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                  ← önceki
                </Button>
                <span className="font-mono text-[12.5px] text-dim">
                  {page} / {data.pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.pagination.totalPages}
                >
                  sonraki →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="font-mono text-[28px] text-dim mb-3">∅</div>
            <h2 className="font-mono text-[16px] font-semibold mb-2">Sonuç bulunamadı</h2>
            <p className="text-[13px] text-muted mb-6">Arama veya filtre kriterlerini değiştirin.</p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="solid">
                filtreleri temizle
              </Button>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
