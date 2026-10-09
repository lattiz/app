import type { DomainSearchResultDto } from '@lattiz/api-client';
import { offersProUpgrade } from './domain-copy';

/** Included, then Pro, then not included, then unavailable. Stable inside each group. */
export function sortDomainSearchResults(
  results: readonly DomainSearchResultDto[],
): DomainSearchResultDto[] {
  return [...results].sort((a, b) => coverageRank(a) - coverageRank(b));
}

function coverageRank(result: DomainSearchResultDto): number {
  if (!result.available) return 3;
  if (result.coveredByPlan) return 0;
  if (offersProUpgrade(result)) return 1;
  return 2;
}
