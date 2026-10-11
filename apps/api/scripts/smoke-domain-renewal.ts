/**
 * Prueba de humo de la renovación anual de dominios contra la base local.
 * Usa el módulo real de Nest con Stripe, Vercel, DNS y el registrador simulados.
 * Solo corre si SMOKE_DATABASE_URL (o el valor por defecto) apunta a 127.0.0.1 o localhost.
 * Antes: `supabase start` y `supabase db reset --local`.
 * Ejecutar: `pnpm --filter @lattiz/api smoke:renewal`.
 */
import 'reflect-metadata';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { Logger, type INestApplicationContext } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import postgres, { type Sql } from 'postgres';
import type Stripe from 'stripe';

const apiRoot = path.resolve(__dirname, '..');
const requireFromApi = createRequire(path.join(apiRoot, 'package.json'));

const DEFAULT_SMOKE_URL =
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const PREFIX = 'smoke-renewal-';
const ADMIN_EMAIL = 'smoke-renewal-admin@example.test';
const APP_URL = 'http://127.0.0.1:5173';
const CLAIM_GAP_MS = 11 * 60 * 1000;
const PERIOD_END = '2030-01-01T00:00:00.000Z';

const SETTING_ENABLED = 'domain.renewal.enabled';
const SETTING_ADMIN = 'alerts.admin_email';

const BLOCKED_ENV = [
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
  'VERCEL_TOKEN',
  'VERCEL_PROJECT_ID',
  'VERCEL_TEAM_ID',
  'OPENPROVIDER_USERNAME',
  'OPENPROVIDER_PASSWORD',
  'OPENPROVIDER_CUSTOMER_HANDLE',
  'OPENPROVIDER_BASE_URL',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
] as const;

interface StepResult {
  id: string;
  ok: boolean;
}

interface Fixture {
  userId: string;
  email: string;
  slug: string;
  domain: string;
  registrarId: string;
  tenantId: string;
  domainId: string;
  expiresAt: Date;
}

interface RecordedCheckout {
  id: string;
  params: Stripe.Checkout.SessionCreateParams;
}

class MemoryStripe {
  readonly sessions: RecordedCheckout[] = [];
  readonly checkout = {
    sessions: {
      create: (
        params: Stripe.Checkout.SessionCreateParams,
      ): Promise<{ id: string; url: string }> => {
        const id = `cs_${PREFIX}${this.sessions.length + 1}`;
        this.sessions.push({ id, params });
        return Promise.resolve({
          id,
          url: 'https://checkout.stripe.test/smoke-renewal',
        });
      },
    },
  };

  latest(): RecordedCheckout | undefined {
    return this.sessions[this.sessions.length - 1];
  }
}

interface SmokeRegistrarHandle {
  seedDomain(
    registrarDomainId: string,
    seed: {
      status?: 'active' | 'expired';
      renewalDate?: Date | null;
      canRenew?: boolean;
      failRenewal?: boolean;
    },
  ): void;
  renewalCount(domain: string): number;
  restoreCount(domain: string): number;
}

interface CompiledApi {
  dayMs: number;
  DomainsModule: new (...args: never[]) => object;
  STRIPE_CLIENT: symbol;
  REGISTRAR_PORT: symbol;
  DNS_PROVIDER_PORT: symbol;
  VercelDomainsService: new (...args: never[]) => object;
  DomainRenewalService: new (...args: never[]) => {
    run(now?: Date): Promise<{
      opened: number;
      skipped: number;
      errors: number;
    }>;
  };
  DomainRenewalPaymentService: new (...args: never[]) => {
    getStatusForUser(userSub: string): Promise<{
      status: string;
      canPay: boolean;
      payBlockedReason: string | null;
      baseCents: number;
      taxCents: number;
      totalCents: number;
    } | null>;
    createCheckout(userSub: string, appUrl: string): Promise<{ url: string }>;
    handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void>;
    retryPaid(now?: Date): Promise<number>;
  };
  DomainRenewalConfig: new (...args: never[]) => {
    maxRegistrarAttempts: number;
  };
  SettingsService: new (...args: never[]) => { reload(): Promise<void> };
  DomainsService: new (...args: never[]) => {
    getQuote(userSub: string, domain: string): Promise<unknown>;
  };
  IncludedDomainAlreadyUsedException: new (...args: never[]) => { code: string };
  createRegistrar(): SmokeRegistrarHandle;
  createDns(): object;
}

const results: StepResult[] = [];

function step(id: string, ok: boolean, phrase: string): void {
  results.push({ id, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${phrase}`);
}

function summaryLine(): string {
  const passed = results.filter((item) => item.ok).length;
  const failed = results.length - passed;
  return `RESUMEN: ${passed} PASS, ${failed} FAIL`;
}

function smokeDatabaseUrl(): string {
  const raw = process.env.SMOKE_DATABASE_URL?.trim();
  const url = raw && raw.length > 0 ? raw : DEFAULT_SMOKE_URL;
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    console.error(
      'ABORT: SMOKE_DATABASE_URL no es una URL válida. No se ha conectado.',
    );
    process.exit(1);
  }
  if (host !== '127.0.0.1' && host !== 'localhost') {
    console.error(
      `ABORT: SMOKE_DATABASE_URL apunta a "${host}". Esta prueba solo corre contra 127.0.0.1 o localhost y no se ha conectado.`,
    );
    process.exit(1);
  }
  return url;
}

function forceLocalEnv(databaseUrl: string): void {
  for (const key of BLOCKED_ENV) delete process.env[key];
  process.env.DATABASE_URL = databaseUrl;
  process.env.DNS_PROVIDER = 'openprovider';
  process.env.EMAIL_PROVIDER = 'log';
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

let dayMs = 86_400_000;

function daysFrom(base: Date, days: number): Date {
  return new Date(base.getTime() + days * dayMs);
}

function loadCompiledApi(): CompiledApi {
  const compiled = spawnSync(
    'pnpm',
    ['exec', 'tsc', '-p', 'tsconfig.json', '--pretty', 'false'],
    { cwd: apiRoot, stdio: 'inherit', env: process.env },
  );
  if (compiled.status !== 0) {
    throw new Error('No se pudo compilar la API para la prueba de humo.');
  }
  const dist = (rel: string) =>
    requireFromApi(path.join(apiRoot, 'dist', rel)) as Record<string, never>;
  const domainsModule = dist('modules/domains/domains.module.js');
  const payment = dist('modules/domains/domain-renewal-payment.service.js');
  const renewal = dist('modules/domains/domain-renewal.service.js');
  const renewalConfig = dist('modules/domains/domain-renewal.config.js');
  const policy = dist('modules/domains/domain/domain-renewal.policy.js');
  const dnsPort = dist('modules/domains/domain/dns-provider.port.js');
  const registrarPort = dist('modules/domains/domain/registrar.port.js');
  const domainsService = dist('modules/domains/domains.service.js');
  const exceptions = dist('modules/domains/domains.exceptions.js');
  const mockDns = dist(
    'modules/domains/infrastructure/openprovider/mock-dns.adapter.js',
  );
  const mockRegistrar = dist(
    'modules/domains/infrastructure/openprovider/mock-openprovider-registrar.adapter.js',
  );
  const vercel = dist('modules/domains/vercel-domains.service.js');
  const stripeProvider = dist('modules/billing/stripe.provider.js');
  const settings = dist('common/settings/settings.service.js');
  const Mock = mockRegistrar.MockOpenproviderRegistrarAdapter as new (
    client: unknown,
    handle: string,
  ) => SmokeRegistrarHandle & {
    checkAvailability(): Promise<unknown>;
    getPriceUsdCents(): Promise<number>;
    renewDomain(params: {
      registrarDomainId: string;
      domain: string;
      periodYears: number;
    }): Promise<void>;
    restoreDomain(params: { registrarDomainId: string; domain: string }): Promise<void>;
  };

  return {
    dayMs: policy.RENEWAL_DAY_MS as unknown as number,
    DomainsModule: domainsModule.DomainsModule as CompiledApi['DomainsModule'],
    STRIPE_CLIENT: stripeProvider.STRIPE_CLIENT as unknown as symbol,
    REGISTRAR_PORT: registrarPort.REGISTRAR_PORT as unknown as symbol,
    DNS_PROVIDER_PORT: dnsPort.DNS_PROVIDER_PORT as unknown as symbol,
    VercelDomainsService:
      vercel.VercelDomainsService as CompiledApi['VercelDomainsService'],
    DomainRenewalService:
      renewal.DomainRenewalService as CompiledApi['DomainRenewalService'],
    DomainRenewalPaymentService:
      payment.DomainRenewalPaymentService as CompiledApi['DomainRenewalPaymentService'],
    DomainRenewalConfig:
      renewalConfig.DomainRenewalConfig as CompiledApi['DomainRenewalConfig'],
    SettingsService: settings.SettingsService as CompiledApi['SettingsService'],
    DomainsService: domainsService.DomainsService as CompiledApi['DomainsService'],
    IncludedDomainAlreadyUsedException:
      exceptions.IncludedDomainAlreadyUsedException as CompiledApi['IncludedDomainAlreadyUsedException'],
    createDns: () => new (mockDns.MockDnsAdapter as new () => object)(),
    createRegistrar: () => {
      class SmokeRegistrar extends Mock {
        readonly renewals: string[] = [];
        readonly restores: string[] = [];

        override checkAvailability(): Promise<{
          available: boolean;
          priceUsdCents: number | null;
        }> {
          return Promise.resolve({ available: false, priceUsdCents: null });
        }

        override getPriceUsdCents(): Promise<number> {
          return Promise.resolve(100);
        }

        override async renewDomain(params: {
          registrarDomainId: string;
          domain: string;
          periodYears: number;
        }): Promise<void> {
          this.renewals.push(params.domain);
          await super.renewDomain(params);
        }

        override async restoreDomain(params: {
          registrarDomainId: string;
          domain: string;
        }): Promise<void> {
          this.restores.push(params.domain);
          await super.restoreDomain(params);
        }

        renewalCount(domain: string): number {
          return this.renewals.filter((name) => name === domain).length;
        }

        restoreCount(domain: string): number {
          return this.restores.filter((name) => name === domain).length;
        }
      }
      const client = new Proxy(
        {},
        {
          get() {
            return () => {
              throw new Error(
                'El registrador de la prueba de humo intentó llamar a Openprovider',
              );
            };
          },
        },
      );
      return new SmokeRegistrar(client, '');
    },
  };
}

function paidSession(
  recorded: RecordedCheckout,
  paymentIntentId: string,
): Stripe.Checkout.Session {
  return {
    id: recorded.id,
    metadata: recorded.params.metadata ?? {},
    payment_status: 'paid',
    payment_intent: paymentIntentId,
    amount_total: 69484,
  } as Stripe.Checkout.Session;
}

async function setJsonSetting(
  db: Sql,
  key: string,
  value: boolean | string,
): Promise<void> {
  await db`
    UPDATE public.app_settings
    SET value = ${db.json(value)}
    WHERE key = ${key}
  `;
}

async function readSetting(db: Sql, key: string): Promise<unknown> {
  const rows = await db<{ value: unknown }[]>`
    SELECT value FROM public.app_settings WHERE key = ${key} LIMIT 1
  `;
  return rows[0]?.value;
}

async function cleanupSmoke(db: Sql, startedAt: Date): Promise<void> {
  await db`
    DELETE FROM public.email_outbox
    WHERE to_email LIKE ${PREFIX + '%'}
       OR tenant_id IN (
         SELECT id FROM public.tenants WHERE slug LIKE ${PREFIX + '%'}
       )
  `;
  await db`
    DELETE FROM auth.users WHERE email LIKE ${PREFIX + '%'}
  `;
  await db`
    DELETE FROM public.tenants WHERE slug LIKE ${PREFIX + '%'}
  `;
  await db`
    DELETE FROM public.app_settings_audit
    WHERE key IN (${SETTING_ENABLED}, ${SETTING_ADMIN})
      AND changed_at >= ${startedAt}
  `;
}

async function assertNoForeignRows(db: Sql): Promise<void> {
  const domains = await db<{ domain: string }[]>`
    SELECT domain FROM public.domains
    WHERE domain NOT LIKE ${PREFIX + '%'}
  `;
  const cycles = await db<{ n: number }[]>`
    SELECT count(*)::int AS n
    FROM public.domain_maintenance_cycles c
    JOIN public.domains d ON d.id = c.domain_id
    WHERE d.domain NOT LIKE ${PREFIX + '%'}
  `;
  const foreignCycles = cycles[0]?.n ?? 0;
  if (domains.length === 0 && foreignCycles === 0) return;
  const names = domains.map((row) => row.domain).join(', ');
  throw new Error(
    `Hay datos ajenos en la base local (${names || 'sin dominios'}, ciclos=${foreignCycles}). run() los modificaría; la prueba no sigue.`,
  );
}

async function provision(
  db: Sql,
  registrar: SmokeRegistrarHandle,
  input: {
    userId: string;
    slug: string;
    domain: string;
    expiresAt: Date;
    subscriptionStatus: 'active' | 'canceled';
    expiredAtRegistrar: boolean;
  },
): Promise<Fixture> {
  const email = `${input.slug}@example.test`;
  const registrarId = `mock_${input.slug}`;
  await db`
    INSERT INTO auth.users (id, email, aud, role, email_confirmed_at)
    VALUES (
      ${input.userId}::uuid,
      ${email},
      'authenticated',
      'authenticated',
      now()
    )
  `;
  const tenants = await db<{ id: string }[]>`
    UPDATE public.tenants
    SET slug = ${input.slug},
        name = ${input.slug},
        plan = 'basico',
        status = 'active',
        stripe_customer_id = ${'cus_' + input.slug},
        included_domain_used_at = now(),
        domain = ${input.domain}
    WHERE user_id = ${input.userId}::uuid
    RETURNING id
  `;
  const tenantId = tenants[0]?.id;
  if (!tenantId) {
    throw new Error(`No se creó el tenant ${input.slug}`);
  }
  await db`
    INSERT INTO public.subscriptions (
      tenant_id, stripe_subscription_id, stripe_customer_id, plan,
      billing_period, status, current_period_start, current_period_end
    ) VALUES (
      ${tenantId}::uuid,
      ${'sub_' + input.slug},
      ${'cus_' + input.slug},
      'basico',
      'annual',
      ${input.subscriptionStatus},
      now(),
      ${PERIOD_END}::timestamptz
    )
  `;
  const domains = await db<{ id: string }[]>`
    INSERT INTO public.domains (
      tenant_id, domain, tld, source, is_mock, purchase_completed_at,
      registrar_domain_id, expires_at, annual_cost_usd_cents
    ) VALUES (
      ${tenantId}::uuid,
      ${input.domain},
      'example',
      'lattiz_managed',
      false,
      now(),
      ${registrarId},
      ${input.expiresAt},
      1000
    )
    RETURNING id
  `;
  const domainId = domains[0]?.id;
  if (!domainId) throw new Error(`No se creó el dominio ${input.domain}`);
  registrar.seedDomain(registrarId, {
    status: input.expiredAtRegistrar ? 'expired' : 'active',
    renewalDate: input.expiresAt,
    canRenew: !input.expiredAtRegistrar,
  });
  return {
    userId: input.userId,
    email,
    slug: input.slug,
    domain: input.domain,
    registrarId,
    tenantId,
    domainId,
    expiresAt: input.expiresAt,
  };
}

async function emailCount(
  db: Sql,
  tenantId: string,
  kind: string,
): Promise<number> {
  const rows = await db<{ n: number }[]>`
    SELECT count(*)::int AS n
    FROM public.email_outbox
    WHERE tenant_id = ${tenantId}::uuid AND kind = ${kind}
  `;
  return rows[0]?.n ?? 0;
}

async function cycleRow(
  db: Sql,
  domainId: string,
): Promise<{
  status: string;
  base: number | null;
  tax: number | null;
  total: number | null;
  attempts: number;
} | null> {
  const rows = await db<
    {
      status: string;
      base_amount_cents: number | null;
      tax_amount_cents: number | null;
      amount_cents: number | null;
      attempts: number;
    }[]
  >`
    SELECT status, base_amount_cents, tax_amount_cents, amount_cents, attempts
    FROM public.domain_maintenance_cycles
    WHERE domain_id = ${domainId}::uuid AND status <> 'void'
    ORDER BY opened_at DESC NULLS LAST
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    status: row.status,
    base: row.base_amount_cents,
    tax: row.tax_amount_cents,
    total: row.amount_cents,
    attempts: row.attempts,
  };
}

async function cycleCount(db: Sql, domainId: string): Promise<number> {
  const rows = await db<{ n: number }[]>`
    SELECT count(*)::int AS n
    FROM public.domain_maintenance_cycles
    WHERE domain_id = ${domainId}::uuid AND status <> 'void'
  `;
  return rows[0]?.n ?? 0;
}

async function domainExpiresAt(db: Sql, domainId: string): Promise<Date | null> {
  const rows = await db<{ expires_at: Date | null }[]>`
    SELECT expires_at FROM public.domains WHERE id = ${domainId}::uuid
  `;
  return rows[0]?.expires_at ?? null;
}

async function releasedAt(db: Sql, domainId: string): Promise<Date | null> {
  const rows = await db<{ released_at: Date | null }[]>`
    SELECT released_at FROM public.domains WHERE id = ${domainId}::uuid
  `;
  return rows[0]?.released_at ?? null;
}

async function entitled(db: Sql, tenantId: string): Promise<boolean> {
  const rows = await db<{ ok: boolean }[]>`
    SELECT public.tenant_site_is_entitled(${tenantId}::uuid) AS ok
  `;
  return rows[0]?.ok === true;
}

async function servingState(db: Sql, slug: string): Promise<string | null> {
  const rows = await db<{ serving_state: string }[]>`
    SELECT serving_state
    FROM public.get_public_tenant_site(p_slug => ${slug})
  `;
  return rows[0]?.serving_state ?? null;
}

function sameInstant(actual: Date | null, expected: Date): boolean {
  if (!actual) return false;
  return Math.abs(actual.getTime() - expected.getTime()) < 1000;
}

function amountsMatch(row: {
  base: number | null;
  tax: number | null;
  total: number | null;
}): boolean {
  return row.base === 59900 && row.tax === 9584 && row.total === 69484;
}

async function main(): Promise<number> {
  const databaseUrl = smokeDatabaseUrl();
  forceLocalEnv(databaseUrl);
  const startedAt = new Date();
  const db = postgres(databaseUrl, { max: 1 });
  let app: INestApplicationContext | undefined;
  let originalEnabled: unknown;
  let originalAdmin: unknown;
  let failed = false;

  try {
    await cleanupSmoke(db, startedAt);
    await assertNoForeignRows(db);
    originalEnabled = await readSetting(db, SETTING_ENABLED);
    originalAdmin = await readSetting(db, SETTING_ADMIN);

    const api = loadCompiledApi();
    dayMs = api.dayMs;
    const stripe = new MemoryStripe();
    const registrar = api.createRegistrar();
    const vercel = {
      addDomain: () => Promise.resolve({ name: 'smoke', verified: true }),
      hasDomain: () => Promise.resolve(false),
      removeDomain: () => Promise.resolve(),
      getDnsTargets: () =>
        Promise.resolve({ ipv4: '127.0.0.1', cname: 'smoke.invalid' }),
      isDomainConfigured: () => Promise.resolve(true),
    };

    const compiled = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        api.DomainsModule,
      ],
    })
      .overrideProvider(api.STRIPE_CLIENT)
      .useValue(stripe)
      .overrideProvider(api.VercelDomainsService)
      .useValue(vercel)
      .overrideProvider(api.REGISTRAR_PORT)
      .useValue(registrar)
      .overrideProvider(api.DNS_PROVIDER_PORT)
      .useValue(api.createDns())
      .compile();

    app = compiled.createNestApplication({
      logger: ['error', 'warn'],
    });
    await app.init();

    const renewals = app.get(api.DomainRenewalService);
    const payments = app.get(api.DomainRenewalPaymentService);
    const settings = app.get(api.SettingsService);
    const domains = app.get(api.DomainsService);
    const renewalConfig = app.get(api.DomainRenewalConfig);
    Logger.overrideLogger(['error', 'warn']);

    const now = new Date();

    const tenantA = await provision(db, registrar, {
      userId: 'a1111111-1111-4111-8111-111111111111',
      slug: `${PREFIX}a`,
      domain: `${PREFIX}a.example`,
      expiresAt: daysFrom(now, 40),
      subscriptionStatus: 'active',
      expiredAtRegistrar: false,
    });

    const far = await renewals.run(now);
    const farStatus = await payments.getStatusForUser(tenantA.userId);
    const farCycles = await cycleCount(db, tenantA.domainId);
    step(
      'A1',
      far.opened === 0 && farCycles === 0 && farStatus === null,
      far.opened === 0 && farCycles === 0 && farStatus === null
        ? 'A 40 días del vencimiento no se abre ciclo y el estado es nulo.'
        : `Se esperaba ningún ciclo (opened=${far.opened}, ciclos=${farCycles}, estado=${farStatus === null ? 'null' : farStatus.status}).`,
    );

    const expiresA = daysFrom(now, 20);
    await db`
      UPDATE public.domains
      SET expires_at = ${expiresA}
      WHERE id = ${tenantA.domainId}::uuid
    `;
    tenantA.expiresAt = expiresA;
    registrar.seedDomain(tenantA.registrarId, {
      status: 'active',
      renewalDate: expiresA,
      canRenew: true,
    });

    const opened = await renewals.run(now);
    const openRow = await cycleRow(db, tenantA.domainId);
    const upcoming = await emailCount(db, tenantA.tenantId, 'renewal_upcoming');
    const openStatus = await payments.getStatusForUser(tenantA.userId);
    const openedOk =
      opened.errors === 0 &&
      openRow !== null &&
      openRow.status === 'open' &&
      amountsMatch(openRow) &&
      upcoming === 1 &&
      openStatus?.status === 'open' &&
      openStatus.canPay === true &&
      openStatus.baseCents === 59900 &&
      openStatus.taxCents === 9584 &&
      openStatus.totalCents === 69484;
    step(
      'A2',
      openedOk,
      openedOk
        ? 'A 20 días se abre el ciclo en 59900 / 9584 / 69484, hay un aviso y se puede pagar.'
        : `Ciclo ${openRow?.status ?? 'ausente'} base=${openRow?.base ?? 'null'} tax=${openRow?.tax ?? 'null'} total=${openRow?.total ?? 'null'}; correos=${upcoming}; canPay=${openStatus?.canPay ?? 'null'}; opened=${opened.opened} skipped=${opened.skipped} errors=${opened.errors}.`,
    );

    const again = await renewals.run(now);
    const cyclesAfter = await cycleCount(db, tenantA.domainId);
    const upcomingAfter = await emailCount(
      db,
      tenantA.tenantId,
      'renewal_upcoming',
    );
    const noDup = again.opened === 0 && cyclesAfter === 1 && upcomingAfter === 1;
    step(
      'A3',
      noDup,
      noDup
        ? 'Una segunda pasada no duplica el ciclo ni el correo.'
        : `opened=${again.opened}, ciclos=${cyclesAfter}, correos=${upcomingAfter}.`,
    );

    let checkoutA: RecordedCheckout | undefined;
    try {
      await payments.createCheckout(tenantA.userId, APP_URL);
      checkoutA = stripe.latest();
    } catch (err) {
      checkoutA = undefined;
      step(
        'A4',
        false,
        `createCheckout lanzó ${err instanceof Error ? err.message : String(err)}.`,
      );
    }
    if (checkoutA) {
      const items = checkoutA.params.line_items ?? [];
      const metadata = checkoutA.params.metadata ?? {};
      const linesOk =
        items.length === 2 &&
        items[0]?.price_data?.currency === 'mxn' &&
        items[0]?.price_data?.unit_amount === 59900 &&
        items[1]?.price_data?.currency === 'mxn' &&
        items[1]?.price_data?.unit_amount === 9584 &&
        metadata.kind === 'domain_renewal';
      step(
        'A4',
        linesOk,
        linesOk
          ? 'El checkout tiene dos líneas (59900 y 9584 MXN) y kind domain_renewal.'
          : `Líneas=${items.length}, metadata.kind=${metadata.kind ?? 'ausente'}.`,
      );
    }

    if (checkoutA) {
      const beforeRenew = registrar.renewalCount(tenantA.domain);
      await payments.handleCheckoutCompleted(
        paidSession(checkoutA, 'pi_smoke-renewal-a'),
      );
      const paidRow = await cycleRow(db, tenantA.domainId);
      const newExpiry = await domainExpiresAt(db, tenantA.domainId);
      const renewedMail = await emailCount(
        db,
        tenantA.tenantId,
        'domain_renewed',
      );
      const expectedExpiry = addYears(expiresA, 1);
      const paidOk =
        paidRow?.status === 'renewed' &&
        sameInstant(newExpiry, expectedExpiry) &&
        registrar.renewalCount(tenantA.domain) === beforeRenew + 1 &&
        renewedMail === 1;
      step(
        'A5',
        paidOk,
        paidOk
          ? 'El pago deja el ciclo renewed, alarga el dominio un año, renueva una vez y avisa.'
          : `estado=${paidRow?.status ?? 'ausente'}, vence=${newExpiry?.toISOString() ?? 'null'} (esperado ${expectedExpiry.toISOString()}), renovaciones=${registrar.renewalCount(tenantA.domain)}, correos=${renewedMail}.`,
      );

      await payments.handleCheckoutCompleted(
        paidSession(checkoutA, 'pi_smoke-renewal-a'),
      );
      const replayRow = await cycleRow(db, tenantA.domainId);
      const replayOk =
        replayRow?.status === 'renewed' &&
        registrar.renewalCount(tenantA.domain) === beforeRenew + 1;
      step(
        'A6',
        replayOk,
        replayOk
          ? 'Reenviar el mismo pago no renueva otra vez.'
          : `estado=${replayRow?.status ?? 'ausente'}, renovaciones=${registrar.renewalCount(tenantA.domain)}.`,
      );
    } else {
      step('A5', false, 'No hubo checkout que pagar.');
      step('A6', false, 'No hubo checkout que reenviar.');
    }

    const expiresB = daysFrom(now, 20);
    const tenantB = await provision(db, registrar, {
      userId: 'b1111111-1111-4111-8111-111111111111',
      slug: `${PREFIX}b`,
      domain: `${PREFIX}b.example`,
      expiresAt: expiresB,
      subscriptionStatus: 'active',
      expiredAtRegistrar: false,
    });
    await renewals.run(now);
    const openB = await cycleRow(db, tenantB.domainId);
    step(
      'B0',
      openB?.status === 'open',
      openB?.status === 'open'
        ? 'El segundo tenant abre un ciclo abierto a 20 días.'
        : `El ciclo quedó ${openB?.status ?? 'ausente'}.`,
    );

    const overdueAt = daysFrom(expiresB, 1);
    await renewals.run(overdueAt);
    const overdueRow = await cycleRow(db, tenantB.domainId);
    const overdueEntitled = await entitled(db, tenantB.tenantId);
    const overdueServing = await servingState(db, tenantB.slug);
    const expiredMail = await emailCount(db, tenantB.tenantId, 'domain_expired');
    const overdueOk =
      overdueRow?.status === 'overdue' &&
      overdueEntitled === false &&
      overdueServing === 'unavailable' &&
      expiredMail === 1;
    step(
      'B1',
      overdueOk,
      overdueOk
        ? 'Un día después del vencimiento el ciclo está overdue, el sitio no se sirve y hay aviso de vencimiento.'
        : `estado=${overdueRow?.status ?? 'ausente'}, entitled=${overdueEntitled}, serving=${overdueServing ?? 'null'}, correos=${expiredMail}.`,
    );

    await renewals.run(daysFrom(expiresB, 8));
    const lastNotice = await emailCount(
      db,
      tenantB.tenantId,
      'renewal_last_notice',
    );
    step(
      'B2',
      lastNotice === 1,
      lastNotice === 1
        ? 'A los 8 días del vencimiento hay un último aviso.'
        : `Correos renewal_last_notice=${lastNotice}.`,
    );

    await renewals.run(daysFrom(expiresB, 16));
    const lapsedRow = await cycleRow(db, tenantB.domainId);
    const released = await releasedAt(db, tenantB.domainId);
    const afterLapse = await entitled(db, tenantB.tenantId);
    const lostMail = await emailCount(db, tenantB.tenantId, 'domain_lost');
    const lapsedOk =
      lapsedRow?.status === 'lapsed' &&
      released !== null &&
      afterLapse === true &&
      lostMail === 1;
    step(
      'B3',
      lapsedOk,
      lapsedOk
        ? 'A los 16 días el ciclo caduca, el dominio se libera, el sitio vuelve a estar habilitado y hay aviso de pérdida.'
        : `estado=${lapsedRow?.status ?? 'ausente'}, released=${released ? 'sí' : 'no'}, entitled=${afterLapse}, correos=${lostMail}.`,
    );

    let quoteCode = '';
    try {
      await domains.getQuote(tenantB.userId, `${PREFIX}extra.example`);
      quoteCode = 'no lanzó';
    } catch (err) {
      quoteCode =
        err instanceof api.IncludedDomainAlreadyUsedException
          ? err.code
          : err instanceof Error
            ? err.message
            : String(err);
    }
    step(
      'B4',
      quoteCode === 'INCLUDED_DOMAIN_ALREADY_USED',
      quoteCode === 'INCLUDED_DOMAIN_ALREADY_USED'
        ? 'Cotizar otro dominio responde INCLUDED_DOMAIN_ALREADY_USED.'
        : `La cotización respondió ${quoteCode}.`,
    );

    const expiresC = daysFrom(now, -5);
    const tenantC = await provision(db, registrar, {
      userId: 'c1111111-1111-4111-8111-111111111111',
      slug: `${PREFIX}c`,
      domain: `${PREFIX}c.example`,
      expiresAt: expiresC,
      subscriptionStatus: 'active',
      expiredAtRegistrar: true,
    });
    await renewals.run(now);
    const overdueC = await cycleRow(db, tenantC.domainId);
    let checkoutC: RecordedCheckout | undefined;
    let checkoutCError = '';
    try {
      await payments.createCheckout(tenantC.userId, APP_URL);
      checkoutC = stripe.latest();
    } catch (err) {
      checkoutCError = err instanceof Error ? err.message : String(err);
    }
    if (checkoutC && overdueC?.status === 'overdue') {
      await payments.handleCheckoutCompleted(
        paidSession(checkoutC, 'pi_smoke-renewal-c'),
      );
    }
    const renewedC = await cycleRow(db, tenantC.domainId);
    const expiryC = await domainExpiresAt(db, tenantC.domainId);
    const entitledC = await entitled(db, tenantC.tenantId);
    const expectedC = addYears(expiresC, 1);
    const lateOk =
      overdueC?.status === 'overdue' &&
      checkoutCError === '' &&
      renewedC?.status === 'renewed' &&
      sameInstant(expiryC, expectedC) &&
      registrar.restoreCount(tenantC.domain) === 1 &&
      entitledC === true;
    step(
      'C1',
      lateOk,
      lateOk
        ? 'El pago en mora restaura el dominio, lo renueva un año desde el vencimiento original y el sitio vuelve a estar habilitado.'
        : `ciclo inicial=${overdueC?.status ?? 'ausente'}, checkout=${checkoutCError || 'ok'}, estado=${renewedC?.status ?? 'ausente'}, vence=${expiryC?.toISOString() ?? 'null'} (esperado ${expectedC.toISOString()}), restauraciones=${registrar.restoreCount(tenantC.domain)}, entitled=${entitledC}.`,
    );

    const tenantD = await provision(db, registrar, {
      userId: 'd1111111-1111-4111-8111-111111111111',
      slug: `${PREFIX}d`,
      domain: `${PREFIX}d.example`,
      expiresAt: daysFrom(now, 20),
      subscriptionStatus: 'canceled',
      expiredAtRegistrar: false,
    });
    await renewals.run(now);
    const statusD = await payments.getStatusForUser(tenantD.userId);
    let checkoutDCode = '';
    try {
      await payments.createCheckout(tenantD.userId, APP_URL);
      checkoutDCode = 'no lanzó';
    } catch (err) {
      checkoutDCode =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : err instanceof Error
            ? err.message
            : String(err);
    }
    const blockedOk =
      statusD?.canPay === false &&
      statusD.payBlockedReason === 'subscription_inactive' &&
      checkoutDCode === 'RENEWAL_REQUIRES_ACTIVE_SUBSCRIPTION';
    step(
      'D1',
      blockedOk,
      blockedOk
        ? 'Con la suscripción cancelada no se puede pagar y el checkout lo rechaza.'
        : `canPay=${statusD?.canPay ?? 'null'}, razón=${statusD?.payBlockedReason ?? 'null'}, checkout=${checkoutDCode}.`,
    );

    const originalAdminText =
      typeof originalAdmin === 'string' ? originalAdmin : '';
    await setJsonSetting(db, SETTING_ADMIN, ADMIN_EMAIL);
    await settings.reload();

    const tenantE = await provision(db, registrar, {
      userId: 'e1111111-1111-4111-8111-111111111111',
      slug: `${PREFIX}e`,
      domain: `${PREFIX}e.example`,
      expiresAt: daysFrom(now, 20),
      subscriptionStatus: 'active',
      expiredAtRegistrar: false,
    });
    await renewals.run(now);
    registrar.seedDomain(tenantE.registrarId, {
      status: 'active',
      renewalDate: tenantE.expiresAt,
      canRenew: true,
      failRenewal: true,
    });
    let checkoutE: RecordedCheckout | undefined;
    try {
      await payments.createCheckout(tenantE.userId, APP_URL);
      checkoutE = stripe.latest();
    } catch (err) {
      step(
        'E1',
        false,
        `createCheckout lanzó ${err instanceof Error ? err.message : String(err)}.`,
      );
    }
    if (checkoutE) {
      await payments.handleCheckoutCompleted(
        paidSession(checkoutE, 'pi_smoke-renewal-e'),
      );
      let attemptNow = new Date(Date.now() + CLAIM_GAP_MS);
      const maxAttempts = renewalConfig.maxRegistrarAttempts;
      for (let i = 0; i < maxAttempts; i += 1) {
        const current = await cycleRow(db, tenantE.domainId);
        if (current?.status === 'renewal_failed') break;
        await payments.retryPaid(attemptNow);
        attemptNow = new Date(attemptNow.getTime() + CLAIM_GAP_MS);
      }
      const failedRow = await cycleRow(db, tenantE.domainId);
      const adminMails = await db<{ n: number }[]>`
        SELECT count(*)::int AS n
        FROM public.email_outbox
        WHERE kind = 'admin_alert'
          AND to_email = ${ADMIN_EMAIL}
          AND tenant_id = ${tenantE.tenantId}::uuid
      `;
      const adminCount = adminMails[0]?.n ?? 0;
      const failedOk =
        failedRow?.status === 'renewal_failed' && adminCount >= 1;
      step(
        'E1',
        failedOk,
        failedOk
          ? 'Tras agotar los intentos el ciclo queda renewal_failed y hay un aviso al correo de administración.'
          : `estado=${failedRow?.status ?? 'ausente'}, intentos=${failedRow?.attempts ?? 'null'}/${maxAttempts}, avisos=${adminCount}.`,
      );
    }

    await setJsonSetting(db, SETTING_ADMIN, originalAdminText);
    await settings.reload();

    await setJsonSetting(db, SETTING_ENABLED, false);
    await settings.reload();
    const tenantF = await provision(db, registrar, {
      userId: 'f1111111-1111-4111-8111-111111111111',
      slug: `${PREFIX}f`,
      domain: `${PREFIX}f.example`,
      expiresAt: daysFrom(now, 20),
      subscriptionStatus: 'active',
      expiredAtRegistrar: false,
    });
    const disabledRun = await renewals.run(now);
    const disabledCycles = await cycleCount(db, tenantF.domainId);
    const disabledStatus = await payments.getStatusForUser(tenantF.userId);
    const disabledOk =
      disabledRun.opened === 0 &&
      disabledCycles === 0 &&
      disabledStatus === null;
    step(
      'F1',
      disabledOk,
      disabledOk
        ? 'Con la renovación apagada no se abre ciclo y el estado es nulo.'
        : `opened=${disabledRun.opened}, ciclos=${disabledCycles}, estado=${disabledStatus === null ? 'null' : disabledStatus.status}.`,
    );

    if (typeof originalEnabled === 'boolean') {
      await setJsonSetting(db, SETTING_ENABLED, originalEnabled);
    }
    await settings.reload();
  } catch (err) {
    failed = true;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`FAIL inesperado: ${message}`);
  } finally {
    try {
      if (typeof originalEnabled === 'boolean') {
        await setJsonSetting(db, SETTING_ENABLED, originalEnabled);
      }
      if (typeof originalAdmin === 'string') {
        await setJsonSetting(db, SETTING_ADMIN, originalAdmin);
      }
      await cleanupSmoke(db, startedAt);
      const leftover = await db<{ n: number }[]>`
        SELECT (
          (SELECT count(*) FROM auth.users WHERE email LIKE ${PREFIX + '%'}) +
          (SELECT count(*) FROM public.tenants WHERE slug LIKE ${PREFIX + '%'}) +
          (SELECT count(*) FROM public.domains WHERE domain LIKE ${PREFIX + '%'}) +
          (SELECT count(*) FROM public.email_outbox WHERE to_email LIKE ${PREFIX + '%'})
        )::int AS n
      `;
      if ((leftover[0]?.n ?? 0) > 0) {
        failed = true;
        console.error(
          'FAIL limpieza: quedaron filas smoke-renewal- en la base local.',
        );
      }
    } catch (err) {
      failed = true;
      console.error(
        `FAIL limpieza: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    await app?.close();
    await db.end({ timeout: 5 });
  }

  console.log(summaryLine());
  return failed || results.some((item) => !item.ok) ? 1 : 0;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
