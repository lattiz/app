import { CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMXN, type BillingPeriod, type PlanDetails } from './plans';

interface Props {
  plan: PlanDetails;
  period: BillingPeriod;
  onSubscribe: () => void;
  loading?: boolean;
  currentPlan?: boolean;
  ctaLabel?: string;
}

export function PricingCard({
  plan,
  period,
  onSubscribe,
  loading,
  currentPlan,
  ctaLabel,
}: Props) {
  const isAnnual = period === 'annual';
  const monthlyPrice = isAnnual ? plan.annualMonthlyEquivalent : plan.monthly;

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        plan.highlighted && 'ring-2 ring-primary',
      )}
    >
      {plan.highlighted && (
        <Badge className="absolute right-6 top-6 bg-primary text-primary-foreground">
          Recomendado
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <CardDescription>{plan.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold">
              {formatMXN(monthlyPrice)}
            </span>
            <span className="text-sm text-muted-foreground">/mes</span>
          </div>
          {isAnnual && (
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMXN(plan.annual)}/año · 2 meses gratis
            </p>
          )}
        </div>

        <ul className="flex flex-col gap-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="mt-auto w-full"
          variant={plan.highlighted ? 'default' : 'outline'}
          disabled={loading || currentPlan}
          onClick={onSubscribe}
        >
          {currentPlan ? 'Tu plan actual' : (ctaLabel ?? 'Suscribirme')}
        </Button>
      </CardContent>
    </Card>
  );
}
