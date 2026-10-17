import {
  adminSettingsControllerListOptions,
  adminSettingsControllerListQueryKey,
  adminSettingsControllerRemoveMutation,
  adminSettingsControllerUpdateMutation,
} from '@lattiz/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { ReasonDialog } from '@/components/reason-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { readApiErrorMessage } from '@/lib/admin-errors';
import { groupSettings } from './labels';
import { asSettingValue, SettingField } from './setting-field';

type PendingChange =
  | { kind: 'update'; key: string; value: unknown }
  | { kind: 'remove'; key: string };

export function SettingsPage({ canEdit }: { canEdit: boolean }) {
  const queryClient = useQueryClient();
  const query = useQuery(adminSettingsControllerListOptions());
  const [pending, setPending] = useState<PendingChange | null>(null);

  const update = useMutation({
    ...adminSettingsControllerUpdateMutation(),
    onSuccess: async () => {
      setPending(null);
      toast.success('El ajuste quedó guardado.');
      await queryClient.invalidateQueries({
        queryKey: adminSettingsControllerListQueryKey(),
      });
    },
    onError: (error) => toast.error(readApiErrorMessage(error)),
  });
  const remove = useMutation({
    ...adminSettingsControllerRemoveMutation(),
    onSuccess: async () => {
      setPending(null);
      toast.success('El ajuste volvió al valor por defecto.');
      await queryClient.invalidateQueries({
        queryKey: adminSettingsControllerListQueryKey(),
      });
    },
    onError: (error) => toast.error(readApiErrorMessage(error)),
  });

  const busy = update.isPending || remove.isPending;
  const groups = query.data ? groupSettings(query.data.items) : [];

  function confirm(reason: string) {
    if (!pending) return;
    if (pending.kind === 'update') {
      update.mutate({
        path: { key: pending.key },
        body: { value: asSettingValue(pending.value), reason },
      });
      return;
    }
    remove.mutate({ path: { key: pending.key }, body: { reason } });
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader
        title="Configuración"
        description="Ajustes del producto. Cada cambio queda registrado con su motivo."
      />
      {canEdit ? null : (
        <Alert>
          <AlertTitle>Solo el propietario puede cambiar la configuración</AlertTitle>
        </Alert>
      )}

      {query.isPending ? <Skeleton className="h-80" /> : null}
      {query.isError ? (
        <QueryAlert
          error={query.error}
          pending={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data && !query.isError && groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay ajustes que mostrar.</p>
      ) : null}

      {query.data && !query.isError
        ? groups.map((group) => (
            <div key={group.group} className="flex min-w-0 flex-col gap-3">
              {group.group === 'preview' ? <TrialNotice /> : null}
              <Card className="min-w-0">
                <CardHeader>
                  <CardTitle>{group.label}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  {group.items.map((item) => (
                    <SettingField
                      key={item.key}
                      item={item}
                      canEdit={canEdit}
                      pending={busy && pending?.key === item.key}
                      onSave={(value) => setPending({ kind: 'update', key: item.key, value })}
                      onReset={() => setPending({ kind: 'remove', key: item.key })}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))
        : null}

      <ReasonDialog
        open={pending != null}
        title={pending?.kind === 'remove' ? 'Volver al valor por defecto' : 'Guardar ajuste'}
        description={
          pending?.kind === 'remove'
            ? 'Se deja de usar el valor guardado aquí. Queda anotado en el historial.'
            : 'Escribe por qué cambias este valor. Queda anotado en el historial.'
        }
        confirmLabel={pending?.kind === 'remove' ? 'Volver al valor por defecto' : 'Guardar'}
        pendingLabel="Guardando…"
        pending={busy}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        onConfirm={confirm}
      />
    </div>
  );
}

function TrialNotice() {
  return (
    <Alert>
      <AlertDescription>
        Cambiar los días de prueba mueve el vencimiento de <strong>todas</strong> las
        pruebas en curso, porque se cuenta desde la primera publicación.
      </AlertDescription>
    </Alert>
  );
}
