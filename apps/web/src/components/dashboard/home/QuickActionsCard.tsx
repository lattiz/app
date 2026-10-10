import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { type LucideIcon, MessageCircleQuestionMark, PaintbrushIcon, PencilIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  hasPrioritySupport,
  isWhatsAppSupportConfigured,
  SUPPORT_EMAIL,
  supportMailto,
} from '@/features/support/support';
import { WhatsAppSupportDialog } from '@/features/support/WhatsAppSupportDialog';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
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
  const { data: tenantMe } = useQuery(tenantsControllerMeOptions());
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  const whatsAppSupport = hasPrioritySupport(tenantMe) && isWhatsAppSupportConfigured();

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
    {
      Icon: MessageCircleQuestionMark,
      title: 'Soporte',
      subtitle: whatsAppSupport ? 'WhatsApp prioritario' : SUPPORT_EMAIL,
      enabled: true,
      onClick: () => {
        if (whatsAppSupport) setWhatsAppOpen(true);
        else window.location.href = supportMailto();
      },
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
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">{action.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {action.subtitle}
              </span>
            </span>
          </button>
        ))}
      </CardContent>
      <WhatsAppSupportDialog
        open={whatsAppOpen}
        onOpenChange={setWhatsAppOpen}
        customerId={userId}
      />
    </Card>
  );
}
