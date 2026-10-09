import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  tenantsControllerSlugAvailabilityOptions,
  tenantsControllerSlugSuggestionOptions,
  type TenantMeResponseDto,
} from '@lattiz/api-client';
import { ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { displayHost } from '@/lib/site-address';
import { cn } from '@/lib/utils';
import { UpgradeGate } from '@/components/dashboard/home/UpgradeGate';
import { useUpdateSlug } from './hooks/useUpdateSlug';
import { slugCheckErrorMessage, slugReasonMessage } from './lib/slug-errors';

const DEBOUNCE_MS = 400;
const HINT = 'De 3 a 32 letras minúsculas, números o guiones.';

type Tone = 'muted' | 'success' | 'error';

const TONE_CLASS: Record<Tone, string> = {
  muted: 'text-muted-foreground',
  success: 'text-green-700 dark:text-green-400',
  error: 'text-destructive',
};

interface SiteAddressSectionProps {
  tenant: TenantMeResponseDto;
}

/** Lets the tenant pick the free `{slug}.lattiz.app` address. Rules live in the API; this only displays its verdict. */
export function SiteAddressSection({ tenant }: SiteAddressSectionProps) {
  const locked = !tenant.isEntitled;
  const [value, setValue] = useState(tenant.slug);
  const touched = useRef(false);
  const update = useUpdateSlug();

  // Everything after the slug, e.g. ".lattiz.app".
  const suffix = displayHost(tenant.previewUrl).slice(tenant.slug.length);

  const suggestion = useQuery({
    ...tenantsControllerSlugSuggestionOptions(),
    enabled: !locked && !tenant.slugIsCustom,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (!touched.current && suggestion.data) setValue(suggestion.data.slug);
  }, [suggestion.data]);

  const normalized = value.trim().toLowerCase();
  const debounced = useDebouncedValue(normalized, DEBOUNCE_MS);
  const isCurrent = normalized === tenant.slug;
  const isSettled = debounced === normalized;

  const availability = useQuery({
    ...tenantsControllerSlugAvailabilityOptions({ query: { slug: debounced } }),
    enabled: !locked && debounced !== '' && debounced !== tenant.slug,
    retry: false,
  });

  let tone: Tone = 'muted';
  let message = HINT;
  let canSave = false;
  if (normalized === '') {
    // keep the hint
  } else if (isCurrent) {
    message = tenant.slugIsCustom
      ? 'Esta es tu dirección actual.'
      : 'Esta dirección se generó automáticamente. Elige una que represente a tu negocio.';
  } else if (!isSettled || availability.isFetching) {
    message = 'Comprobando disponibilidad…';
  } else if (availability.isError) {
    tone = 'error';
    message = slugCheckErrorMessage(availability.error);
  } else if (availability.data) {
    if (availability.data.available) {
      tone = 'success';
      message = 'Disponible.';
      canSave = true;
    } else {
      tone = 'error';
      message = slugReasonMessage(availability.data.reason);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (canSave) update.mutate({ body: { slug: normalized } });
  };

  if (locked) {
    return (
      <Card data-tour="site-address-section">
        <CardHeader>
          <CardTitle>Dirección de tu sitio</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            render={
              <a
                href={tenant.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {displayHost(tenant.previewUrl)} <ExternalLinkIcon />
          </Button>
          <UpgradeGate reason="address" className="border-0 py-8" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-tour="site-address-section">
      <CardHeader>
        <CardTitle>Dirección de tu sitio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="max-w-xl text-sm text-muted-foreground">
            Es la dirección gratuita donde tu sitio queda en línea desde que lo
            publicas, aunque todavía no tengas un dominio propio.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="site-slug">Dirección</Label>
            <div className="flex items-center gap-2">
              <Input
                id="site-slug"
                value={value}
                maxLength={64}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={tone === 'error'}
                aria-describedby="site-slug-status"
                className="max-w-64"
                onChange={(e) => {
                  touched.current = true;
                  setValue(e.target.value);
                }}
              />
              <span className="text-sm text-muted-foreground">{suffix}</span>
            </div>
            <p
              id="site-slug-status"
              aria-live="polite"
              className={cn('min-h-4 text-xs', TONE_CLASS[tone])}
            >
              {message}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              render={
                <a
                  href={tenant.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {displayHost(tenant.previewUrl)} <ExternalLinkIcon />
            </Button>
            <Button type="submit" disabled={!canSave || update.isPending}>
              {update.isPending && <Spinner data-icon="inline-start" />}
              {update.isPending ? 'Guardando…' : 'Guardar dirección'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
