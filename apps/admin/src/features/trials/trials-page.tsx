import {
  adminTrialsControllerListOptions,
  adminTrialsControllerSummaryOptions,
  type AdminTrialListItemDto,
  type AdminTrialSummaryDto,
} from '@lattiz/api-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { textLinkClass } from '@/components/external-anchor';
import { HelpTip } from '@/components/help-tip';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCount, formatDate, formatPercent } from '@/lib/format';
import {
  isTrialState,
  medianHoursText,
  TRIAL_STATES,
  trialDurationText,
  type TrialListSearch,
  type TrialState,
  toTrialListQuery,
} from './labels';

const TAB_LABEL: Record<TrialState, string> = {
  active: 'Activas',
  expiring: 'Por vencer',
  expired: 'Vencidas',
  converted: 'Convertidas',
};

export function TrialsPage({ search }: { search: TrialListSearch }) {
  const navigate = useNavigate({ from: '/pruebas' });
  const state = search.state ?? 'active';
  const summary = useQuery(adminTrialsControllerSummaryOptions());
  const list = useQuery({
    ...adminTrialsControllerListOptions({ query: toTrialListQuery(search) }),
    placeholderData: keepPreviousData,
  });

  function updateSearch(patch: Partial<TrialListSearch>, resetPage = true) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: resetPage ? undefined : patch.page,
      }),
    });
  }

  const page = list.data?.page ?? search.page ?? 1;
  const pageSize = list.data?.pageSize ?? 25;
  const total = list.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const hoursNote = summary.data ? medianHoursText(summary.data.medianHoursToConvert) : null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader
        title="Pruebas gratuitas"
        description="Quién está probando Lattiz y quién ya empezó a pagar."
      />

      {summary.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : null}
      {summary.isError ? (
        <QueryAlert
          error={summary.error}
          pending={summary.isFetching}
          onRetry={() => void summary.refetch()}
        />
      ) : null}
      {summary.data ? (
        <>
          {summary.data.enabled ? null : (
            <Alert>
              <AlertTitle>La prueba gratuita está apagada</AlertTitle>
              <AlertDescription>
                Los sitios nuevos no entran en prueba. Los números de abajo son de quienes ya la
                tenían.
              </AlertDescription>
            </Alert>
          )}
          <SummaryCards summary={summary.data} />
          <p className="text-sm text-muted-foreground">
            {trialDurationText(summary.data.trialDays)}
            {hoursNote ? ` ${hoursNote}` : ''}
          </p>
        </>
      ) : null}

      <Tabs
        value={state}
        onValueChange={(value) => {
          if (!isTrialState(value)) return;
          updateSearch({ state: value === 'active' ? undefined : value });
        }}
      >
        <div className="max-w-full overflow-x-auto">
          <TabsList className="w-max">
            {TRIAL_STATES.map((item) => (
              <TabsTrigger key={item} value={item}>
                {TAB_LABEL[item]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {list.isPending ? <Skeleton className="h-80" /> : null}
      {list.isError ? (
        <QueryAlert
          error={list.error}
          pending={list.isFetching}
          onRetry={() => void list.refetch()}
        />
      ) : null}
      {list.data && !list.isError ? (
        <Card className="min-w-0">
          {list.data.items.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              No hay pruebas en este estado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plantilla</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Vence o venció</TableHead>
                  <TableHead>Convertida</TableHead>
                  <TableHead>Horas hasta pagar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data.items.map((item) => (
                  <TableRow key={item.tenant.id}>
                    <TableCell className="whitespace-normal">
                      <Link
                        to="/clientes/$tenantId"
                        params={{ tenantId: item.tenant.id }}
                        className={textLinkClass}
                      >
                        {item.tenant.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {item.tenant.email ?? 'Sin correo'}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <TemplateCell item={item} />
                    </TableCell>
                    <TableCell>{formatDate(item.previewStartedAt)}</TableCell>
                    <TableCell>{expiryText(item)}</TableCell>
                    <TableCell>
                      {item.convertedAt ? formatDate(item.convertedAt) : 'No'}
                    </TableCell>
                    <TableCell>
                      {item.hoursToConvert == null
                        ? '—'
                        : formatCount(Math.round(item.hoursToConvert))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm text-muted-foreground">{rangeLabel(page, pageSize, total)}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateSearch({ page: page - 1 }, false)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => updateSearch({ page: page + 1 }, false)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function SummaryCards({ summary }: { summary: AdminTrialSummaryDto }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Metric title="Activas" value={formatCount(summary.active)} />
      <Metric
        title="Por vencer (48 h)"
        help="Les quedan menos de 48 horas de prueba."
        value={formatCount(summary.expiring)}
      />
      <Metric
        title="Vencidas sin pagar"
        help="Se les acabó la prueba y todavía no contratan un plan."
        value={formatCount(summary.expired)}
      />
      <Metric
        title="Convertidas"
        help="Empezaron la prueba y después pagaron, sin importar cuándo."
        value={formatCount(summary.converted)}
      />
      <Metric
        title="Conversión a 30 días"
        help="De quienes empezaron la prueba en los últimos 30 días, el porcentaje que ya paga."
        value={rateText(summary.conversionRate30d)}
      />
      <Metric
        title="Conversión a 90 días"
        help="De quienes empezaron la prueba en los últimos 90 días, el porcentaje que ya paga."
        value={rateText(summary.conversionRate90d)}
      />
    </div>
  );
}

function Metric({
  title,
  value,
  help,
}: {
  title: string;
  value: string;
  help?: string;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          {title}
          {help ? <HelpTip text={help} /> : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TemplateCell({ item }: { item: AdminTrialListItemDto }) {
  if (!item.template) return <span className="text-muted-foreground">Sin plantilla</span>;
  return (
    <Link to="/plantillas/$id" params={{ id: item.template.id }} className={textLinkClass}>
      {item.template.name ?? item.template.id}
    </Link>
  );
}

function expiryText(item: AdminTrialListItemDto): string {
  if (!item.previewExpiresAt) return 'Sin fecha';
  const date = formatDate(item.previewExpiresAt);
  if (item.state === 'expired') return `Venció ${date}`;
  return `Vence ${date}`;
}

function rateText(rate: number | null): string {
  if (rate == null) return 'Sin datos';
  return formatPercent(rate);
}

function rangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return '0 pruebas';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${formatCount(start)}–${formatCount(end)} de ${formatCount(total)}`;
}
