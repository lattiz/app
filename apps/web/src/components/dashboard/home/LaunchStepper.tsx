import { CheckCircle2Icon, CircleIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SiteStatus } from '@/types/dashboard.types';

interface LaunchStepperProps {
  site: SiteStatus | null;
}

export type Step = { label: string; done: boolean };

export function buildSteps(site: SiteStatus | null): Step[] {
  return [
    { label: 'Crear cuenta', done: true },
    { label: 'Elegir plantilla', done: !!site?.templateId },
    { label: 'Personalizar contenido', done: false },
    { label: 'Conectar dominio', done: !!site?.domainConnected },
    { label: 'Publicar sitio', done: !!site?.isOnline },
  ];
}

export function LaunchStepper({ site }: LaunchStepperProps) {
  const steps = buildSteps(site);

  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        {steps.map((step) => (
          <div
            key={step.label}
            className="flex items-center gap-3 py-1.5 text-sm"
          >
            {step.done ? (
              <CheckCircle2Icon className="size-5 text-green-600 dark:text-green-500" />
            ) : (
              <CircleIcon className="size-5 text-muted-foreground" />
            )}
            <span
              className={cn(
                step.done ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
