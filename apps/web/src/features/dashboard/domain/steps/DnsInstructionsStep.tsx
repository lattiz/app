import { ArrowRightIcon, CopyIcon, TriangleAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDomainWizardStore } from '../store/domain-wizard.store';

function copyValue(value: string) {
  void navigator.clipboard.writeText(value).then(
    () => toast.success('Copiado al portapapeles'),
    () => toast.error('No se pudo copiar'),
  );
}

export function DnsInstructionsStep() {
  const dnsInstructions = useDomainWizardStore((s) => s.dnsInstructions);
  const setStep = useDomainWizardStore((s) => s.setStep);

  if (!dnsInstructions) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold">
          Configura estos registros DNS en tu proveedor
        </h1>
        <p className="text-sm text-muted-foreground">
          Agrégalos en el panel DNS de tu registrador (GoDaddy, Namecheap,
          Cloudflare, Google Domains…).
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto py-4">
          <table className="w-full min-w-105 text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Tipo</th>
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Valor</th>
                <th className="py-2 pr-4 font-medium">TTL</th>
                <th className="py-2 font-medium" aria-label="Copiar" />
              </tr>
            </thead>
            <tbody>
              {dnsInstructions.map((record) => (
                <tr key={record.name} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{record.type}</td>
                  <td className="py-3 pr-4 font-mono">{record.name}</td>
                  <td className="py-3 pr-4 font-mono">{record.value}</td>
                  <td className="py-3 pr-4">{record.ttl}</td>
                  <td className="py-3">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Copiar valor del registro ${record.name}`}
                      onClick={() => copyValue(record.value)}
                    >
                      <CopyIcon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
        <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-yellow-700 dark:text-yellow-400" />
        <div className="space-y-1 text-muted-foreground">
          <p>
            Si tu proveedor no permite CNAME en «@», usa un registro ALIAS o
            ANAME con el mismo valor.
          </p>
          <p>En Cloudflare: desactiva el proxy (nube gris).</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        La propagación puede tardar entre 5 minutos y 2 horas.
      </p>

      <div>
        <Button onClick={() => setStep('propagating')}>
          Ya agregué los registros — Verificar propagación
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
