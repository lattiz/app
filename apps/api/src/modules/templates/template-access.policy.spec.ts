import { computeIsEntitled } from '../../common/billing/entitlement';
import {
  evaluateTemplateAccess,
  isTemplateLocked,
  planRankForTemplates,
  templatePlanFor,
} from './template-access.policy';

const DAY = 86_400_000;
const future = () => new Date(Date.now() + 10 * DAY);
const past = () => new Date(Date.now() - DAY);

describe('evaluateTemplateAccess', () => {
  it.each`
    plan             | tier       | allowed
    ${'basico'}      | ${'basic'} | ${true}
    ${'basico'}      | ${'pro'}   | ${false}
    ${'pro'}         | ${'basic'} | ${true}
    ${'pro'}         | ${'pro'}   | ${true}
    ${'empresarial'} | ${'basic'} | ${true}
    ${'empresarial'} | ${'pro'}   | ${true}
    ${'none'}        | ${'basic'} | ${true}
    ${'none'}        | ${'pro'}   | ${false}
    ${'trial'}       | ${'pro'}   | ${false}
    ${null}          | ${'pro'}   | ${false}
    ${'unknown'}     | ${'pro'}   | ${false}
    ${'constructor'} | ${'pro'}   | ${false}
    ${'pro'}         | ${'gold'}  | ${true}
    ${'basico'}      | ${'gold'}  | ${false}
  `(
    '$plan on a $tier template → allowed=$allowed',
    ({ plan, tier, allowed }) => {
      expect(evaluateTemplateAccess(plan, tier)).toEqual({
        allowed,
        reason: allowed ? null : 'REQUIRES_PRO',
      });
    },
  );

  it('ranks by comparison, not string equality', () => {
    expect(planRankForTemplates('empresarial')).toBeGreaterThan(
      planRankForTemplates('pro'),
    );
    expect(planRankForTemplates('pro')).toBeGreaterThan(
      planRankForTemplates('basico'),
    );
  });
});

describe('lock and pick rules over the live entitlement', () => {
  type Case = {
    plan: string | null;
    status: string | null;
    periodEnd: Date | null;
    tier: string | null;
    locked: boolean;
    picksPro: boolean;
  };
  const cases: [string, Case][] = [
    [
      'active Pro on a Pro template',
      {
        plan: 'pro',
        status: 'active',
        periodEnd: future(),
        tier: 'pro',
        locked: false,
        picksPro: true,
      },
    ],
    [
      'active Básico after a downgrade, on a Pro template',
      {
        plan: 'basico',
        status: 'active',
        periodEnd: future(),
        tier: 'pro',
        locked: true,
        picksPro: false,
      },
    ],
    [
      'active Básico on a Básico template',
      {
        plan: 'basico',
        status: 'active',
        periodEnd: future(),
        tier: 'basic',
        locked: false,
        picksPro: false,
      },
    ],
    [
      'trialing Básico on a Pro template',
      {
        plan: 'basico',
        status: 'trialing',
        periodEnd: future(),
        tier: 'pro',
        locked: true,
        picksPro: false,
      },
    ],
    [
      'empresarial on a Pro template',
      {
        plan: 'empresarial',
        status: 'active',
        periodEnd: future(),
        tier: 'pro',
        locked: false,
        picksPro: true,
      },
    ],
    [
      'Pro whose payment lapsed (past_due)',
      {
        plan: 'pro',
        status: 'past_due',
        periodEnd: future(),
        tier: 'pro',
        locked: false,
        picksPro: true,
      },
    ],
    [
      'Pro whose period ended without a webhook (status still active)',
      {
        plan: 'pro',
        status: 'active',
        periodEnd: past(),
        tier: 'pro',
        locked: false,
        picksPro: true,
      },
    ],
    [
      'Básico whose period ended, on a Pro template (lapse, not downgrade)',
      {
        plan: 'basico',
        status: 'active',
        periodEnd: past(),
        tier: 'pro',
        locked: false,
        picksPro: false,
      },
    ],
    [
      'canceled Pro synced to plan none',
      {
        plan: 'none',
        status: 'canceled',
        periodEnd: past(),
        tier: 'pro',
        locked: false,
        picksPro: false,
      },
    ],
    [
      'free preview, never paid',
      {
        plan: 'none',
        status: null,
        periodEnd: null,
        tier: 'basic',
        locked: false,
        picksPro: false,
      },
    ],
    [
      'no template yet',
      {
        plan: 'basico',
        status: 'active',
        periodEnd: future(),
        tier: null,
        locked: false,
        picksPro: false,
      },
    ],
  ];

  it.each(cases)('%s', (_name, c) => {
    const state = {
      plan: c.plan,
      isEntitled: computeIsEntitled(
        c.status ? { status: c.status, currentPeriodEnd: c.periodEnd } : null,
      ),
    };
    expect(isTemplateLocked(state, c.tier)).toBe(c.locked);
    expect(evaluateTemplateAccess(templatePlanFor(state), 'pro').allowed).toBe(
      c.picksPro,
    );
  });
});
