import { Link } from '@tanstack/react-router';
import { ChartAreaIcon, CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const BENEFITS = [
  'Visitas y usuarios de los últimos 28 días',
  'De dónde llegan tus visitantes',
  'Sin configuración: lo activamos por ti',
];

export function AnalyticsUpsell() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ChartAreaIcon className="size-6 text-primary" />
        </div>
        <div className="space-y-2">
          <Badge variant="secondary">Pro</Badge>
          <h2 className="text-lg font-semibold">Analíticas disponibles en el plan Pro</h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Conoce cuántas personas visitan tu sitio y cómo te encuentran.
          </p>
        </div>
        <ul className="flex flex-col gap-1.5 text-left text-sm">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <CheckIcon className="size-4 shrink-0 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
        <Button render={<Link to="/dashboard/subscription" />}>Mejorar a Pro</Button>
      </CardContent>
    </Card>
  );
}
