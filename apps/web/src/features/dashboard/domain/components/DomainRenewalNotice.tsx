import { Link } from '@tanstack/react-router';
import { bannerToneStyles } from '@/components/dashboard/banner-tone';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  useDomainRenewal,
  useRenewalCheckout,
} from '../hooks/useDomainRenewal';
import { renewalCheckoutErrorMessage } from '../lib/domain-errors';
import { domainRenewalCopy, renewalAmountLine } from '../lib/renewal-copy';

export function DomainRenewalNotice() {
  const renewal = useDomainRenewal();
  const checkout = useRenewalCheckout();
  const data = renewal.data;
  if (!data) return null;

  const copy = domainRenewalCopy(data, new Date());
  const tone = bannerToneStyles[copy.tone];
  const errorMessage =
    checkout.isError && !checkout.isPending
      ? renewalCheckoutErrorMessage(checkout.error)
      : null;

  return (
    <Alert variant={tone.variant} className={cn('text-sm', tone.className)}>
      <tone.Icon />
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <p>{copy.description}</p>
        {copy.showAmount && <p>{renewalAmountLine(data)}</p>}
        {copy.cta && data.payBlockedReason === 'subscription_inactive' ? (
          <Button
            size="sm"
            variant={copy.tone === 'destructive' ? 'destructive' : 'outline'}
            render={<Link to="/dashboard/subscription" />}
          >
            {copy.cta}
          </Button>
        ) : copy.cta ? (
          <Button
            size="sm"
            variant={copy.tone === 'destructive' ? 'destructive' : 'outline'}
            disabled={checkout.isPending}
            onClick={() => checkout.mutate({})}
          >
            {checkout.isPending && <Spinner />}
            {copy.cta}
          </Button>
        ) : null}
        {errorMessage && <p className="text-destructive">{errorMessage}</p>}
      </AlertDescription>
    </Alert>
  );
}
