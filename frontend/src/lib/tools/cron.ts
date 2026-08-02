import cronstrue from 'cronstrue/i18n';
import { CronExpressionParser } from 'cron-parser';

export interface CronAnalysis {
  ok: boolean;
  /** İnsan tarafından okunabilir Türkçe açıklama. */
  description: string;
  /** Sonraki çalışma zamanları; hata durumunda boş. */
  nextRuns: Date[];
  error?: string;
}

export function analyzeCron(expression: string, count = 5): CronAnalysis {
  const trimmed = expression.trim();

  if (trimmed === '') {
    return { ok: false, description: '', nextRuns: [], error: 'İfade boş' };
  }

  let description: string;
  try {
    description = cronstrue.toString(trimmed, { locale: 'tr', use24HourTimeFormat: true });
  } catch (error) {
    return {
      ok: false,
      description: '',
      nextRuns: [],
      error: error instanceof Error ? error.message : 'Geçersiz cron ifadesi',
    };
  }

  // Açıklama üretilebilse bile ifade çalıştırılamıyor olabilir (örn. 31 Şubat).
  try {
    const iterator = CronExpressionParser.parse(trimmed);
    const nextRuns = Array.from({ length: count }, () => iterator.next().toDate());
    return { ok: true, description, nextRuns };
  } catch (error) {
    return {
      ok: false,
      description,
      nextRuns: [],
      error: error instanceof Error ? error.message : 'İfade çözümlenemedi',
    };
  }
}

export interface CronPreset {
  label: string;
  expression: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Her dakika', expression: '* * * * *' },
  { label: 'Her 5 dakikada', expression: '*/5 * * * *' },
  { label: 'Her saat başı', expression: '0 * * * *' },
  { label: 'Her gün 03:00', expression: '0 3 * * *' },
  { label: 'Her gün gece yarısı', expression: '0 0 * * *' },
  { label: 'Hafta içi 09:00', expression: '0 9 * * 1-5' },
  { label: 'Her pazartesi 08:30', expression: '30 8 * * 1' },
  { label: 'Ayın ilk günü', expression: '0 0 1 * *' },
  { label: 'Her çeyrek saatte', expression: '*/15 * * * *' },
];

/** Cron alanlarının sırası ve kabul ettiği aralıklar — form ve yardım metni için. */
export const CRON_FIELDS = [
  { name: 'Dakika', range: '0-59', example: '*/5' },
  { name: 'Saat', range: '0-23', example: '9' },
  { name: 'Ayın günü', range: '1-31', example: '*' },
  { name: 'Ay', range: '1-12', example: '*' },
  { name: 'Haftanın günü', range: '0-6 (0 = Pazar)', example: '1-5' },
] as const;
