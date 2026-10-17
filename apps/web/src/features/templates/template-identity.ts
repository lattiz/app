import type { TemplateGalleryItemDto } from '@lattiz/api-client';
import { filterByTier, type TierFilter } from './template-access';
import {
  TEMPLATE_IDENTITIES,
  type TemplateIdentity,
} from './template-identity.generated';

export type { TemplateIdentity };

const BY_ID = new Map(TEMPLATE_IDENTITIES.map((t) => [t.id, t]));

/** Kit identity of a template; null for templates that don't come from the kit. */
export function identityFor(id: string): TemplateIdentity | null {
  return BY_ID.get(id) ?? null;
}

export const ALL = 'all';

export interface TemplateFilters {
  tier: TierFilter;
  giro: string;
  direction: string;
}

export const NO_FILTERS: TemplateFilters = {
  tier: 'all',
  giro: ALL,
  direction: ALL,
};

export function filterTemplates(
  templates: readonly TemplateGalleryItemDto[],
  f: TemplateFilters,
): TemplateGalleryItemDto[] {
  return filterByTier(templates, f.tier).filter((t) => {
    const id = identityFor(t.id);
    if (f.giro !== ALL && id?.giro !== f.giro) return false;
    if (f.direction !== ALL && id?.direction?.id !== f.direction) return false;
    return true;
  });
}

/** Giros and directions present in the gallery the caller sees, sorted by label. */
export function filterOptions(templates: readonly TemplateGalleryItemDto[]): {
  giros: Record<string, string>;
  directions: Record<string, string>;
} {
  const giros = new Map<string, string>();
  const directions = new Map<string, string>();
  for (const t of templates) {
    const id = identityFor(t.id);
    if (!id) continue;
    giros.set(id.giro, id.giroLabel);
    if (id.direction) directions.set(id.direction.id, id.direction.name);
  }
  const sorted = (m: Map<string, string>) =>
    Object.fromEntries([...m].sort((a, b) => a[1].localeCompare(b[1], 'es')));
  return { giros: sorted(giros), directions: sorted(directions) };
}
