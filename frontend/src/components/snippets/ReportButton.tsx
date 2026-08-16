'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Field, Select, Textarea } from '@/components/ui/Field';
import type { ReportReason } from '@/lib/types';

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'malicious', label: 'Zararlı ya da kötü niyetli kod' },
  { value: 'spam', label: 'Spam veya alakasız içerik' },
  { value: 'offensive', label: 'Saldırgan veya uygunsuz' },
  { value: 'copyright', label: 'Telif ihlali' },
  { value: 'other', label: 'Diğer' },
];

/**
 * İçerik bildirme.
 *
 * Moderasyon yalnızca yayın öncesi çalışıyordu; yayımlandıktan sonra kötüye
 * kullanımı yakalamanın başka yolu yoktu. Özellikle hacking kategorisi için gerekli.
 */
export function ReportButton({
  snippetId,
  commentId,
  label = 'bildir',
}: {
  snippetId?: string;
  commentId?: string;
  label?: string;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('malicious');
  const [details, setDetails] = useState('');
  const [isSending, setIsSending] = useState(false);

  const open = () => {
    // Anonim bildirime izin vermek, kuyruğu doldurmak için bedava bir araç olurdu.
    if (!isAuthenticated) {
      toast('Bildirmek için giriş yapman gerekiyor.');
      router.push('/auth/login');
      return;
    }
    setIsOpen(true);
  };

  const submit = async () => {
    setIsSending(true);
    try {
      const res = await api.post<{ alreadyReported?: boolean }>('/reports', {
        snippetId,
        commentId,
        reason,
        details: details.trim() || undefined,
      });
      toast.success(
        res.alreadyReported
          ? 'Bunu zaten bildirmiştin, inceleniyor.'
          : 'Bildirimin alındı, teşekkürler.'
      );
      setIsOpen(false);
      setDetails('');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Bildirim gönderilemedi'));
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={open}
        className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-dim hover:text-danger transition-colors cursor-pointer"
      >
        <Flag className="w-3 h-3" />
        {label}
      </button>
    );
  }

  return (
    <div className="mt-3 p-4 bg-raised border border-danger/40 rounded-sm space-y-3">
      <p className="font-mono text-[12px] text-danger">İçeriği bildir</p>

      <Field label="Sebep" htmlFor="report-reason">
        <Select
          id="report-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as ReportReason)}
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Ayrıntı" htmlFor="report-details" hint="isteğe bağlı">
        <Textarea
          id="report-details"
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Sorunun ne olduğunu kısaca yaz…"
        />
      </Field>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSending}>
          Vazgeç
        </Button>
        <Button variant="solid" onClick={submit} disabled={isSending}>
          {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
          Gönder
        </Button>
      </div>
    </div>
  );
}
