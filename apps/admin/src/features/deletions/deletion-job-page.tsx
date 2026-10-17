import {
  adminDeletionsControllerGetOptions,
  adminDeletionsControllerGetQueryKey,
  adminDeletionsControllerRetryMutation,
  type DeletionJobDto,
} from '@lattiz/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  Circle,
  CircleCheck,
  CircleMinus,
  CircleX,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import { FactList } from '@/components/fact-list';
import { PageCrumb } from '@/components/layout/page-crumb';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { isAdminNotFound, readApiErrorMessage } from '@/lib/admin-errors';
import { finishSentence, formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  deletionRefetchInterval,
  describeSteps,
  manualActions,
  manualActionsCopyText,
  type ManualAction,
  type StepView,
} from './model';

const amberAlert =
  'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50';
const greenAlert =
  'border-emerald-600/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50';

const STEP_ICONS = {
  circle: Circle,
  check: CircleCheck,
  minus: CircleMinus,
  alert: TriangleAlert,
  x: CircleX,
} as const;

const ICON_CLASS: Record<StepView['icon'], string> = {
  circle: 'text-muted-foreground',
  spinner: '',
  check: 'text-emerald-700 dark:text-emerald-300',
  minus: 'text-muted-foreground',
  alert: 'text-amber-700 dark:text-amber-300',
  x: 'text-destructive',
};

export function DeletionJobPage({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...adminDeletionsControllerGetOptions({ path: { jobId } }),
    refetchInterval: (current) =>
      deletionRefetchInterval(current.state.data?.status),
  });
  const retry = useMutation({
    ...adminDeletionsControllerRetryMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminDeletionsControllerGetQueryKey({ path: { jobId } }),
      });
    },
  });

  if (query.isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!query.data) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <BackLink />
        {query.isError && isAdminNotFound(query.error) ? (
          <PageHeader
            title="Borrado"
            description="No encontramos este trabajo."
          />
        ) : (
          <QueryAlert
            error={query.error}
            pending={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        )}
      </div>
    );
  }

  const job = query.data;
  const actor = job.actorEmail ?? job.actorUserId;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageCrumb label={job.slug} />
      <BackLink />
      <PageHeader
        title={`Borrado de ${job.slug}`}
        description={finishSentence(
          `Lo pidió ${actor} el ${formatDateTime(job.createdAt)}`,
        )}
      />
      {query.isError ? (
        <QueryAlert
          error={query.error}
          pending={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      <Outcome
        job={job}
        retryPending={retry.isPending}
        retryError={retry.error}
        onRetry={() => retry.mutate({ path: { jobId } })}
      />
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-4">
            {describeSteps(job.steps).map((step, index) => (
              <StepRow key={step.key} index={index + 1} step={step} />
            ))}
          </ol>
        </CardContent>
      </Card>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Datos guardados antes de borrar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FactList items={snapshotFacts(job)} />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Motivo</p>
            <p className="mt-0.5 break-words">{job.reason}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Outcome({
  job,
  retryPending,
  retryError,
  onRetry,
}: {
  job: DeletionJobDto;
  retryPending: boolean;
  retryError: unknown;
  onRetry: () => void;
}) {
  if (job.status === 'completed') {
    return (
      <Alert className={greenAlert}>
        <AlertTitle>Cliente borrado de todos los proveedores</AlertTitle>
      </Alert>
    );
  }

  if (job.status === 'completed_manual') {
    return (
      <Alert className={amberAlert}>
        <AlertTitle>Quedan acciones manuales</AlertTitle>
        <AlertDescription>
          Lo automático ya terminó. Marca cada pendiente cuando lo resuelvas, o
          copia la lista.
        </AlertDescription>
        <ManualChecklist actions={manualActions(job.steps)} />
      </Alert>
    );
  }

  if (job.status === 'failed') {
    return (
      <Alert variant="destructive">
        <AlertTitle>El borrado se detuvo</AlertTitle>
        <AlertDescription>
          Retoma desde el paso que falló; no repite lo ya hecho.
        </AlertDescription>
        <div className="mt-3 flex flex-col items-start gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={retryPending}
            onClick={onRetry}
          >
            {retryPending ? 'Reintentando…' : 'Reintentar'}
          </Button>
          {retryError ? (
            <p className="text-sm">{readApiErrorMessage(retryError)}</p>
          ) : null}
        </div>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertTitle>Estamos borrando</AlertTitle>
      <AlertDescription>Esta página se actualiza sola.</AlertDescription>
    </Alert>
  );
}

function ManualChecklist({ actions }: { actions: ManualAction[] }) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set());
  const [copyNote, setCopyNote] = useState<string | null>(null);

  if (actions.length === 0) {
    return (
      <p className="mt-3 text-sm">
        No llegó el detalle de qué revisar. Mira los pasos de abajo.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {actions.map((action) => {
          const id = `manual-${action.key}`;
          return (
            <li key={action.key} className="flex items-start gap-2">
              <Checkbox
                id={id}
                className="mt-0.5"
                checked={checked.has(action.key)}
                onCheckedChange={(value) => {
                  setChecked((current) => {
                    const next = new Set(current);
                    if (value === true) next.add(action.key);
                    else next.delete(action.key);
                    return next;
                  });
                }}
              />
              <label htmlFor={id} className="min-w-0 break-words">
                <span className="font-medium">{action.label}. </span>
                {action.detail}
              </label>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const text = manualActionsCopyText(actions, checked);
            void navigator.clipboard.writeText(text).then(
              () => setCopyNote('Lista copiada.'),
              () =>
                setCopyNote(
                  'No se pudo copiar. Selecciona la lista y cópiala a mano.',
                ),
            );
          }}
        >
          Copiar lista
        </Button>
        {copyNote ? <p className="text-sm">{copyNote}</p> : null}
      </div>
    </div>
  );
}

function StepRow({ index, step }: { index: number; step: StepView }) {
  return (
    <li className="flex min-w-0 gap-3">
      <StepMarker icon={step.icon} />
      <div className="min-w-0">
        <p className="font-medium">
          {index}. {step.label}
        </p>
        <p className="text-sm text-muted-foreground">
          {step.statusLabel}
          {step.at ? ` · ${formatDateTime(step.at)}` : ''}
        </p>
        {step.note ? (
          <p className={cn('break-words', noteClass(step.status))}>
            {step.note}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function StepMarker({ icon }: { icon: StepView['icon'] }) {
  if (icon === 'spinner') {
    return <Spinner className="mt-0.5 size-4 shrink-0" aria-label="En curso" />;
  }
  const Icon = STEP_ICONS[icon];
  return (
    <Icon
      className={cn('mt-0.5 size-4 shrink-0', ICON_CLASS[icon])}
      aria-hidden
    />
  );
}

function noteClass(status: StepView['status']): string {
  if (status === 'failed') return 'text-sm text-destructive';
  if (status === 'manual') return 'text-sm text-amber-800 dark:text-amber-200';
  return 'text-sm text-muted-foreground';
}

function snapshotFacts(
  job: DeletionJobDto,
): { label: string; value: string }[] {
  const domain = job.snapshot.domain;
  return [
    { label: 'Dominio', value: domain?.name ?? 'Sin dominio' },
    {
      label: 'Vence en el registrador',
      value: domain?.expiresAt
        ? formatDate(domain.expiresAt)
        : 'Sin fecha de vencimiento',
    },
    {
      label: 'Cliente de Stripe',
      value: job.snapshot.stripeCustomerId ?? 'Sin cliente de Stripe',
    },
    {
      label: 'Propiedad de Google Analytics',
      value: ga4Label(job),
    },
  ];
}

function ga4Label(job: DeletionJobDto): string {
  if (job.snapshot.ga4PropertyId) return job.snapshot.ga4PropertyId;
  if (job.snapshot.analyticsIsMock) return 'Propiedad de prueba';
  return 'Sin propiedad';
}

function BackLink() {
  return (
    <Link
      to="/borrados"
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      Borrados
    </Link>
  );
}
