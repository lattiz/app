import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useDomainConnect } from '../hooks/useDomainConnect';
import { ConnectDomainSchema } from '../schemas/domain.schemas';
import { useDomainWizardStore } from '../store/domain-wizard.store';

export function ConnectFormStep() {
  const setStep = useDomainWizardStore((s) => s.setStep);
  const selectDomain = useDomainWizardStore((s) => s.selectDomain);

  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const connect = useDomainConnect();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ConnectDomainSchema.safeParse({ domain: input.trim() });
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? 'Dominio inválido',
      );
      return;
    }
    setValidationError(null);
    selectDomain(parsed.data.domain);
    connect.mutate({ body: { domain: parsed.data.domain } });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold">
          Ingresa tu dominio
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa solo el dominio, sin https:// ni rutas.
        </p>
      </div>

      <form onSubmit={submit} className="flex max-w-md items-start gap-2">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => {
              if (!input) return;
              const parsed = ConnectDomainSchema.safeParse({
                domain: input.trim(),
              });
              setValidationError(
                parsed.success
                  ? null
                  : (parsed.error.issues[0]?.message ?? 'Dominio inválido'),
              );
            }}
            placeholder="miempresa.com"
            aria-label="Tu dominio"
            aria-invalid={validationError != null}
            disabled={connect.isPending}
          />
          {validationError && (
            <p className="mt-1 text-sm text-destructive">{validationError}</p>
          )}
          {connect.isError && !validationError && (
            <p className="mt-1 text-sm text-destructive">
              No se pudo conectar el dominio. Intenta de nuevo.
            </p>
          )}
        </div>
        <Button type="submit" disabled={connect.isPending}>
          {connect.isPending ? <Spinner /> : null}
          Conectar
          <ArrowRightIcon />
        </Button>
      </form>

      <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
        <InfoIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground">
          No transferimos tu dominio. Solo configuramos el DNS para que apunte a
          tu sitio en Lattiz. Tú sigues siendo el propietario y responsable de
          la renovación anual.
        </p>
      </div>

      <div>
        <Button
          variant="outline"
          onClick={() => setStep('entry')}
          disabled={connect.isPending}
        >
          <ArrowLeftIcon />
          Volver
        </Button>
      </div>
    </div>
  );
}
