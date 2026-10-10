import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { Mail } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import {
  hasPrioritySupport,
  isWhatsAppSupportConfigured,
  SUPPORT_EMAIL,
  supportMailto,
} from '@/features/support/support';
import { WhatsAppIcon } from '@/features/support/WhatsAppIcon';
import { WhatsAppSupportDialog } from '@/features/support/WhatsAppSupportDialog';
import { useAuthStore } from '@/stores/auth.store';

export function ContactSupport() {
  const { data: tenantMe } = useQuery(tenantsControllerMeOptions());
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);

  const showWhatsApp = hasPrioritySupport(tenantMe) && isWhatsAppSupportConfigured();

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton render={<a href={supportMailto()} />}>
          <Mail />
          <span>{SUPPORT_EMAIL}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {showWhatsApp && (
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setWhatsAppOpen(true)}>
            <WhatsAppIcon />
            <span>Soporte por WhatsApp</span>
            <span className="ml-auto text-xs text-sidebar-foreground/50">Pro</span>
          </SidebarMenuButton>
          <WhatsAppSupportDialog
            open={whatsAppOpen}
            onOpenChange={setWhatsAppOpen}
            customerId={userId}
          />
        </SidebarMenuItem>
      )}
    </>
  );
}
