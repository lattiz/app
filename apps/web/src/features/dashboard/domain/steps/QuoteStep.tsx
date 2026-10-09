import { ArrowLeftIcon, CheckCircle2Icon, GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formatMoney } from '@/lib/format';
import { AgreementCheckbox } from '../components/AgreementCheckbox';
import { renewalPriceLabel } from '../lib/domain-copy';
import { useDomainPurchase } from '../hooks/useDomainPurchase';
import { useDomainWizardStore } from '../store/domain-wizard.store';

export function QuoteStep() {
  const quote = useDomainWizardStore((s) => s.quote);
  const selectedDomain = useDomainWizardStore((s) => s.selectedDomain);
  const agreementsAccepted = useDomainWizardStore((s) => s.agreementsAccepted);
  const agreedAt = useDomainWizardStore((s) => s.agreedAt);
  const toggleAgreement = useDomainWizardStore((s) => s.toggleAgreement);
  const backToSearch = useDomainWizardStore((s) => s.backToSearch);

  const purchase = useDomainPurchase();

  if (!quote || !selectedDomain) return null;

  const allAccepted =
    quote.requiredAgreements.length > 0 &&
    quote.requiredAgreements.every((a) =>
      agreementsAccepted.includes(a.agreementType),
    );

  const confirm = () => {
    if (!agreedAt) return;
    purchase.mutate({
      body: {
        domain: selectedDomain,
        agreementTypes: agreementsAccepted,
        agreedAt,
      },
    });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GlobeIcon className="size-5 text-primary" />
            {selectedDomain}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2Icon className="size-4" />
            Disponible e incluido en tu plan
          </p>
          {quote.renewalPriceUsdCents !== null && (
            <p className="text-sm text-muted-foreground">
              {renewalPriceLabel(quote.renewalPriceUsdCents)}, incluida en tu
              plan mientras tu suscripción esté activa.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            A partir del segundo año se cobra una cuota anual de mantenimiento de{' '}
            {formatMoney(
              quote.maintenanceFee.amountCents,
              quote.maintenanceFee.currency,
            )}{' '}
            {quote.maintenanceFee.currency.toUpperCase()}.
          </p>
          <p className="text-sm text-muted-foreground">
            Una vez confirmado, el dominio no se puede cancelar, modificar ni
            reembolsar.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Antes de confirmar</h2>
        {quote.requiredAgreements.map((agreement) => (
          <AgreementCheckbox
            key={agreement.agreementType}
            agreement={agreement}
            checked={agreementsAccepted.includes(agreement.agreementType)}
            onToggle={toggleAgreement}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={backToSearch} disabled={purchase.isPending}>
          <ArrowLeftIcon />
          Volver a buscar
        </Button>
        <Button
          disabled={!allAccepted || purchase.isPending}
          onClick={confirm}
        >
          {purchase.isPending && <Spinner />}
          Confirmar dominio
        </Button>
      </div>
    </div>
  );
}
