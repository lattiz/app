import { useEffect, useRef } from 'react';
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  billingControllerGetPlanChangeOptions,
  billingControllerGetPlanChangeQueryKey,
  billingControllerGetPlansQueryKey,
  billingControllerGetSubscriptionPriceQueryKey,
  billingControllerReleasePendingPlanChangeMutation,
  billingControllerRequestPlanChangeMutation,
  tenantsControllerMeQueryKey,
  type TenantMeResponseDto,
} from '@lattiz/api-client';
import { toast } from 'sonner';
import { formatDateLong } from '@/lib/subscription-status';
import { planChangeCopy, planChangeErrorMessage } from './plan-change.copy';

/** Where to send the user once an upgrade started elsewhere (e.g. the domain wizard) has landed. */
const RETURN_TO_KEY = 'lattiz.planChangeReturnTo';
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 20_000;

export type PlanChangeReturn = 'done' | 'canceled';

export function rememberPlanChangeReturn(path: '/dashboard/domain'): void {
  sessionStorage.setItem(RETURN_TO_KEY, path);
}

function takePlanChangeReturn(): '/dashboard/domain' | null {
  const value = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  return value === '/dashboard/domain' ? value : null;
}

function invalidatePlanQueries(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: billingControllerGetPlanChangeQueryKey(),
    }),
    queryClient.invalidateQueries({ queryKey: tenantsControllerMeQueryKey() }),
    queryClient.invalidateQueries({
      queryKey: billingControllerGetSubscriptionPriceQueryKey(),
    }),
    queryClient.invalidateQueries({
      queryKey: billingControllerGetPlansQueryKey(),
    }),
  ]);
}

/** GET /billing/plan-change — options, blockers and any scheduled change. */
export function usePlanChangeStatus(enabled: boolean) {
  return useQuery({
    ...billingControllerGetPlanChangeOptions(),
    enabled,
    staleTime: 30_000,
  });
}

/** POST /billing/plan-change — upgrade redirects to Stripe; downgrade is scheduled. */
export function useRequestPlanChange() {
  const queryClient = useQueryClient();
  return useMutation({
    ...billingControllerRequestPlanChangeMutation(),
    onSuccess: (result) => {
      if (result.kind === 'redirect' && result.url) {
        window.location.href = result.url;
        return;
      }
      toast.success(
        planChangeCopy.scheduledToast(formatDateLong(result.effectiveAt)),
      );
      void invalidatePlanQueries(queryClient);
    },
    onError: (error) => toast.error(planChangeErrorMessage(error)),
  });
}

/** DELETE /billing/plan-change/pending — keeps the current plan. */
export function useReleasePlanChange() {
  const queryClient = useQueryClient();
  return useMutation({
    ...billingControllerReleasePendingPlanChangeMutation(),
    onSuccess: () => {
      toast.success(planChangeCopy.releasedToast);
      void invalidatePlanQueries(queryClient);
    },
    onError: () => toast.error(planChangeCopy.releaseError),
  });
}

/**
 * Handles the Stripe portal return once, then strips the param. The plan flips
 * only when the webhook lands, so `done` polls GET /tenants/me for up to 20 s.
 */
export function usePlanChangeReturn(planChange: PlanChangeReturn | undefined) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (!planChange || handled.current) return;
    handled.current = true;
    void navigate({ to: '/dashboard/subscription', search: {}, replace: true });

    if (planChange === 'canceled') {
      sessionStorage.removeItem(RETURN_TO_KEY);
      toast(planChangeCopy.canceledToast);
      return;
    }

    const startedAt = Date.now();
    const poll = async (): Promise<void> => {
      await invalidatePlanQueries(queryClient);
      await queryClient.refetchQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      const fresh = queryClient.getQueryData<TenantMeResponseDto>(
        tenantsControllerMeQueryKey(),
      );
      if (fresh?.plan === 'pro') {
        toast.success(planChangeCopy.doneToast);
        const returnTo = takePlanChangeReturn();
        if (returnTo) void navigate({ to: returnTo });
        return;
      }
      if (Date.now() - startedAt >= POLL_MAX_MS) {
        takePlanChangeReturn();
        toast(planChangeCopy.processingToast);
        return;
      }
      window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
    };
    void poll();
  }, [planChange, navigate, queryClient]);
}
