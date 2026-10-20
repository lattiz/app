import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import {
  siteStockAssetsControllerImportPhotoMutation,
  stockControllerSearchOptions,
  type StockPhotoDto,
  type UploadedAssetResponseDto,
} from '@lattiz/api-client';
import { SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { uploadErrorMessage } from '@/lib/upload-errors';
import { cn } from '@/lib/utils';

const QUICK_SEARCHES = [
  'barbería',
  'restaurante',
  'clínica',
  'dentista',
  'salón de belleza',
  'tienda',
  'café',
  'oficina',
];
const DEBOUNCE_MS = 400;

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

function stockErrorMessage(error: unknown): string {
  const body = (error as ApiErrorBody | null | undefined)?.error;
  if (body?.code?.startsWith('STOCK_') && body.message) return body.message;
  return uploadErrorMessage(error);
}

function useDebounced(value: string, ms: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

interface StockPhotosDialogProps {
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The imported, optimized asset (already in R2). */
  onUse: (asset: UploadedAssetResponseDto, photo: StockPhotoDto) => void;
}

/** Pixabay search through the API; "Usar" imports by id so the site never hotlinks Pixabay. */
export function StockPhotosDialog({
  tenantId,
  open,
  onOpenChange,
  onUse,
}: StockPhotosDialogProps) {
  const [input, setInput] = useState(QUICK_SEARCHES[0]);
  const query = useDebounced(input.trim(), DEBOUNCE_MS);
  // Paging is per query: a new search starts again at page 1.
  const [paging, setPaging] = useState({ query, page: 1 });
  const page = paging.query === query ? paging.page : 1;
  const setPage = (next: number) => setPaging({ query, page: next });
  const searchable = query.length >= 2 && query.length <= 80;

  const results = useQuery({
    ...stockControllerSearchOptions({ query: { query, page, perPage: 24 } }),
    enabled: open && searchable,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const importPhoto = useMutation({
    ...siteStockAssetsControllerImportPhotoMutation(),
    onError: (error) => toast.error(stockErrorMessage(error)),
  });

  const handleUse = (photo: StockPhotoDto) => {
    importPhoto.mutate(
      { path: { tenantId }, body: { photoId: photo.id } },
      { onSuccess: (asset) => onUse(asset, photo) },
    );
  };

  const importingId = importPhoto.isPending
    ? importPhoto.variables?.body.photoId
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Fotos gratuitas</DialogTitle>
          <DialogDescription>
            Fotos proporcionadas por{' '}
            <a
              href="https://pixabay.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Pixabay
            </a>
            . Al usarla se optimiza y se guarda en tu sitio.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            maxLength={80}
            placeholder="Busca: corte de cabello, tacos, consultorio…"
            className="pl-9"
            onChange={(e) => setInput(e.target.value)}
            aria-label="Buscar fotos"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SEARCHES.map((term) => (
            <Button
              key={term}
              type="button"
              size="xs"
              variant={query === term ? 'default' : 'outline'}
              onClick={() => setInput(term)}
            >
              {term}
            </Button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {results.isError ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {stockErrorMessage(results.error)}
            </p>
          ) : results.isPending && searchable ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : results.data && results.data.photos.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Sin resultados. Prueba con otra palabra.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {results.data?.photos.map((photo) => (
                <li key={photo.id} className="group flex flex-col gap-1">
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                    {...(photo.avgColor
                      ? { style: { backgroundColor: photo.avgColor } }
                      : {})}
                  >
                    <img
                      src={photo.thumbUrl}
                      alt={photo.alt || 'Foto de Pixabay'}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className={cn(
                        'absolute right-2 bottom-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
                        importingId === photo.id && 'sm:opacity-100',
                      )}
                      disabled={importPhoto.isPending}
                      onClick={() => handleUse(photo)}
                    >
                      {importingId === photo.id && (
                        <Spinner data-icon="inline-start" />
                      )}
                      Usar
                    </Button>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    por{' '}
                    <a
                      href={photo.photographerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {photo.photographer}
                    </a>{' '}
                    en{' '}
                    <a
                      href={photo.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      Pixabay
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {results.data && (results.data.page > 1 || results.data.hasNext) && (
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || results.isFetching}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">Página {page}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!results.data.hasNext || results.isFetching}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
