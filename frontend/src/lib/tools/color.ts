export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** #abc, #aabbcc ve başında # olmayan biçimleri kabul eder. */
export function parseHex(input: string): Rgb | null {
  const hex = input.trim().replace(/^#/, '');

  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

/** "232, 179, 74" veya "rgb(232 179 74)" gibi yazımları çözer. */
export function parseRgb(input: string): Rgb | null {
  const parts = input.match(/\d+(\.\d+)?/g);
  if (!parts || parts.length < 3) return null;

  const [r, g, b] = parts.slice(0, 3).map(Number);
  if ([r, g, b].some((v) => Number.isNaN(v) || v < 0 || v > 255)) return null;

  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

/** "39, 76%, 60%" veya "hsl(39 76% 60%)" gibi yazımları çözer. */
export function parseHsl(input: string): Hsl | null {
  const parts = input.match(/\d+(\.\d+)?/g);
  if (!parts || parts.length < 3) return null;

  const [h, s, l] = parts.slice(0, 3).map(Number);
  if ([h, s, l].some(Number.isNaN)) return null;
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;

  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
  }

  return { h: Math.round((h / 6) * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export const formatRgb = ({ r, g, b }: Rgb) => `${r}, ${g}, ${b}`;
export const formatHsl = ({ h, s, l }: Hsl) => `${h}°, ${s}%, ${l}%`;

/** Metin rengi seçimi için WCAG bağıl parlaklığı. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const channel = v / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
