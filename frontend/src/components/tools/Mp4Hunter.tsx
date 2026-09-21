'use client';

import { useEffect, useState } from 'react';
import { Bug, Download, Loader2, Search, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import { api, getApiErrorMessage } from '@/lib/api';
import { Button, buttonClass } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { ResultBox } from '@/components/ui/Panel';

interface Analysis {
  id: string;
  title: string;
  duration?: number;
  source?: string;
  qualities: number[];
  size?: number;
  route: 'direct' | 'proton';
}

interface DownloadJob {
  id: string;
  title: string;
  height?: number;
  status: string;
  message?: string;
  percent?: number;
  size?: number;
  code?: string;
  retryable?: boolean;
  route: 'direct' | 'proton';
  queue_position?: number;
}

const STORAGE_KEY = 'fwt-mp4-job-v1';
const ACTIVE_STATUSES = new Set(['queued', 'processing', 'paused']);

function formatBytes(value?: number) {
  if (!value || value < 1) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unit = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** unit).toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatDuration(value?: number) {
  if (!value || value < 1) return '—';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function technicalDetails(error: unknown) {
  if (!error || typeof error !== 'object') return null;
  const body = error as Record<string, unknown>;
  const details = {
    status: body.status,
    code: body.code,
    retryable: body.retryable,
    diagnostic: body.diagnostic,
  };
  return Object.values(details).some((value) => value !== undefined) ? details : null;
}

export function Mp4Hunter() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [quality, setQuality] = useState('');
  const [job, setJob] = useState<DownloadJob | null>(null);
  const [events, setEvents] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId || !/^[a-f0-9]{32}$/.test(savedId)) return;
    api.get<{ job: DownloadJob }>(`/media/downloads/${savedId}`)
      .then((response) => setJob(response.job))
      .catch(() => localStorage.removeItem(STORAGE_KEY));
  }, []);

  useEffect(() => {
    const id = job?.id;
    if (!id || !ACTIVE_STATUSES.has(job.status)) return;

    let disposed = false;
    const refresh = async () => {
      try {
        const response = await api.get<{ job: DownloadJob }>(`/media/downloads/${id}`);
        if (!disposed) setJob(response.job);
      } catch (caught) {
        if (!disposed) {
          setError(getApiErrorMessage(caught, 'İşlem durumu alınamadı.'));
          setErrorDetails(technicalDetails(caught));
        }
      }
    };

    const timer = window.setInterval(refresh, 1_500);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [job?.id, job?.status]);

  const analyze = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsAnalyzing(true);
    setAnalysis(null);
    setEvents(null);
    setError(null);
    setErrorDetails(null);
    try {
      const response = await api.post<{ analysis: Analysis }>('/media/analyze', { url });
      setAnalysis(response.analysis);
      setQuality('');
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Video bağlantısı analiz edilemedi.'));
      setErrorDetails(technicalDetails(caught));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startDownload = async () => {
    if (!analysis) return;
    setIsStarting(true);
    setError(null);
    setErrorDetails(null);
    try {
      const response = await api.post<{ job: DownloadJob }>('/media/downloads', {
        analysis_id: analysis.id,
        height: quality ? Number(quality) : null,
      });
      setJob(response.job);
      localStorage.setItem(STORAGE_KEY, response.job.id);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'İndirme işlemi başlatılamadı.'));
      setErrorDetails(technicalDetails(caught));
    } finally {
      setIsStarting(false);
    }
  };

  const cancelDownload = async () => {
    if (!job) return;
    try {
      const response = await api.delete<{ job: DownloadJob }>(`/media/downloads/${job.id}`);
      setJob(response.job);
      localStorage.removeItem(STORAGE_KEY);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'İşlem iptal edilemedi.'));
      setErrorDetails(technicalDetails(caught));
    }
  };

  const loadEvents = async () => {
    if (!job) return;
    setIsLoadingEvents(true);
    try {
      const response = await api.get<{ details: unknown }>(`/media/downloads/${job.id}/events`);
      setEvents(response.details);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Test ayrıntıları alınamadı.'));
      setErrorDetails(technicalDetails(caught));
    } finally {
      setIsLoadingEvents(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={analyze} className="space-y-4">
        <Field
          label="Videonun bulunduğu bağlantı"
          htmlFor="mp4-url"
          hint="Yalnızca herkese açık ve DRM ile korunmayan içerikler desteklenir."
        >
          <Input
            id="mp4-url"
            tone="green"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://ornek.com/video/..."
            spellCheck={false}
          />
        </Field>
        <Button type="submit" variant="solid" disabled={isAnalyzing || url === ''}>
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Videoyu bul
        </Button>
      </form>

      {error && (
        <ResultBox tone="danger" className="space-y-2">
          <p>{error}</p>
          {errorDetails !== null && (
            <details>
              <summary className="cursor-pointer text-[11.5px]">Teknik hata ayrıntıları</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-[10.5px] text-muted">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </details>
          )}
        </ResultBox>
      )}

      {analysis && (
        <div className="bg-inset border border-line-soft rounded-sm p-4 space-y-4">
          <div>
            <p className="font-semibold text-[15px] break-words">{analysis.title}</p>
            <p className="font-mono text-[11.5px] text-dim mt-1">
              süre {formatDuration(analysis.duration)} · tahmini boyut {formatBytes(analysis.size)} · rota {analysis.route}
            </p>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <Field label="Kalite" htmlFor="mp4-quality" className="flex-1 min-w-[180px]">
              <Select
                id="mp4-quality"
                tone="green"
                value={quality}
                onChange={(event) => setQuality(event.target.value)}
              >
                <option value="">En iyi kalite</option>
                {analysis.qualities.map((height) => (
                  <option key={height} value={height}>{height}p&apos;ye kadar</option>
                ))}
              </Select>
            </Field>
            <Button type="button" variant="solid" onClick={startDownload} disabled={isStarting}>
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              MP4 hazırla
            </Button>
          </div>
        </div>
      )}

      {job && (
        <div className="border border-line-soft rounded-sm p-4 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-[14px] break-words">{job.title}</p>
              <p className="font-mono text-[11.5px] text-dim mt-1">
                {job.height ? `${job.height}p` : 'en iyi kalite'} · {job.route}
              </p>
            </div>
            <span className="font-mono text-[11.5px] text-green border border-green/30 rounded-xs px-2 py-1">
              {job.status}
            </span>
          </div>

          {typeof job.percent === 'number' && (
            <div
              className="h-1.5 rounded-full bg-line-soft overflow-hidden"
              role="progressbar"
              aria-label="İndirme ilerlemesi"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.max(0, Math.min(100, job.percent))}
            >
              <div className="h-full bg-green transition-all" style={{ width: `${Math.max(0, Math.min(100, job.percent))}%` }} />
            </div>
          )}
          <p className="text-[13px] text-muted">
            {job.message || (job.queue_position ? `Kuyrukta ${job.queue_position}. sırada.` : 'İşlem güncelleniyor…')}
          </p>
          {job.code && <p className="font-mono text-[11px] text-danger">kod: {job.code}</p>}

          <div className="flex gap-2 flex-wrap">
            {job.status === 'complete' && (
              <a
                href={`${API_URL}/media/downloads/${job.id}/file`}
                className={buttonClass('solid', 'md')}
              >
                <Download className="w-4 h-4" /> MP4 indir
              </a>
            )}
            {ACTIVE_STATUSES.has(job.status) && (
              <Button type="button" variant="danger" onClick={cancelDownload}>
                <Trash2 className="w-4 h-4" /> İptal et
              </Button>
            )}
            <Button type="button" onClick={loadEvents} disabled={isLoadingEvents}>
              {isLoadingEvents ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
              Test ayrıntıları
            </Button>
          </div>
        </div>
      )}

      {events !== null && (
        <details open className="bg-inset border border-line-soft rounded-sm p-4">
          <summary className="font-mono text-[11.5px] text-green cursor-pointer">İşlem günlüğü</summary>
          <pre className="mt-3 max-h-[360px] overflow-auto whitespace-pre-wrap break-words font-mono text-[10.5px] text-muted">
            {JSON.stringify(events, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
