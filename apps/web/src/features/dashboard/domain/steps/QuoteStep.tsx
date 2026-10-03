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
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Primer año</dt>
              <dd className="text-2xl font-semibold">
                {formatUSD(quote.priceUsdCents)}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / año
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Renovación anual</dt>
              <dd className="text-2xl font-semibold">
                {formatUSD(quote.renewalPriceUsdCents)}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / año
                </span>
              </dd>
            </div>
          </dl>
          {quote.renewalPriceUsdCents > quote.priceUsdCents && (
            <p className="text-sm text-muted-foreground">
              A partir del segundo año el dominio se renueva a un precio mayor
              que el del primer año.
            </p>
          )}
          {quote.irreversible && (
            <p className="text-sm text-muted-foreground">
              La compra de un dominio es definitiva y no se puede reembolsar.
            </p>
          )}
          {changedPriceUsdCents !== null && (
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <span className="text-destructive">
                El precio cambió: ahora es {formatUSD(changedPriceUsdCents)} /
                año (antes {formatUSD(quote.priceUsdCents)}). Obtén el nuevo
                precio para continuar.
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={requote.isPending}
                onClick={refreshQuote}
              >
                {requote.isPending ? <Spinner /> : <RefreshCwIcon />}
                Obtener nuevo precio
              </Button>
            </div>
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
          Confirmar compra
        </Button>
      </div>
    </div>
  );
}
