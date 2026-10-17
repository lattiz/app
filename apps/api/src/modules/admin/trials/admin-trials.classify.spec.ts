import {
  classifyTrial,
  conversionRate,
  hoursToConvert,
  medianHours,
  summarizeTrials,
  type TrialSummarySample,
} from './admin-trials.classify';

const NOW = new Date('2026-06-15T00:00:00.000Z');
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const POLICY = { enabled: true, trialDays: 7 };

function startedForRemaining(remainingMs: number): string {
  return new Date(NOW.getTime() + remainingMs - 7 * DAY_MS).toISOString();
}

describe('classifyTrial', () => {
  it('keeps an open window active at 48h and expiring under it', () => {
    const active = classifyTrial(
      {
        isEntitled: false,
        plan: 'none',
        previewStartedAt: startedForRemaining(48 * HOUR_MS),
        convertedAt: null,
      },
      POLICY,
      NOW,
    );
    expect(active.state).toBe('active');

    const expiring = classifyTrial(
      {
        isEntitled: false,
        plan: 'none',
        previewStartedAt: startedForRemaining(48 * HOUR_MS - 1),
        convertedAt: null,
      },
      POLICY,
      NOW,
    );
    expect(expiring.state).toBe('expiring');
    expect(expiring.previewExpiresAt?.toISOString()).toBe(
      new Date(NOW.getTime() + 48 * HOUR_MS - 1).toISOString(),
    );
  });

  it('closes the window at the exclusive end', () => {
    const expired = classifyTrial(
      {
        isEntitled: false,
        plan: 'none',
        previewStartedAt: startedForRemaining(0),
        convertedAt: null,
      },
      POLICY,
      NOW,
    );
    expect(expired.state).toBe('expired');
  });

  it('treats a later subscription as converted while the window is open', () => {
    const started = startedForRemaining(10 * HOUR_MS);
    const convertedAt = new Date(
      new Date(started).getTime() + 2 * HOUR_MS,
    ).toISOString();
    const result = classifyTrial(
      {
        isEntitled: true,
        plan: 'pro',
        previewStartedAt: started,
        convertedAt,
      },
      POLICY,
      NOW,
    );
    expect(result.state).toBe('converted');
    expect(hoursToConvert(started, convertedAt)).toBe(2);
  });

  it('does not call an entitled tenant converted without that subscription', () => {
    const result = classifyTrial(
      {
        isEntitled: true,
        plan: 'pro',
        previewStartedAt: startedForRemaining(10 * HOUR_MS),
        convertedAt: null,
      },
      POLICY,
      NOW,
    );
    expect(result.state).toBe('expired');
    expect(result.previewExpiresAt).toBeNull();
  });

  it('ignores the enabled flag when naming the window', () => {
    const result = classifyTrial(
      {
        isEntitled: false,
        plan: 'none',
        previewStartedAt: startedForRemaining(3 * DAY_MS),
        convertedAt: null,
      },
      { enabled: false, trialDays: 7 },
      NOW,
    );
    expect(result.state).toBe('active');
  });

  it('expires a non-none plan that never converted', () => {
    const result = classifyTrial(
      {
        isEntitled: false,
        plan: 'basico',
        previewStartedAt: startedForRemaining(3 * DAY_MS),
        convertedAt: null,
      },
      POLICY,
      NOW,
    );
    expect(result.state).toBe('expired');
  });
});

describe('trial summary math', () => {
  it('returns null rates and median when there is nothing to divide', () => {
    expect(conversionRate(0, 0)).toBeNull();
    expect(conversionRate(4, 1)).toBe(0.25);
    expect(medianHours([])).toBeNull();
    expect(medianHours([Number.NaN, Number.POSITIVE_INFINITY])).toBeNull();
    expect(medianHours([3, 1, 2])).toBe(2);
    expect(medianHours([4, 1])).toBe(2.5);
  });

  it('rates only trials started in the window and medians every conversion', () => {
    const samples: TrialSummarySample[] = [
      {
        startedAt: new Date(NOW.getTime() - DAY_MS),
        state: 'converted',
        hoursToConvert: 10,
      },
      {
        startedAt: new Date(NOW.getTime() - 10 * DAY_MS),
        state: 'active',
        hoursToConvert: null,
      },
      {
        startedAt: new Date(NOW.getTime() - 30 * DAY_MS),
        state: 'converted',
        hoursToConvert: 5,
      },
      {
        startedAt: new Date(NOW.getTime() - 40 * DAY_MS),
        state: 'converted',
        hoursToConvert: 20,
      },
      {
        startedAt: new Date(NOW.getTime() - 100 * DAY_MS),
        state: 'expired',
        hoursToConvert: null,
      },
    ];

    expect(summarizeTrials(samples, NOW)).toEqual({
      active: 1,
      expiring: 0,
      expired: 1,
      converted: 3,
      conversionRate30d: 2 / 3,
      conversionRate90d: 3 / 4,
      medianHoursToConvert: 10,
    });
  });
});
