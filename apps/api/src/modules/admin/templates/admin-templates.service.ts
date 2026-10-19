import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { type Database, DATABASE } from '../../../database/database.module';
import { assetMagic } from '../../sites/asset-magic';
import {
  OBJECT_STORAGE_PORT,
  type ObjectStoragePort,
} from '../../storage/domain/object-storage.port';
import {
  AdminNotFoundException,
  TemplateDeleteConfirmException,
  TemplateInUseException,
  TemplateNotReadyException,
  TemplateOrderInvalidException,
  TemplateThumbnailRejectedException,
  TemplateThumbnailTooLargeException,
} from '../admin.exceptions';
import type {
  AdminTemplateDetailDto,
  AdminTemplateListQueryDto,
  AdminTemplateListResponseDto,
  AdminTemplateUpdateDto,
} from './admin-templates.dto';
import {
  mapTemplateDetail,
  mapTemplateListItem,
  readKitMeta,
  type TemplateDetailRow,
  type TemplateListRow,
  type TemplateTenantRow,
} from './admin-templates.mapper';
import {
  templateActivateStatement,
  templateDeleteSnapshotStatement,
  templateDeleteStatement,
  templateDetailStatement,
  templateEditableStatement,
  templateLifecycleStatement,
  templateListStatement,
  templateReferenceCountsStatement,
  templateReorderStatement,
  templateRetireStatement,
  templateSortOrdersStatement,
  templateTenantsStatement,
  templateThumbnailStateStatement,
  templateThumbnailUpdateStatement,
  templateUpdateStatement,
  type TemplateUpdateFields,
} from './admin-templates.queries';

export const MAX_TEMPLATE_THUMB_BYTES = 2 * 1024 * 1024;

/** The part of a multer file we use — avoids the ambient `Express.Multer` global. */
export interface UploadedTemplateThumbnail {
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface TemplateMutationResult {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  template: AdminTemplateDetailDto;
}

export interface TemplateRetireResult extends TemplateMutationResult {
  reason: string;
}

export interface TemplateReorderResult {
  ids: string[];
  before: Array<{ id: string; sortOrder: number }>;
  after: Array<{ id: string; sortOrder: number }>;
}

export interface TemplateDeleteSnapshot {
  id: string;
  name: string;
  tier: string;
  category: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  kit_meta: Record<string, unknown> | null;
}

export interface TemplateDeleteResult {
  before: TemplateDeleteSnapshot;
}

interface SqlExecutor {
  execute(query: SQL): Promise<unknown>;
}

interface EditableRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  featured: boolean | string | null;
}

interface LifecycleRow {
  id: string;
  is_active: boolean | string | null;
  retired_at: string | Date | null;
  preview_url: string | null;
  thumbnail_url: string | null;
}

interface SortRow {
  id: string;
  sort_order: number | string;
}

interface CountRow {
  sites: number | string | null;
  archives: number | string | null;
}

interface SnapshotRow {
  id: string;
  name: string;
  tier: string;
  category: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  kit_meta: unknown;
}

const THUMB_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class AdminTemplatesService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: ObjectStoragePort,
  ) {}

  async list(
    query: AdminTemplateListQueryDto,
  ): Promise<AdminTemplateListResponseDto> {
    const rows = await this.query<TemplateListRow>(
      templateListStatement(query),
    );
    return { items: rows.map(mapTemplateListItem) };
  }

  async get(id: string): Promise<AdminTemplateDetailDto> {
    const rows = await this.query<TemplateDetailRow>(
      templateDetailStatement(id),
    );
    const row = rows[0];
    if (!row) throw templateNotFound();
    const tenants = await this.query<TemplateTenantRow>(
      templateTenantsStatement(id),
    );
    return mapTemplateDetail(row, tenants);
  }

  async update(
    id: string,
    patch: AdminTemplateUpdateDto,
  ): Promise<TemplateMutationResult> {
    const rows = await this.query<EditableRow>(templateEditableStatement(id));
    const row = rows[0];
    if (!row) throw templateNotFound();

    const change = changedFields(row, patch);
    if (change.sets) {
      const updated = await this.query<{ id: string }>(
        templateUpdateStatement(id, change.fields),
      );
      if (!updated[0]) throw templateNotFound();
    }

    return {
      before: change.before,
      after: change.after,
      template: await this.get(id),
    };
  }

  async activate(id: string): Promise<TemplateMutationResult> {
    const rows = await this.query<LifecycleRow>(templateLifecycleStatement(id));
    const row = rows[0];
    if (!row) throw templateNotFound();

    const missing: string[] = [];
    if (row.preview_url == null) missing.push('preview_url');
    if (row.thumbnail_url == null) missing.push('thumbnail_url');
    if (missing.length > 0) throw new TemplateNotReadyException(missing);

    const updated = await this.query<{ id: string }>(
      templateActivateStatement(id),
    );
    if (!updated[0]) throw templateNotFound();

    return {
      before: {
        isActive: isTrue(row.is_active),
        retiredAt: isoOrNull(row.retired_at),
      },
      after: { isActive: true, retiredAt: null },
      template: await this.get(id),
    };
  }

  async retire(id: string, reason: string): Promise<TemplateRetireResult> {
    const rows = await this.query<LifecycleRow>(templateLifecycleStatement(id));
    const row = rows[0];
    if (!row) throw templateNotFound();

    const updated = await this.query<{ retired_at: string | Date }>(
      templateRetireStatement(id),
    );
    const retiredAt = updated[0]?.retired_at;
    if (!retiredAt) throw templateNotFound();

    return {
      reason,
      before: {
        isActive: isTrue(row.is_active),
        retiredAt: isoOrNull(row.retired_at),
      },
      after: { isActive: false, retiredAt: isoOrNull(retiredAt) },
      template: await this.get(id),
    };
  }

  async reorder(ids: readonly string[]): Promise<TemplateReorderResult> {
    const duplicates = duplicateIds(ids);
    if (ids.length === 0 || duplicates.length > 0) {
      throw new TemplateOrderInvalidException(
        duplicates.length > 0 ? { duplicates } : {},
      );
    }

    return this.db.transaction(async (tx) => {
      const rows = await this.query<SortRow>(
        templateSortOrdersStatement(ids),
        tx,
      );
      const sortById = new Map(rows.map((row) => [row.id, row.sort_order]));
      const unknown = ids.filter((id) => !sortById.has(id));
      if (unknown.length > 0) {
        throw new TemplateOrderInvalidException({ unknown });
      }

      await this.query(templateReorderStatement(ids), tx);
      return {
        ids: [...ids],
        before: ids.map((id) => ({
          id,
          sortOrder: asInt(sortById.get(id)),
        })),
        after: ids.map((id, index) => ({ id, sortOrder: index * 10 })),
      };
    });
  }

  async replaceThumbnail(
    id: string,
    file: UploadedTemplateThumbnail | undefined,
  ): Promise<TemplateMutationResult> {
    const rows = await this.query<{ id: string; thumbnail_url: string | null }>(
      templateThumbnailStateStatement(id),
    );
    const row = rows[0];
    if (!row) throw templateNotFound();

    const image = thumbnailImage(file);
    const hash = createHash('sha256')
      .update(image.body)
      .digest('hex')
      .slice(0, 16);
    const url = await this.storage.uploadPublic(
      thumbnailKey(row.id, hash, image.ext),
      image.body,
      image.mime,
    );
    const updated = await this.query<{ id: string }>(
      templateThumbnailUpdateStatement(id, url),
    );
    if (!updated[0]) throw templateNotFound();

    return {
      before: { thumbnailUrl: row.thumbnail_url },
      after: { thumbnailUrl: url },
      template: await this.get(id),
    };
  }

  /**
   * Deletes the catalog row only. Objects stay: a published site may still
   * request the previous thumbnail URL.
   */
  async remove(id: string, confirmId: string): Promise<TemplateDeleteResult> {
    if (confirmId !== id) throw new TemplateDeleteConfirmException();

    try {
      return await this.db.transaction(async (tx) => {
        const rows = await this.query<SnapshotRow>(
          templateDeleteSnapshotStatement(id),
          tx,
        );
        const row = rows[0];
        if (!row) throw templateNotFound();

        const counts = await this.referenceCounts(id, tx);
        if (counts.sites > 0 || counts.archives > 0) {
          throw new TemplateInUseException(counts.sites, counts.archives);
        }

        const deleted = await this.query<{ id: string }>(
          templateDeleteStatement(id),
          tx,
        );
        if (!deleted[0]) throw templateNotFound();

        return { before: snapshotOf(row) };
      });
    } catch (error) {
      if (error instanceof DomainException) throw error;
      if (postgresCode(error) === '23503') {
        const counts = await this.referenceCounts(id);
        throw new TemplateInUseException(counts.sites, counts.archives);
      }
      throw error;
    }
  }

  private async referenceCounts(
    id: string,
    executor: SqlExecutor = this.db,
  ): Promise<{ sites: number; archives: number }> {
    const rows = await this.query<CountRow>(
      templateReferenceCountsStatement(id),
      executor,
    );
    const row = rows[0];
    return { sites: asInt(row?.sites), archives: asInt(row?.archives) };
  }

  private async query<T>(
    statement: SQL,
    executor: SqlExecutor = this.db,
  ): Promise<T[]> {
    const rows = await executor.execute(statement);
    return rows as unknown as T[];
  }
}

function changedFields(
  row: EditableRow,
  patch: AdminTemplateUpdateDto,
): {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  fields: TemplateUpdateFields;
  sets: boolean;
} {
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};
  const fields: TemplateUpdateFields = {};

  if (patch.name !== undefined && patch.name !== row.name) {
    before.name = row.name;
    after.name = patch.name;
    fields.name = patch.name;
  }

  if (
    patch.description !== undefined &&
    (patch.description ?? null) !== (row.description ?? null)
  ) {
    const description = patch.description ?? null;
    before.description = row.description;
    after.description = description;
    fields.description = description;
  }

  if (
    patch.category !== undefined &&
    patch.category !== (row.category ?? null)
  ) {
    before.category = row.category;
    after.category = patch.category;
    fields.category = patch.category;
  }

  if (patch.tags !== undefined) {
    const current = tagsOf(row.tags);
    if (!sameTags(current, patch.tags)) {
      before.tags = current;
      after.tags = patch.tags;
      fields.tags = patch.tags;
    }
  }

  if (patch.featured !== undefined && patch.featured !== isTrue(row.featured)) {
    before.featured = isTrue(row.featured);
    after.featured = patch.featured;
    fields.featured = patch.featured;
  }

  return {
    before,
    after,
    fields,
    sets: Object.keys(fields).length > 0,
  };
}

function snapshotOf(row: SnapshotRow): TemplateDeleteSnapshot {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    category: row.category,
    preview_url: row.preview_url,
    thumbnail_url: row.thumbnail_url,
    kit_meta: readKitMeta(row.kit_meta),
  };
}

function thumbnailImage(file: UploadedTemplateThumbnail | undefined): {
  mime: string;
  ext: string;
  body: Buffer;
} {
  if (!file?.buffer?.length) throw new TemplateThumbnailRejectedException();
  if (
    file.buffer.length > MAX_TEMPLATE_THUMB_BYTES ||
    file.size > MAX_TEMPLATE_THUMB_BYTES
  ) {
    throw new TemplateThumbnailTooLargeException(MAX_TEMPLATE_THUMB_BYTES);
  }

  const mime = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
  const ext = THUMB_EXT[mime];
  if (!ext || !assetMagic.matches(mime, file.buffer)) {
    throw new TemplateThumbnailRejectedException();
  }
  return { mime, ext, body: file.buffer };
}

function thumbnailKey(id: string, hash: string, ext: string): string {
  if (id.includes('/') || id.includes('\\') || id.includes('..')) {
    throw new TemplateThumbnailRejectedException();
  }
  return `templates/${id}/admin-thumb-${hash}.${ext}`;
}

function duplicateIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) {
      if (!duplicates.includes(id)) duplicates.push(id);
    } else {
      seen.add(id);
    }
  }
  return duplicates;
}

function tagsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function sameTags(
  current: readonly string[],
  next: readonly string[],
): boolean {
  return (
    current.length === next.length &&
    current.every((tag, index) => tag === next[index])
  );
}

function isTrue(value: boolean | string | null | undefined): boolean {
  return value === true || value === 'true' || value === 't';
}

function asInt(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return 0;
}

function isoOrNull(value: string | Date | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function templateNotFound(): AdminNotFoundException {
  return new AdminNotFoundException('No se encontró la plantilla.');
}

function postgresCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string') return code;
  return postgresCode((error as { cause?: unknown }).cause);
}
