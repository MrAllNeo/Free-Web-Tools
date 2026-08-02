export interface RegexMatch {
  value: string;
  start: number;
  end: number;
  groups: (string | undefined)[];
  named: Record<string, string | undefined>;
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[]; truncated: boolean }
  | { ok: false; error: string };

/** Tek bir desenin üretebileceği eşleşme sayısı sınırı — tarayıcıyı kilitlememek için. */
const MAX_MATCHES = 500;

export function runRegex(pattern: string, flags: string, text: string): RegexResult {
  if (pattern === '') return { ok: true, matches: [], truncated: false };

  let regex: RegExp;
  try {
    // Konum bilgisi için global bayrağı her zaman ekliyoruz; kullanıcı seçmese de
    // tüm eşleşmeleri taramamız gerekiyor.
    regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Geçersiz desen' };
  }

  const matches: RegexMatch[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
      groups: match.slice(1),
      named: match.groups ?? {},
    });

    // Sıfır uzunluklu eşleşme (örn. `a*`) lastIndex'i ilerletmez; elle ilerletmezsek
    // döngü sonsuza kadar aynı konumda kalır.
    if (match[0] === '') regex.lastIndex++;

    if (matches.length >= MAX_MATCHES) {
      return { ok: true, matches, truncated: true };
    }
  }

  return { ok: true, matches, truncated: false };
}

export interface TextSegment {
  text: string;
  matchIndex: number | null;
}

/** Test metnini eşleşen ve eşleşmeyen parçalara böler (vurgulama için). */
export function segmentText(text: string, matches: RegexMatch[]): TextSegment[] {
  if (matches.length === 0) return [{ text, matchIndex: null }];

  const segments: TextSegment[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    // Örtüşen eşleşmeler olmamalı ama sıfır uzunlukluları atlayarak güvende kalıyoruz.
    if (match.start < cursor || match.end === match.start) return;

    if (match.start > cursor) {
      segments.push({ text: text.slice(cursor, match.start), matchIndex: null });
    }
    segments.push({ text: text.slice(match.start, match.end), matchIndex: index });
    cursor = match.end;
  });

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), matchIndex: null });
  }

  return segments;
}

export const REGEX_FLAGS = [
  { flag: 'g', label: 'global', hint: 'tüm eşleşmeler' },
  { flag: 'i', label: 'ignoreCase', hint: 'büyük/küçük harf duyarsız' },
  { flag: 'm', label: 'multiline', hint: '^ ve $ satır başı/sonu' },
  { flag: 's', label: 'dotAll', hint: '. satır sonunu da kapsar' },
  { flag: 'u', label: 'unicode', hint: 'unicode kaçışları' },
] as const;
