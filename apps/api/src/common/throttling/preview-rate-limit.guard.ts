import { createHash } from 'node:crypto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerStorage,
  ThrottlerException,
  type ThrottlerStorage,
} from '@nestjs/throttler';
import type { Request } from 'express';
import { PreviewConfig } from '../billing/preview.config';
import {
  MINUTE_MS,
  PREVIEW_RATE_LIMIT_KIND,
  type PreviewRateLimitKind,
} from './rate-limits';

/** Extra per-user bucket for unpaid publish and assets. 0 disables it; paid tenants keep only the global IP limit. */
@Injectable()
export class PreviewRateLimitGuard implements CanActivate {
  constructor(
    @InjectThrottlerStorage() private readonly storage: ThrottlerStorage,
    private readonly preview: PreviewConfig,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const kind = this.reflector.getAllAndOverride<
      PreviewRateLimitKind | undefined
    >(PREVIEW_RATE_LIMIT_KIND, [context.getHandler(), context.getClass()]);
    if (!kind) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (request.previewAccess?.isEntitled) return true;

    const limit =
      kind === 'publish'
        ? this.preview.publishRateLimitPerMin
        : this.preview.assetRateLimitPerMin;
    if (limit <= 0) return true;

    const tracker = request.user?.sub;
    if (!tracker) return true;

    const key = createHash('sha256')
      .update(`preview:${kind}:${tracker}`)
      .digest('hex');
    const { isBlocked } = await this.storage.increment(
      key,
      MINUTE_MS,
      limit,
      MINUTE_MS,
      'preview',
    );
    if (isBlocked) throw new ThrottlerException();
    return true;
  }
}
