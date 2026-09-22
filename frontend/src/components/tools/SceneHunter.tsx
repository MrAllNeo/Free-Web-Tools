'use client';

import { useRef, useState } from 'react';
import { Loader2, Search, ShieldAlert, Upload, X } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field } from '@/components/ui/Field';
import { Card, ResultBox } from '@/components/ui/Panel';

type Category = 'all' | 'movie-tv' | 'anime';

interface SceneResult {
  title: string;
  episode: string | null;
  category: string;
  adult: boolean;
  source_name?: string;
  source_url?: string;
  timestamp?: string;
  similarity?: number;
  provider?: string;
  external?: boolean;
  preview_image?: string | null;
  preview_video?: string | null;
}

interface SearchResponse {
  query: { width?: number; height?: number };
  results: SceneResult[];
  indexed_frames: number;
  providers: { trace_moe: { requested: boolean; enabled: boolean; searched_frames: number } };
  external_error: string | null;
}

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CATEGORY_OPTIONS: [Category, string][] = [
  ['all', 'Tümü'],
  ['movie-tv', 'Film / Dizi'],
  ['anime', 'Anime'],
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function SceneHunter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [encodedImage, setEncodedImage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('all');
  const [allowAdult, setAllowAdult] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [confirmingAge, setConfirmingAge] = useState(false);
  const [useTraceMoe, setUseTraceMoe] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const traceAvailable = category === 'all' || category === 'anime';

  const handleFile = (candidate: File | null | undefined) => {
    if (!candidate) return;
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      setFileError('JPG, PNG veya WebP formatında bir görsel seç.');
      return;
    }
    if (candidate.size > MAX_FILE_BYTES) {
      setFileError('Görsel 12 MB sınırını aşıyor.');
      return;
    }
    setFileError(null);
    setFile(candidate);
    const reader = new FileReader();
    reader.onload = () => setEncodedImage(reader.result as string);
    reader.readAsDataURL(candidate);
  };

  const clearFile = () => {
    setFile(null);
    setEncodedImage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const toggleAdult = (checked: boolean) => {
    if (checked && !adultConfirmed) {
      setConfirmingAge(true);
      return;
    }
    setAllowAdult(checked);
  };

  const confirmAge = (confirmed: boolean) => {
    setConfirmingAge(false);
    if (confirmed) {
      setAdultConfirmed(true);
      setAllowAdult(true);
    }
  };

  const search = async () => {
    if (!encodedImage) return;
    setIsSearching(true);
    setError(null);
    try {
      const result = await api.post<SearchResponse>('/scene/search', {
        image_base64: encodedImage,
        category,
        allow_adult: allowAdult && adultConfirmed,
        use_trace_moe: useTraceMoe && traceAvailable,
        limit: 8,
      });
      setResponse(result);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Arama tamamlanamadı.'));
      setResponse(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Arama türü">
        {CATEGORY_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={`font-mono text-[12px] px-3 py-1.5 rounded-xs border transition-colors ${
              category === value
                ? 'bg-green text-bg border-green font-semibold'
                : 'bg-transparent text-muted border-line hover:border-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Field label="Ekran görüntüsü" hint="JPG, PNG veya WebP · en fazla 12 MB">
        {!file ? (
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-line rounded-sm px-4 py-8 cursor-pointer hover:border-green transition-colors">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <Upload className="w-5 h-5 text-dim" />
            <span className="font-mono text-[12.5px] text-muted">Görsel seç veya sürükle bırak</span>
          </label>
        ) : (
          <div className="flex items-center gap-3 border border-line-soft rounded-sm p-3">
            {encodedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={encodedImage}
                alt="Seçilen ekran görüntüsü"
                className="w-16 h-16 object-cover rounded-xs"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[12.5px] truncate">{file.name}</p>
              <p className="font-mono text-[11px] text-dim">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-dim hover:text-danger"
              aria-label="Görseli kaldır"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {fileError && <p className="mt-1.5 font-mono text-[11.5px] text-danger">{fileError}</p>}
      </Field>

      <div className="space-y-2">
        <Checkbox
          label={
            <span>
              <strong>18+ indeksini dahil et</strong>{' '}
              <span className="text-dim">— yalnızca reşit kullanıcılar</span>
            </span>
          }
          checked={allowAdult}
          onChange={(event) => toggleAdult(event.target.checked)}
        />
        <Checkbox
          label={
            <span>
              <strong>trace.moe anime araması</strong>{' '}
              <span className="text-dim">— görsel üçüncü taraf API&apos;ye gönderilir</span>
            </span>
          }
          checked={useTraceMoe}
          disabled={!traceAvailable}
          onChange={(event) => setUseTraceMoe(event.target.checked)}
        />
      </div>

      {confirmingAge && (
        <div className="border border-amber/40 rounded-md bg-raised p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-[14px]">Yetişkin indeksini açmak üzeresin</p>
                <p className="text-[12.5px] text-muted mt-1">
                  Devam ederek en az 18 yaşında olduğunu ve bu özelliği bulunduğun yerde
                  kullanabildiğini onaylarsın.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="solid" size="sm" onClick={() => confirmAge(true)}>
                  18 yaşından büyüğüm
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => confirmAge(false)}>
                  Vazgeç
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button type="button" variant="solid" onClick={search} disabled={!encodedImage || isSearching}>
        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        Sahneyi ara
      </Button>

      {error && <ResultBox tone="danger">{error}</ResultBox>}

      {response && (
        <div className="space-y-3">
          <p className="font-mono text-[11.5px] text-dim">
            Yerel: {response.indexed_frames.toLocaleString('tr-TR')} kare
            {response.providers.trace_moe.requested && !response.external_error &&
              ` · trace.moe: ${response.providers.trace_moe.searched_frames.toLocaleString('tr-TR')} kare`}
            {response.external_error && ' · trace.moe kullanılamadı'}
          </p>

          {response.results.length === 0 ? (
            <ResultBox tone="muted">Bu kareye uyan bir eşleşme bulunamadı.</ResultBox>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {response.results.map((item, index) => (
                <Card key={index} className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded-xs border ${
                        item.external ? 'text-green border-green/30' : 'text-muted border-line'
                      }`}
                    >
                      {item.external ? `CANLI · ${item.provider}` : 'YEREL İNDEKS'}
                    </span>
                    {typeof item.similarity === 'number' && (
                      <span className="font-mono text-[12px] text-amber">
                        %{Math.round(item.similarity)}
                      </span>
                    )}
                  </div>
                  {item.preview_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.preview_image}
                      alt=""
                      className="w-full h-28 object-cover rounded-xs"
                      loading="lazy"
                    />
                  )}
                  <p className="font-semibold text-[13.5px] break-words">{item.title}</p>
                  <p className="font-mono text-[11.5px] text-dim">
                    {item.source_name}
                    {item.episode ? ` · Bölüm ${item.episode}` : ''}
                    {item.timestamp ? ` · ${item.timestamp}` : ''}
                  </p>
                  <div className="flex gap-3">
                    {item.preview_video && (
                      <a
                        href={item.preview_video}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11.5px] text-green hover:underline"
                      >
                        Sahne klibi ↗
                      </a>
                    )}
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11.5px] text-green hover:underline"
                      >
                        Kaynağı aç ↗
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
