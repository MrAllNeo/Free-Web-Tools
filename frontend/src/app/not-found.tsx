import { ArrowLeft, Home } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="font-mono text-[72px] font-bold text-amber leading-none mb-4">404</div>
        <h1 className="font-mono text-[20px] font-semibold mb-2">Sayfa bulunamadı</h1>
        <p className="text-[13.5px] text-muted mb-8">
          Aradığın sayfa mevcut değil ya da taşınmış olabilir.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <ButtonLink href="/" variant="solid">
            <Home className="w-4 h-4" />
            Ana sayfa
          </ButtonLink>
          <ButtonLink href="/snippets" variant="ghost">
            <ArrowLeft className="w-4 h-4" />
            Snippet arşivi
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
