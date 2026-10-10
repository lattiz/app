import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { computeIsEntitled } from '../../common/billing/entitlement';
import { type Database, DATABASE } from '../../database/database.module';
import {
  evaluateTemplateAccess,
  isTemplateLocked,
  TEMPLATE_ACCESS_ASSUMPTIONS,
  templatePlanFor,
  type TenantPlanState,
} from './template-access.policy';
import {
  TemplateLockedByPlanException,
  TemplateRequiresProException,
} from './templates.exceptions';

interface SqlExecutor {
  execute(query: SQL): Promise<unknown>;
}

interface TenantTemplateRow {
  plan: string | null;
  status: string | null;
  current_period_end: string | Date | null;
  template_id: string | null;
  template_name: string | null;
  template_tier: string | null;
}

export interface CurrentTemplate {
  id: string;
  name: string | null;
  tier: string;
}

/** Everything the template rules need about one tenant, read in one query. */
export interface TenantTemplateState extends TenantPlanState {
  /** The plan used to decide which templates the tenant may pick. */
  templatePlan: string;
  current: CurrentTemplate | null;
  locked: boolean;
}

/**
 * Resolves template access from live rows: `tenants.plan`, the latest
 * subscription's status and period end (computeIsEntitled) and the tier of the
 * template in `site_schemas`. Every query filters by tenant id.
 */
@Injectable()
export class TemplateAccessService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async stateForTenant(
    tenantId: string,
    executor: SqlExecutor = this.db,
  ): Promise<TenantTemplateState> {
    const rows = (await executor.execute(
      sql`SELECT t.plan, s.status, s.current_period_end,
                 ss.template_id, tp.name AS template_name, tp.tier AS template_tier
          FROM public.tenants t
          LEFT JOIN LATERAL (
            SELECT status, current_period_end FROM public.subscriptions
            WHERE tenant_id = t.id
            ORDER BY created_at DESC
            LIMIT 1
          ) s ON true
          LEFT JOIN public.site_schemas ss ON ss.tenant_id = t.id
          LEFT JOIN public.templates tp ON tp.id = ss.template_id
          WHERE t.id = ${tenantId}::uuid
          LIMIT 1`,
    )) as unknown as TenantTemplateRow[];
    return toState(rows[0]);
  }

  /** Tenant id for the caller, or null when the user has no tenant yet. */
  async tenantIdForUser(userSub: string): Promise<string | null> {
    const rows = (await this.db.execute(
      sql`SELECT id FROM public.tenants WHERE user_id = ${userSub}::uuid LIMIT 1`,
    )) as unknown as { id: string }[];
    return rows[0]?.id ?? null;
  }

  /** Throws TEMPLATE_REQUIRES_PRO when the tenant's plan does not include `tier`. */
  assertCanUse(
    state: TenantTemplateState,
    templateId: string,
    tier: string,
  ): void {
    if (!evaluateTemplateAccess(state.templatePlan, tier).allowed)
      throw new TemplateRequiresProException(templateId);
  }

  /** Throws TEMPLATE_LOCKED_BY_PLAN while the current template is above the tenant's active plan (A2). */
  async assertNotLocked(tenantId: string): Promise<void> {
    if (!TEMPLATE_ACCESS_ASSUMPTIONS.lockBlocksEditing) return;
    const state = await this.stateForTenant(tenantId);
    if (state.locked)
      throw new TemplateLockedByPlanException(
        state.current?.id ?? null,
        state.current?.tier ?? null,
      );
  }
}

function toState(row: TenantTemplateRow | undefined): TenantTemplateState {
  const plan = row?.plan ?? null;
  const isEntitled = computeIsEntitled(
    row?.status
      ? { status: row.status, currentPeriodEnd: row.current_period_end }
      : null,
  );
  const current =
    row?.template_id && row.template_tier
      ? {
          id: row.template_id,
          name: row.template_name,
          tier: row.template_tier,
        }
      : null;
  const planState = { plan, isEntitled };
  return {
    ...planState,
    templatePlan: templatePlanFor(planState),
    current,
    locked: isTemplateLocked(planState, current?.tier ?? null),
  };
}
