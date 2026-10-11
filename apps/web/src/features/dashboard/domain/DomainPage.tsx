import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  domainsControllerGetDomainQueryKey,
  domainsControllerGetRenewalQueryKey,
  tenantsControllerMeOptions,
  tenantsControllerMeQueryKey,
} from '@lattiz/api-client';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { UpgradeGate } from '@/components/dashboard/home/UpgradeGate';
import { DomainRenewalNotice } from './components/DomainRenewalNotice';
import { DomainWizardProgress } from './components/DomainWizardProgress';
import { ActiveStep } from './steps/ActiveStep';
import { ConnectFormStep } from './steps/ConnectFormStep';
import { DnsInstructionsStep } from './steps/DnsInstructionsStep';
import { EntryStep } from './steps/EntryStep';
import { PropagatingStep } from './steps/PropagatingStep';
import { PurchasingStep } from './steps/PurchasingStep';
import { QuoteStep } from './steps/QuoteStep';
import { SearchStep } from './steps/SearchStep';
import { SuspendedStep } from './steps/SuspendedStep';
import {
  useDomainWizardStore,
  type WizardStep,
} from './store/domain-wizard.store';

const STEP_VIEWS: Record<WizardStep, React.ReactNode> = {
  entry: <EntryStep />,
  search: <SearchStep />,
  quote: <QuoteStep />,
  purchasing: <PurchasingStep />,
  'connect-form': <ConnectFormStep />,
  'dns-instructions': <DnsInstructionsStep />,
  propagating: <PropagatingStep />,
  active: <ActiveStep />,
  suspended: <SuspendedStep />,
};

const routeApi = getRouteApi('/_authenticated/dashboard/domain');

export function DomainPage() {
  const step = useDomainWizardStore((s) => s.step);
  const domainSource = useDomainWizardStore((s) => s.domainSource);
  const { data: tenantMe, isLoading } = useQuery(tenantsControllerMeOptions());
  const search = routeApi.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handledReturn = useRef(false);

  useEffect(() => {
    if (handledReturn.current) return;
    if (search.renewal !== 'success' && search.renewal !== 'canceled') return;
    handledReturn.current = true;

    if (search.renewal === 'success') {
      toast.success('Recibimos tu pago. Estamos renovando tu dominio.');
      void queryClient.invalidateQueries({
        queryKey: domainsControllerGetRenewalQueryKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: domainsControllerGetDomainQueryKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
    }

    void navigate({
      to: '/dashboard/domain',
      search: {},
      replace: true,
    });
  }, [search.renewal, navigate, queryClient]);

  const domainStatus = tenantMe?.domainStatus ?? null;

  // A tenant with a provisioned domain skips the wizard. Rows from an
  // in-flight purchase/connect (not yet Vercel-mapped) don't redirect — the
  // wizard steps own those transitions.
  useEffect(() => {
    if (!domainStatus) return;
    const store = useDomainWizardStore.getState();
    // Suspension overrides dnsStatus: DNS still resolves, but Vercel has no mapping.
    if (domainStatus.suspended) {
      store.setDomainSource(domainStatus.source);
      store.setStep('suspended');
      return;
    }
    if (store.step !== 'entry') return;
    store.setDomainSource(domainStatus.source);
    if (domainStatus.dnsStatus === 'active') {
      store.setStep('active');
    } else if (domainStatus.vercelMapped) {
      store.setStep('propagating');
    }
  }, [domainStatus]);

  if (isLoading) return <DashboardSkeleton />;
  if (tenantMe && !tenantMe.isEntitled) {
    return (
      <div className="flex flex-col gap-6">
        <DomainRenewalNotice />
        <UpgradeGate reason="domain" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DomainRenewalNotice />
      {step !== 'entry' && step !== 'suspended' && (
        <DomainWizardProgress currentStep={step} domainSource={domainSource} />
      )}
      {STEP_VIEWS[step]}
    </div>
  );
}
