import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  tenantsControllerMeOptions,
  tenantsControllerMeQueryKey,
} from '@lattiz/api-client';
import { Loader2Icon, PauseCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRelaunchDomain } from '../hooks/useRelaunchDomain';
import { useDomainWizardStore } from '../store/domain-wizard.store';

export function SuspendedStep() {
  const queryClient = useQueryClient();
  const { data: tenantMe } = useQuery(tenantsControllerMeOptions());
  const relaunch = useRelaunchDomain();
  const [autoChecking, setAutoChecking] = useState(true);

  const domainStatus = tenantMe?.domainStatus ?? null;
  const suspended = domainStatus?.suspended ?? false;

  // The billing webhook usually relaunches before the user gets here — one
  // delayed re-read catches that without making them click.
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      await queryClient.refetchQueries({ queryKey: tenantsControllerMeQueryKey() });
      setAutoChecking(false);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [queryClient]);

  useEffect(() => {
    if (domainStatus && !suspended) {
      useDomainWizardStore.getState().setStep('propagating');
    }
  }, [domainStatus, suspended]);

  if (!domainStatus) return null;

  return (
    <Card className="max-w-2xl">
      <CardContent className="flex flex-col gap-6 py-6">
        <div className="flex items-center gap-3">
          <PauseCircleIcon className="size-6 text-yellow-700 dark:text-yellow-400" />
          <h1 className="font-heading text-xl font-semibold">
            Tu sitio está pausado
          </h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Tu dominio <span className="font-medium text-foreground">{domainStatus.domain}</span>{' '}
          dejó de estar disponible cuando tu suscripción venció. Ya renovaste —
          estamos restaurando tu sitio automáticamente.
        </p>

        <div className="flex items-center gap-3">
          <Button
            disabled={relaunch.isPending}
            onClick={() => relaunch.mutate({})}
          >
            {relaunch.isPending ? (
              <>
                <Loader2Icon className="size-3 animate-spin" />
                Reactivando…
              </>
            ) : (
              'Reactivar ahora'
            )}
          </Button>
          {autoChecking && !relaunch.isPending && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2Icon className="size-3 animate-spin" />
              Comprobando estado…
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
