import type { TenantSubscriptionDto } from '@lattiz/api-client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { formatMXN, planById } from './plans';

interface Props {
  subscription: TenantSubscriptionDto;
}

function statusBadge(status: string | null): { text: string; className: string } {
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
  const badge = statusBadge(subscription.status);
  const isAnnual = subscription.billingPeriod === 'annual';
  const price = plan
    ? isAnnual
      ? plan.annual
      : plan.monthly
    : null;

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
          {price != null && (
            <span className="text-muted-foreground">
              · {formatMXN(price)}/{isAnnual ? 'año' : 'mes'}
            </span>
          )}
        </Row>
        <Row label={subscription.cancelAtPeriodEnd ? 'Termina el' : 'Próximo cobro'}>
          {formatDate(subscription.currentPeriodEnd)}
        </Row>
        {subscription.cancelAtPeriodEnd && (
          <p className="py-3 text-sm text-destructive">
            Tu suscripción se cancelará al final del periodo actual y no se
            renovará.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
