import { ApiProperty } from '@nestjs/swagger';

export const SLUG_PROBLEMS = [
  'SLUG_INVALID',
  'SLUG_RESERVED',
  'SLUG_TAKEN',
] as const;
export type SlugProblem = (typeof SLUG_PROBLEMS)[number];

export class TenantSlugResponseDto {
  @ApiProperty()
  slug!: string;

  /** Where the site is reachable before (or without) a custom domain. */
  @ApiProperty()
  previewUrl!: string;
}

export class SlugAvailabilityResponseDto {
  /** The normalized address that was checked. */
  @ApiProperty()
  slug!: string;

  /** True when the caller can claim it (including the address they already own). */
  @ApiProperty()
  available!: boolean;

  /** Why it cannot be claimed; null when available. */
  @ApiProperty({ type: String, enum: SLUG_PROBLEMS, nullable: true })
  reason!: SlugProblem | null;
}
