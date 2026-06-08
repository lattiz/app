import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckHealthUseCase } from '../application/check-health.use-case';
import { HealthResponseDto } from './health.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkHealth: CheckHealthUseCase) {}

  /** Public liveness/readiness probe. No authentication required. */
  @Get()
  @ApiOperation({ summary: 'Service health (public)' })
  @ApiOkResponse({ type: HealthResponseDto })
  async health(): Promise<HealthResponseDto> {
    return this.checkHealth.execute();
  }
}
