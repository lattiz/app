import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DomainWizardProgress } from './components/DomainWizardProgress';
import { ActiveStep } from './steps/ActiveStep';
import { PropagatingStep } from './steps/PropagatingStep';
import { PurchasingStep } from './steps/PurchasingStep';
import { QuoteStep } from './steps/QuoteStep';
import { SearchStep } from './steps/SearchStep';
import { useDomainWizardStore, type WizardStep } from './store/domain-wizard.store';

const STEP_VIEWS: Record<WizardStep, React.ReactNode> = {
  search: <SearchStep />,
  quote: <QuoteStep />,
  purchasing: <PurchasingStep />,
  propagating: <PropagatingStep />,
  active: <ActiveStep />,
};

export function DomainPage() {
  const step = useDomainWizardStore((s) => s.step);
  const { data: tenantMe, isLoading } = useQuery(tenantsControllerMeOptions());

  const domainStatus = tenantMe?.domainStatus ?? null;

  // A tenant with a provisioned domain skips the wizard. Rows from an
  // in-flight purchase (not yet Vercel-mapped) don't redirect — the job
  // polling in PurchasingStep owns those transitions.
  useEffect(() => {
    if (!domainStatus) return;
    const current = useDomainWizardStore.getState().step;
    if (current !== 'search') return;
    if (domainStatus.dnsStatus === 'active') {
      useDomainWizardStore.getState().setStep('active');
    } else if (domainStatus.vercelMapped) {
      useDomainWizardStore.getState().setStep('propagating');
    }
  }, [domainStatus]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <DomainWizardProgress currentStep={step} />
      {STEP_VIEWS[step]}
    </div>
  );
}
