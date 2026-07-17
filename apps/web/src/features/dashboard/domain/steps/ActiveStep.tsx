import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { Link } from '@tanstack/react-router';
import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  PencilIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDomainStatus } from '../hooks/useDomainStatus';

function StatusItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
      <CheckCircle2Icon
        className={
          ok
            ? 'size-4 text-green-600 dark:text-green-400'
            : 'size-4 text-muted-foreground/50'
        }
      />
      <span className={ok ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

export function ActiveStep() {
  const { data: domain } = useDomainStatus();
  const { data: tenantMe } = useQuery(tenantsControllerMeOptions());

  if (!domain) return null;
  const url = `https://${domain.domain}`;

  return (
    <Card className="max-w-2xl border-green-500/30 bg-green-500/5">
      <CardContent className="flex flex-col gap-6 py-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="size-6 text-green-600 dark:text-green-400" />
            <h1 className="font-heading text-xl font-semibold">
              Tu sitio está en vivo
            </h1>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-lg font-medium text-primary underline-offset-4 hover:underline"
          >
            {url}
            <ExternalLinkIcon className="size-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatusItem label="DNS" ok={domain.dnsStatus === 'active'} />
          <StatusItem label="SSL" ok={domain.sslActive} />
          <StatusItem label="Vercel" ok={domain.vercelMapped} />
        </div>

        <div className="flex flex-wrap gap-3">
          {tenantMe?.tenantId && (
            <Button
              nativeButton={false}
              render={
                <Link
                  to="/editor/$tenantId"
                  params={{ tenantId: tenantMe.tenantId }}
                />
              }
            >
              <PencilIcon />
              Ir al editor
            </Button>
          )}
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={url} target="_blank" rel="noreferrer" />}
          >
            Ver sitio
            <ExternalLinkIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
