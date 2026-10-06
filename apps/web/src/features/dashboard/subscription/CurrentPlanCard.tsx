import type { TenantSubscriptionDto } from '@lattiz/api-client';
import { TriangleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  cancelingStatusBadgeText,
  getSubscriptionPeriodDisplay,
} from '@/lib/subscription-status';
import { BillingPortalButton } from './BillingPortalButton';
import { formatPrice, planById } from './plans';
import { useSubscriptionPrice } from './useBilling';

interface Props {
  subscription: TenantSubscriptionDto;
}

function statusBadge(
  status: string | null,
  isCanceling: boolean,
  dateShort: string,
): { text: string; className: string } {
  if (isCanceling) {
    return {
      text: cancelingStatusBadgeText(dateShort),
      className:
        'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    };
  }

  switch (status) {
    case 'active':
      return {
        text: 'Activa',
        className: 'bg-green-500/10 text-green-700 dark:text-green-400',
      };
    case 'trialing':
      return {
        text: 'Periodo de prueba',
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      };
    case 'past_due':
      return {
        text: 'Pago fallido',
        className: 'bg-destructive/10 text-destructive',
      };
    case 'canceled':
      return { text: 'Cancelada', className: 'bg-muted text-muted-foreground' };
    default:
      return { text: 'Inactiva', className: 'bg-muted text-muted-foreground' };
  }
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium">{children}</span>
    </div>
  );
}

export function CurrentPlanCard({ subscription }: Props) {
  const plan = planById(subscription.plan);
  const period = getSubscriptionPeriodDisplay(subscription);
  const badge = statusBadge(
    subscription.status,
    period.isCanceling,
    period.dateShort,
  );
  const isAnnual = subscription.billingPeriod === 'annual';
  // The subscription's own Stripe price, not today's catalog: grandfathered subscribers keep theirs.
  const price = useSubscriptionPrice().data?.price;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {plan?.name ?? 'Tu suscripción'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <Row label="Estado">
          <Badge variant="secondary" className={badge.className}>
            {badge.text}
          </Badge>
        </Row>
        <Row label="Facturación">
          {isAnnual ? 'Anual' : 'Mensual'}
          {price && (
            <span className="text-muted-foreground">
              · {formatPrice(price.amount, price.currency)}/
              {price.period === 'annual' ? 'año' : 'mes'}
            </span>
          )}
        </Row>
        <Row label={period.periodLabel}>{period.dateShort}</Row>
        {period.isCanceling && (
          <div className="flex flex-col gap-3 py-3">
            <Alert
              className="border-yellow-500/30 bg-yellow-500/5 text-yellow-800 dark:text-yellow-300 *:data-[slot=alert-description]:text-yellow-700/90 dark:*:data-[slot=alert-description]:text-yellow-300/80"
            >
              <TriangleAlertIcon />
              <AlertTitle>Tu suscripción se cancelará</AlertTitle>
              <AlertDescription>
                Seguirás teniendo acceso y tu sitio seguirá en línea hasta el{' '}
                {period.dateLong}. Después se suspenderá.
              </AlertDescription>
            </Alert>
            <BillingPortalButton variant="default">
              Reactivar suscripción
            </BillingPortalButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
