import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  tenantsControllerMeOptions,
  tenantsControllerMeQueryKey,
  type TenantMeResponseDto,
} from '@lattiz/api-client';
import { TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Button } from '@/components/ui/button';
import { BillingPeriodToggle } from './BillingPeriodToggle';
import { BillingPortalButton } from './BillingPortalButton';
import { CurrentPlanCard } from './CurrentPlanCard';
import { PricingCard } from './PricingCard';
import { PLANS, type BillingPeriod, type PlanId } from './plans';
import { useCreateCheckoutSession } from './useBilling';

const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const routeApi = getRouteApi('/_authenticated/dashboard/subscription');

export function SubscriptionPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const { data, isLoading } = useQuery(tenantsControllerMeOptions());
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const checkout = useCreateCheckoutSession();
  const handledReturn = useRef(false);

  // Handle the Stripe Checkout return once, then strip the params from the URL.
  useEffect(() => {
    if (handledReturn.current) return;
    const isSuccess = search.success === true;
    const isCanceled = search.canceled === true;
    if (!isSuccess && !isCanceled) return;
    handledReturn.current = true;

    if (isSuccess) {
      toast.success('¡Suscripción activada! Gracias por tu compra.');
      // The checkout.session.completed webhook can land 1–5s after this
      // redirect, so the first refetch may still read the old plan. Poll
      // (max ~8s) until the subscription flips to active.
      let attempts = 0;
      const poll = async (): Promise<void> => {
        attempts += 1;
        await queryClient.refetchQueries({
          queryKey: tenantsControllerMeQueryKey(),
        });
        const fresh = queryClient.getQueryData<TenantMeResponseDto>(
          tenantsControllerMeQueryKey(),
        );
        const status = fresh?.subscription?.status;
        if (status === 'active' || status === 'trialing' || attempts >= 4) {
          return;
        }
        window.setTimeout(() => void poll(), 2000);
      };
      window.setTimeout(() => void poll(), 1500);
    } else {
      toast('Pago cancelado, puedes intentarlo cuando quieras.');
    }

    void navigate({
      to: '/dashboard/subscription',
      search: {},
      replace: true,
    });
  }, [search.success, search.canceled, navigate, queryClient]);

  if (isLoading) return <DashboardSkeleton />;

  const subscription = data?.subscription ?? null;
  const isActive =
    subscription != null && ACTIVE_STATUSES.has(subscription.status ?? '');
  const isPastDue = subscription?.status === 'past_due';

  const subscribe = (plan: PlanId) =>
    checkout.mutate({ body: { plan, period } });

  if (subscription && (isActive || isPastDue)) {
    return (
      <div className="flex flex-col gap-6">
        {isPastDue && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Tu pago falló — actualiza tu método de pago
              </p>
              <p className="text-muted-foreground">
                El acceso a la edición se pausa hasta regularizar el pago.
              </p>
            </div>
          </div>
        )}

        <CurrentPlanCard subscription={subscription} />

        <div className="flex flex-wrap gap-3">
          <BillingPortalButton variant={isPastDue ? 'default' : 'outline'} />
          {subscription.plan === 'basico' && (
            <Button
              variant="default"
              disabled={checkout.isPending}
              onClick={() => subscribe('pro')}
            >
              Mejorar a Pro
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold">Elige tu plan</h1>
          <p className="text-sm text-muted-foreground">
            Cancela cuando quieras. Todos los planes incluyen tu sitio en línea
            con SSL.
          </p>
        </div>
        <BillingPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            period={period}
            loading={checkout.isPending}
            onSubscribe={() => subscribe(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}
