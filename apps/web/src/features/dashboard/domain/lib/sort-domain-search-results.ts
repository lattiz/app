import type { DomainSearchResultDto } from '@lattiz/api-client';
import { offersProUpgrade } from './domain-copy';

/**
 * What the wizard lists: included and Pro-upsell names first, then unavailable
 * ones. Available names no plan can buy (over a price cap, or unpriced) are
 * dropped: the API keeps deciding them, the user never sees them.
 */
export function visibleDomainSearchResults(
  results: readonly DomainSearchResultDto[],
): DomainSearchResultDto[] {
  return results
    .filter((result) => !isOutOfReach(result))
    .sort((a, b) => coverageRank(a) - coverageRank(b));
}

function isOutOfReach(result: DomainSearchResultDto): boolean {
  return (
    result.available && !result.coveredByPlan && !offersProUpgrade(result)
  );
}

/** Included, then Pro, then unavailable. Stable inside each group. */
function coverageRank(result: DomainSearchResultDto): number {
  if (!result.available) return 2;
  if (result.coveredByPlan) return 0;
  return 1;
}
