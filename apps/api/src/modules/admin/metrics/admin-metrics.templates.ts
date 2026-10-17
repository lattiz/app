const TOP = 10;
const MIN_USING_FOR_CONVERSION = 3;

export interface TemplateUsageFact {
  id: string;
  name: string;
  tier: 'basic' | 'pro';
  tenantsUsing: number;
  payingTenants: number;
}

export interface TemplateRank extends TemplateUsageFact {
  conversionRate: number | null;
}

export interface TemplateRanks {
  byAdoption: TemplateRank[];
  byConversion: TemplateRank[];
}

/** Adoption is `tenants_using`. Conversion needs at least 3 tenants. */
export function rankTemplates(
  rows: readonly TemplateUsageFact[],
): TemplateRanks {
  const ranked = rows.map(withRate);
  return {
    byAdoption: ranked
      .toSorted(
        (left, right) =>
          right.tenantsUsing - left.tenantsUsing ||
          left.id.localeCompare(right.id),
      )
      .slice(0, TOP),
    byConversion: ranked
      .filter((row) => row.tenantsUsing >= MIN_USING_FOR_CONVERSION)
      .toSorted(
        (left, right) =>
          (right.conversionRate ?? -1) - (left.conversionRate ?? -1) ||
          right.tenantsUsing - left.tenantsUsing ||
          left.id.localeCompare(right.id),
      )
      .slice(0, TOP),
  };
}

function withRate(row: TemplateUsageFact): TemplateRank {
  return {
    ...row,
    conversionRate:
      row.tenantsUsing > 0 ? row.payingTenants / row.tenantsUsing : null,
  };
}
