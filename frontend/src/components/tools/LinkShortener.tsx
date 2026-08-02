'use client';

import { useState } from 'react';
import { ExternalLink, Link2, Loader2 } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/ui/Panel';
import { CopyButton } from '@/components/ui/CopyButton';

interface ShortLink {
  slug: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | null;
}

const EXPIRY_OPTIONS = [
  { value: '', label: 'süresiz' },
  { value: '1', label: '1 gün' },
  { value: '7', label: '7 gün' },
  { value: '30', label: '30 gün' },
  { value: '365', label: '1 yıl' },
];

export function LinkShortener() {
  const [url, setUrl] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [link, setLink] = useState<ShortLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Kısa link her zaman sitenin kendi kökünden servis edilir.
  const shortUrl = link
    ? `${typeof window === 'undefined' ? '' : window.location.origin}/s/${link.slug}`
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ link: ShortLink }>('/links/shorten', {
        url,
        expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      });
      setLink(response.link);
    } catch (err) {
      setLink(null);
      setError(getApiErrorMessage(err, 'Link kısaltılamadı'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Kısaltılacak adres" htmlFor="link-url">
          <Input
            id="link-url"
            tone="green"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://cok-uzun-bir-adres.com/yol/parametre?a=1&b=2"
            spellCheck={false}
          />
        </Field>

        <div className="flex items-end gap-3 flex-wrap">
          <Field label="Geçerlilik süresi" htmlFor="link-expiry" className="flex-1 min-w-[160px]">
            <Select
              id="link-expiry"
              tone="green"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            >
              {EXPIRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Button type="submit" variant="solid" disabled={isLoading || url === ''}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            Kısalt
          </Button>
        </div>
      </form>

      {error && (
        <ResultBox tone="danger">{error}</ResultBox>
      )}

      {link && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11.5px] text-dim">Kısa link</span>
              <CopyButton value={shortUrl} />
            </div>
            <ResultBox className="!text-[15px]">{shortUrl}</ResultBox>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap font-mono text-[11.5px] text-dim">
            <span className="truncate max-w-full">→ {link.originalUrl}</span>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green hover:underline shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              test et
            </a>
          </div>

          {link.expiresAt && (
            <p className="font-mono text-[11px] text-amber">
              Son kullanma: {new Date(link.expiresAt).toLocaleString('tr-TR')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
