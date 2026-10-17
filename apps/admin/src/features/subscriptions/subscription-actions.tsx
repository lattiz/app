import {
  adminSubscriptionsControllerCancelMutation,
  adminSubscriptionsControllerGetQueryKey,
  adminSubscriptionsControllerListQueryKey,
  adminSubscriptionsControllerResumeMutation,
  type AdminSubscriptionDetailDto,
  type AdminSubscriptionListItemDto,
} from '@lattiz/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ExternalAnchor } from '@/components/external-anchor';
import { actionReasonError } from '@/lib/action-reason';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import type { AdminRole } from '@/lib/navigation';
import {
  immediateCancelConfirmed,
  subscriptionActionSet,
  subscriptionErrorKind,
  subscriptionErrorText,
  type SubscriptionErrorKind,
} from './actions';

const REFRESH_DELAY_MS = 3000;

export function SubscriptionActions({
  id,
  role,
  local,
}: {
  id: string;
  role: AdminRole;
  local: AdminSubscriptionListItemDto;
}) {
  const actions = subscriptionActionSet(role, local);
  const queryClient = useQueryClient();
  const refreshTimer = useRef<number | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [notice, setNotice] = useState<SubscriptionErrorKind | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimer.current != null)
        window.clearTimeout(refreshTimer.current);
    };
  }, []);

  function afterSuccess(detail: AdminSubscriptionDetailDto, message: string) {
    setNotice(null);
    queryClient.setQueryData(
      adminSubscriptionsControllerGetQueryKey({ path: { id } }),
      detail,
    );
    void queryClient.invalidateQueries({
      queryKey: adminSubscriptionsControllerGetQueryKey({ path: { id } }),
    });
    void queryClient.invalidateQueries({
      queryKey: adminSubscriptionsControllerListQueryKey(),
    });
    if (refreshTimer.current != null) window.clearTimeout(refreshTimer.current);
    // Stripe avisa unos segundos después; entonces el detalle local ya cambió.
    refreshTimer.current = window.setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: adminSubscriptionsControllerGetQueryKey({ path: { id } }),
      });
    }, REFRESH_DELAY_MS);
    toast.success(message);
  }

  function onFailure(error: unknown) {
    const kind = subscriptionErrorKind(error);
    setNotice(kind === 'message' ? null : kind);
    toast.error(subscriptionErrorText(error));
  }

  const cancel = useMutation({
    ...adminSubscriptionsControllerCancelMutation(),
    onSuccess: (detail) => {
      setCancelOpen(false);
      afterSuccess(detail, 'Cancelación registrada.');
    },
    onError: onFailure,
  });
  const resume = useMutation({
    ...adminSubscriptionsControllerResumeMutation(),
    onSuccess: (detail) => {
      setResumeOpen(false);
      afterSuccess(detail, 'La suscripción sigue activa.');
    },
    onError: onFailure,
  });

  if (!actions.cancel && !actions.resume) return null;

  const endLabel = local.currentPeriodEnd
    ? `Termina el ${formatDate(local.currentPeriodEnd)}.`
    : 'Termina al cerrar el periodo actual.';

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {actions.cancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCancelOpen(true)}
          >
            Cancelar suscripción
          </Button>
        ) : null}
        {actions.resume ? (
          <Button type="button" onClick={() => setResumeOpen(true)}>
            Reanudar
          </Button>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">
        El cambio se refleja aquí cuando Stripe avisa (segundos).
      </p>
      {notice === 'schedule' ? (
        <Alert>
          <AlertTitle>Hay un cambio de plan programado</AlertTitle>
          <AlertDescription>
            Gestiónalo en Stripe.{' '}
            <ExternalAnchor href={local.stripeDashboardUrl}>
              Abrir en Stripe
            </ExternalAnchor>
          </AlertDescription>
        </Alert>
      ) : null}
      {notice === 'stripe' ? (
        <Alert variant="destructive">
          <AlertTitle>
            No se pudo hablar con Stripe; no se cambió nada.
          </AlertTitle>
        </Alert>
      ) : null}
      <CancelDialog
        open={cancelOpen}
        pending={cancel.isPending}
        endLabel={endLabel}
        slug={local.tenant.slug}
        onOpenChange={setCancelOpen}
        onConfirm={(mode, reason) =>
          cancel.mutate({ path: { id }, body: { mode, reason } })
        }
      />
      <AlertDialog
        open={resumeOpen}
        onOpenChange={(next) => {
          if (resume.isPending) return;
          setResumeOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reanudar suscripción</AlertDialogTitle>
            <AlertDialogDescription>
              Se deshace la baja programada. El cobro sigue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resume.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={resume.isPending}
              onClick={() => resume.mutate({ path: { id } })}
            >
              {resume.isPending ? 'Reanudando…' : 'Reanudar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CancelDialog({
  open,
  pending,
  endLabel,
  slug,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  pending: boolean;
  endLabel: string;
  slug: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: 'period_end' | 'now', reason: string) => void;
}) {
  const [mode, setMode] = useState<'period_end' | 'now'>('period_end');
  const [reason, setReason] = useState('');
  const [typedSlug, setTypedSlug] = useState('');
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMode('period_end');
      setReason('');
      setTypedSlug('');
    }
  }
  const reasonProblem =
    reason.trim().length === 0 ? null : actionReasonError(reason);
  const slugOk =
    mode === 'period_end' || immediateCancelConfirmed(typedSlug, slug);
  const canConfirm = actionReasonError(reason) == null && slugOk;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar suscripción</AlertDialogTitle>
          <AlertDialogDescription>
            Elige cuándo deja de cobrarse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Cuándo cancelar</legend>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="cancel-mode"
              className="mt-1"
              checked={mode === 'period_end'}
              onChange={() => setMode('period_end')}
            />
            <span>
              <span className="font-medium">
                Al final del periodo (recomendado)
              </span>
              <span className="block text-muted-foreground">{endLabel}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-destructive">
            <input
              type="radio"
              name="cancel-mode"
              className="mt-1"
              checked={mode === 'now'}
              onChange={() => setMode('now')}
            />
            <span>
              <span className="font-medium">Ahora mismo</span>
              <span className="block">
                El sitio deja de mostrarse y el dominio sigue el proceso de
                suspensión.
              </span>
            </span>
          </label>
        </fieldset>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cancel-reason">Motivo</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            maxLength={300}
            onChange={(event) => setReason(event.target.value)}
          />
          {reasonProblem ? (
            <p className="text-sm text-destructive">{reasonProblem}</p>
          ) : null}
        </div>
        {mode === 'now' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="cancel-slug">Identificador del cliente</Label>
            <p className="text-sm text-muted-foreground">
              Escribe <span className="font-mono text-foreground">{slug}</span>{' '}
              para confirmar.
            </p>
            <Input
              id="cancel-slug"
              value={typedSlug}
              autoComplete="off"
              onChange={(event) => setTypedSlug(event.target.value)}
            />
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Volver</AlertDialogCancel>
          <AlertDialogAction
            variant={mode === 'now' ? 'destructive' : 'default'}
            disabled={pending || !canConfirm}
            onClick={() => onConfirm(mode, reason.trim())}
          >
            {pending ? 'Cancelando…' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
