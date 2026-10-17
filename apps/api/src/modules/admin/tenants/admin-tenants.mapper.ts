import {
  computePreviewCapability,
  type PreviewPolicyConfig,
} from '../../../common/billing/preview-capability';
import { scheduledCancellation } from '../../../common/billing/scheduled-cancellation';
import { previewUrl } from '../../../common/preview/preview-url';
import type { AdminStorageUsageDto } from '../storage/storage-usage.dto';
import type {
  AdminTemplateArchiveDto,
  AdminTenantAnalyticsDto,
  AdminTenantDetailDto,
  AdminTenantDomainSummaryDto,
  AdminTenantEmailDto,
  AdminTenantIdentityDto,
  AdminTenantListItemDto,
  AdminTenantOverviewDto,
  AdminTenantSiteDto,
  AdminTenantSubscriptionDto,
  AdminTenantSubscriptionSummaryDto,
  TenantPlan,
  TenantStatus,
} from './admin-tenants.dto';

const ERROR_CLIP = 200;

export interface TenantListRow {
  tenant_id: string;
  slug: string;
  name: string;
  email: string | null;
  plan: string;
  status: string;
  entitled: boolean | string | null;
  preview_started_at: string | Date | null;
  subscription_id: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  billing_period: string | null;
  current_period_end: string | Date | null;
  cancel_at_period_end: boolean | null;
  cancel_at: string | Date | null;
  template_id: string | null;
  template_name: string | null;
  site_status: string | null;
  domain: string | null;
  domain_expires_at: string | Date | null;
  dns_status: string | null;
  storage_bytes: number | string | null;
  is_internal: boolean | string | null;
  tags: unknown;
  created_at: string | Date;
  last_sign_in_at: string | Date | null;
}

export interface TenantOverviewRow extends TenantListRow {
  user_id: string;
  included_domain_used_at: string | Date | null;
  stripe_customer_id: string | null;
  email_confirmed_at: string | Date | null;
  payment_attempts: number | string | null;
  subscription_created_at: string | Date | null;
  published_at: string | Date | null;
  site_updated_at: string | Date | null;
  domain_source: string | null;
  domain_suspended_at: string | Date | null;
  dns_provider: string | null;
  renewal_status: string | null;
  renewal_late_deadline_at: string | Date | null;
  storage_measured_at: string | Date | null;
  flag_notes: string | null;
}

export interface AuthIdentityRow {
  email: string | null;
  email_confirmed_at: string | Date | null;
  last_sign_in_at: string | Date | null;
  created_at: string | Date | null;
  providers: unknown;
}

export interface ArchiveRow {
  template_id: string | null;
  reason: string;
  archived_at: string | Date;
}

export interface SubscriptionRow {
  id: string;
  stripe_subscription_id: string;
  plan: string;
  billing_period: string;
  status: string;
  current_period_start: string | Date | null;
  current_period_end: string | Date | null;
  cancel_at_period_end: boolean;
  cancel_at: string | Date | null;
  canceled_at: string | Date | null;
  payment_attempts: number | string | null;
  created_at: string | Date;
}

export interface AnalyticsRow {
  provisioning_status: string | null;
  is_mock: boolean | null;
  fetched_at: string | Date | null;
  report: unknown;
}

export interface EmailRow {
  kind: string;
  status: string;
  attempts: number | string;
  created_at: string | Date;
  sent_at: string | Date | null;
  last_error: string | null;
}

export function mapTenantListItem(
  row: TenantListRow,
  policy: PreviewPolicyConfig,
  now: Date,
): AdminTenantListItemDto {
  const entitled = toBool(row.entitled);
  const preview = computePreviewCapability(
    {
      isEntitled: entitled,
      plan: row.plan,
      previewStartedAt: row.preview_started_at,
    },
    policy,
    now,
  );
  return {
    id: row.tenant_id,
    slug: row.slug,
    name: row.name,
    email: row.email,
    plan: row.plan as TenantPlan,
    status: row.status as TenantStatus,
    entitled,
    previewState: preview.state,
    previewExpiresAt: toIso(preview.previewExpiresAt),
    subscription: mapSubscriptionSummary(row),
    template: mapTemplate(row.template_id, row.template_name),
    published: row.site_status === 'published',
    domain: mapDomain(row),
    storageBytes: toInt(row.storage_bytes),
    isInternal: toBool(row.is_internal),
    tags: asTags(row.tags),
    createdAt: toIsoRequired(row.created_at),
    lastSignInAt: toIso(row.last_sign_in_at),
  };
}

export function mapAssetByteLimit(
  entitled: boolean,
  maxAssetBytes: number,
): number | null {
  if (entitled || maxAssetBytes <= 0) return null;
  return maxAssetBytes;
}

export function mapTenantEmails(rows: EmailRow[]): AdminTenantEmailDto[] {
  return rows.map((row) => ({
    kind: row.kind,
    status: row.status,
    attempts: toInt(row.attempts) ?? 0,
    createdAt: toIsoRequired(row.created_at),
    sentAt: toIso(row.sent_at),
    lastError: clip(row.last_error, ERROR_CLIP),
  }));
}

export function mapTenantDetail(input: {
  overview: TenantOverviewRow;
  user: AuthIdentityRow | null;
  archives: ArchiveRow[];
  subscriptions: SubscriptionRow[];
  analytics: AnalyticsRow | null;
  emails: EmailRow[];
  storage: AdminStorageUsageDto | null;
  maxAssetBytes: number;
  policy: PreviewPolicyConfig;
  now: Date;
}): AdminTenantDetailDto {
  const listItem = mapTenantListItem(input.overview, input.policy, input.now);
  const entitled = listItem.entitled;
  return {
    overview: mapOverview(input.overview),
    identity: mapIdentity(input.overview, input.user),
    previewState: listItem.previewState,
    previewExpiresAt: listItem.previewExpiresAt,
    site: mapSite(input.overview),
    templateHistory: input.archives.map(mapArchive),
    subscriptions: input.subscriptions.map(mapSubscription),
    analytics: mapAnalytics(input.analytics),
    storage: {
      usage: input.storage,
      assetByteLimit: mapAssetByteLimit(entitled, input.maxAssetBytes),
    },
    emails: mapTenantEmails(input.emails),
    flags: {
      isInternal: toBool(input.overview.is_internal),
      tags: asTags(input.overview.tags),
      notes: input.overview.flag_notes,
    },
  };
}

function mapOverview(row: TenantOverviewRow): AdminTenantOverviewDto {
  return {
    tenantId: row.tenant_id,
    userId: row.user_id,
    slug: row.slug,
    name: row.name,
    plan: row.plan as TenantPlan,
    status: row.status as TenantStatus,
    createdAt: toIsoRequired(row.created_at),
    previewStartedAt: toIso(row.preview_started_at),
    includedDomainUsedAt: toIso(row.included_domain_used_at),
    stripeCustomerId: row.stripe_customer_id,
    email: row.email,
    emailConfirmedAt: toIso(row.email_confirmed_at),
    lastSignInAt: toIso(row.last_sign_in_at),
    isInternal: toBool(row.is_internal),
    tags: asTags(row.tags),
    entitled: toBool(row.entitled),
    subscriptionId: row.subscription_id,
    subscriptionStatus: asNullable(
      row.subscription_status,
    ) as AdminTenantOverviewDto['subscriptionStatus'],
    subscriptionPlan: asNullable(
      row.subscription_plan,
    ) as AdminTenantOverviewDto['subscriptionPlan'],
    billingPeriod: asNullable(
      row.billing_period,
    ) as AdminTenantOverviewDto['billingPeriod'],
    currentPeriodEnd: toIso(row.current_period_end),
    cancelAtPeriodEnd:
      row.cancel_at_period_end == null ? null : row.cancel_at_period_end,
    cancelAt: toIso(row.cancel_at),
    paymentAttempts: toInt(row.payment_attempts),
    subscriptionCreatedAt: toIso(row.subscription_created_at),
    templateId: row.template_id,
    siteStatus: asNullable(
      row.site_status,
    ) as AdminTenantOverviewDto['siteStatus'],
    publishedAt: toIso(row.published_at),
    siteUpdatedAt: toIso(row.site_updated_at),
    domain: row.domain,
    domainSource: asNullable(
      row.domain_source,
    ) as AdminTenantOverviewDto['domainSource'],
    dnsStatus: asNullable(
      row.dns_status,
    ) as AdminTenantOverviewDto['dnsStatus'],
    domainExpiresAt: toIso(row.domain_expires_at),
    domainSuspendedAt: toIso(row.domain_suspended_at),
    dnsProvider: row.dns_provider,
    renewalStatus: asNullable(
      row.renewal_status,
    ) as AdminTenantOverviewDto['renewalStatus'],
    renewalLateDeadlineAt: toIso(row.renewal_late_deadline_at),
    storageBytes: toInt(row.storage_bytes),
    storageMeasuredAt: toIso(row.storage_measured_at),
  };
}

function mapIdentity(
  overview: TenantOverviewRow,
  user: AuthIdentityRow | null,
): AdminTenantIdentityDto {
  const confirmed = user?.email_confirmed_at ?? overview.email_confirmed_at;
  return {
    email: user?.email ?? overview.email,
    emailVerified: toIso(confirmed) !== null,
    lastSignInAt: toIso(user?.last_sign_in_at ?? overview.last_sign_in_at),
    providers: providersOf(user?.providers),
    createdAt: toIso(user?.created_at),
  };
}

function mapSite(row: TenantOverviewRow): AdminTenantSiteDto {
  const custom =
    row.dns_status === 'active' && row.domain ? `https://${row.domain}` : null;
  return {
    template: mapTemplate(row.template_id, row.template_name),
    status: asNullable(row.site_status) as AdminTenantSiteDto['status'],
    published: row.site_status === 'published',
    publishedAt: toIso(row.published_at),
    updatedAt: toIso(row.site_updated_at),
    previewUrl: previewUrl(row.slug),
    customDomainUrl: custom,
  };
}

function mapArchive(row: ArchiveRow): AdminTemplateArchiveDto {
  return {
    templateId: row.template_id,
    reason: row.reason,
    archivedAt: toIsoRequired(row.archived_at),
  };
}

function mapSubscription(row: SubscriptionRow): AdminTenantSubscriptionDto {
  const scheduled = scheduledCancellation({
    status: row.status,
    cancel_at: row.cancel_at,
    cancel_at_period_end: row.cancel_at_period_end === true,
    current_period_end: row.current_period_end,
  });
  return {
    id: row.id,
    stripeSubscriptionId: row.stripe_subscription_id,
    status: row.status as AdminTenantSubscriptionDto['status'],
    plan: row.plan as AdminTenantSubscriptionDto['plan'],
    billingPeriod:
      row.billing_period as AdminTenantSubscriptionDto['billingPeriod'],
    currentPeriodStart: toIso(row.current_period_start),
    currentPeriodEnd: toIso(row.current_period_end),
    cancelAt: scheduled.cancelAt,
    cancelAtPeriodEnd: scheduled.cancelAtPeriodEnd,
    canceledAt: toIso(row.canceled_at),
    paymentAttempts: toInt(row.payment_attempts) ?? 0,
    createdAt: toIsoRequired(row.created_at),
  };
}

function mapSubscriptionSummary(
  row: TenantListRow,
): AdminTenantSubscriptionSummaryDto | null {
  if (
    !row.subscription_id ||
    !row.subscription_status ||
    !row.subscription_plan ||
    !row.billing_period
  ) {
    return null;
  }
  const scheduled = scheduledCancellation({
    status: row.subscription_status,
    cancel_at: row.cancel_at,
    cancel_at_period_end: row.cancel_at_period_end === true,
    current_period_end: row.current_period_end,
  });
  return {
    status:
      row.subscription_status as AdminTenantSubscriptionSummaryDto['status'],
    plan: row.subscription_plan as AdminTenantSubscriptionSummaryDto['plan'],
    billingPeriod:
      row.billing_period as AdminTenantSubscriptionSummaryDto['billingPeriod'],
    currentPeriodEnd: toIso(row.current_period_end),
    cancelAt: scheduled.cancelAt,
    cancelAtPeriodEnd: scheduled.cancelAtPeriodEnd,
  };
}

function mapTemplate(
  id: string | null,
  name: string | null,
): AdminTenantListItemDto['template'] {
  if (!id) return null;
  return { id, name };
}

function mapDomain(row: TenantListRow): AdminTenantDomainSummaryDto | null {
  if (!row.domain) return null;
  return {
    name: row.domain,
    expiresAt: toIso(row.domain_expires_at),
    dnsStatus: row.dns_status as AdminTenantDomainSummaryDto['dnsStatus'],
  };
}

function mapAnalytics(
  row: AnalyticsRow | null,
): AdminTenantAnalyticsDto | null {
  if (!row) return null;
  const hasAnalytics = row.provisioning_status != null || row.is_mock != null;
  const hasReport = row.fetched_at != null || row.report != null;
  if (!hasAnalytics && !hasReport) return null;
  return {
    provisioningStatus:
      row.provisioning_status as AdminTenantAnalyticsDto['provisioningStatus'],
    isMock: row.is_mock,
    fetchedAt: toIso(row.fetched_at),
    report: row.report ?? null,
  };
}

function providersOf(value: unknown): string[] {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === 'string');
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function asNullable<T extends string>(value: T | null): T | null {
  return value;
}

function toBool(value: boolean | string | null | undefined): boolean {
  return value === true || value === 'true' || value === 't';
}

function toInt(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

function toIso(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toIsoRequired(value: string | Date): string {
  const iso = toIso(value);
  if (!iso) throw new Error('Expected a timestamp');
  return iso;
}

function clip(value: string | null, max: number): string | null {
  if (value == null) return null;
  return value.length <= max ? value : value.slice(0, max);
}
