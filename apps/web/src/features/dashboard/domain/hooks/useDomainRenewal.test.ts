import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toRenewalStatus } from './useDomainRenewal';

describe('toRenewalStatus', () => {
  it('treats the empty body of "no cycle" as null', () => {
    assert.equal(toRenewalStatus({}), null);
    assert.equal(toRenewalStatus(''), null);
    assert.equal(toRenewalStatus(null), null);
    assert.equal(toRenewalStatus(undefined), null);
  });

  it('keeps a real cycle', () => {
    const cycle = { status: 'open', expiresAt: '2027-01-01T00:00:00.000Z' };
    assert.equal(toRenewalStatus(cycle), cycle);
  });
});
