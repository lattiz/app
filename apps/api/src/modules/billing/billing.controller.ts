import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  type RawBodyRequest,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CronSecretGuard } from '../../common/auth/cron-secret.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import {
  ProviderLookupRateLimit,
  SensitiveActionRateLimit,
} from '../../common/throttling/rate-limits';
import { BillingPricesService } from './billing-prices.service';
import { BillingService } from './billing.service';
import { PlanChangeService } from './plan-change.service';
import {
  BillingRedirectResponseDto,
  InvoiceListResponseDto,
  PlanPriceDto,
  ReconcileResponseDto,
  SubscriptionPriceResponseDto,
  SubscriptionResponseDto,
} from './dto/billing.response.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import {
  PlanChangeResultDto,
  PlanChangeStatusResponseDto,
  ReleasePlanChangeResponseDto,
  RequestPlanChangeDto,
} from './dto/plan-change.dto';
import { InvalidWebhookSignatureException } from './billing.exceptions';

function appUrl(): string {
  return process.env.APP_URL ?? 'http://localhost:5173';
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly prices: BillingPricesService,
    private readonly planChange: PlanChangeService,
  ) {}

  /** Current price of every plan/period, straight from Stripe (cached ~10 min). */
  @Get('plans')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List plan prices from Stripe (protected)' })
  @ApiOkResponse({ type: PlanPriceDto, isArray: true })
  @UseGuards(SupabaseJwtGuard)
  async getPlans(): Promise<PlanPriceDto[]> {
    return this.prices.listPlans();
  }

  @Post('checkout-session')
  @SensitiveActionRateLimit()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Checkout session (protected)' })
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  @ApiConflictResponse({
    description:
      'SUBSCRIPTION_ALREADY_ACTIVE: the tenant already has a live subscription.',
  })
  @UseGuards(SupabaseJwtGuard)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<BillingRedirectResponseDto> {
    return this.billing.createCheckoutSession(requireSub(user), dto, appUrl());
  }

  @Post('portal-session')
  @SensitiveActionRateLimit()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe billing portal session (protected)' })
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  @UseGuards(SupabaseJwtGuard)
  async createPortalSession(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<BillingRedirectResponseDto> {
    return this.billing.createPortalSession(
      requireSub(user),
      `${appUrl()}/dashboard/subscription`,
    );
  }

  /** Which plan changes the tenant can make now, and any change already scheduled. */
  @Get('plan-change')
  @ProviderLookupRateLimit()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get plan change options (protected)' })
  @ApiOkResponse({ type: PlanChangeStatusResponseDto })
  @UseGuards(SupabaseJwtGuard)
  async getPlanChange(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PlanChangeStatusResponseDto> {
    return this.planChange.getStatus(requireSub(user));
  }

  /** Upgrade → Stripe portal URL to confirm; downgrade → scheduled for the period end. */
  @Post('plan-change')
  @SensitiveActionRateLimit()
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a plan change (protected)' })
  @ApiOkResponse({ type: PlanChangeResultDto })
  @UseGuards(SupabaseJwtGuard)
  async requestPlanChange(
    @Body() dto: RequestPlanChangeDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PlanChangeResultDto> {
    return this.planChange.requestChange(
      requireSub(user),
      dto.targetPlan,
      appUrl(),
    );
  }

  @Delete('plan-change/pending')
  @SensitiveActionRateLimit()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel the scheduled plan change (protected)' })
  @ApiOkResponse({ type: ReleasePlanChangeResponseDto })
  @UseGuards(SupabaseJwtGuard)
  async releasePendingPlanChange(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ReleasePlanChangeResponseDto> {
    return this.planChange.releasePending(requireSub(user));
  }

  @Get('subscription')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the tenant current subscription (protected)' })
  @ApiOkResponse({ type: SubscriptionResponseDto, nullable: true })
  @UseGuards(SupabaseJwtGuard)
  async getSubscription(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<SubscriptionResponseDto | null> {
    return this.billing.getSubscriptionForUser(requireSub(user));
  }

  /** What the current subscription is billed — grandfathered subscribers keep their old price. */
  @Get('subscription/price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the price the tenant subscription is billed (protected)' })
  @ApiOkResponse({ type: SubscriptionPriceResponseDto })
  @UseGuards(SupabaseJwtGuard)
  async getSubscriptionPrice(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<SubscriptionPriceResponseDto> {
    return {
      price: await this.prices.getSubscriptionPriceForUser(requireSub(user)),
    };
  }

  @Get('invoices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the tenant paid invoice history (protected)' })
  @ApiOkResponse({ type: InvoiceListResponseDto })
  @UseGuards(SupabaseJwtGuard)
  async getInvoices(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<InvoiceListResponseDto> {
    return this.billing.getInvoicesForUser(requireSub(user));
  }

  /**
   * Dev/ops escape hatch so the 15-minute cron need not be waited out. It
   * sweeps every tenant, so it takes the ops secret, never a user JWT.
   */
  @Post('reconcile')
  @SensitiveActionRateLimit()
  @HttpCode(200)
  @ApiExcludeEndpoint()
  @UseGuards(CronSecretGuard)
  async triggerReconciliation(): Promise<ReconcileResponseDto> {
    await this.billing.reconcileStaleSubscriptions();
    return { triggered: true };
  }

  /** Verified by Stripe signature over the raw body — no JWT guard. */
  @Post('webhooks')
  @SkipThrottle()
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    if (!req.rawBody) throw new InvalidWebhookSignatureException();
    await this.billing.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}

function requireSub(user?: AuthenticatedUser): string {
  if (!user) throw new UnauthorizedException();
  return user.sub;
}
