/** The plan domain rules use: the lower of the stored plan and any scheduled plan change. */
export interface EffectivePlanPort {
  /** `storedPlan` is `tenants.plan`; resolves to `basico` when the billing provider cannot be read. */
  effectivePlanFor(
    tenantId: string,
    storedPlan: string | null,
  ): Promise<string | null>;
}

export const EFFECTIVE_PLAN_PORT = Symbol('EFFECTIVE_PLAN_PORT');
