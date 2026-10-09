import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Database } from '../../database/database.module';
import { PreviewCapabilityService } from '../billing/preview-capability.service';
import { PreviewConfig } from '../billing/preview.config';
import { SettingsService } from '../settings/settings.service';
import { EmailNotVerifiedException } from '../exceptions/email-not-verified.exception';
import { PreviewExpiredException } from '../exceptions/preview-expired.exception';
import { SubscriptionInactiveException } from '../exceptions/subscription-inactive.exception';
import { PublishAllowedGuard } from './publish-allowed.guard';

const DAY_MS = 86_400_000;

function settings(env: Record<string, string> = {}): PreviewConfig {
  const config = {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
  return new PreviewConfig(
    config,
    new SettingsService(config, {
      loadAll: () => Promise.resolve(new Map()),
    }),
  );
}

function guard(
  rows: unknown[],
  env: Record<string, string> = {},
): PublishAllowedGuard {
  const config = settings(env);
  const db = { execute: async () => rows } as unknown as Database;
  return new PublishAllowedGuard(
    db,
    new PreviewCapabilityService(config),
    config,
  );
}

function context(sub?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: sub ? { sub, claims: {} } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

function row(overrides: Record<string, unknown> = {}) {
  return {
    plan: 'none',
    preview_started_at: null,
    status: null,
    current_period_end: null,
    email_confirmed_at: null,
    ...overrides,
  };
}

const verified = { email_confirmed_at: new Date() };

describe('PublishAllowedGuard', () => {
  it('allows an entitled tenant', async () => {
    const allowed = await guard([
      row({
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * DAY_MS),
      }),
    ]).canActivate(context('user-1'));
    assert.equal(allowed, true);
  });

  it('allows a never-paid tenant who has not published yet', async () => {
    const allowed = await guard([row(verified)]).canActivate(context('user-1'));
    assert.equal(allowed, true);
  });

  it('allows a never-paid tenant inside the window', async () => {
    const allowed = await guard([
      row({
        preview_started_at: new Date(Date.now() - DAY_MS),
        ...verified,
      }),
    ]).canActivate(context('user-1'));
    assert.equal(allowed, true);
  });

  it('blocks an unverified unpaid tenant with EMAIL_NOT_VERIFIED', async () => {
    await assert.rejects(
      () => guard([row()]).canActivate(context('user-1')),
      (error: unknown) => {
        assert.ok(error instanceof EmailNotVerifiedException);
        assert.equal(error.code, 'EMAIL_NOT_VERIFIED');
        assert.equal(error.status, 403);
        return true;
      },
    );
  });

  it('accepts a confirmed-at timestamp stored as text', async () => {
    const allowed = await guard([
      row({ email_confirmed_at: '2026-01-01T00:00:00.000Z' }),
    ]).canActivate(context('user-1'));
    assert.equal(allowed, true);
  });

  it('skips the email check when the switch is off', async () => {
    const allowed = await guard([row()], {
      PREVIEW_REQUIRE_VERIFIED_EMAIL: 'false',
    }).canActivate(context('user-1'));
    assert.equal(allowed, true);
  });

  it('does not require a verified email from an entitled tenant', async () => {
    const allowed = await guard([
      row({
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * DAY_MS),
        email_confirmed_at: null,
      }),
    ]).canActivate(context('user-1'));
    assert.equal(allowed, true);
  });

  it('blocks an expired preview with PREVIEW_EXPIRED', async () => {
    await assert.rejects(
      () =>
        guard([
          row({ preview_started_at: new Date(Date.now() - 15 * DAY_MS) }),
        ]).canActivate(context('user-1')),
      (error: unknown) => {
        assert.ok(error instanceof PreviewExpiredException);
        assert.equal(error.code, 'PREVIEW_EXPIRED');
        assert.equal(error.status, 403);
        return true;
      },
    );
  });

  it('blocks a lapsed paid plan with SUBSCRIPTION_INACTIVE', async () => {
    await assert.rejects(
      () => guard([row({ plan: 'basico' })]).canActivate(context('user-1')),
      (error: unknown) => {
        assert.ok(error instanceof SubscriptionInactiveException);
        assert.equal(error.code, 'SUBSCRIPTION_INACTIVE');
        return true;
      },
    );
  });

  it('blocks a legacy trial plan the same way', async () => {
    await assert.rejects(
      () => guard([row({ plan: 'trial' })]).canActivate(context('user-1')),
      SubscriptionInactiveException,
    );
  });

  it('blocks everyone who is not entitled when the preview is off', async () => {
    const env = { PREVIEW_ENABLED: 'false' };
    await assert.rejects(
      () => guard([row()], env).canActivate(context('user-1')),
      SubscriptionInactiveException,
    );
    await assert.rejects(
      () =>
        guard(
          [row({ preview_started_at: new Date(Date.now() - 15 * DAY_MS) })],
          env,
        ).canActivate(context('user-1')),
      SubscriptionInactiveException,
    );
  });

  it('blocks a missing user', async () => {
    await assert.rejects(
      () => guard([row()]).canActivate(context()),
      SubscriptionInactiveException,
    );
  });
});
