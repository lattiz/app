import { ApiProperty } from '@nestjs/swagger';

/** One row of `admin.storage_usage`. Byte counts are integers. */
export class AdminStorageUsageDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  assetsBytes!: number;

  /** Always 0 until object storage can count keys, not only bytes. */
  @ApiProperty()
  assetsObjects!: number;

  @ApiProperty()
  brandingBytes!: number;

  /** Always 0 until object storage can count keys, not only bytes. */
  @ApiProperty()
  brandingObjects!: number;

  /** When this row was measured (ISO 8601). */
  @ApiProperty()
  measuredAt!: string;
}
