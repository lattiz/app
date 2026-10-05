import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSubscriptionPeriodDisplay } from '@/lib/subscription-status';
import { BillingPortalButton } from '../../subscription/BillingPortalButton';
import { formatMXN, planById } from '../../subscription/plans';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium">{children}</span>
    </div>
  );
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

export function SubscriptionSection() {
  const { data, isLoading } = useQuery(tenantsControllerMeOptions());

  if (isLoading) {
    return <Skeleton className="h-48 rounded-4xl" />;
  }

  const subscription = data?.subscription ?? null;

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suscripción</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Sin suscripción activa.
          </p>
          <Button size="sm" render={<Link to="/dashboard/subscription" />}>
            Ver planes
          </Button>
        </CardContent>
      </Card>
    );
  }

  const plan = planById(subscription.plan ?? '');
  const badge = statusBadge(subscription.status);
  const period = getSubscriptionPeriodDisplay(subscription);
  const isAnnual = subscription.billingPeriod === 'annual';
  const isPastDue = subscription.status === 'past_due';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Suscripción</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <Row label="Plan">
          {plan?.name ?? '—'}
          <Badge variant="secondary" className={badge.className}>
            {badge.text}
          </Badge>
        </Row>
        <Row label="Período">{isAnnual ? 'Anual' : 'Mensual'}</Row>
        <Row label={period.periodLabel}>{period.dateShort}</Row>
        {period.isCanceling && (
          <p className="py-3 text-sm text-yellow-800 dark:text-yellow-300">
            Se cancelará el {period.dateShort}. Seguirás con acceso hasta
            entonces.
          </p>
        )}
        {data?.domain && <Row label="Dominio">{data.domain}</Row>}
        {plan && (
          <Row label="Precio">
            {formatMXN(isAnnual ? plan.annual : plan.monthly)}/
            {isAnnual ? 'año' : 'mes'}
          </Row>
        )}
        <div className="flex justify-end pt-3">
          <BillingPortalButton variant={isPastDue ? 'default' : 'outline'} />
        </div>
      </CardContent>
    </Card>
  );
}
