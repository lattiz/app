import { describe, expect, it } from 'vitest';
import {
  CLIENT_LIST_PAGE_SIZE,
  DOMAIN_EXPIRING_SOON_DAYS,
  toTenantListQuery,
  validateClientListSearch,
} from './list-search';

describe('client list search', () => {
  it('keeps valid filters and drops junk', () => {
    expect(
      validateClientListSearch({
        q: '  panadería ',
        plan: 'pro',
        status: 'nope',
        domainSoon: true,
        renewalOverdue: false,
        dnsIssue: true,
        internal: true,
        sort: 'domain_expires_at',
        order: 'asc',
        page: 2,
        pageSize: 25,
        extra: 'x',
      }),
    ).toEqual({
      q: 'panadería',
      plan: 'pro',
      domainSoon: true,
      dnsIssue: true,
      internal: true,
      sort: 'domain_expires_at',
      order: 'asc',
      page: 2,
    });
  });

  it('rejects a broken page instead of failing the route', () => {
    expect(validateClientListSearch({ page: 0, plan: 'trial' })).toEqual({
      plan: 'trial',
    });
    expect(validateClientListSearch({ q: '   ' })).toEqual({});
  });

  it('serializes URL flags into the tenants query', () => {
    expect(
      toTenantListQuery({
        q: 'cafe',
        plan: 'basico',
        status: 'active',
        domainSoon: true,
        renewalOverdue: true,
        dnsIssue: true,
        internal: true,
        sort: 'last_sign_in_at',
        order: 'asc',
        page: 3,
      }),
    ).toEqual({
      q: 'cafe',
      plan: 'basico',
      status: 'active',
      domainExpiringDays: DOMAIN_EXPIRING_SOON_DAYS,
      renewalOverdue: true,
      dnsIssue: true,
      internal: true,
      sort: 'last_sign_in_at',
      order: 'asc',
      page: 3,
      pageSize: CLIENT_LIST_PAGE_SIZE,
    });
  });

  it('omits filters that are off', () => {
    expect(toTenantListQuery({})).toEqual({
      page: 1,
      pageSize: CLIENT_LIST_PAGE_SIZE,
    });
  });
});
