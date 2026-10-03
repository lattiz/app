import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tenantsControllerMeQueryKey } from '@lattiz/api-client';
import { ExternalLinkIcon, InfoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DomainStatusBadge } from '../components/DomainStatusBadge';
import { useDomainStatus } from '../hooks/useDomainStatus';
import { useDomainWizardStore } from '../store/domain-wizard.store';

export function PropagatingStep() {
  const queryClient = useQueryClient();
  const { data: domain } = useDomainStatus();
  const notified = useRef(false);

  const dnsStatus = domain?.dnsStatus;

  useEffect(() => {
    if (dnsStatus !== 'active' || notified.current) return;
    notified.current = true;
    toast.success('¡Tu sitio está en vivo!');
    void queryClient.invalidateQueries({ queryKey: tenantsControllerMeQueryKey() });
    useDomainWizardStore.getState().setStep('active');
  }, [dnsStatus, queryClient]);

  if (!domain) return null;

  return (
    <Card className="max-w-2xl">
      <CardContent className="flex flex-col gap-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-yellow-500" />
          </span>
          <h1 className="font-heading text-xl font-semibold">{domain.domain}</h1>
          <DomainStatusBadge status={domain.dnsStatus} />
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
          <InfoIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            Tu dominio ya está comprado y configurado. La propagación DNS puede
            tardar entre 5 minutos y 2 horas. Tu sitio estará disponible
            automáticamente — no necesitas hacer nada más.
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={`https://dnschecker.org/#A/${domain.domain}`}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Ver el estado de DNS
            <ExternalLinkIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
