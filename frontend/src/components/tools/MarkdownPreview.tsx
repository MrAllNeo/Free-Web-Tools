'use client';

import { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Textarea } from '@/components/ui/Field';
import { CopyButton } from '@/components/ui/CopyButton';

const SAMPLE = `# Başlık

Bu bir **kalın** ve bu *italik* metin. Satır içi \`kod\` da böyle görünür.

## Liste

- Birinci madde
- İkinci madde
  - İç içe madde

1. Numaralı
2. Liste

## Kod bloğu

\`\`\`js
const merhaba = (isim) => \`Merhaba \${isim}\`;
\`\`\`

> Alıntı bloğu böyle görünür.

| Sütun | Değer |
|-------|-------|
| bir   | 1     |
| iki   | 2     |

[Bağlantı](https://github.com/MrAllNeo/Free-Web-Tools)
`;

/**
 * Terminal temasına uygun render eşlemesi.
 * @tailwindcss/typography eklemek yerine her öğeyi açıkça biçimlendiriyoruz —
 * böylece tasarım token'larıyla birebir tutarlı kalıyor.
 */
const components: Components = {
  h1: (props) => <h1 className="font-mono text-[24px] font-bold mt-6 mb-3 first:mt-0" {...props} />,
  h2: (props) => (
    <h2
      className="font-mono text-[19px] font-semibold mt-6 mb-2.5 pb-2 border-b border-line-soft first:mt-0"
      {...props}
    />
  ),
  h3: (props) => <h3 className="font-mono text-[16px] font-semibold mt-5 mb-2" {...props} />,
  p: (props) => <p className="text-[14px] text-muted leading-relaxed my-3" {...props} />,
  a: (props) => (
    <a className="text-green hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  strong: (props) => <strong className="text-fg font-semibold" {...props} />,
  em: (props) => <em className="text-fg italic" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 my-3 space-y-1.5 text-[14px] text-muted" {...props} />,
  ol: (props) => (
    <ol className="list-decimal pl-5 my-3 space-y-1.5 text-[14px] text-muted" {...props} />
  ),
  li: (props) => <li className="leading-relaxed marker:text-amber-dim" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-amber-dim pl-4 my-4 text-[14px] text-dim italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="font-mono text-[12.5px] text-amber bg-inset border border-line-soft rounded-xs px-1.5 py-0.5"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="bg-inset border border-line-soft rounded-sm p-4 my-4 overflow-x-auto [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-green"
      {...props}
    />
  ),
  hr: () => <hr className="border-line-soft my-6" />,
  table: (props) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border border-line-soft text-[13px]" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="bg-inset border border-line-soft px-3 py-2 text-left font-mono text-[11.5px] text-dim uppercase tracking-[0.06em]"
      {...props}
    />
  ),
  td: (props) => <td className="border border-line-soft px-3 py-2 text-muted" {...props} />,
};

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(SAMPLE);

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="md-input" className="font-mono text-[11.5px] text-dim">
              Markdown
            </label>
            <CopyButton value={markdown} />
          </div>
          <Textarea
            id="md-input"
            tone="green"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            className="min-h-[440px] text-[12.5px]"
          />
        </div>

        <div>
          <span className="block font-mono text-[11.5px] text-dim mb-1.5">Önizleme</span>
          <div className="bg-inset border border-line-soft rounded-sm p-5 min-h-[440px] max-h-[560px] overflow-y-auto">
            <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
