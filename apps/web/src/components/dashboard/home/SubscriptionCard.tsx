import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SubscriptionStatus } from '@/types/dashboard.types';

interface SubscriptionCardProps {
  subscription: SubscriptionStatus | null;
}

function Row({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium">{children}</span>
    </div>
  );
}

function statusBadge(status: SubscriptionStatus['status']) {
  switch (status) {
    case 'active':
      return {
        text: 'activa',
        className: 'bg-green-500/10 text-green-700 dark:text-green-400',
      };
    case 'trialing':
      return {
        text: 'trial',
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      };
    case 'past_due':
      return {
        text: 'pago fallido',
        className: 'bg-destructive/10 text-destructive',
      };
    case 'canceled':
      return { text: 'cancelada', className: 'bg-muted text-muted-foreground' };
    default:
      return { text: 'inactiva', className: 'bg-muted text-muted-foreground' };
  }
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  if (!subscription) return null;

  const badge = statusBadge(subscription.status);
  const includesDomain = subscription.plan === 'pro';
  const showUpgrade = subscription.plan !== 'pro';

  return (
    <Card>
      <CardContent className="flex flex-col divide-y divide-border">
        <Row label="Estado">
          <Badge variant="secondary" className={badge.className}>
            {badge.text}
          </Badge>
        </Row>
        <Row label="Próximo cobro">
          {formatDate(subscription.currentPeriodEnd)}
        </Row>
        <Row label="Dominio propio">
          <Badge
            variant="secondary"
            className={cn(
              includesDomain
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {includesDomain ? 'incluido' : 'no incluido'}
          </Badge>
        </Row>
        {showUpgrade && (
          <div className="pt-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/dashboard/subscription" />}
            >
              Actualizar plan →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
