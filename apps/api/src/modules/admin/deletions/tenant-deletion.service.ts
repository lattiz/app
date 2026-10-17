import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { CustomerDeletionBilling } from '../../billing/billing.service';
import { BillingService } from '../../billing/billing.service';
import {
  DNS_PROVIDER_PORT,
  type DnsProviderPort,
} from '../../domains/domain/dns-provider.port';
import type {
  DomainInspection,
  RegistrarInspection,
} from '../../domains/domain-inspection';
import { DomainsService } from '../../domains/domains.service';
import {
  OBJECT_STORAGE_PORT,
  type ObjectStoragePort,
} from '../../storage/domain/object-storage.port';
import {
  tenantAssetsPrefix,
  tenantBrandingPrefix,
} from '../../storage/domain/storage-path';
import {
  AdminMemberNotDeletableException,
  AdminNotFoundException,
  AdminStripeUnavailableException,
  TenantDeleteConfirmException,
  TenantDeletionActiveException,
  TenantDeletionNotRetryableException,
} from '../admin.exceptions';
import { AdminMembersService } from '../auth/admin-members.service';
import type {
  DeletionJobDto,
  DeletionJobListDto,
  DeletionListQueryDto,
  DeletionPreviewDto,
  StartTenantDeletionDto,
  TenantDeletionAcceptedDto,
} from './tenant-deletion.dto';
import {
  autoRenewNeedsAttention,
  canRetryDeletionJob,
  deletionWarnings,
  initialSteps,
  maskEmail,
  renewalPaidNotRenewed,
  WHAT_IS_KEPT,
  type DeletionJob,
  type DeletionSnapshot,
} from './tenant-deletion.model';
import {
  type TenantDeletionContext,
  TenantDeletionRepository,
} from './tenant-deletion.repository';
import { TenantDeletionRunner } from './tenant-deletion.runner';

interface ProviderPicture {
  inspection: DomainInspection | null;
  billing: CustomerDeletionBilling | null;
  assetsBytes: number;
  brandingBytes: number;
}

@Injectable()
export class TenantDeletionService {
  constructor(
    private readonly jobs: TenantDeletionRepository,
    private readonly runner: TenantDeletionRunner,
    private readonly domains: DomainsService,
    private readonly billing: BillingService,
    private readonly members: AdminMembersService,
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: ObjectStoragePort,
    @Inject(DNS_PROVIDER_PORT) private readonly dns: DnsProviderPort,
  ) {}

  async preview(tenantId: string): Promise<DeletionPreviewDto> {
    const context = await this.requireContext(tenantId);
    const [picture, adminMember] = await Promise.all([
      this.picture(context),
      this.isActiveMember(context.userId),
    ]);
    return this.toPreview(context, picture, adminMember);
  }

  async start(
    tenantId: string,
    body: StartTenantDeletionDto,
    actor: { userId: string; email: string | null },
  ): Promise<TenantDeletionAcceptedDto> {
    const context = await this.requireContext(tenantId);
    if (body.confirmSlug !== context.slug) {
      throw new TenantDeleteConfirmException();
    }
    if (await this.isActiveMember(context.userId)) {
      throw new AdminMemberNotDeletableException();
    }
    const picture = await this.picture(context);
    const notifyCustomer = body.notifyCustomer !== false;
    const snapshot = this.snapshot(context, picture);
    const inserted = await this.jobs.insert({
      tenantId: context.tenantId,
      userId: context.userId,
      slug: context.slug,
      snapshot,
      notifyEmail: notifyCustomer ? context.email : null,
      notifyCustomer,
      steps: initialSteps(),
      reason: body.reason,
      actorUserId: actor.userId,
      actorEmail: actor.email,
    });
    const kicked = await this.runner.kick(inserted.id);
    if (!kicked) throw new TenantDeletionActiveException();
    return { jobId: inserted.id };
  }

  async list(query: DeletionListQueryDto): Promise<DeletionJobListDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const result = await this.jobs.list({
      status: query.status,
      page,
      pageSize,
    });
    return {
      items: result.items.map((job) => toDeletionJobDto(job)),
      total: result.total,
      page,
      pageSize,
    };
  }

  async get(jobId: string): Promise<DeletionJobDto> {
    const job = await this.jobs.find(jobId);
    if (!job) {
      throw new AdminNotFoundException('No se encontró el trabajo de borrado.');
    }
    return toDeletionJobDto(job);
  }

  async retry(jobId: string): Promise<TenantDeletionAcceptedDto> {
    const job = await this.jobs.find(jobId);
    if (!job) {
      throw new AdminNotFoundException('No se encontró el trabajo de borrado.');
    }
    if (!canRetryDeletionJob(job.status, new Date(job.updatedAt), new Date())) {
      throw new TenantDeletionNotRetryableException();
    }
    const kicked = await this.runner.kick(jobId);
    if (!kicked) throw new TenantDeletionNotRetryableException();
    return { jobId };
  }

  private async requireContext(
    tenantId: string,
  ): Promise<TenantDeletionContext> {
    const context = await this.jobs.loadContext(tenantId);
    if (!context) throw new AdminNotFoundException();
    return context;
  }

  private async isActiveMember(userId: string): Promise<boolean> {
    this.members.invalidate(userId);
    const member = await this.members.findActiveMember(userId);
    return member != null;
  }

  private async picture(
    context: TenantDeletionContext,
  ): Promise<ProviderPicture> {
    const billingPromise = context.stripeCustomerId
      ? this.billing
          .describeCustomerForDeletion(context.stripeCustomerId)
          .catch((error: unknown) => {
            if (error instanceof DomainException) throw error;
            throw new AdminStripeUnavailableException(
              'Stripe no está disponible para revisar el borrado.',
            );
          })
      : Promise.resolve(null);
    const [inspection, billing, assetsBytes, brandingBytes] = await Promise.all(
      [
        context.domain
          ? this.domains.inspectForTenant(context.tenantId)
          : Promise.resolve(null),
        billingPromise,
        this.storage.usageBytes(tenantAssetsPrefix(context.tenantId)),
        this.storage.usageBytes(tenantBrandingPrefix(context.tenantId)),
      ],
    );
    return { inspection, billing, assetsBytes, brandingBytes };
  }

  private snapshot(
    context: TenantDeletionContext,
    picture: ProviderPicture,
  ): DeletionSnapshot {
    const registrar = registrarOf(picture.inspection);
    return {
      tenantId: context.tenantId,
      userId: context.userId,
      slug: context.slug,
      emailMasked: maskEmail(context.email),
      domain: context.domain
        ? {
            name: context.domain.name,
            source: context.domain.source,
            registrarDomainId: context.domain.registrarDomainId,
            expiresAt: context.domain.expiresAt,
            dnsProvider: context.domain.dnsProvider,
            dnsZoneId: context.domain.dnsZoneId,
            autoRenew: registrar?.autoRenew ?? null,
            renewalDate: registrar?.renewalDate ?? context.domain.expiresAt,
            vercelInProject: vercelInProject(picture.inspection),
          }
        : null,
      ga4PropertyId: context.ga4PropertyId,
      analyticsIsMock: context.analyticsIsMock,
      stripeCustomerId: context.stripeCustomerId,
      subscriptionIds: picture.billing?.liveSubscriptionIds ?? [],
      r2Bytes: picture.assetsBytes + picture.brandingBytes,
      r2Objects: context.assetsObjects + context.brandingObjects,
      pendingEmails: context.pendingEmails,
    };
  }

  private toPreview(
    context: TenantDeletionContext,
    picture: ProviderPicture,
    adminMember: boolean,
  ): DeletionPreviewDto {
    const registrar = registrarOf(picture.inspection);
    const autoRenew = registrar?.autoRenew ?? null;
    const otherDns =
      context.domain?.dnsProvider &&
      context.domain.dnsProvider !== this.dns.provider
        ? context.domain.dnsProvider
        : null;
    const flags = deletionWarnings({
      paidNotRenewed: renewalPaidNotRenewed(picture.inspection),
      balance: picture.billing?.balance ?? 0,
      openInvoices: picture.billing?.openInvoices ?? 0,
      otherDnsProvider: otherDns,
      autoRenewNeedsAttention: autoRenewNeedsAttention({
        source: context.domain?.source ?? null,
        registrarDomainId: context.domain?.registrarDomainId ?? null,
        autoRenew,
      }),
      adminMember,
    });
    return {
      tenantId: context.tenantId,
      userId: context.userId,
      slug: context.slug,
      emailMasked: maskEmail(context.email),
      stripe: {
        customerId: context.stripeCustomerId,
        liveSubscriptionIds: picture.billing?.liveSubscriptionIds ?? [],
        balance: picture.billing?.balance ?? 0,
        openInvoices: picture.billing?.openInvoices ?? 0,
      },
      domain: context.domain
        ? {
            name: context.domain.name,
            source: context.domain.source,
            dnsProvider: context.domain.dnsProvider,
            dnsZoneId: context.domain.dnsZoneId,
            activeDnsProvider: this.dns.provider,
            zoneOnActiveProvider:
              otherDns == null && context.domain.dnsProvider != null,
            vercelInProject: vercelInProject(picture.inspection),
            expiresAt: context.domain.expiresAt,
            autoRenew,
            renewalDate: registrar?.renewalDate ?? context.domain.expiresAt,
          }
        : null,
      analytics: {
        propertyId: context.ga4PropertyId,
        isMock: context.analyticsIsMock,
      },
      storage: {
        assetsBytes: picture.assetsBytes,
        brandingBytes: picture.brandingBytes,
        assetsObjects: context.assetsObjects,
        brandingObjects: context.brandingObjects,
      },
      pendingEmails: context.pendingEmails,
      warnings: flags.warnings,
      blocking: flags.blocking,
      whatIsKept: [...WHAT_IS_KEPT],
    };
  }
}

export function toDeletionJobDto(job: DeletionJob): DeletionJobDto {
  return {
    id: job.id,
    tenantId: job.tenantId,
    userId: job.userId,
    slug: job.slug,
    snapshot: job.snapshot,
    notifyCustomer: job.notifyCustomer,
    status: job.status,
    steps: job.steps,
    reason: job.reason,
    actorUserId: job.actorUserId,
    actorEmail: job.actorEmail,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    finishedAt: job.finishedAt,
  };
}

function registrarOf(
  inspection: DomainInspection | null,
): RegistrarInspection | null {
  const registrar = inspection?.registrar;
  if (!registrar || 'error' in registrar) return null;
  return registrar;
}

function vercelInProject(inspection: DomainInspection | null): boolean | null {
  const vercel = inspection?.vercel;
  if (!vercel || 'error' in vercel) return null;
  return vercel.inProject;
}
