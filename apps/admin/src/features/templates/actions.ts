import type { AdminTemplateUpdateDto } from '@lattiz/api-client';
import { readApiErrorBody } from '@/lib/admin-errors';
import { formatCount } from '@/lib/format';
import type { AdminRole } from '@/lib/navigation';

export { actionReasonError } from '@/lib/action-reason';

export type TemplateStatus = 'pending' | 'active' | 'retired';

export type TemplateActionSet = {
  edit: boolean;
  activate: boolean;
  activateLabel: 'Activar' | 'Volver a activar' | null;
  retire: boolean;
  thumbnail: boolean;
  delete: boolean;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 24;
const MAX_NAME = 80;
const MAX_DESCRIPTION = 500;
const MAX_CATEGORY = 40;
export const THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;

const THUMB_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const THUMB_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

const MISSING_LABEL: Record<string, string> = {
  preview_url: 'la vista previa',
  thumbnail_url: 'la miniatura',
};

export function templateActionSet(
  role: AdminRole,
  status: TemplateStatus,
): TemplateActionSet {
  const staff = role === 'owner' || role === 'operator';
  const activate = staff && status !== 'active';
  return {
    edit: staff,
    activate,
    activateLabel: !activate
      ? null
      : status === 'retired'
        ? 'Volver a activar'
        : 'Activar',
    retire: staff && status === 'active',
    thumbnail: staff,
    delete: role === 'owner',
  };
}

export function templateDeleteBlock(usage: {
  tenantsUsing: number;
  archivedCount: number;
}): string | null {
  if (usage.tenantsUsing <= 0 && usage.archivedCount <= 0) return null;
  const sites = countNoun(usage.tenantsUsing, 'sitio', 'sitios');
  const archives = countNoun(usage.archivedCount, 'archivo', 'archivos');
  return `La usan ${sites} y ${archives}.`;
}

export function confirmIdMatches(typed: string, id: string): boolean {
  return typed.trim() === id;
}

export type TagAddResult = {
  tags: string[];
  error: string | null;
};

export function addSlugTag(tags: readonly string[], raw: string): TagAddResult {
  const tag = raw.trim().toLowerCase();
  if (!tag) return { tags: [...tags], error: 'Escribe una etiqueta.' };
  if (tag.length > MAX_TAG_LENGTH || !SLUG.test(tag)) {
    return {
      tags: [...tags],
      error: 'Usa minúsculas, números y guiones. Hasta 24 caracteres.',
    };
  }
  if (tags.includes(tag)) return { tags: [...tags], error: null };
  if (tags.length >= MAX_TAGS) {
    return { tags: [...tags], error: 'Puedes poner hasta 10 etiquetas.' };
  }
  return { tags: [...tags, tag], error: null };
}

export type TemplateDraft = {
  name: string;
  description: string;
  category: string;
  tags: readonly string[];
  featured: boolean;
};

export function templateDraftError(draft: TemplateDraft): string | null {
  const name = draft.name.trim();
  if (name.length < 1 || name.length > MAX_NAME) {
    return 'El nombre debe tener entre 1 y 80 caracteres.';
  }
  if (draft.description.trim().length > MAX_DESCRIPTION) {
    return 'La descripción puede tener hasta 500 caracteres.';
  }
  const category = draft.category.trim().toLowerCase();
  if (!category || category.length > MAX_CATEGORY || !SLUG.test(category)) {
    return 'La categoría usa minúsculas, números y guiones.';
  }
  if (draft.tags.length > MAX_TAGS) return 'Puedes poner hasta 10 etiquetas.';
  for (const tag of draft.tags) {
    if (tag.length > MAX_TAG_LENGTH || !SLUG.test(tag)) {
      return 'Revisa las etiquetas: minúsculas, números y guiones.';
    }
  }
  return null;
}

export function templateUpdateBody(
  draft: TemplateDraft,
): AdminTemplateUpdateDto {
  const description = draft.description.trim();
  return {
    name: draft.name.trim(),
    description: description.length > 0 ? description : null,
    category: draft.category.trim().toLowerCase(),
    tags: [...draft.tags],
    featured: draft.featured,
  };
}

export type ThumbnailCandidate = {
  name: string;
  type: string;
  size: number;
};

export function thumbnailProblem(file: ThumbnailCandidate): string | null {
  if (file.size <= 0) return 'El archivo está vacío.';
  if (file.size > THUMBNAIL_MAX_BYTES)
    return 'La imagen debe pesar 2 MB o menos.';
  if (!thumbnailTypeAllowed(file)) return 'Usa un archivo JPEG, PNG o WebP.';
  return null;
}

export function templateMutationMessage(
  error: unknown,
  templateId: string,
): string {
  const body = readApiErrorBody(error);
  if (body.code === 'TEMPLATE_NOT_READY')
    return templateNotReadyText(body.details, templateId);
  if (body.code === 'TEMPLATE_IN_USE') return templateInUseText(body.details);
  if (body.message) return body.message;
  return 'No se pudo completar la acción.';
}

export function isTemplateNotReady(error: unknown): boolean {
  return readApiErrorBody(error).code === 'TEMPLATE_NOT_READY';
}

export function templateNotReadyText(
  details: unknown,
  templateId: string,
): string {
  const missing = stringList(details, 'missing');
  const labels = missing.flatMap((item) => {
    const label = MISSING_LABEL[item];
    return label ? [label] : [];
  });
  const command = `pnpm lattiz deploy ${templateId}`;
  if (labels.length === 0) {
    return `Falta la vista previa o la miniatura; corre ${command}.`;
  }
  if (labels.length === 1) return `Falta ${labels[0]}; corre ${command}.`;
  return `Faltan ${labels.join(' y ')}; corre ${command}.`;
}

export function templateInUseText(details: unknown): string {
  const sites = numberField(details, 'sites');
  const archives = numberField(details, 'archives');
  if (sites == null && archives == null) {
    return 'La plantilla sigue en uso y no se puede borrar.';
  }
  return `No se puede borrar: la usan ${countNoun(sites ?? 0, 'sitio', 'sitios')} y ${countNoun(archives ?? 0, 'archivo', 'archivos')}.`;
}

export function moveListItem<T>(
  items: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const target = index + direction;
  if (
    index < 0 ||
    index >= items.length ||
    target < 0 ||
    target >= items.length
  ) {
    return [...items];
  }
  const next = [...items];
  const [item] = next.splice(index, 1);
  if (item === undefined) return [...items];
  next.splice(target, 0, item);
  return next;
}

export function sameOrder(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) return false;
  return left.every((id, index) => id === right[index]);
}

export function templatesInCatalogOrder<
  T extends { id: string; sortOrder: number },
>(items: readonly T[]): T[] {
  return [...items].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
  );
}

function thumbnailTypeAllowed(file: ThumbnailCandidate): boolean {
  const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (THUMB_TYPES.has(type)) return true;
  if (type && type !== 'application/octet-stream') return false;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return THUMB_EXTENSIONS.has(extension);
}

function countNoun(count: number, singular: string, plural: string): string {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`;
}

function stringList(details: unknown, key: string): string[] {
  const record = recordOf(details);
  const value = record?.[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function numberField(details: unknown, key: string): number | null {
  const record = recordOf(details);
  const value = record?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function recordOf(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
