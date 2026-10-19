import {
  adminDomainControllerActivationCheckMutation,
  adminDomainControllerInspectOptions,
  adminTenantsControllerGetQueryKey,
  type AdminDomainCycleDto,
  type AdminDomainDnsDto,
  type AdminDomainInspectionDto,
  type AdminDomainRegistrarDto,
  type AdminDomainRenewalDto,
  type AdminDomainVercelDto,
} from '@lattiz/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { QueryAlert } from '@/components/query-alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { readApiErrorMessage } from '@/lib/admin-errors';
import { formatDate, formatMoney } from '@/lib/format';
import { absentVercelHosts, dnsIssueText, dnsRowIssues } from './dns-match';
import {
  autoRenewLabel,
  daysRemainingText,
  daysUntil,
  domainExpiryIsUrgent,
  domainSourceLabel,
  payBlockedLabel,
  registrarBadge,
  renewalBadge,
  zoneBadge,
} from './labels';
import { StatusBadgeView } from './status-badge';

export function DomainPanel({
  tenantId,
  domainName,
}: {
  tenantId: string;
  domainName: string | null;
}) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const inspect = adminDomainControllerInspectOptions({ path: { id: tenantId } });
  const query = useQuery({ ...inspect, enabled: domainName != null });
  const activation = useMutation({
    ...adminDomainControllerActivationCheckMutation(),
    onSuccess: async (panel) => {
      queryClient.setQueryData(inspect.queryKey, panel);
      await queryClient.invalidateQueries({
        queryKey: adminTenantsControllerGetQueryKey({ path: { id: tenantId } }),
      });
      toast.success('Cloudflare ya revisó el dominio.');
    },
    onError: (error) => {
      toast.error(readApiErrorMessage(error));
    },
  });

  if (!domainName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin dominio</CardTitle>
          <CardDescription>Este cliente todavía no conecta un dominio.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const panel = await queryClient.fetchQuery(
        adminDomainControllerInspectOptions({
          path: { id: tenantId },
          query: { refresh: '1' },
        }),
      );
      queryClient.setQueryData(inspect.queryKey, panel);
      toast.success('Datos del dominio actualizados.');
    } catch (error) {
      toast.error(readApiErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={refreshing} onClick={() => void refresh()}>
          {refreshing ? 'Actualizando…' : 'Actualizar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={activation.isPending}
          onClick={() => activation.mutate({ path: { id: tenantId } })}
        >
          {activation.isPending ? 'Pidiendo verificación…' : 'Pedir verificación a Cloudflare'}
        </Button>
      </div>
      {query.isPending ? <Skeleton className="h-64" /> : null}
      {query.isError ? (
        <QueryAlert
          error={query.error}
          pending={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data && !query.isError ? <DomainCards panel={query.data} /> : null}
    </div>
  );
}

function DomainCards({ panel }: { panel: AdminDomainInspectionDto }) {
  if (!panel.domain) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin dominio</CardTitle>
          <CardDescription>Este cliente todavía no conecta un dominio.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid min-w-0 gap-4">
      {panel.domain.isMock ? (
        <p className="text-sm text-muted-foreground">Estos datos del dominio son de prueba.</p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{panel.domain.name}</CardTitle>
          <CardDescription>{domainSourceLabel(panel.domain.source)}</CardDescription>
        </CardHeader>
        <CardContent>
          <FactList
            items={[
              {
                label: 'Vence',
                value: panel.domain.expiresAt ? formatDate(panel.domain.expiresAt) : 'Sin fecha',
              },
              {
                label: 'Suspendido',
                value: panel.domain.suspendedAt
                  ? formatDate(panel.domain.suspendedAt)
                  : 'No',
              },
              {
                label: 'Última revisión de activación',
                value: panel.domain.dnsActivationCheckedAt
                  ? formatDate(panel.domain.dnsActivationCheckedAt)
                  : 'Nunca',
              },
            ]}
          />
        </CardContent>
      </Card>
      <RenewalCard renewal={panel.renewal} />
      <RegistrarCard registrar={panel.registrar} />
      <DnsCard dns={panel.dns} domainName={panel.domain.name} />
      <VercelCard vercel={panel.vercel} sslActive={panel.domain.sslActive} />
    </div>
  );
}

function RenewalCard({ renewal }: { renewal: AdminDomainRenewalDto | null }) {
  if (!renewal || renewal.managedBy === 'customer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renovación anual</CardTitle>
          <CardDescription>
            {renewal?.managedBy === 'customer'
              ? 'Este dominio lo renueva el cliente, no Lattiz.'
              : 'No hay datos de renovación.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const days = renewal.daysUntilExpiry ?? daysUntil(renewal.expiresAt);
  const urgent = domainExpiryIsUrgent(days);
  const blocked = payBlockedLabel(renewal.currentCycle?.payBlockedReason);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renovación anual</CardTitle>
        {renewal.firstYearIncluded ? (
          <CardDescription>El primer año ya va incluido.</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className={urgent ? 'text-3xl font-semibold text-destructive' : 'text-3xl font-semibold'}>
            {days == null ? 'Sin fecha de vencimiento' : daysRemainingText(days)}
          </p>
          {renewal.expiresAt ? (
            <p className="text-sm text-muted-foreground">{formatDate(renewal.expiresAt)}</p>
          ) : null}
        </div>
        <FactList
          items={[
            {
              label: 'Apertura del cobro',
              value: renewal.paymentOpensAt
                ? `El cobro abre el ${formatDate(renewal.paymentOpensAt)}`
                : 'Sin fecha',
            },
            {
              label: 'Avisos',
              value:
                renewal.noticeDates && renewal.noticeDates.length > 0
                  ? renewal.noticeDates.map((day) => formatDate(day)).join(', ')
                  : 'Sin avisos programados',
            },
            {
              label: 'Gracia',
              value: renewal.lateDeadlineAt
                ? `Termina el ${formatDate(renewal.lateDeadlineAt)}`
                : 'Sin periodo de gracia',
            },
            {
              label: 'Cuota esperada',
              value:
                renewal.expectedChargeCents == null
                  ? 'Sin cuota'
                  : `${formatMoney(renewal.expectedChargeCents, renewal.currency ?? 'mxn')} con IVA`,
            },
          ]}
        />
        {renewal.currentCycle ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Ciclo actual</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadgeView badge={renewalBadge(renewal.currentCycle.status)} />
              <span>
                {formatMoney(renewal.currentCycle.totalCents, renewal.currentCycle.currency)}
              </span>
            </div>
            {blocked ? <p className="text-sm text-muted-foreground">{blocked}</p> : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay un ciclo de cobro abierto.</p>
        )}
        <CycleHistory cycles={renewal.cycles ?? []} />
      </CardContent>
    </Card>
  );
}

function CycleHistory({ cycles }: { cycles: AdminDomainCycleDto[] }) {
  if (cycles.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay historial de renovación.</p>;
  }
  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm font-medium">Historial</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Abierto</TableHead>
            <TableHead>Pagado</TableHead>
            <TableHead>Renovado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cycles.map((cycle, index) => (
            <TableRow key={`${cycle.status}-${cycle.openedAt ?? index}`}>
              <TableCell>
                <StatusBadgeView badge={renewalBadge(cycle.status)} />
                {cycle.lastError ? (
                  <p className="mt-1 max-w-64 text-xs whitespace-normal text-muted-foreground">
                    {cycle.lastError}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                {cycle.amountCents == null
                  ? '—'
                  : formatMoney(cycle.amountCents, cycle.currency)}
              </TableCell>
              <TableCell>{cycle.openedAt ? formatDate(cycle.openedAt) : '—'}</TableCell>
              <TableCell>{cycle.paidAt ? formatDate(cycle.paidAt) : '—'}</TableCell>
              <TableCell>{cycle.renewedAt ? formatDate(cycle.renewedAt) : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RegistrarCard({ registrar }: { registrar: AdminDomainRegistrarDto | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrador (Openprovider)</CardTitle>
      </CardHeader>
      <CardContent>
        {registrar == null ? (
          <p className="text-muted-foreground">Sin datos del registrador.</p>
        ) : registrar.error ? (
          <p className="text-muted-foreground">No disponible ahora</p>
        ) : (
          <div className="flex flex-col gap-3">
            <StatusBadgeView badge={registrarBadge(registrar.status)} />
            <FactList
              items={[
                {
                  label: 'Fecha de renovación',
                  value: registrar.renewalDate ? formatDate(registrar.renewalDate) : 'Sin fecha',
                },
                {
                  label: 'Se puede renovar',
                  value:
                    registrar.canRenew == null ? 'Sin dato' : registrar.canRenew ? 'Sí' : 'No',
                },
                {
                  label: 'Se puede restaurar hasta',
                  value: registrar.restorableUntil
                    ? formatDate(registrar.restorableUntil)
                    : 'No aplica',
                },
                { label: 'Renovación automática', value: autoRenewLabel(registrar.autoRenew) },
              ]}
            />
            {registrar.expiryMismatch ? (
              <p className="text-sm text-destructive">
                La fecha del registrador no coincide con la nuestra.
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DnsCard({
  dns,
  domainName,
}: {
  dns: AdminDomainDnsDto | null;
  domainName: string;
}) {
  const flagRows = dns?.recordsMatchVercel === false;
  const records = dns?.records ?? [];
  const missing = flagRows ? absentVercelHosts(records, domainName) : [];

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Cloudflare</CardTitle>
        {dns && !dns.error && dns.status ? (
          <CardDescription>
            <StatusBadgeView badge={zoneBadge(dns.status)} />
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {dns == null ? (
          <p className="text-muted-foreground">Sin datos de Cloudflare.</p>
        ) : dns.error ? (
          <p className="text-muted-foreground">No disponible ahora</p>
        ) : (
          <>
            <NameList title="Nameservers" values={dns.nameservers ?? []} />
            <RecordsMatch matches={dns.recordsMatchVercel} />
            {missing.includes('apex') ? (
              <p className="text-sm text-destructive">
                Falta el registro A 76.76.21.21 en el dominio.
              </p>
            ) : null}
            {missing.includes('www') ? (
              <p className="text-sm text-destructive">
                Falta el CNAME cname.vercel-dns.com en www.
              </p>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Proxy</TableHead>
                  {flagRows ? <TableHead>Revisar</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={flagRows ? 5 : 4} className="text-muted-foreground">
                      No hay registros.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => {
                    const issues = flagRows ? dnsRowIssues(record, domainName) : [];
                    return (
                      <TableRow
                        key={`${record.type}-${record.name}-${record.content}`}
                        className={issues.length > 0 ? 'bg-destructive/10' : undefined}
                      >
                        <TableCell>{record.type}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell className="max-w-64 whitespace-normal">{record.content}</TableCell>
                        <TableCell>
                          {record.proxied == null ? '—' : record.proxied ? 'Sí' : 'No'}
                        </TableCell>
                        {flagRows ? (
                          <TableCell className="whitespace-normal text-destructive">
                            {issues.length > 0 ? dnsIssueText(issues) : '—'}
                          </TableCell>
                        ) : null}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RecordsMatch({ matches }: { matches: boolean | undefined }) {
  if (matches == null) return null;
  return (
    <p className="inline-flex items-center gap-2 text-sm">
      {matches ? <Check className="size-4 text-emerald-600" /> : <X className="size-4 text-destructive" />}
      {matches
        ? 'Los registros coinciden con lo que espera el sitio.'
        : 'Los registros no coinciden con lo que espera el sitio.'}
    </p>
  );
}

function VercelCard({
  vercel,
  sslActive,
}: {
  vercel: AdminDomainVercelDto | null;
  sslActive: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vercel</CardTitle>
      </CardHeader>
      <CardContent>
        {vercel == null || vercel.error ? (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">
              {vercel?.error ? 'No disponible ahora' : 'Sin datos de Vercel.'}
            </p>
            <p>Candado (SSL): {sslActive ? 'Activo' : 'Inactivo'}</p>
          </div>
        ) : (
          <FactList
            items={[
              { label: 'En el proyecto', value: yesNo(vercel.inProject) },
              { label: 'Configurado', value: yesNo(vercel.configured) },
              { label: 'Candado (SSL)', value: sslActive ? 'Activo' : 'Inactivo' },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}

function yesNo(value: boolean | undefined): string {
  if (value == null) return 'Sin dato';
  return value ? 'Sí' : 'No';
}

function NameList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      {values.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ninguno.</p>
      ) : (
        <ul className="mt-1 text-sm">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FactList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
