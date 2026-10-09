import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { BillingPeriod, BillingPlan } from '../billing.constants';
import {
  PLAN_CHANGE_BLOCKERS,
  type PlanChangeBlocker,
  type PlanChangeDirection,
  type PlanChangeTiming,
} from '../plan-change.policy';

export class RequestPlanChangeDto {
  @ApiProperty({ enum: ['basico', 'pro'] })
  @IsIn(['basico', 'pro'])
  targetPlan!: BillingPlan;
}

export class PlanChangeOptionDto {
  @ApiProperty({ enum: ['basico', 'pro'] })
  targetPlan!: BillingPlan;

  /** `none` when the target is the current plan or the current plan is unknown. */
  @ApiProperty({ enum: ['upgrade', 'downgrade', 'none'] })
  direction!: PlanChangeDirection;

  /** Upgrades apply now (prorated); downgrades at the end of the current billing period. */
  @ApiProperty({ enum: ['immediate', 'period_end', null], nullable: true })
  effective!: PlanChangeTiming | null;

  /** ISO date a downgrade would take effect; null for upgrades. */
  @ApiProperty({ type: String, nullable: true })
  effectiveAt!: string | null;

  @ApiProperty()
  allowed!: boolean;

  @ApiProperty({ enum: PLAN_CHANGE_BLOCKERS, isArray: true })
  blockers!: PlanChangeBlocker[];
}

export class PendingPlanChangeDto {
  @ApiProperty({ enum: ['basico', 'pro'] })
  targetPlan!: BillingPlan;

  /** ISO date the scheduled change takes effect. */
  @ApiProperty()
  effectiveAt!: string;
}

export class PlanChangeStatusResponseDto {
  /** Derived from the subscription's price; null without a subscription or for an unknown price. */
  @ApiProperty({ enum: ['basico', 'pro', null], nullable: true })
  currentPlan!: BillingPlan | null;

  @ApiProperty({ enum: ['monthly', 'annual', null], nullable: true })
  billingPeriod!: BillingPeriod | null;

  @ApiProperty({ type: PendingPlanChangeDto, nullable: true })
  pending!: PendingPlanChangeDto | null;

  @ApiProperty({ type: PlanChangeOptionDto, isArray: true })
  options!: PlanChangeOptionDto[];
}

/** `redirect`: send the browser to `url` (Stripe confirms an upgrade). `scheduled`: a downgrade was scheduled for `effectiveAt`. */
export class PlanChangeResultDto {
  @ApiProperty({ enum: ['redirect', 'scheduled'] })
  kind!: 'redirect' | 'scheduled';

  @ApiProperty({ type: String, nullable: true })
  url!: string | null;

  @ApiProperty({ type: String, nullable: true })
  effectiveAt!: string | null;
}

export class ReleasePlanChangeResponseDto {
  @ApiProperty()
  released!: boolean;
}
