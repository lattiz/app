import { useQuery } from '@tanstack/react-query';
import { billingControllerGetInvoicesOptions } from '@lattiz/api-client';

/** GET /billing/invoices — last 12 paid invoices for the current tenant. */
export function useInvoices() {
  return useQuery({
    ...billingControllerGetInvoicesOptions(),
    staleTime: 5 * 60 * 1000,
  });
}
