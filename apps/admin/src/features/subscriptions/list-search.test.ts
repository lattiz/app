import { describe, expect, it } from 'vitest';
import {
  SUBSCRIPTION_LIST_PAGE_SIZE,
  toSubscriptionListQuery,
  validateSubscriptionListSearch,
} from './list-search';

describe('subscription list search', () => {
  it('keeps valid filters and drops junk', () => {
    expect(
      validateSubscriptionListSearch({
        q: '  panadería ',
        status: 'past_due',
        plan: 'pro',
        period: 'annual',
        cancelScheduled: true,
        paymentIssues: false,
        internal: true,
        page: 2,
        extra: 'x',
      }),
    ).toEqual({
      q: 'panadería',
      status: 'past_due',
      plan: 'pro',
      period: 'annual',
      cancelScheduled: true,
      internal: true,
      page: 2,
    });
  });

  it('sends one status as the list the API expects', () => {
    expect(
      toSubscriptionListQuery({ status: 'active', page: 3 }),
    ).toEqual({
      status: ['active'],
      page: 3,
      pageSize: SUBSCRIPTION_LIST_PAGE_SIZE,
    });
  });

  it('rejects an unknown status instead of failing the route', () => {
    expect(validateSubscriptionListSearch({ status: 'nope', plan: 'basico' })).toEqual({
      plan: 'basico',
    });
  });
});
