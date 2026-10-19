import {
  adminTenantsControllerGetQueryKey,
  adminTenantsControllerListQueryKey,
  adminTenantsControllerReactivateMutation,
  adminTenantsControllerSuspendMutation,
  adminTenantsControllerUpdateFlagsMutation,
  type AdminTenantDetailDto,
  type AdminTenantFlagsDto,
} from '@lattiz/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChipField } from '@/components/chip-field';
import { ReasonDialog } from '@/components/reason-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { readApiErrorMessage } from '@/lib/admin-errors';
import type { AdminRole } from '@/lib/navigation';
import { addFreeTag, notesError, sameFlags, tenantActionSet } from './actions';

export function TenantHeaderActions({
  tenantId,
  role,
  status,
}: {
  tenantId: string;
  role: AdminRole;
  status: AdminTenantDetailDto['overview']['status'];
}) {
  const actions = tenantActionSet(role, status);
  const queryClient = useQueryClient();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const suspend = useMutation({
    ...adminTenantsControllerSuspendMutation(),
    onSuccess: (detail) => {
      rememberTenant(queryClient, tenantId, detail);
      setSuspendOpen(false);
      toast.success('El sitio quedó suspendido.');
    },
    onError: (error) => toast.error(readApiErrorMessage(error)),
  });
  const reactivate = useMutation({
    ...adminTenantsControllerReactivateMutation(),
    onSuccess: (detail) => {
      rememberTenant(queryClient, tenantId, detail);
      setReactivateOpen(false);
      toast.success('El sitio volvió a mostrarse.');
    },
    onError: (error) => toast.error(readApiErrorMessage(error)),
  });

  if (!actions.suspend && !actions.reactivate) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.suspend ? (
          <Button
            type="button"
            variant="destructive"
            disabled={suspend.isPending}
            onClick={() => setSuspendOpen(true)}
          >
            Suspender
          </Button>
        ) : null}
        {actions.reactivate ? (
          <Button
            type="button"
            disabled={reactivate.isPending}
            onClick={() => setReactivateOpen(true)}
          >
            Reactivar
          </Button>
        ) : null}
      </div>
      <ReasonDialog
        open={suspendOpen}
        title="Suspender sitio"
        description="El sitio público deja de mostrarse de inmediato. No cambia su cobro ni su dominio."
        confirmLabel="Suspender"
        pendingLabel="Suspendiendo…"
        pending={suspend.isPending}
        destructive
        onOpenChange={setSuspendOpen}
        onConfirm={(reason) =>
          suspend.mutate({ path: { id: tenantId }, body: { reason } })
        }
      />
      <AlertDialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivar sitio</AlertDialogTitle>
            <AlertDialogDescription>
              El sitio público vuelve a mostrarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reactivate.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={reactivate.isPending}
              onClick={() => reactivate.mutate({ path: { id: tenantId } })}
            >
              {reactivate.isPending ? 'Reactivando…' : 'Reactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function NotesPanel({
  tenantId,
  flags,
}: {
  tenantId: string;
  flags: AdminTenantFlagsDto;
}) {
  const queryClient = useQueryClient();
  const snapshot = flagSnapshot(flags);
  const [source, setSource] = useState(snapshot);
  const [internal, setInternal] = useState(flags.isInternal);
  const [tags, setTags] = useState(flags.tags);
  const [notes, setNotes] = useState(flags.notes ?? '');
  if (source !== snapshot) {
    setSource(snapshot);
    setInternal(flags.isInternal);
    setTags(flags.tags);
    setNotes(flags.notes ?? '');
  }

  const save = useMutation({
    ...adminTenantsControllerUpdateFlagsMutation(),
    onSuccess: (detail) => {
      rememberTenant(queryClient, tenantId, detail);
      toast.success('Notas guardadas.');
    },
    onError: (error) => toast.error(readApiErrorMessage(error)),
  });

  const draft = { isInternal: internal, tags, notes };
  const unchanged = sameFlags(flags, draft);
  const problem = notesError(notes);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Notas internas</CardTitle>
        <CardDescription>Solo las ve el equipo de Lattiz.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-medium">Cuenta interna</span>
            <span className="block text-sm text-muted-foreground">
              Las cuentas internas no cuentan en las métricas.
            </span>
          </span>
          <Switch checked={internal} onCheckedChange={setInternal} />
        </label>
        <ChipField
          id="tenant-tags"
          label="Etiquetas"
          tags={tags}
          placeholder="vip"
          addTag={addFreeTag}
          onTagsChange={setTags}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="tenant-notes">Notas</Label>
          <Textarea
            id="tenant-notes"
            value={notes}
            maxLength={2000}
            onChange={(event) => setNotes(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {notes.trim().length} / 2000
          </p>
          {problem ? (
            <p className="text-sm text-destructive">{problem}</p>
          ) : null}
        </div>
        <Button
          type="button"
          className="self-start"
          disabled={save.isPending || unchanged || problem != null}
          onClick={() =>
            save.mutate({
              path: { id: tenantId },
              body: {
                isInternal: internal,
                tags,
                notes: notes.trim().length > 0 ? notes.trim() : null,
              },
            })
          }
        >
          {save.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </CardContent>
    </Card>
  );
}

function rememberTenant(
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: string,
  detail: AdminTenantDetailDto,
) {
  queryClient.setQueryData(
    adminTenantsControllerGetQueryKey({ path: { id: tenantId } }),
    detail,
  );
  void queryClient.invalidateQueries({
    queryKey: adminTenantsControllerListQueryKey(),
  });
}

function flagSnapshot(flags: AdminTenantFlagsDto): string {
  return `${flags.isInternal}|${flags.tags.join('\n')}|${flags.notes ?? ''}`;
}
