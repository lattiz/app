import type { TenantPlan } from '../tenants/admin-tenants.dto';
import type {
  AdminTemplateDetailDto,
  AdminTemplateListItemDto,
  AdminTemplateTenantDto,
  AdminTemplateUsageDto,
  TemplateStatus,
  TemplateTier,
} from './admin-templates.dto';

export interface TemplateListRow {
  template_id: string;
  name: string;
  description: string | null;
  category: string | null;
  tier: string;
  is_active: boolean | string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  sort_order: number | string;
  created_at: string | Date;
  tenants_using: number | string | null;
  sites_published: number | string | null;
  paying_tenants: number | string | null;
  trial_tenants: number | string | null;
  archived_count: number | string | null;
}

export interface TemplateDetailRow extends TemplateListRow {
  section_count: number | string | null;
}

export interface TemplateTenantRow {
  tenant_id: string;
  slug: string;
  name: string;
  plan: string;
  entitled: boolean | string | null;
  site_status: string | null;
}

export function templateStatus(
  isActive: boolean | string | null,
): TemplateStatus {
  return toBool(isActive) ? 'active' : 'pending';
}

export function mapTemplateListItem(
  row: TemplateListRow,
): AdminTemplateListItemDto {
  return {
    id: row.template_id,
    name: row.name,
    description: row.description,
    category: row.category,
    tier: row.tier as TemplateTier,
    status: templateStatus(row.is_active),
    thumbnailUrl: row.thumbnail_url,
    previewUrl: row.preview_url,
    sortOrder: countOf(row.sort_order),
    createdAt: toIsoRequired(row.created_at),
    usage: mapUsage(row),
  };
}

export function mapTemplateDetail(
  row: TemplateDetailRow,
  tenants: readonly TemplateTenantRow[],
): AdminTemplateDetailDto {
  return {
    ...mapTemplateListItem(row),
    sectionCount: countOf(row.section_count),
    tenants: tenants.map(mapTemplateTenant),
  };
}

function mapUsage(row: TemplateListRow): AdminTemplateUsageDto {
  return {
    tenantsUsing: countOf(row.tenants_using),
    sitesPublished: countOf(row.sites_published),
    payingTenants: countOf(row.paying_tenants),
    trialTenants: countOf(row.trial_tenants),
    archivedCount: countOf(row.archived_count),
  };
}

function mapTemplateTenant(row: TemplateTenantRow): AdminTemplateTenantDto {
  return {
    id: row.tenant_id,
    slug: row.slug,
    name: row.name,
    plan: row.plan as TenantPlan,
    entitled: toBool(row.entitled),
    published: row.site_status === 'published',
  };
}

function toBool(value: boolean | string | null | undefined): boolean {
  return value === true || value === 'true' || value === 't';
}

function countOf(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.trunc(parsed);
  }
  return 0;
}

function toIsoRequired(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Expected a timestamp');
  }
  return date.toISOString();
}
