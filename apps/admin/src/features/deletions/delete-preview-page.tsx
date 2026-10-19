import {
  adminTenantDeletionControllerPreviewOptions,
  adminTenantDeletionControllerStartMutation,
  adminTenantsControllerGetOptions,
  type DeletionPreviewDto,
} from '@lattiz/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { textLinkClass } from '@/components/external-anchor';
import { PageCrumb } from '@/components/layout/page-crumb';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { isAdminNotFound, readApiErrorMessage } from '@/lib/admin-errors';
import { formatDate } from '@/lib/format';
import {
  DELETION_REASON_MAX,
  canStartDeletion,
  deletionPreviewCards,
  isTeamDeletionWarning,
} from './model';

const amberAlert =
  'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50';

export function DeletePreviewPage({ tenantId }: { tenantId: string }) {
  const navigate = useNavigate();
  const tenantQuery = useQuery(
    adminTenantsControllerGetOptions({ path: { id: tenantId } }),
  );
  const previewQuery = useQuery(
    adminTenantDeletionControllerPreviewOptions({ path: { id: tenantId } }),
  );
  const start = useMutation({
    ...adminTenantDeletionControllerStartMutation(),
    onSuccess: (accepted) => {
      void navigate({
        to: '/borrados/$jobId',
        params: { jobId: accepted.jobId },
      });
    },
  });

  if (previewQuery.isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <BackLink tenantId={tenantId} />
        {previewQuery.isError && isAdminNotFound(previewQuery.error) ? (
          <PageHeader
            title="Borrar cliente"
            description="No encontramos este cliente."
          />
        ) : (
          <QueryAlert
            error={previewQuery.error}
            pending={previewQuery.isFetching}
            onRetry={() => void previewQuery.refetch()}
          />
        )}
      </div>
    );
  }

  const preview = previewQuery.data;
  const name = tenantQuery.data?.overview.name ?? preview.slug;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageCrumb label={name} />
      <BackLink tenantId={tenantId} />
      <PageHeader
        title={`Borrar a ${name} de todos los proveedores`}
        description="Esta acción no se puede deshacer. Revisa con calma qué se borra y qué se queda."
      />
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        {deletionPreviewCards(preview, formatDate).map((card) => (
          <Card key={card.id} className="min-w-0">
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {preview.warnings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {preview.warnings.map((warning) => (
            <Alert
              key={warning}
              variant={preview.blocking ? 'destructive' : 'default'}
              className={preview.blocking ? undefined : amberAlert}
            >
              <AlertTitle>
                <WarningText warning={warning} />
              </AlertTitle>
            </Alert>
          ))}
        </div>
      ) : null}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Lo que se conserva a propósito</CardTitle>
        </CardHeader>
        <CardContent>
          {preview.whatIsKept.length === 0 ? (
            <p className="text-muted-foreground">
              No hay nada marcado para conservarse.
            </p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {preview.whatIsKept.map((item) => (
                <li key={item} className="break-words">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <ConfirmForm
        preview={preview}
        pending={start.isPending}
        error={start.error}
        onConfirm={(body) =>
          start.mutate({
            path: { id: tenantId },
            body,
          })
        }
      />
    </div>
  );
}

function ConfirmForm({
  preview,
  pending,
  error,
  onConfirm,
}: {
  preview: DeletionPreviewDto;
  pending: boolean;
  error: unknown;
  onConfirm: (body: {
    confirmSlug: string;
    reason: string;
    notifyCustomer: boolean;
  }) => void;
}) {
  const [reason, setReason] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [confirmation, setConfirmation] = useState('');
  const locked = preview.blocking || pending;
  const enabled =
    !pending &&
    canStartDeletion({
      blocking: preview.blocking,
      slug: preview.slug,
      confirmation,
      reason,
    });

  return (
    <form
      className="flex min-w-0 flex-col gap-4"
      onSubmit={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault();
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="deletion-reason">Motivo</Label>
        <Textarea
          id="deletion-reason"
          value={reason}
          maxLength={DELETION_REASON_MAX}
          disabled={locked}
          required
          onChange={(event) => setReason(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {reason.trim().length} / {DELETION_REASON_MAX}. Mínimo 3 caracteres.
        </p>
      </div>
      <label className="flex items-center justify-between gap-3">
        <span>
          <span className="block text-sm font-medium">
            Avisar al cliente por correo
          </span>
          <span className="block text-sm text-muted-foreground">
            Le escribimos que su cuenta fue borrada.
          </span>
        </span>
        <Switch
          checked={notifyCustomer}
          disabled={locked}
          onCheckedChange={setNotifyCustomer}
        />
      </label>
      <div className="flex flex-col gap-2">
        <Label htmlFor="deletion-slug">
          Escribe <strong>{preview.slug}</strong> para confirmar
        </Label>
        <Input
          id="deletion-slug"
          name="deletion-confirm-slug"
          value={confirmation}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={locked}
          onChange={(event) => setConfirmation(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault();
          }}
        />
        {confirmation.length > 0 && confirmation !== preview.slug ? (
          <p className="text-sm text-destructive">
            No coincide con el identificador.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Tiene que ser idéntico, con las mismas mayúsculas.
          </p>
        )}
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{readApiErrorMessage(error)}</AlertTitle>
        </Alert>
      ) : null}
      <div>
        <Button
          type="button"
          variant="destructive"
          disabled={!enabled}
          onClick={() => {
            if (!enabled) return;
            onConfirm({
              confirmSlug: confirmation,
              reason: reason.trim(),
              notifyCustomer,
            });
          }}
        >
          {pending ? 'Borrando…' : 'Borrar definitivamente'}
        </Button>
      </div>
    </form>
  );
}

function WarningText({ warning }: { warning: string }) {
  if (!isTeamDeletionWarning(warning)) return warning;
  return (
    <>
      Es miembro del equipo: revócalo primero en{' '}
      <Link to="/equipo" className={textLinkClass}>
        Equipo
      </Link>
      .
    </>
  );
}

function BackLink({ tenantId }: { tenantId: string }) {
  return (
    <Link
      to="/clientes/$tenantId"
      params={{ tenantId }}
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      Volver al cliente
    </Link>
  );
}
