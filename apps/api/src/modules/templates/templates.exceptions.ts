import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** The tenant's plan does not include this template's tier. */
export class TemplateRequiresProException extends DomainException {
  readonly code = 'TEMPLATE_REQUIRES_PRO';
  readonly status = HttpStatus.FORBIDDEN;

  constructor(templateId: string) {
    super('This template requires the Pro plan.', { templateId, tier: 'pro' });
  }
}

/** The current template is above the tenant's plan (after a downgrade): editing is paused until they switch or upgrade. */
export class TemplateLockedByPlanException extends DomainException {
  readonly code = 'TEMPLATE_LOCKED_BY_PLAN';
  readonly status = HttpStatus.FORBIDDEN;

  constructor(templateId: string | null, tier: string | null) {
    super(
      'Your plan no longer includes this template. Choose a Básico template or upgrade to Pro.',
      { templateId, tier },
    );
  }
}
