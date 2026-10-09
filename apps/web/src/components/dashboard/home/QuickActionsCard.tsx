import { useNavigate } from '@tanstack/react-router';
import { type LucideIcon, PaintbrushIcon, PencilIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardState } from '@/types/dashboard.types';

interface QuickActionsCardProps {
  state: DashboardState;
}

interface QuickAction {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  enabled: boolean;
  onClick: () => void;
}

export function QuickActionsCard({ state }: QuickActionsCardProps) {
  const navigate = useNavigate();
  const canEdit = state === 'active' || state === 'trial-expired';

  const actions: QuickAction[] = [
    {
      Icon: PencilIcon,
      title: 'Editar',
      subtitle: 'Abrir editor',
      enabled: canEdit,
      onClick: () => void navigate({ to: '/dashboard/customization' }),
    },
    {
      Icon: PaintbrushIcon,
      title: 'Diseño',
      subtitle: 'Cambiar plantilla',
      enabled: canEdit || state === 'no-template',
      onClick: () => void navigate({ to: '/dashboard/templates' }),
    },
  ];

  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            disabled={!action.enabled}
            onClick={action.onClick}
            className={cn(
              'flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors hover:bg-muted hover:cursor-pointer',
              !action.enabled &&
                'opacity-40 cursor-not-allowed pointer-events-none',
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <action.Icon className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium">{action.title}</span>
              <span className="text-xs text-muted-foreground">
                {action.subtitle}
              </span>
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
