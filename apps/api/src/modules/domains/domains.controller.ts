import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SubscriptionActiveGuard } from '../../common/auth/subscription-active.guard';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { DomainsService } from './domains.service';
import { ConnectDomainDto } from './dto/connect-domain.dto';
import {
  ConnectDomainResponseDto,
  DomainJobStatusDto,
  DomainPurchaseResponseDto,
  DomainQuoteResponseDto,
  DomainSearchResultDto,
  DomainStatusResponseDto,
  RelaunchDomainResponseDto,
} from './dto/domains.response.dto';
import { GetQuoteDto } from './dto/get-quote.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';
import { SearchDomainsDto } from './dto/search-domains.dto';

@ApiTags('domains')
@ApiBearerAuth()
@Controller('domains')
@UseGuards(SupabaseJwtGuard)
export class DomainsController {
  constructor(private readonly domains: DomainsService) {}

  /** Search available domains for a keyword (TLD variants generated server-side). */
  @Get('search')
  @UseGuards(SubscriptionActiveGuard)
  @ApiOperation({ summary: 'Search available domains (protected)' })
  @ApiOkResponse({ type: [DomainSearchResultDto] })
  async search(
    @Query() query: SearchDomainsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DomainSearchResultDto[]> {
    requireSub(user);
    return this.domains.searchDomains(query.q);
  }

  /** Get the current price, renewal price and required agreements for a domain — free, no commitment. */
  @Post('quote')
  @UseGuards(SubscriptionActiveGuard)
  @ApiOperation({ summary: 'Get a registration quote (protected)' })
  @ApiOkResponse({ type: DomainQuoteResponseDto })
  async getQuote(
    @Body() dto: GetQuoteDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DomainQuoteResponseDto> {
    requireSub(user);
    return this.domains.getQuote(dto.domain);
  }

  /** Initiate the async purchase pipeline — returns a jobId immediately. */
  @Post('purchase')
  @UseGuards(SubscriptionActiveGuard)
  @ApiOperation({ summary: 'Purchase a domain (protected, async)' })
  @ApiOkResponse({ type: DomainPurchaseResponseDto })
  async purchase(
    @Body() dto: PurchaseDomainDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DomainPurchaseResponseDto> {
    return this.domains.initiatePurchase(requireSub(user), dto);
  }

  /** Connect a domain the tenant already owns — returns the DNS records to create. */
  @Post('connect')
  @UseGuards(SubscriptionActiveGuard)
  @ApiOperation({ summary: 'Connect a tenant-owned domain (protected)' })
  @ApiOkResponse({ type: ConnectDomainResponseDto })
  async connect(
    @Body() dto: ConnectDomainDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ConnectDomainResponseDto> {
    return this.domains.initiateConnect(requireSub(user), dto.domain);
  }

  /** Restore the Vercel mapping of a domain suspended by a lapsed subscription. Idempotent. */
  @Post('relaunch')
  @UseGuards(SubscriptionActiveGuard)
  @ApiOperation({ summary: 'Relaunch a suspended domain (protected)' })
  @ApiOkResponse({ type: RelaunchDomainResponseDto })
  async relaunch(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<RelaunchDomainResponseDto> {
    return this.domains.relaunchDomainForUser(requireSub(user));
  }

  /** Poll the purchase job status. */
  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get domain purchase job status (protected)' })
  @ApiOkResponse({ type: DomainJobStatusDto })
  async getJobStatus(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DomainJobStatusDto> {
    return this.domains.getJobStatus(requireSub(user), jobId);
  }

  /** Get the tenant's current domain — re-checks DNS propagation on each call. */
  @Get()
  @ApiOperation({ summary: 'Get the tenant current domain + DNS/SSL status (protected)' })
  @ApiOkResponse({ type: DomainStatusResponseDto, nullable: true })
  async getDomain(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DomainStatusResponseDto | null> {
    return this.domains.checkDnsStatus(requireSub(user));
  }
}

/** The guard guarantees a user; this narrows the type defensively. */
function requireSub(user?: AuthenticatedUser): string {
  if (!user) throw new UnauthorizedException();
  return user.sub;
}
