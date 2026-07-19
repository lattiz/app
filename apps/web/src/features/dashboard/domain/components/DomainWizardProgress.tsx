import { cn } from '@/lib/utils';
import type { DomainSource, WizardStep } from '../store/domain-wizard.store';

const PURCHASE_STEPS: Array<{ key: WizardStep; label: string }> = [
  { key: 'search', label: 'Buscar' },
  { key: 'quote', label: 'Confirmar' },
  { key: 'purchasing', label: 'Compra' },
  { key: 'propagating', label: 'Propagación' },
  { key: 'active', label: 'En vivo' },
];

const CONNECT_STEPS: Array<{ key: WizardStep; label: string }> = [
  { key: 'connect-form', label: 'Conectar' },
  { key: 'dns-instructions', label: 'DNS' },
  { key: 'propagating', label: 'Propagación' },
  { key: 'active', label: 'En vivo' },
];

interface Props {
  currentStep: WizardStep;
  domainSource: DomainSource | null;
}

export function DomainWizardProgress({ currentStep, domainSource }: Props) {
  const STEPS =
    domainSource === 'user_provided' ? CONNECT_STEPS : PURCHASE_STEPS;
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                active && 'bg-primary text-primary-foreground',
                done && 'bg-primary/10 text-primary',
                !active && !done && 'bg-muted text-muted-foreground',
              )}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="h-px w-4 bg-border" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
