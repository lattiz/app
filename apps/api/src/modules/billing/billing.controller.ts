import {
  Body,
  Controller,
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
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { BillingService } from './billing.service';
import {
  BillingRedirectResponseDto,
  InvoiceListResponseDto,
  ReconcileResponseDto,
  SubscriptionResponseDto,
} from './dto/billing.response.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { InvalidWebhookSignatureException } from './billing.exceptions';

function appUrl(): string {
  return process.env.APP_URL ?? 'http://localhost:5173';
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('checkout-session')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Checkout session (protected)' })
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  @UseGuards(SupabaseJwtGuard)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<BillingRedirectResponseDto> {
    return this.billing.createCheckoutSession(requireSub(user), dto, appUrl());
  }

  @Post('portal-session')
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

  /** Dev/ops escape hatch so the 15-minute cron need not be waited out. */
  @Post('reconcile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Force a stale-subscription reconciliation (protected)' })
  @ApiOkResponse({ type: ReconcileResponseDto })
  @UseGuards(SupabaseJwtGuard)
  async triggerReconciliation(): Promise<ReconcileResponseDto> {
    await this.billing.reconcileStaleSubscriptions();
    return { triggered: true };
  }

  /** Verified by Stripe signature over the raw body — no JWT guard. */
  @Post('webhooks')
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
