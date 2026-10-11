import { createHash } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerStorage,
  ThrottlerException,
  type ThrottlerStorage,
} from '@nestjs/throttler';
import type { Request } from 'express';
import { MINUTE_MS } from '../../common/throttling/rate-limits';

const STOCK_RATE_LIMIT_KIND = 'stockRateLimitKind';
type StockRateLimitKind = 'search' | 'import';

// Per user (= per tenant): the Pexels quota is shared by every tenant, so one must not drain it.
const LIMITS: Record<StockRateLimitKind, number> = { search: 30, import: 10 };

export const StockRateLimit = (kind: StockRateLimitKind): MethodDecorator =>
  SetMetadata(STOCK_RATE_LIMIT_KIND, kind);

@Injectable()
export class StockRateLimitGuard implements CanActivate {
  constructor(
    @InjectThrottlerStorage() private readonly storage: ThrottlerStorage,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const kind = this.reflector.get<StockRateLimitKind | undefined>(
      STOCK_RATE_LIMIT_KIND,
      context.getHandler(),
    );
    const tracker = context.switchToHttp().getRequest<Request>().user?.sub;
    if (!kind || !tracker) return true;

    const key = createHash('sha256')
      .update(`stock:${kind}:${tracker}`)
      .digest('hex');
    const { isBlocked } = await this.storage.increment(
      key,
      MINUTE_MS,
      LIMITS[kind],
      MINUTE_MS,
      'stock',
    );
    if (isBlocked) throw new ThrottlerException();
    return true;
  }
}
