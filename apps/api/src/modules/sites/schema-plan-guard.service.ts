import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import { evaluateTemplateAccess } from '../templates/template-access.policy';
import { TemplateAccessService } from '../templates/template-access.service';
import { PLAN_CATALOG } from './plan-catalog.generated';
import {
  decidePlanGuard,
  hasMarkers,
  mergeMarkers,
  NO_MARKERS,
  parseEnforcementMode,
  proMarkersInHtml,
  proMarkersInProject,
  type ProMarkers,
  type SchemaPlanEnforcement,
} from './plan-guard';
import { SectionsRequireProException } from './sites.exceptions';

export type PlanGuardAction = 'save' | 'publish';

/**
 * Server-side plan check on schema save and publish (the editor only filters blocks in the
 * client). SCHEMA_PLAN_ENFORCEMENT: off | report (default: log, never block) | enforce (reject
 * Pro-only sections a plan without Pro adds). Clean payloads cost one in-memory walk, no query.
 */
@Injectable()
export class SchemaPlanGuard {
  private readonly logger = new Logger(SchemaPlanGuard.name);
  readonly mode: SchemaPlanEnforcement;

  constructor(
    config: ConfigService,
    @Inject(DATABASE) private readonly db: Database,
    private readonly templateAccess: TemplateAccessService,
  ) {
    const raw = config.get<string>('SCHEMA_PLAN_ENFORCEMENT');
    const mode = parseEnforcementMode(raw);
    if (mode === null)
      this.logger.warn(
        `SCHEMA_PLAN_ENFORCEMENT="${raw}" is not off|report|enforce; using report.`,
      );
    this.mode = mode ?? 'report';
  }

  async check(
    tenantId: string,
    action: PlanGuardAction,
    project: unknown,
    exportedHtml?: string,
  ): Promise<void> {
    if (this.mode === 'off') return;
    const scanned = proMarkersInProject(project);
    const found = mergeMarkers(
      scanned,
      exportedHtml ? proMarkersInHtml(exportedHtml) : NO_MARKERS,
    );
    if (!hasMarkers(found)) return;

    const state = await this.templateAccess.stateForTenant(tenantId);
    const proIncluded = evaluateTemplateAccess(
      state.templatePlan,
      'pro',
    ).allowed;
    if (proIncluded) return;

    const decision = decidePlanGuard({
      found,
      proIncluded,
      currentTemplateTier: state.current?.tier ?? null,
      templateMarkers: state.current
        ? await this.templateMarkers(state.current.id)
        : NO_MARKERS,
    });
    if (decision.verdict === 'clean') return;

    const willBlock =
      this.mode === 'enforce' &&
      decision.verdict === 'flagged' &&
      decision.blocking;
    this.logger.warn(
      JSON.stringify({
        event: 'schema_plan_guard',
        mode: this.mode,
        action,
        tenantId,
        plan: state.plan,
        templatePlan: state.templatePlan,
        entitled: state.isEntitled,
        templateId: state.current?.id ?? null,
        templateTier: state.current?.tier ?? null,
        verdict: decision.verdict,
        sections: decision.offending.variants,
        hooks: decision.offending.hooks,
        truncated: scanned.truncated,
        blocked: willBlock,
        catalog: PLAN_CATALOG.manifestHash,
      }),
    );
    if (willBlock)
      throw new SectionsRequireProException(decision.offending.variants);
  }

  /** Only read when a payload has Pro markers on a plan without Pro (rare): no cache to go stale. */
  private async templateMarkers(templateId: string): Promise<ProMarkers> {
    const rows = (await this.db.execute(
      sql`SELECT grapesjs_json FROM public.templates WHERE id = ${templateId} LIMIT 1`,
    )) as unknown as { grapesjs_json: unknown }[];
    return rows[0] ? proMarkersInProject(rows[0].grapesjs_json) : NO_MARKERS;
  }
}
