import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ThrottlerException, type ThrottlerStorage } from '@nestjs/throttler';
import { PreviewConfig } from '../billing/preview.config';
import { SettingsService } from '../settings/settings.service';
import { PreviewRateLimitGuard } from './preview-rate-limit.guard';
import type { PreviewRateLimitKind } from './rate-limits';

function config(env: Record<string, string> = {}): PreviewConfig {
  const configService = {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
  return new PreviewConfig(
    configService,
    new SettingsService(configService, {
      loadAll: () => Promise.resolve(new Map()),
    }),
  );
}

class CountingStorage implements ThrottlerStorage {
  readonly keys: string[] = [];

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const bucket = `${throttlerName}:${key}`;
    this.keys.push(bucket);
    const totalHits = this.keys.filter((item) => item === bucket).length;
    const isBlocked = totalHits > limit;
    return {
      totalHits,
      timeToExpire: Math.ceil(ttl / 1000),
      isBlocked,
      timeToBlockExpire: isBlocked ? Math.ceil(blockDuration / 1000) : 0,
    };
  }
}

function harness(
  env: Record<string, string> = {},
  storage: ThrottlerStorage = new CountingStorage(),
) {
  let kind: PreviewRateLimitKind | undefined = 'publish';
  const reflector = {
    getAllAndOverride: () => kind,
  } as unknown as Reflector;
  return {
    storage,
    guard: new PreviewRateLimitGuard(storage, config(env), reflector),
    setKind(next: PreviewRateLimitKind) {
      kind = next;
    },
  };
}

function context(sub: string, isEntitled: boolean): ExecutionContext {
  return {
    getHandler: () => 'handler',
    getClass: () => 'SitesController',
    switchToHttp: () => ({
      getRequest: () => ({
        user: { sub, claims: {} },
        previewAccess: { isEntitled },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('PreviewRateLimitGuard', () => {
  it('blocks the request after the configured unpaid publish limit', async () => {
    const { guard, storage } = harness({
      PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN: '2',
    });
    const unpaid = context('user-1', false);
    assert.equal(await guard.canActivate(unpaid), true);
    assert.equal(await guard.canActivate(unpaid), true);
    await assert.rejects(() => guard.canActivate(unpaid), ThrottlerException);
    assert.equal((storage as CountingStorage).keys.length, 3);
  });

  it('uses a separate bucket for asset uploads', async () => {
    const { guard, setKind } = harness({
      PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN: '1',
      PREVIEW_ASSET_RATE_LIMIT_PER_MIN: '2',
    });
    const unpaid = context('user-1', false);
    assert.equal(await guard.canActivate(unpaid), true);
    await assert.rejects(() => guard.canActivate(unpaid), ThrottlerException);

    setKind('asset');
    assert.equal(await guard.canActivate(unpaid), true);
    assert.equal(await guard.canActivate(unpaid), true);
    await assert.rejects(() => guard.canActivate(unpaid), ThrottlerException);
  });

  it('does not share a bucket across users', async () => {
    const { guard } = harness({ PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN: '1' });
    assert.equal(await guard.canActivate(context('user-1', false)), true);
    await assert.rejects(
      () => guard.canActivate(context('user-1', false)),
      ThrottlerException,
    );
    assert.equal(await guard.canActivate(context('user-2', false)), true);
  });

  it('does not count entitled tenants', async () => {
    const storage = new CountingStorage();
    const { guard } = harness(
      { PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN: '1' },
      storage,
    );
    for (let i = 0; i < 5; i += 1) {
      assert.equal(await guard.canActivate(context('user-1', true)), true);
    }
    assert.equal(storage.keys.length, 0);
  });

  it('does not count anyone when the limit is 0', async () => {
    const storage = new CountingStorage();
    const { guard } = harness(
      { PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN: '0' },
      storage,
    );
    for (let i = 0; i < 5; i += 1) {
      assert.equal(await guard.canActivate(context('user-1', false)), true);
    }
    assert.equal(storage.keys.length, 0);
  });
});
