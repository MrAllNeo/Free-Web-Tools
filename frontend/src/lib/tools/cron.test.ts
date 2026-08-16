import { describe, expect, it } from 'vitest';
import { analyzeCron, CRON_PRESETS } from './cron';

describe('analyzeCron', () => {
  it('geçerli ifadeyi açıklar ve sonraki çalışmaları verir', () => {
    const result = analyzeCron('0 9 * * 1', 3);
    expect(result.ok).toBe(true);
    expect(result.description.length).toBeGreaterThan(0);
    expect(result.nextRuns).toHaveLength(3);
  });

  it('sonraki çalışmalar artan sırada ve gelecektedir', () => {
    const result = analyzeCron('*/5 * * * *', 3);
    expect(result.ok).toBe(true);
    expect(result.nextRuns[0].getTime()).toBeGreaterThan(Date.now() - 60_000);
    expect(result.nextRuns[1].getTime()).toBeGreaterThan(result.nextRuns[0].getTime());
    expect(result.nextRuns[2].getTime()).toBeGreaterThan(result.nextRuns[1].getTime());
  });

  it('boş ifadeyi ayrı bir hata olarak bildirir', () => {
    expect(analyzeCron('  ')).toMatchObject({ ok: false, error: 'İfade boş' });
  });

  it('geçersiz ifadeyi hata olarak bildirir', () => {
    const result = analyzeCron('bu bir cron değil');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.nextRuns).toEqual([]);
  });

  it('istenen sayıda çalışma döndürür', () => {
    expect(analyzeCron('0 0 * * *', 7).nextRuns).toHaveLength(7);
  });
});

describe('CRON_PRESETS', () => {
  it('hazır ifadelerin tamamı geçerlidir', () => {
    // Arayüzde tek tıkla seçilebilen bir hazır ifade bozuksa kullanıcı hata görür.
    for (const preset of CRON_PRESETS) {
      expect(analyzeCron(preset.expression, 1).ok, `${preset.label} → ${preset.expression}`).toBe(true);
    }
  });
});
