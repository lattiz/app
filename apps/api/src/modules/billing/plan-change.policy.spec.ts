import {
  evaluatePlanChange,
  type PlanChangeSnapshot,
} from './plan-change.policy';

const healthy = (
  overrides: Partial<PlanChangeSnapshot> = {},
): PlanChangeSnapshot => ({
  status: 'active',
  canceling: false,
  itemCount: 1,
  currentPlan: 'basico',
  period: 'monthly',
  schedule: 'none',
  ...overrides,
});

describe('evaluatePlanChange', () => {
  it('allows an upgrade immediately and never consults domains', () => {
    expect(evaluatePlanChange(healthy(), 'pro', null)).toEqual({
      direction: 'upgrade',
      timing: 'immediate',
      blockers: [],
    });
    // A domain whose renewal is above the Básico cap does not block upgrading.
    expect(evaluatePlanChange(healthy(), 'pro', 'above_cap').blockers).toEqual(
      [],
    );
  });

  it('allows a downgrade at period end when the domain fits Básico', () => {
    expect(
      evaluatePlanChange(healthy({ currentPlan: 'pro' }), 'basico', 'ok'),
    ).toEqual({ direction: 'downgrade', timing: 'period_end', blockers: [] });
  });

  it.each([
    ['above_cap', 'DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP'],
    ['price_unavailable', 'DOWNGRADE_PRICE_UNAVAILABLE'],
    [null, 'DOWNGRADE_PRICE_UNAVAILABLE'],
  ] as const)('downgrade with domain check %p → %s', (check, blocker) => {
    expect(
      evaluatePlanChange(healthy({ currentPlan: 'pro' }), 'basico', check)
        .blockers,
    ).toEqual([blocker]);
  });

  it.each([null, 'canceled', 'incomplete_expired'])(
    'status %p → only NO_ACTIVE_SUBSCRIPTION',
    (status) => {
      expect(
        evaluatePlanChange(healthy({ status }), 'pro', null).blockers,
      ).toEqual(['NO_ACTIVE_SUBSCRIPTION']);
    },
  );

  it.each(['past_due', 'unpaid', 'incomplete', 'paused'])(
    'status %s → SUBSCRIPTION_NOT_ACTIVE',
    (status) => {
      expect(
        evaluatePlanChange(healthy({ status }), 'pro', null).blockers,
      ).toEqual(['SUBSCRIPTION_NOT_ACTIVE']);
    },
  );

  it('blocks a subscription scheduled to cancel (flexible cancel_at or classic flag)', () => {
    expect(
      evaluatePlanChange(healthy({ canceling: true }), 'pro', null).blockers,
    ).toEqual(['SUBSCRIPTION_CANCELING']);
  });

  it('blocks a pending change and the same plan', () => {
    expect(
      evaluatePlanChange(healthy({ schedule: 'pending' }), 'pro', null)
        .blockers,
    ).toEqual(['PLAN_CHANGE_PENDING']);
    expect(evaluatePlanChange(healthy(), 'basico', null)).toEqual({
      direction: 'none',
      timing: null,
      blockers: ['SAME_PLAN'],
    });
  });

  it.each<[string, Partial<PlanChangeSnapshot>]>([
    ['two items', { itemCount: 2 }],
    ['an unknown price', { currentPlan: null }],
    ['an unknown interval', { period: null }],
    ['a foreign schedule', { schedule: 'foreign' }],
  ])('blocks %s as UNSUPPORTED_SUBSCRIPTION', (_label, overrides) => {
    expect(
      evaluatePlanChange(healthy(overrides), 'pro', null).blockers,
    ).toContain('UNSUPPORTED_SUBSCRIPTION');
  });
});
