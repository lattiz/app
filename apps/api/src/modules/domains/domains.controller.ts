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
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { DomainsService } from './domains.service';
import {
  DomainJobStatusDto,
  DomainPurchaseResponseDto,
  DomainQuoteResponseDto,
  DomainSearchResultDto,
  DomainStatusResponseDto,
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
  @ApiOperation({ summary: 'Search available domains (protected)' })
  @ApiOkResponse({ type: [DomainSearchResultDto] })
  async search(
    @Query() query: SearchDomainsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DomainSearchResultDto[]> {
    requireSub(user);
    return this.domains.searchDomains(query.q);
  }

  /** Get a locked price quote for a domain — free, no commitment, 10-min TTL. */
  @Post('quote')
  @ApiOperation({ summary: 'Get a locked registration quote (protected)' })
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
  @ApiOperation({ summary: 'Purchase a domain (protected, async)' })
  @ApiOkResponse({ type: DomainPurchaseResponseDto })
  async purchase(
    @Body() dto: PurchaseDomainDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<DomainPurchaseResponseDto> {
    return this.domains.initiatePurchase(requireSub(user), dto);
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
