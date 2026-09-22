import { useState } from 'react';
import type { TenantBrandingDto } from '@lattiz/api-client';
import { GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateSiteSettings } from '@/hooks/use-branding';
import { cn } from '@/lib/utils';

// Hard ceilings mirror UpdateSiteSettingsDto; the recommended ranges below are
// guidance only and never block saving.
const TITLE_MAX = 70;
const DESCRIPTION_MAX = 200;
const SITE_NAME_MAX = 60;

type HintTone = 'muted' | 'success' | 'warning';

interface Hint {
  tone: HintTone;
  text: string;
}

const HINT_TONE_CLASS: Record<HintTone, string> = {
  muted: 'text-muted-foreground',
  success: 'text-green-700 dark:text-green-400',
  warning: 'text-yellow-700 dark:text-yellow-400',
};

function titleHint(count: number): Hint | null {
  if (count > 60) {
    return { tone: 'warning', text: 'Puede cortarse en los resultados de búsqueda.' };
  }
  if (count >= 50) return { tone: 'success', text: 'Buena longitud.' };
  if (count < 30) {
    return {
      tone: 'muted',
      text: 'Muy corto. Aprovecha más espacio en resultados de búsqueda.',
    };
  }
  return null;
}

function descriptionHint(count: number): Hint | null {
  if (count > 125) {
    return { tone: 'warning', text: 'Puede cortarse en los resultados de búsqueda.' };
  }
  if (count >= 80) return { tone: 'success', text: 'Buena longitud.' };
  return { tone: 'muted', text: 'Agrega más detalle para mejorar el CTR.' };
}

function HintText({ hint }: { hint: Hint | null }) {
  // min-h keeps the layout from jumping when a hint appears or disappears.
  return (
    <p className={cn('min-h-4 text-xs', hint && HINT_TONE_CLASS[hint.tone])}>
      {hint?.text}
    </p>
  );
}

interface SiteSeoFieldsProps {
  tenantId: string;
  tenantName: string;
  domain: string;
  branding: TenantBrandingDto;
}

export function SiteSeoFields({
  tenantId,
  tenantName,
  domain,
  branding,
}: SiteSeoFieldsProps) {
  const [title, setTitle] = useState(branding.seoTitle ?? '');
  const [description, setDescription] = useState(branding.seoDescription ?? '');
  const [siteName, setSiteName] = useState(branding.ogSiteName ?? '');
  const save = useUpdateSiteSettings();

  const isDirty =
    title !== (branding.seoTitle ?? '') ||
    description !== (branding.seoDescription ?? '') ||
    siteName !== (branding.ogSiteName ?? '');

  // Mirrors the tenant-sites fallbacks so the preview matches what gets served.
  const previewTitle = title.trim() || tenantName;
  const previewDescription = description.trim() || `Sitio web de ${tenantName}`;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    save.mutate({
      path: { tenantId },
      body: { title, description, ogSiteName: siteName },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium">Búsqueda y redes sociales</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="seo-title">Título</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {title.length}/60
              </span>
            </div>
            <Input
              id="seo-title"
              value={title}
              maxLength={TITLE_MAX}
              placeholder={tenantName}
              onChange={(e) => setTitle(e.target.value)}
            />
            <HintText hint={titleHint(title.length)} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="seo-description">Descripción</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {description.length}/125
              </span>
            </div>
            <Textarea
              id="seo-description"
              value={description}
              maxLength={DESCRIPTION_MAX}
              rows={3}
              placeholder={`Sitio web de ${tenantName}`}
              onChange={(e) => setDescription(e.target.value)}
            />
            <HintText hint={descriptionHint(description.length)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seo-site-name">Nombre del sitio</Label>
            <Input
              id="seo-site-name"
              value={siteName}
              maxLength={SITE_NAME_MAX}
              onChange={(e) => setSiteName(e.target.value)}
            />
            <HintText
              hint={
                siteName.trim()
                  ? null
                  : {
                      tone: 'warning',
                      text: 'Falta el nombre del sitio. Discord lo muestra arriba del título — sin él, la tarjeta se ve anónima.',
                    }
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            Vista previa
          </span>
          <div className="space-y-1 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-background">
                {branding.faviconLightUrl ? (
                  <img
                    src={branding.faviconLightUrl}
                    alt=""
                    className="size-4 object-contain"
                  />
                ) : (
                  <GlobeIcon className="size-3.5" />
                )}
              </span>
              <span className="truncate">{domain}</span>
            </div>
            <p className="line-clamp-1 text-lg text-blue-700 hover:underline dark:text-blue-400">
              {previewTitle}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {previewDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || save.isPending}>
          {save.isPending && <Spinner data-icon="inline-start" />}
          {save.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
