import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tenantsControllerMeQueryKey } from '@lattiz/api-client';
import { CheckIcon, CircleIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useDomainJob, useDomainPurchase } from '../hooks/useDomainPurchase';
import { useDomainWizardStore } from '../store/domain-wizard.store';

const PIPELINE_STEPS = [
  { key: 'purchasing', label: 'Registrando dominio' },
  { key: 'configuring_dns', label: 'Configurando DNS' },
  { key: 'registering_vercel', label: 'Conectando a Vercel' },
] as const;

type StepState = 'pending' | 'active' | 'done' | 'error';

function StepIndicator({ state }: { state: StepState }) {
  switch (state) {
    case 'done':
      return <CheckIcon className="size-5 text-green-600 dark:text-green-400" />;
    case 'active':
      return <Spinner className="size-5 text-primary" />;
    case 'error':
      return <XIcon className="size-5 text-destructive" />;
    default:
      return <CircleIcon className="size-5 text-muted-foreground/50" />;
  }
}

export function PurchasingStep() {
  const jobId = useDomainWizardStore((s) => s.jobId);
  const quote = useDomainWizardStore((s) => s.quote);
  const selectedDomain = useDomainWizardStore((s) => s.selectedDomain);
  const agreementsAccepted = useDomainWizardStore((s) => s.agreementsAccepted);
  const agreedAt = useDomainWizardStore((s) => s.agreedAt);

  const queryClient = useQueryClient();
  const job = useDomainJob(jobId);
  const retry = useDomainPurchase();
  const notified = useRef(false);

  const status = job.data?.status;

  useEffect(() => {
    if (status !== 'completed' || notified.current) return;
    notified.current = true;
    toast.success('¡Dominio comprado!');
    void queryClient.invalidateQueries({ queryKey: tenantsControllerMeQueryKey() });
    useDomainWizardStore.getState().setStep('propagating');
  }, [status, queryClient]);

  const stepState = (key: string): StepState => {
    if (job.data?.stepsCompleted.includes(key)) return 'done';
    if (job.data?.errorStep === key) return 'error';
    if (status === key) return 'active';
    return 'pending';
  };

  // The backend reuses the stored idempotency key, so retrying is safe.
  const retryPurchase = () => {
    if (!quote || !selectedDomain || !agreedAt) return;
    notified.current = false;
    retry.mutate({
      body: {
        domain: selectedDomain,
        agreementTypes: agreementsAccepted,
        agreedAt,
        priceUsdCents: Math.round(quote.priceUsdCents),
      },
    });
  };

  const failed = status === 'failed';

  return (
    <Card className="max-w-2xl">
      <CardContent className="flex flex-col gap-6 py-6">
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold">
            Configurando tu dominio
          </h1>
          <p className="text-sm text-muted-foreground">
            Esto tarda aproximadamente 30 segundos. No cierres esta página.
          </p>
        </div>

        <ol className="flex flex-col gap-4">
          {PIPELINE_STEPS.map((step) => {
            const state = stepState(step.key);
            return (
              <li key={step.key} className="flex items-center gap-3">
                <StepIndicator state={state} />
                <span
                  className={cn(
                    'text-sm',
                    state === 'pending' && 'text-muted-foreground',
                    state === 'error' && 'text-destructive',
                    state !== 'pending' && state !== 'error' && 'font-medium',
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>

        {failed && (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <p className="font-medium text-destructive">
              La compra no se pudo completar
            </p>
            {job.data?.errorMessage && (
              <p className="break-words text-muted-foreground">
                {job.data.errorMessage}
              </p>
            )}
            <div>
              <Button
                size="sm"
                variant="outline"
                disabled={retry.isPending}
                onClick={retryPurchase}
              >
                {retry.isPending && <Spinner />}
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
