import { ArrowRightIcon, CheckIcon, LinkIcon, ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDomainWizardStore } from '../store/domain-wizard.store';

export function EntryStep() {
  const setStep = useDomainWizardStore((s) => s.setStep);
  const setDomainSource = useDomainWizardStore((s) => s.setDomainSource);

  const choose = (source: 'godaddy_managed' | 'user_provided') => {
    setDomainSource(source);
    setStep(source === 'godaddy_managed' ? 'search' : 'connect-form');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold">
          Conecta un dominio a tu sitio
        </h1>
        <p className="text-sm text-muted-foreground">
          Compra un dominio nuevo con tu plan o usa uno que ya tengas.
        </p>
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCartIcon className="size-5 text-primary" />
              Comprar dominio
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Buscamos el dominio perfecto para tu negocio. Incluido en tu
              suscripción.
            </p>
            <p className="flex items-center gap-2 text-sm font-medium">
              <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
              Incluido en tu plan
            </p>
            <div className="mt-auto">
              <Button onClick={() => choose('godaddy_managed')}>
                Buscar dominio
                <ArrowRightIcon />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="size-5 text-primary" />
              Conectar mi dominio
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Usa un dominio que ya tienes en GoDaddy, Namecheap u otro
              servicio.
            </p>
            <p className="text-sm text-muted-foreground">
              Tú eres responsable de la renovación anual.
            </p>
            <div className="mt-auto">
              <Button variant="outline" onClick={() => choose('user_provided')}>
                Conectar mi dominio
                <ArrowRightIcon />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
