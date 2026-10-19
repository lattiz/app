import {
  adminTemplatesControllerActivateMutation,
  adminTemplatesControllerGetQueryKey,
  adminTemplatesControllerListQueryKey,
  adminTemplatesControllerRemoveMutation,
  adminTemplatesControllerReplaceThumbnailMutation,
  adminTemplatesControllerRetireMutation,
  type AdminTemplateDetailDto,
} from '@lattiz/api-client';
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ReasonDialog } from '@/components/reason-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AdminRole } from '@/lib/navigation';
import {
  confirmIdMatches,
  isTemplateNotReady,
  templateActionSet,
  templateDeleteBlock,
  templateMutationMessage,
  thumbnailProblem,
} from './actions';
import { TemplateEditor } from './template-editor';

export function TemplateControls({
  detail,
  role,
}: {
  detail: AdminTemplateDetailDto;
  role: AdminRole;
}) {
  const actions = templateActionSet(role, detail.status);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [retireOpen, setRetireOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [thumbOpen, setThumbOpen] = useState(false);
  const [notReady, setNotReady] = useState<string | null>(null);
  const block = templateDeleteBlock(detail.usage);

  const activate = useMutation({
    ...adminTemplatesControllerActivateMutation(),
    onSuccess: (next) => {
      rememberTemplate(queryClient, next);
      setNotReady(null);
      toast.success('La plantilla ya está activa.');
    },
    onError: (error) => {
      const message = templateMutationMessage(error, detail.id);
      if (isTemplateNotReady(error)) setNotReady(message);
      toast.error(message);
    },
  });
  const retire = useMutation({
    ...adminTemplatesControllerRetireMutation(),
    onSuccess: (next) => {
      rememberTemplate(queryClient, next);
      setRetireOpen(false);
      toast.success('La plantilla quedó retirada.');
    },
    onError: (error) => {
      toast.error(templateMutationMessage(error, detail.id));
    },
  });
  const remove = useMutation({
    ...adminTemplatesControllerRemoveMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminTemplatesControllerListQueryKey(),
      });
      toast.success('Plantilla borrada.');
      void navigate({ to: '/plantillas' });
    },
    onError: (error) => {
      toast.error(templateMutationMessage(error, detail.id));
    },
  });

  const busy = activate.isPending || retire.isPending || remove.isPending;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {actions.edit ? (
          <TemplateEditor detail={detail} disabled={busy} />
        ) : null}
        {actions.activate && actions.activateLabel ? (
          <Button
            type="button"
            disabled={busy}
            onClick={() => activate.mutate({ path: { id: detail.id } })}
          >
            {activate.isPending ? 'Activando…' : actions.activateLabel}
          </Button>
        ) : null}
        {actions.retire ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setRetireOpen(true)}
          >
            Retirar
          </Button>
        ) : null}
        {actions.thumbnail ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setThumbOpen(true)}
          >
            Cambiar miniatura
          </Button>
        ) : null}
        {actions.delete ? (
          block ? (
            <Tooltip>
              <TooltipTrigger
                render={<span tabIndex={0} className="inline-flex" />}
              >
                <Button type="button" variant="destructive" disabled>
                  Borrar
                </Button>
              </TooltipTrigger>
              <TooltipContent>{block}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => setDeleteOpen(true)}
            >
              Borrar
            </Button>
          )
        ) : null}
      </div>
      {notReady ? (
        <Alert variant="destructive">
          <AlertTitle>Todavía no se puede activar</AlertTitle>
          <AlertDescription>{notReady}</AlertDescription>
        </Alert>
      ) : null}
      <ReasonDialog
        open={retireOpen}
        title="Retirar plantilla"
        description="Deja de aparecer en la galería para clientes nuevos. Los sitios que ya la usan no cambian."
        confirmLabel="Retirar"
        pendingLabel="Retirando…"
        pending={retire.isPending}
        onOpenChange={setRetireOpen}
        onConfirm={(reason) =>
          retire.mutate({ path: { id: detail.id }, body: { reason } })
        }
      />
      <DeleteDialog
        open={deleteOpen}
        templateId={detail.id}
        pending={remove.isPending}
        onOpenChange={setDeleteOpen}
        onConfirm={() =>
          remove.mutate({
            path: { id: detail.id },
            body: { confirmId: detail.id },
          })
        }
      />
      <ThumbnailDialog
        open={thumbOpen}
        detail={detail}
        onOpenChange={setThumbOpen}
        onSaved={(next) => rememberTemplate(queryClient, next)}
      />
    </div>
  );
}

function rememberTemplate(
  queryClient: QueryClient,
  detail: AdminTemplateDetailDto,
) {
  queryClient.setQueryData(
    adminTemplatesControllerGetQueryKey({ path: { id: detail.id } }),
    detail,
  );
  void queryClient.invalidateQueries({
    queryKey: adminTemplatesControllerListQueryKey(),
  });
}

function DeleteDialog({
  open,
  templateId,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  templateId: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped('');
  }
  const matches = confirmIdMatches(typed, templateId);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Borrar plantilla</AlertDialogTitle>
          <AlertDialogDescription>
            Escribe el id exacto para confirmar. Los archivos en el
            almacenamiento no se borran.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-template-id">Id de la plantilla</Label>
          <p className="font-mono text-sm break-all">{templateId}</p>
          <Input
            id="confirm-template-id"
            value={typed}
            autoComplete="off"
            onChange={(event) => setTyped(event.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending || !matches}
            onClick={onConfirm}
          >
            {pending ? 'Borrando…' : 'Borrar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ThumbnailDialog({
  open,
  detail,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  detail: AdminTemplateDetailDto;
  onOpenChange: (open: boolean) => void;
  onSaved: (detail: AdminTemplateDetailDto) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFile(null);
      setProblem(null);
    }
  }
  const previewUrl = useObjectUrl(file);
  const replace = useMutation({
    ...adminTemplatesControllerReplaceThumbnailMutation(),
    onSuccess: (next) => {
      onSaved(next);
      toast.success('Miniatura actualizada.');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(templateMutationMessage(error, detail.id));
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (replace.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar miniatura</DialogTitle>
          <DialogDescription>
            JPEG, PNG o WebP, de hasta 2 MB.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Label htmlFor="template-thumbnail">Archivo</Label>
          <Input
            id="template-thumbnail"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              if (!next) {
                setFile(null);
                setProblem(null);
                return;
              }
              const rejection = thumbnailProblem(next);
              setProblem(rejection);
              setFile(rejection ? null : next);
            }}
          />
          {problem ? (
            <p className="text-sm text-destructive">{problem}</p>
          ) : null}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Vista previa de la miniatura nueva"
              className="aspect-[16/10] w-full rounded-2xl object-cover"
            />
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={replace.isPending || file == null}
            onClick={() => {
              if (!file) return;
              replace.mutate({ path: { id: detail.id }, body: { file } });
            }}
          >
            {replace.isPending ? 'Subiendo…' : 'Subir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}
