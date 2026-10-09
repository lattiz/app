import type { DomainQuoteResponseDto, DomainSearchResultDto } from '@lattiz/api-client';

type NotCoveredReason = DomainSearchResultDto['notCoveredReason'];

export const domainCoverageCopy = {
  included: 'Incluido en tu plan',
  availableWithPro: 'Disponible con Pro',
  upgradeCta: 'Mejorar a Pro',
  upgradeMessage:
    'Este dominio está disponible con Pro. Mejora tu plan para registrarlo.',
  renewalOverCap: 'La renovación supera lo que cubre tu plan',
  purchaseOverCap: 'Su precio supera lo que cubre tu plan',
  priceUnknown: 'No pudimos confirmar el precio; intenta más tarde',
  notIncluded: 'No incluido en tu plan',
  renewalOverAnyPlan:
    'La renovación de este dominio supera lo que cubre cualquier plan',
  notCovered: 'Tu plan no cubre este dominio. Elige otro.',
  noLongerAvailable: 'Este dominio ya no está disponible. Elige otro.',
} as const;

/** Label next to "Disponible" when the current plan does not include the name. */
export function searchNotCoveredLabel(reason: NotCoveredReason): string {
  switch (reason) {
    case 'renewal_over_cap':
      return domainCoverageCopy.renewalOverCap;
    case 'purchase_over_cap':
      return domainCoverageCopy.purchaseOverCap;
    case 'price_unknown':
      return domainCoverageCopy.priceUnknown;
    case 'requires_pro':
      return domainCoverageCopy.availableWithPro;
    default:
      return domainCoverageCopy.notIncluded;
  }
}

/** Quote succeeded but the name cannot be bought on the current plan. */
export function quoteNotCoveredMessage(
  reason: DomainQuoteResponseDto['notCoveredReason'],
): string {
  if (reason == null) return domainCoverageCopy.notCovered;
  return searchNotCoveredLabel(reason);
}

export function offersProUpgrade(result: {
  coveredByPlan: boolean;
  availableWithPro: boolean;
  notCoveredReason: NotCoveredReason;
}): boolean {
  return (
    !result.coveredByPlan &&
    (result.availableWithPro || result.notCoveredReason === 'requires_pro')
  );
}
