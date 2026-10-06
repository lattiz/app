import { ArrowLeftIcon, GlobeIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formatUSD } from '@/lib/format';
import { AgreementCheckbox } from '../components/AgreementCheckbox';
import { useDomainPurchase } from '../hooks/useDomainPurchase';
import { useDomainQuote } from '../hooks/useDomainQuote';
import { useDomainWizardStore } from '../store/domain-wizard.store';

export function QuoteStep() {
  const quote = useDomainWizardStore((s) => s.quote);
  const selectedDomain = useDomainWizardStore((s) => s.selectedDomain);
  const agreementsAccepted = useDomainWizardStore((s) => s.agreementsAccepted);
  const agreedAt = useDomainWizardStore((s) => s.agreedAt);
  const changedPriceUsdCents = useDomainWizardStore((s) => s.changedPriceUsdCents);
  const toggleAgreement = useDomainWizardStore((s) => s.toggleAgreement);
  const backToSearch = useDomainWizardStore((s) => s.backToSearch);

  const requote = useDomainQuote();
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
        priceUsdCents: Math.round(quote.priceUsdCents),
      },
    });
  };

  const refreshQuote = () => {
    requote.mutate({ body: { domain: selectedDomain } });
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
          {quote.renewalPriceUsdCents > quote.priceUsdCents && (
            <p className="text-sm text-muted-foreground">
              A partir del segundo año se cobra una couta de mantenimiento a un precio $599 MXN.
            </p>
          )}
          {quote.irreversible && (
            <p className="text-sm text-muted-foreground">
              La compra de un dominio es definitiva y no se puede reembolsar.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Términos de registro</h2>
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
          disabled={
            !allAccepted || changedPriceUsdCents !== null || purchase.isPending
          }
          onClick={confirm}
        >
          {purchase.isPending && <Spinner />}
          Confirmar dominio
        </Button>
      </div>
    </div>
  );
}
