import { describe, expect, it } from 'vitest';
import { formatDuration, getYouTubeId, getYouTubeThumbnail } from './video';

describe('getYouTubeId', () => {
  it('bilinen tüm bağlantı biçimlerinden kimliği çıkarır', () => {
    const id = 'dQw4w9WgXcQ';
    expect(getYouTubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(getYouTubeId(`https://youtu.be/${id}`)).toBe(id);
    expect(getYouTubeId(`https://www.youtube.com/embed/${id}`)).toBe(id);
    expect(getYouTubeId(`https://www.youtube.com/shorts/${id}`)).toBe(id);
    expect(getYouTubeId(`https://www.youtube.com/live/${id}`)).toBe(id);
  });

  it('ek sorgu parametreleri kimliği bozmaz', () => {
    expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')).toBe('dQw4w9WgXcQ');
  });

  it('boş ve YouTube olmayan adreslerde null döner', () => {
    expect(getYouTubeId(null)).toBeNull();
    expect(getYouTubeId(undefined)).toBeNull();
    expect(getYouTubeId('')).toBeNull();
    expect(getYouTubeId('https://vimeo.com/12345')).toBeNull();
  });
});

describe('getYouTubeThumbnail', () => {
  it('kimlik varsa kapak adresini kurar', () => {
    expect(getYouTubeThumbnail('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    );
  });

  it('kimlik yoksa null döner', () => {
    expect(getYouTubeThumbnail('https://example.com')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('bir saatin altını dakika:saniye gösterir', () => {
    expect(formatDuration(504)).toBe('08:24');
  });

  it('bir saatin üstünü saat:dakika:saniye gösterir', () => {
    expect(formatDuration(4900)).toBe('1:21:40');
  });

  it('geçersiz ve boş değerlerde null döner', () => {
    expect(formatDuration(0)).toBeNull();
    expect(formatDuration(-5)).toBeNull();
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(undefined)).toBeNull();
  });
});
