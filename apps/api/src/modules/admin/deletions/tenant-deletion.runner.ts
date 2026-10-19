import { Inject, Injectable, Logger } from '@nestjs/common';
import { GA4_GATEWAY, type Ga4Gateway } from '../../analytics/ga4.gateway';
import { BillingService } from '../../billing/billing.service';
import {
  DNS_PROVIDER_PORT,
  DNS_ZONE_INSPECTION_PORT,
  type DnsProviderPort,
  type DnsZoneInspectionPort,
} from '../../domains/domain/dns-provider.port';
import { DomainsService } from '../../domains/domains.service';
import { EmailOutboxService } from '../../email/application/email-outbox.service';
import {
  AUTH_ADMIN_PORT,
  type AuthAdminPort,
} from '../../me/domain/auth-admin.port';
import {
  USER_REPOSITORY_PORT,
  type UserRepositoryPort,
} from '../../me/domain/user-repository.port';
import {
  OBJECT_STORAGE_PORT,
  type ObjectStoragePort,
} from '../../storage/domain/object-storage.port';
import {
  tenantAssetsPrefix,
  tenantBrandingPrefix,
} from '../../storage/domain/storage-path';
import { AdminAuditService } from '../audit/admin-audit.service';
import { AdminMembersService } from '../auth/admin-members.service';
import {
  clearsNotifyEmail,
  completionStatus,
  formatExpiry,
  stepIsSettled,
  type DeletionJob,
  type DeletionStep,
  type DeletionStepKey,
  type StepOutcome,
} from './tenant-deletion.model';
import { TenantDeletionRepository } from './tenant-deletion.repository';

const GA4_EDITOR_MESSAGE =
  'La cuenta de servicio necesita rol de editor en la cuenta de GA4';
const ERROR_MAX = 500;

export interface DeletionJobStore {
  claim(id: string): Promise<DeletionJob | null>;
  writeSteps(id: string, steps: DeletionStep[]): Promise<boolean>;
  finish(input: {
    id: string;
    status: 'completed' | 'completed_manual' | 'failed';
    steps: DeletionStep[];
    clearNotifyEmail: boolean;
  }): Promise<boolean>;
}

/** Side effects of one job. Tests pass fakes; production wires the real ports. */
export interface DeletionEffects {
  now(): string;
  setOffline(tenantId: string): Promise<void>;
  cancelSubscriptions(userId: string): Promise<void>;
  releaseDomain(tenantId: string): Promise<void>;
  activeDnsProvider(): string;
  deleteProperty(propertyId: string): Promise<{ deleted: boolean }>;
  ga4IsMock: boolean;
  removePrefix(
    prefix: string,
  ): Promise<{ deletedObjects: number; deletedBytes: number }>;
  usageBytes(prefix: string): Promise<number>;
  cancelPendingEmails(tenantId: string): Promise<void>;
  enqueueAccountDeleted(
    email: string,
    idempotencyKey: string,
  ): Promise<boolean>;
  pendingEmailKinds(tenantId: string): Promise<string[]>;
  isActiveAdmin(userId: string): Promise<boolean>;
  deleteProfile(userId: string): Promise<void>;
  deleteAuthUser(userId: string): Promise<void>;
  liveSubscriptionIds(customerId: string): Promise<string[]>;
  tenantAndUserGone(
    tenantId: string,
    userId: string,
  ): Promise<{ tenant: boolean; user: boolean }>;
  zoneExists(domain: string): Promise<boolean>;
  auditFinish(
    job: DeletionJob,
    status: string,
    steps: DeletionStep[],
  ): Promise<void>;
}

@Injectable()
export class TenantDeletionRunner {
  private readonly logger = new Logger(TenantDeletionRunner.name);

  constructor(
    private readonly jobs: TenantDeletionRepository,
    private readonly billing: BillingService,
    private readonly domains: DomainsService,
    private readonly emails: EmailOutboxService,
    private readonly members: AdminMembersService,
    private readonly audit: AdminAuditService,
    @Inject(GA4_GATEWAY) private readonly ga4: Ga4Gateway,
    @Inject(DNS_PROVIDER_PORT) private readonly dns: DnsProviderPort,
    @Inject(DNS_ZONE_INSPECTION_PORT)
    private readonly zones: DnsZoneInspectionPort,
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: ObjectStoragePort,
    @Inject(USER_REPOSITORY_PORT) private readonly users: UserRepositoryPort,
    @Inject(AUTH_ADMIN_PORT) private readonly authAdmin: AuthAdminPort,
  ) {}

  /**
   * Claims the row, then runs the steps without awaiting them.
   * The caller returns 202 as soon as the claim succeeds.
   */
  async kick(id: string): Promise<boolean> {
    const job = await this.jobs.claim(id);
    if (!job) return false;
    void this.execute(job).catch((error: unknown) => {
      this.logger.error(`tenant deletion ${id} crashed: ${errorText(error)}`);
    });
    return true;
  }

  /** Claims and waits. Used by tests and by a retry that must observe the race. */
  async run(id: string): Promise<void> {
    const job = await this.jobs.claim(id);
    if (!job) return;
    await this.execute(job);
  }

  private execute(job: DeletionJob): Promise<void> {
    return runTenantDeletion(job, this.jobs, this.effects(), (message) =>
      this.logger.error(message),
    );
  }

  private effects(): DeletionEffects {
    return {
      now: () => new Date().toISOString(),
      setOffline: (tenantId) => this.jobs.setTenantOffline(tenantId),
      cancelSubscriptions: (userId) =>
        this.billing.cancelSubscriptionsForUser(userId),
      releaseDomain: async (tenantId) => {
        await this.domains.releaseDomain(tenantId);
      },
      activeDnsProvider: () => this.dns.provider,
      deleteProperty: (propertyId) => this.ga4.deleteProperty(propertyId),
      ga4IsMock: this.ga4.isMock,
      removePrefix: (prefix) => this.storage.removePrefix(prefix),
      usageBytes: (prefix) => this.storage.usageBytes(prefix),
      cancelPendingEmails: (tenantId) =>
        this.jobs.cancelPendingEmails(tenantId),
      enqueueAccountDeleted: (email, key) => this.enqueueNotice(email, key),
      pendingEmailKinds: (tenantId) => this.jobs.pendingEmailKinds(tenantId),
      isActiveAdmin: (userId) => this.memberStillActive(userId),
      deleteProfile: (userId) => this.users.delete(userId),
      deleteAuthUser: (userId) => this.deleteAuthUser(userId),
      liveSubscriptionIds: (customerId) =>
        this.billing.listLiveSubscriptionIds(customerId),
      tenantAndUserGone: (tenantId, userId) =>
        this.jobs.accountGone(tenantId, userId),
      zoneExists: async (domain) =>
        (await this.zones.inspectZone(domain)).exists,
      auditFinish: (job, status, steps) => this.auditFinish(job, status, steps),
    };
  }

  private async memberStillActive(userId: string): Promise<boolean> {
    this.members.invalidate(userId);
    const member = await this.members.findActiveMember(userId);
    return member != null;
  }

  private async enqueueNotice(email: string, key: string): Promise<boolean> {
    const inserted = await this.emails.enqueue(
      'account_deleted',
      email,
      {},
      key,
      null,
    );
    if (inserted) return true;
    return this.jobs.hasIdempotencyKey(key);
  }

  /** A second delete of an already-removed auth user is success. */
  private async deleteAuthUser(userId: string): Promise<void> {
    try {
      await this.authAdmin.deleteUser(userId);
    } catch (error) {
      const message = errorText(error);
      if (/not found/i.test(message)) return;
      throw error;
    }
  }

  private async auditFinish(
    job: DeletionJob,
    status: string,
    steps: DeletionStep[],
  ): Promise<void> {
    await this.audit.record({
      actorUserId: job.actorUserId,
      actorEmail: job.actorEmail,
      action: 'tenant.delete.finish',
      targetType: 'tenant',
      targetId: job.tenantId,
      reason: job.reason,
      after: {
        jobId: job.id,
        status,
        steps: steps.map((step) => ({
          key: step.key,
          status: step.status,
          detail: step.detail,
          error: step.error,
        })),
      },
    });
  }
}

export async function runTenantDeletion(
  job: DeletionJob,
  store: DeletionJobStore,
  effects: DeletionEffects,
  log: (message: string) => void = () => undefined,
): Promise<void> {
  try {
    for (let index = 0; index < job.steps.length; index += 1) {
      const step = job.steps[index];
      if (!step || stepIsSettled(step)) continue;
      const outcome = await runOne(job, index, store, effects);
      if (outcome === 'lost') {
        log(`tenant deletion ${job.id} lost its claim`);
        return;
      }
      if (outcome === 'stop') return;
    }
    await finishJob(job, store, effects, completionStatus(job.steps), log);
  } catch (error) {
    log(`tenant deletion ${job.id} failed: ${errorText(error)}`);
    failOpenStep(job, errorText(error), effects.now());
    await finishJob(job, store, effects, 'failed', log);
  }
}

async function runOne(
  job: DeletionJob,
  index: number,
  store: DeletionJobStore,
  effects: DeletionEffects,
): Promise<'continue' | 'stop' | 'lost'> {
  const step = job.steps[index];
  if (!step) return 'stop';
  step.status = 'running';
  step.startedAt = effects.now();
  step.error = null;
  if (!(await store.writeSteps(job.id, job.steps))) return 'lost';

  let outcome: StepOutcome;
  try {
    outcome = await perform(step.key, job, effects);
  } catch (error) {
    outcome = { status: 'failed', detail: null, error: errorText(error) };
  }

  step.status = outcome.status;
  step.finishedAt = effects.now();
  step.detail = outcome.detail;
  step.error = outcome.error;
  if (outcome.status === 'failed') {
    const finished = await finishJob(job, store, effects, 'failed');
    return finished ? 'stop' : 'lost';
  }
  if (!(await store.writeSteps(job.id, job.steps))) return 'lost';
  return 'continue';
}

async function perform(
  key: DeletionStepKey,
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  switch (key) {
    case 'offline':
      return offline(job, effects);
    case 'stripe':
      return stripe(job, effects);
    case 'domain':
      return domain(job, effects);
    case 'registrar':
      return registrar(job);
    case 'analytics':
      return analytics(job, effects);
    case 'storage':
      return storage(job, effects);
    case 'emails':
      return emails(job, effects);
    case 'account':
      return account(job, effects);
    case 'verify':
      return verify(job, effects);
    default:
      return {
        status: 'failed',
        detail: null,
        error: `Paso desconocido: ${key}`,
      };
  }
}

async function offline(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  await effects.setOffline(job.tenantId);
  return { status: 'done', detail: 'El sitio quedó inactivo.', error: null };
}

async function stripe(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  await effects.cancelSubscriptions(job.userId);
  return {
    status: 'done',
    detail: 'Suscripciones vivas canceladas. El cliente de Stripe se conserva.',
    error: null,
  };
}

async function domain(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  const recorded = job.snapshot.domain;
  if (!recorded) {
    return { status: 'skipped', detail: 'Sin dominio.', error: null };
  }
  await effects.releaseDomain(job.tenantId);
  if (
    recorded.dnsProvider &&
    recorded.dnsProvider !== effects.activeDnsProvider()
  ) {
    return {
      status: 'manual',
      detail: `Borra la zona ${recorded.name} en ${recorded.dnsProvider}`,
      error: null,
    };
  }
  return { status: 'done', detail: recorded.name, error: null };
}

function registrar(job: DeletionJob): StepOutcome {
  const recorded = job.snapshot.domain;
  if (
    !recorded ||
    recorded.source !== 'lattiz_managed' ||
    !recorded.registrarDomainId
  ) {
    return {
      status: 'skipped',
      detail: 'Sin dominio en el registrador.',
      error: null,
    };
  }
  if (recorded.autoRenew === 'off') {
    const when = formatExpiry(recorded.renewalDate ?? recorded.expiresAt);
    return {
      status: 'done',
      detail: `Se deja expirar el ${when}`,
      error: null,
    };
  }
  return {
    status: 'manual',
    detail: `Apaga la renovación automática en Openprovider para ${recorded.name}`,
    error: null,
  };
}

async function analytics(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  const propertyId = job.snapshot.ga4PropertyId;
  if (!propertyId) {
    return { status: 'skipped', detail: 'Sin propiedad de GA4.', error: null };
  }
  if (job.snapshot.analyticsIsMock && !effects.ga4IsMock) {
    return {
      status: 'skipped',
      detail: 'propiedad simulada, nada que borrar en Google',
      error: null,
    };
  }
  try {
    const result = await effects.deleteProperty(propertyId);
    return {
      status: 'done',
      detail: result.deleted
        ? 'Propiedad borrada.'
        : 'La propiedad ya no existía.',
      error: null,
    };
  } catch (error) {
    if (isGa4PermissionDenied(error)) {
      return {
        status: 'manual',
        detail: errorText(error),
        error: null,
      };
    }
    throw error;
  }
}

async function storage(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  const assets = await effects.removePrefix(tenantAssetsPrefix(job.tenantId));
  const branding = await effects.removePrefix(
    tenantBrandingPrefix(job.tenantId),
  );
  return {
    status: 'done',
    detail:
      `assets ${assets.deletedObjects} objetos, ${assets.deletedBytes} bytes; ` +
      `branding ${branding.deletedObjects} objetos, ${branding.deletedBytes} bytes`,
    error: null,
  };
}

async function emails(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  await effects.cancelPendingEmails(job.tenantId);
  if (!job.notifyCustomer || !job.notifyEmail) {
    return {
      status: 'done',
      detail: 'Correos pendientes cancelados.',
      error: null,
    };
  }
  const queued = await effects.enqueueAccountDeleted(
    job.notifyEmail,
    `account_deleted:admin:${job.tenantId}`,
  );
  if (!queued) {
    return {
      status: 'failed',
      detail: null,
      error: 'No se pudo encolar el aviso de cuenta borrada.',
    };
  }
  return {
    status: 'done',
    detail: 'Correos pendientes cancelados y aviso encolado.',
    error: null,
  };
}

async function account(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  if (await effects.isActiveAdmin(job.userId)) {
    return {
      status: 'failed',
      detail: null,
      error: 'Revócalo del equipo primero',
    };
  }
  await effects.deleteProfile(job.userId);
  await effects.deleteAuthUser(job.userId);
  return {
    status: 'done',
    detail: 'Perfil y usuario de acceso borrados.',
    error: null,
  };
}

async function verify(
  job: DeletionJob,
  effects: DeletionEffects,
): Promise<StepOutcome> {
  const problems: string[] = [];
  const customerId = job.snapshot.stripeCustomerId;
  if (customerId) {
    const live = await effects.liveSubscriptionIds(customerId);
    if (live.length > 0) {
      problems.push(`Stripe sigue con suscripciones vivas: ${live.join(', ')}`);
    }
  }
  const gone = await effects.tenantAndUserGone(job.tenantId, job.userId);
  if (!gone.tenant) problems.push('El cliente sigue en la base de datos.');
  if (!gone.user) problems.push('El usuario sigue en la base de datos.');

  const assets = await effects.usageBytes(tenantAssetsPrefix(job.tenantId));
  const branding = await effects.usageBytes(tenantBrandingPrefix(job.tenantId));
  if (assets !== 0 || branding !== 0) {
    problems.push(`R2 todavía tiene ${assets + branding} bytes.`);
  }

  const recorded = job.snapshot.domain;
  if (
    recorded?.dnsProvider &&
    recorded.dnsProvider === effects.activeDnsProvider()
  ) {
    const exists = await effects.zoneExists(recorded.name);
    if (exists) problems.push(`La zona ${recorded.name} sigue existiendo.`);
  }

  const pending = await effects.pendingEmailKinds(job.tenantId);
  const unexpected = pending.filter((kind) => kind !== 'account_deleted');
  if (unexpected.length > 0) {
    problems.push(`Correos pendientes: ${unexpected.join(', ')}`);
  }

  if (problems.length > 0) {
    return { status: 'failed', detail: problems.join(' '), error: null };
  }
  return { status: 'done', detail: 'Verificación completa.', error: null };
}

async function finishJob(
  job: DeletionJob,
  store: DeletionJobStore,
  effects: DeletionEffects,
  status: 'completed' | 'completed_manual' | 'failed',
  log: (message: string) => void = () => undefined,
): Promise<boolean> {
  const saved = await store.finish({
    id: job.id,
    status,
    steps: job.steps,
    clearNotifyEmail: clearsNotifyEmail(status),
  });
  if (!saved) return false;
  if (clearsNotifyEmail(status)) job.notifyEmail = null;
  job.status = status;
  try {
    await effects.auditFinish(job, status, job.steps);
  } catch (error) {
    log(`tenant.delete.finish audit failed for ${job.id}: ${errorText(error)}`);
  }
  return true;
}

function failOpenStep(job: DeletionJob, message: string, now: string): void {
  const open = job.steps.find(
    (step) => step.status === 'running' || step.status === 'pending',
  );
  if (!open) return;
  open.status = 'failed';
  open.error = message.slice(0, ERROR_MAX);
  open.finishedAt = now;
  if (!open.startedAt) open.startedAt = now;
}

function isGa4PermissionDenied(error: unknown): boolean {
  if (error instanceof Error && error.message === GA4_EDITOR_MESSAGE) {
    return true;
  }
  const code = (error as { code?: unknown } | null)?.code;
  return code === 7 || code === 'PERMISSION_DENIED';
}

function errorText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, ERROR_MAX);
}
