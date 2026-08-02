import type { CSSProperties } from 'react';

const base: CSSProperties = {
  color: '#ede9e1',
  background: 'none',
  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
  fontSize: '12.5px',
  lineHeight: 1.75,
  direction: 'ltr',
  textAlign: 'left',
  whiteSpace: 'pre',
  wordSpacing: 'normal',
  wordBreak: 'normal',
  tabSize: 2,
  hyphens: 'none',
};

/**
 * react-syntax-highlighter (Prism) için terminal paletiyle uyumlu tema.
 * Renkler doğrudan tasarım token'larından türetilmiştir:
 * mavi = anahtar kelime, amber = fonksiyon/sınıf, yeşil = dize, sönük = yorum.
 */
export const fwtCodeTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': { ...base, padding: '1.25rem', margin: 0, overflow: 'auto' },

  comment: { color: '#635c4d', fontStyle: 'italic' },
  prolog: { color: '#635c4d' },
  doctype: { color: '#635c4d' },
  cdata: { color: '#635c4d' },

  punctuation: { color: '#948d7d' },
  operator: { color: '#948d7d' },
  entity: { color: '#948d7d' },
  url: { color: '#5fa8d3' },

  property: { color: '#e8b34a' },
  tag: { color: '#5fa8d3' },
  constant: { color: '#e8b34a' },
  symbol: { color: '#e8b34a' },
  deleted: { color: '#d3685f' },
  inserted: { color: '#6fb37a' },

  boolean: { color: '#d3685f' },
  number: { color: '#d3685f' },

  selector: { color: '#6fb37a' },
  'attr-name': { color: '#e8b34a' },
  string: { color: '#6fb37a' },
  char: { color: '#6fb37a' },
  builtin: { color: '#5fa8d3' },
  'attr-value': { color: '#6fb37a' },

  atrule: { color: '#5fa8d3' },
  keyword: { color: '#5fa8d3' },
  'class-name': { color: '#e8b34a' },

  function: { color: '#e8b34a' },
  regex: { color: '#6fb37a' },
  important: { color: '#d3685f', fontWeight: 'bold' },
  variable: { color: '#ede9e1' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
};
