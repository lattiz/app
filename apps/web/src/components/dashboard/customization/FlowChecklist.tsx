import { CheckCircle2Icon, CircleIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SiteStatus, SubscriptionStatus } from '@/types/dashboard.types';

interface FlowChecklistProps {
  site: SiteStatus;
  subscription: SubscriptionStatus;
}

interface ChecklistItem {
  label: string;
  done: boolean;
}

function buildChecklist(
  site: SiteStatus,
  subscription: SubscriptionStatus,
): ChecklistItem[] {
  return [
    { label: 'Suscripción activa', done: subscription.status === 'active' },
    { label: 'Plantilla seleccionada', done: site.templateId !== null },
    { label: 'Dominio configurado', done: site.domain !== null },
    { label: 'DNS verificado', done: site.domainConnected },
    { label: 'Sitio publicado', done: site.lastPublished !== null },
  ];
}

export function FlowChecklist({ site, subscription }: FlowChecklistProps) {
  const items = buildChecklist(site, subscription);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de configuración</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 py-1.5 text-sm"
          >
            {item.done ? (
              <CheckCircle2Icon className="size-5 text-green-600 dark:text-green-500" />
            ) : (
              <CircleIcon className="size-5 text-muted-foreground" />
            )}
            <span
              className={cn(
                item.done ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
