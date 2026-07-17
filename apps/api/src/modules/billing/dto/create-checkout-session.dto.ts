import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { BillingPeriod, BillingPlan } from '../billing.constants';

export class CreateCheckoutSessionDto {
  @ApiProperty({ enum: ['basico', 'pro'] })
  @IsIn(['basico', 'pro'])
  plan!: BillingPlan;

  @ApiProperty({ enum: ['monthly', 'annual'] })
  @IsIn(['monthly', 'annual'])
  period!: BillingPeriod;
}
