import type { AdminRole } from '@/lib/navigation';

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 24;
const MAX_NOTES = 2000;

export type TenantSiteStatus = 'active' | 'inactive' | 'cancelled';

export type TenantActionSet = {
  suspend: boolean;
  reactivate: boolean;
  notes: boolean;
};

export function tenantActionSet(
  role: AdminRole,
  status: TenantSiteStatus,
): TenantActionSet {
  const staff = role === 'owner' || role === 'operator';
  return {
    suspend: staff && status === 'active',
    reactivate: staff && status === 'inactive',
    notes: staff,
  };
}

export type TagAddResult = {
  tags: string[];
  error: string | null;
};

export function addFreeTag(tags: readonly string[], raw: string): TagAddResult {
  const tag = raw.trim();
  if (!tag) return { tags: [...tags], error: 'Escribe una etiqueta.' };
  if (tag.length > MAX_TAG_LENGTH) {
    return {
      tags: [...tags],
      error: 'Cada etiqueta puede tener hasta 24 caracteres.',
    };
  }
  if (tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
    return { tags: [...tags], error: null };
  }
  if (tags.length >= MAX_TAGS) {
    return { tags: [...tags], error: 'Puedes poner hasta 10 etiquetas.' };
  }
  return { tags: [...tags, tag], error: null };
}

export function notesError(notes: string): string | null {
  if (notes.trim().length > MAX_NOTES)
    return 'Las notas pueden tener hasta 2000 caracteres.';
  return null;
}

export function sameFlags(
  current: {
    isInternal: boolean;
    tags: readonly string[];
    notes: string | null;
  },
  draft: { isInternal: boolean; tags: readonly string[]; notes: string },
): boolean {
  if (current.isInternal !== draft.isInternal) return false;
  const notes = draft.notes.trim();
  if ((current.notes?.trim() ?? '') !== notes) return false;
  if (current.tags.length !== draft.tags.length) return false;
  return current.tags.every((tag, index) => tag === draft.tags[index]);
}
