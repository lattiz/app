import { ApiProperty } from '@nestjs/swagger';

export class DependencyStatusDto {
  @ApiProperty({ example: 'mock', description: 'Dependency name.' })
  name!: string;

  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  status!: 'up' | 'down';
}

export class HealthResponseDto {
  @ApiProperty({
    enum: ['ok', 'degraded'],
    example: 'ok',
    description: 'Overall service status.',
  })
  status!: 'ok' | 'degraded';

  @ApiProperty({
    type: [DependencyStatusDto],
    description: 'Per-dependency probe results.',
  })
  dependencies!: DependencyStatusDto[];
}
