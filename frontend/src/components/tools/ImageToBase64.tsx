'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/ui/Panel';
import { CopyButton } from '@/components/ui/CopyButton';
import { fileToDataUri, formatBytes } from '@/lib/tools/base64';

/** Tarayıcı belleğini ve pano sınırlarını zorlamamak için üst sınır. */
const MAX_BYTES = 5 * 1024 * 1024;

interface LoadedImage {
  name: string;
  size: number;
  type: string;
  dataUri: string;
}

export function ImageToBase64() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Yalnızca görsel dosyaları desteklenir');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`Dosya çok büyük (en fazla ${formatBytes(MAX_BYTES)})`);
      return;
    }

    try {
      const dataUri = await fileToDataUri(file);
      setImage({ name: file.name, size: file.size, type: file.type, dataUri });
    } catch {
      toast.error('Dosya okunamadı');
    }
  };

  const snippets = image
    ? [
        { label: 'Data URI', value: image.dataUri },
        { label: 'HTML', value: `<img src="${image.dataUri}" alt="" />` },
        { label: 'CSS', value: `background-image: url("${image.dataUri}");` },
      ]
    : [];

  return (
    <div className="space-y-4">
      {!image ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void load(e.dataTransfer.files[0]);
          }}
          className={`border border-dashed rounded-sm p-12 text-center transition-colors ${
            isDragging ? 'border-green bg-green/6' : 'border-line'
          }`}
        >
          <Upload className="w-7 h-7 text-dim mx-auto mb-3" />
          <p className="text-[13.5px] text-muted mb-1">Görseli buraya sürükle</p>
          <p className="font-mono text-[11.5px] text-dim mb-5">
            PNG, JPG, SVG, WebP · en fazla {formatBytes(MAX_BYTES)}
          </p>
          <Button onClick={() => inputRef.current?.click()}>Dosya seç</Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void load(e.target.files?.[0])}
          />
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 bg-inset border border-line-soft rounded-sm p-4">
            {/* Data URI'yi next/image işleyemez; düz img gerekli. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.dataUri}
              alt=""
              className="w-20 h-20 object-contain bg-raised border border-line-soft rounded-xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold truncate">{image.name}</p>
              <p className="font-mono text-[11.5px] text-dim mt-1">
                {image.type} · {formatBytes(image.size)} → {formatBytes(image.dataUri.length)} data
                URI
              </p>
              <p className="font-mono text-[11px] text-muted mt-2">
                Base64 kodlama boyutu yaklaşık %33 büyütür.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label="Görseli kaldır"
              className="p-1.5 text-dim hover:text-danger transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {snippets.map((snippet) => (
            <div key={snippet.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11.5px] text-dim">{snippet.label}</span>
                <CopyButton value={snippet.value} />
              </div>
              <ResultBox className="max-h-[110px] overflow-y-auto text-[11.5px]">
                {snippet.value}
              </ResultBox>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
