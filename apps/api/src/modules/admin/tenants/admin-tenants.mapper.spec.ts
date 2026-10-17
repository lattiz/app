import {
  mapAssetByteLimit,
  mapTenantEmails,
  mapTenantListItem,
  type TenantListRow,
} from './admin-tenants.mapper';

const NOW = new Date('2026-06-15T12:00:00.000Z');
const DAY_MS = 86_400_000;
const POLICY = { enabled: true, trialDays: 7 };
const TENANT = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';

function listRow(overrides: Partial<TenantListRow> = {}): TenantListRow {
  return {
    tenant_id: TENANT,
    slug: 'cafe-centro',
    name: 'Café Centro',
    email: 'ana@example.com',
    plan: 'none',
    status: 'active',
    entitled: false,
    preview_started_at: null,
    subscription_id: null,
    subscription_status: null,
    subscription_plan: null,
    billing_period: null,
    current_period_end: null,
    cancel_at_period_end: null,
    cancel_at: null,
    template_id: 'bistro',
    template_name: 'Bistro',
    site_status: 'published',
    domain: 'cafecentro.mx',
    domain_expires_at: '2026-07-01T00:00:00.000Z',
    dns_status: 'active',
    storage_bytes: '1536',
    is_internal: false,
    tags: ['demo'],
    created_at: new Date('2026-01-02T03:04:05.000Z'),
    last_sign_in_at: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('mapTenantListItem', () => {
  it('maps an active trial with a fixed clock', () => {
    const started = new Date(NOW.getTime() - 2 * DAY_MS);
    const item = mapTenantListItem(
      listRow({ preview_started_at: started }),
      POLICY,
      NOW,
    );

    expect(item.previewState).toBe('trial_active');
    expect(item.previewExpiresAt).toBe(
      new Date(started.getTime() + 7 * DAY_MS).toISOString(),
    );
    expect(item.id).toBe(TENANT);
    expect(item.published).toBe(true);
    expect(item.storageBytes).toBe(1536);
    expect(item.tags).toEqual(['demo']);
    expect(item.template).toEqual({ id: 'bistro', name: 'Bistro' });
    expect(item.domain).toEqual({
      name: 'cafecentro.mx',
      expiresAt: '2026-07-01T00:00:00.000Z',
      dnsStatus: 'active',
    });
    expect(item.createdAt).toBe('2026-01-02T03:04:05.000Z');
    expect(item.subscription).toBeNull();
  });

  it('maps paid, unstarted, expired, and lapsed', () => {
    expect(
      mapTenantListItem(listRow({ entitled: true, plan: 'pro' }), POLICY, NOW)
        .previewState,
    ).toBe('paid');
    expect(
      mapTenantListItem(listRow({ entitled: true, plan: 'pro' }), POLICY, NOW)
        .previewExpiresAt,
    ).toBeNull();

    expect(mapTenantListItem(listRow(), POLICY, NOW).previewState).toBe(
      'trial_unstarted',
    );

    const expiredStart = new Date(NOW.getTime() - 20 * DAY_MS);
    expect(
      mapTenantListItem(
        listRow({ preview_started_at: expiredStart }),
        POLICY,
        NOW,
      ).previewState,
    ).toBe('trial_expired');

    expect(
      mapTenantListItem(
        listRow({ plan: 'basico', entitled: false }),
        POLICY,
        NOW,
      ).previewState,
    ).toBe('lapsed');
  });

  it('maps a scheduled cancellation from the period end', () => {
    const item = mapTenantListItem(
      listRow({
        subscription_id: 'sub-1',
        subscription_status: 'active',
        subscription_plan: 'pro',
        billing_period: 'annual',
        current_period_end: '2026-12-01T00:00:00.000Z',
        cancel_at_period_end: true,
      }),
      POLICY,
      NOW,
    );

    expect(item.subscription).toEqual({
      status: 'active',
      plan: 'pro',
      billingPeriod: 'annual',
      currentPeriodEnd: '2026-12-01T00:00:00.000Z',
      cancelAt: '2026-12-01T00:00:00.000Z',
      cancelAtPeriodEnd: true,
    });
  });
});

describe('mapTenantEmails', () => {
  it('clips last_error to 200 characters', () => {
    const [email] = mapTenantEmails([
      {
        kind: 'preview_ending',
        status: 'failed',
        attempts: '2',
        created_at: '2026-06-01T00:00:00.000Z',
        sent_at: null,
        last_error: 'x'.repeat(250),
      },
    ]);

    expect(email?.lastError).toHaveLength(200);
    expect(email?.attempts).toBe(2);
    expect(email?.sentAt).toBeNull();
  });
});

describe('mapAssetByteLimit', () => {
  it('returns the cap only while the tenant is not paying', () => {
    expect(mapAssetByteLimit(false, 5_000_000)).toBe(5_000_000);
    expect(mapAssetByteLimit(true, 5_000_000)).toBeNull();
    expect(mapAssetByteLimit(false, 0)).toBeNull();
  });
});
