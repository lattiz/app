import { useRef, useState } from 'react';
import type { TenantBrandingDto } from '@lattiz/api-client';
import { ImageIcon, UploadIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  BRANDING_RULES,
  type BrandingType,
  useRemoveBranding,
  useUploadBranding,
} from '@/hooks/use-branding';
import { cn } from '@/lib/utils';

interface SiteImagesSectionProps {
  tenantId: string;
  branding: TenantBrandingDto;
}

interface UploadSlotProps {
  type: BrandingType;
  label: string;
  url: string | null;
  busy: boolean;
  aspect: string;
  onFile: (type: BrandingType, file: File) => void;
  onRemove: (type: BrandingType) => void;
}

function UploadSlot({
  type,
  label,
  url,
  busy,
  aspect,
  onFile,
  onRemove,
}: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 max-h-48">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {url && !busy && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label={`Quitar ${label}`}
            onClick={() => onRemove(type)}
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/30',
          aspect,
        )}
      >
        {url ? (
          <img
            src={url}
            alt={label}
            className="size-full object-contain p-2"
          />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground/60" />
        )}

        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Spinner className="size-5" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={BRANDING_RULES[type].accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the same file twice still fires onChange.
          event.target.value = '';
          if (file) onFile(type, file);
        }}
      />

      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon className="size-3.5" />
        {url ? 'Reemplazar' : 'Subir'}
      </Button>
    </div>
  );
}

export function SiteImagesSection({
  tenantId,
  branding,
}: SiteImagesSectionProps) {
  const [pending, setPending] = useState<BrandingType | null>(null);
  const upload = useUploadBranding();
  const remove = useRemoveBranding();

  const handleFile = (type: BrandingType, file: File): void => {
    const rule = BRANDING_RULES[type];
    if (!rule.mimeTypes.includes(file.type)) {
      toast.error('Formato no admitido para esta imagen.');
      return;
    }
    if (file.size > rule.maxBytes) {
      toast.error(
        `La imagen supera el máximo de ${Math.round(rule.maxBytes / 1024 / 1024)}MB.`,
      );
      return;
    }

    setPending(type);
    upload.mutate(
      { path: { tenantId }, body: { type, file } },
      { onSettled: () => setPending(null) },
    );
  };

  const handleRemove = (type: BrandingType): void => {
    setPending(type);
    remove.mutate(
      { path: { tenantId, type } },
      { onSettled: () => setPending(null) },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes del sitio</CardTitle>
        <CardDescription>
          El favicon y la vista previa que se muestran al compartir tu sitio.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">Favicon</p>
            <span className="text-xs text-muted-foreground">64 × 64 px</span>
          </div>
          <div className="flex gap-4">
            <UploadSlot
              type="favicon_light"
              label="Claro"
              url={branding.faviconLightUrl}
              busy={pending === 'favicon_light'}
              aspect="aspect-square max-w-32"
              onFile={handleFile}
              onRemove={handleRemove}
            />
            <UploadSlot
              type="favicon_dark"
              label="Oscuro"
              url={branding.faviconDarkUrl}
              busy={pending === 'favicon_dark'}
              aspect="aspect-square max-w-32"
              onFile={handleFile}
              onRemove={handleRemove}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">Vista previa social</p>
            <span className="text-xs text-muted-foreground">1200 × 630 px</span>
          </div>
          <UploadSlot
            type="social_preview"
            label="Imagen al compartir"
            url={branding.socialPreviewUrl}
            busy={pending === 'social_preview'}
            aspect="aspect-[20/9]"
            onFile={handleFile}
            onRemove={handleRemove}
          />
          {!branding.socialPreviewUrl && (
            <p className="text-xs text-muted-foreground">
              Sin imagen propia se usa la vista previa generada automáticamente.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
