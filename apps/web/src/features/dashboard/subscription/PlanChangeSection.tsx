import { useState } from 'react';
import type { PlanChangeOptionDto } from '@lattiz/api-client';
import { CalendarClockIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDateLong } from '@/lib/subscription-status';
import {
  blockerMessages,
  needsSupport,
  planChangeCopy,
  PRO_ONLY_FEATURES,
  SUPPORT_EMAIL,
} from './plan-change.copy';
import { formatPrice, planById, pricingFor } from './plans';
import { useBillingPlans } from './useBilling';
import {
  rememberPlanChangeReturn,
  usePlanChangeStatus,
  useReleasePlanChange,
  useRequestPlanChange,
} from './usePlanChange';

interface Props {
  /** Send the user back to the domain wizard once an upgrade lands. */
  returnToDomain: boolean;
}

export function PlanChangeSection({ returnToDomain }: Props) {
  const status = usePlanChangeStatus(true);
  const request = useRequestPlanChange();
  const release = useReleasePlanChange();
  const prices = useBillingPlans();
  const [selected, setSelected] = useState<PlanChangeOptionDto | null>(null);

  if (!status.data) return null;
  const { pending, options, billingPeriod } = status.data;

  if (pending) {
    const planName = planById(pending.targetPlan)?.name ?? pending.targetPlan;
    return (
      <Alert className="border-primary/30 bg-primary/5">
        <CalendarClockIcon />
        <AlertTitle>
          {planChangeCopy.pendingTitle(
            planName,
            formatDateLong(pending.effectiveAt),
          )}
        </AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <p>{planChangeCopy.pendingNote}</p>
          <Button
            variant="outline"
            size="sm"
            disabled={release.isPending}
            onClick={() => release.mutate({})}
          >
            {planChangeCopy.pendingCancel}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const actionable = options.filter((option) => option.direction !== 'none');
  if (actionable.length === 0) return null;

  const confirm = () => {
    if (!selected) return;
    if (selected.direction === 'upgrade' && returnToDomain) {
      rememberPlanChangeReturn('/dashboard/domain');
    }
    request.mutate(
      { body: { targetPlan: selected.targetPlan } },
      { onSettled: () => setSelected(null) },
    );
  };

  const targetPricing = selected
    ? pricingFor(prices.data, selected.targetPlan)
    : null;
  const targetPrice =
    targetPricing && billingPeriod
      ? `${formatPrice(targetPricing[billingPeriod], targetPricing.currency)}/${billingPeriod === 'annual' ? 'año' : 'mes'}`
      : null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{planChangeCopy.sectionTitle}</h2>
      {actionable.map((option) => {
        const messages = blockerMessages(option.blockers);
        return (
          <div
            key={option.targetPlan}
            className="flex flex-col items-start gap-2"
          >
            <Button
              variant={option.direction === 'upgrade' ? 'default' : 'outline'}
              disabled={!option.allowed || request.isPending}
              onClick={() => setSelected(option)}
            >
              {option.direction === 'upgrade'
                ? planChangeCopy.upgradeCta
                : planChangeCopy.downgradeCta}
            </Button>
            {messages.map((message) => (
              <p key={message} className="text-sm text-muted-foreground">
                {message}
              </p>
            ))}
            {needsSupport(option.blockers) && (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-sm font-medium underline underline-offset-4"
              >
                {planChangeCopy.contactSupport}
              </a>
            )}
          </div>
        );
      })}

      <AlertDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && !request.isPending) setSelected(null);
        }}
      >
        <AlertDialogContent>
          {selected?.direction === 'upgrade' ? (
            <AlertDialogHeader>
              <AlertDialogTitle>{planChangeCopy.upgradeTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {planChangeCopy.upgradeBody}
                {targetPrice && (
                  <span className="mt-2 block font-medium text-foreground">
                    Plan Pro: {targetPrice}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
          ) : (
            <AlertDialogHeader>
              <AlertDialogTitle>
                {planChangeCopy.downgradeTitle}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {planChangeCopy.downgradeBody(
                  formatDateLong(selected?.effectiveAt ?? null),
                )}
              </AlertDialogDescription>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {planChangeCopy.downgradeLosesTitle}
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {PRO_ONLY_FEATURES.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {targetPrice && (
                  <p className="mt-2">Plan Básico: {targetPrice}</p>
                )}
              </div>
            </AlertDialogHeader>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={request.isPending}>
              {planChangeCopy.cancel}
            </AlertDialogCancel>
            <AlertDialogAction disabled={request.isPending} onClick={confirm}>
              {selected?.direction === 'upgrade'
                ? planChangeCopy.upgradeConfirm
                : planChangeCopy.downgradeConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
