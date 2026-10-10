import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  currentRenewalNotice,
  renewalNoticeKey,
  renewalWindow,
  RENEWAL_DAY_MS,
  type RenewalNotice,
  type RenewalPhase,
} from './domain-renewal.policy';

const DAY = RENEWAL_DAY_MS;
const EXPIRES = new Date('2026-08-01T00:00:00.000Z');
const OPEN_DAYS = 28;
const LATE_DAYS = 15;

function at(offsetMs: number): Date {
  return new Date(EXPIRES.getTime() + offsetMs);
}

describe('renewalWindow', () => {
  const cases: Array<[string, number, RenewalPhase]> = [
    ['1ms before the window opens', -OPEN_DAYS * DAY - 1, 'not_due'],
    ['the instant the window opens', -OPEN_DAYS * DAY, 'open'],
    ['1ms before expiry', -1, 'open'],
    ['the instant of expiry', 0, 'late'],
    ['1ms before the late deadline', LATE_DAYS * DAY - 1, 'late'],
    ['the instant of the late deadline', LATE_DAYS * DAY, 'lapsed'],
    ['1ms after the late deadline', LATE_DAYS * DAY + 1, 'lapsed'],
  ];

  for (const [name, offsetMs, phase] of cases) {
    it(`is ${phase} at ${name}`, () => {
      const window = renewalWindow({
        expiresAt: EXPIRES,
        now: at(offsetMs),
        openDaysBefore: OPEN_DAYS,
        lateDays: LATE_DAYS,
      });
      assert.equal(window.phase, phase);
      assert.equal(window.expiresAt.getTime(), EXPIRES.getTime());
      assert.equal(
        window.opensAt.getTime(),
        EXPIRES.getTime() - OPEN_DAYS * DAY,
      );
      assert.equal(
        window.lateDeadlineAt.getTime(),
        EXPIRES.getTime() + LATE_DAYS * DAY,
      );
    });
  }

  it('has no late phase when lateDays is 0', () => {
    const justBefore = renewalWindow({
      expiresAt: EXPIRES,
      now: at(-1),
      openDaysBefore: OPEN_DAYS,
      lateDays: 0,
    });
    const atExpiry = renewalWindow({
      expiresAt: EXPIRES,
      now: at(0),
      openDaysBefore: OPEN_DAYS,
      lateDays: 0,
    });
    assert.equal(justBefore.phase, 'open');
    assert.equal(atExpiry.phase, 'lapsed');
    assert.equal(atExpiry.lateDeadlineAt.getTime(), EXPIRES.getTime());
  });
});

describe('currentRenewalNotice', () => {
  const before = [28, 14, 7, 3, 1, 0];
  const after = [7];

  function notice(
    offsetMs: number,
    overrides: {
      noticeDaysBefore?: readonly number[];
      lateNoticeDaysAfter?: readonly number[];
      openDaysBefore?: number;
      lateDays?: number;
    } = {},
  ): RenewalNotice | null {
    return currentRenewalNotice({
      expiresAt: EXPIRES,
      now: at(offsetMs),
      noticeDaysBefore: overrides.noticeDaysBefore ?? before,
      lateNoticeDaysAfter: overrides.lateNoticeDaysAfter ?? after,
      openDaysBefore: overrides.openDaysBefore ?? OPEN_DAYS,
      lateDays: overrides.lateDays ?? LATE_DAYS,
    });
  }

  it('returns null for empty lists inside the window', () => {
    assert.equal(
      notice(-DAY, { noticeDaysBefore: [], lateNoticeDaysAfter: [] }),
      null,
    );
  });

  it('ignores a before-notice further out than the open window', () => {
    assert.equal(notice(-14 * DAY, { noticeDaysBefore: [40] }), null);
    assert.deepEqual(notice(-14 * DAY, { noticeDaysBefore: [40, 14] }), {
      kind: 'before',
      days: 14,
    });
  });

  it('returns the later threshold when a cron day was missed', () => {
    assert.deepEqual(notice(-3 * DAY, { noticeDaysBefore: [14, 3] }), {
      kind: 'before',
      days: 3,
    });
    assert.deepEqual(notice(-3 * DAY - 1, { noticeDaysBefore: [14, 3] }), {
      kind: 'before',
      days: 14,
    });
  });

  it('hits a before-notice on its exact millisecond and not 1ms earlier', () => {
    assert.deepEqual(notice(-OPEN_DAYS * DAY), { kind: 'before', days: 28 });
    assert.equal(notice(-OPEN_DAYS * DAY - 1), null);
    assert.deepEqual(notice(-14 * DAY), { kind: 'before', days: 14 });
    assert.deepEqual(notice(-14 * DAY - 1), { kind: 'before', days: 28 });
    assert.deepEqual(notice(0), { kind: 'before', days: 0 });
    assert.deepEqual(notice(-1), { kind: 'before', days: 1 });
  });

  it('returns null outside the window even if a threshold was reached', () => {
    assert.equal(notice(-OPEN_DAYS * DAY - 1), null);
    assert.equal(notice(LATE_DAYS * DAY), null);
    assert.equal(notice(7 * DAY, { lateDays: 0 }), null);
  });

  it('ignores an after-notice at or beyond lateDays', () => {
    assert.deepEqual(
      notice(7 * DAY, { lateNoticeDaysAfter: [15, 7], noticeDaysBefore: [] }),
      { kind: 'after', days: 7 },
    );
    assert.equal(
      notice(7 * DAY, { lateNoticeDaysAfter: [15], noticeDaysBefore: [] }),
      null,
    );
  });

  it('hits an after-notice on its exact millisecond and not 1ms earlier', () => {
    assert.deepEqual(notice(7 * DAY, { noticeDaysBefore: [] }), {
      kind: 'after',
      days: 7,
    });
    assert.equal(notice(7 * DAY - 1, { noticeDaysBefore: [] }), null);
  });

  it('prefers the later after-notice over an earlier before-notice', () => {
    assert.deepEqual(notice(7 * DAY), { kind: 'after', days: 7 });
    assert.equal(renewalNoticeKey({ kind: 'before', days: 14 }), 'before:14');
    assert.equal(renewalNoticeKey({ kind: 'after', days: 7 }), 'after:7');
  });
});
