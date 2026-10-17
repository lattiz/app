import {
  adminMembersControllerGrantMutation,
  adminMembersControllerListOptions,
  adminMembersControllerListQueryKey,
  adminMembersControllerRevokeMutation,
  adminMembersControllerUpdateRoleMutation,
  type AdminMemberDto,
} from '@lattiz/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { FilterChip } from '@/components/filter-select';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { formatDateTime } from '@/lib/format';
import { ROLE_LABEL, type AdminRole } from '@/lib/navigation';

const ROLES = ['owner', 'operator', 'viewer'] as const;

const ROLE_HELP: Record<AdminRole, string> = {
  owner: 'Todo, incluido cobros y borrados',
  operator: 'Plantillas y soporte a clientes',
  viewer: 'Solo el resumen del negocio, sin datos personales',
};

const ROLE_OPTIONS = ROLES.map((role) => ({
  value: role,
  label: ROLE_LABEL[role],
}));

export function MembersPage({ currentUserId }: { currentUserId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery(adminMembersControllerListOptions());
  const [showRevoked, setShowRevoked] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AdminMemberDto | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const updateRole = useMutation({
    ...adminMembersControllerUpdateRoleMutation(),
    onSuccess: async () => {
      toast.success('El rol quedó actualizado.');
      await queryClient.invalidateQueries({
        queryKey: adminMembersControllerListQueryKey(),
      });
    },
    onError: (error) => toast.error(readApiErrorMessage(error)),
  });
  const revoke = useMutation({
    ...adminMembersControllerRevokeMutation(),
    onSuccess: async () => {
      setRevokeTarget(null);
      setRevokeError(null);
      toast.success('El acceso quedó revocado.');
      await queryClient.invalidateQueries({
        queryKey: adminMembersControllerListQueryKey(),
      });
    },
    onError: (error) => setRevokeError(readApiErrorMessage(error)),
  });

  const items = query.data?.items ?? [];
  const visible = showRevoked ? items : items.filter((item) => item.revokedAt == null);
  const rolePendingId = updateRole.isPending ? updateRole.variables?.path.userId : undefined;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Equipo"
          description="Quién puede entrar a este panel y con qué permisos."
        />
        <Button type="button" onClick={() => setGrantOpen(true)}>
          Agregar persona
        </Button>
      </div>
      <FilterChip pressed={showRevoked} onClick={() => setShowRevoked((current) => !current)}>
        Mostrar revocados
      </FilterChip>

      {query.isPending ? <Skeleton className="h-80" /> : null}
      {query.isError ? (
        <QueryAlert
          error={query.error}
          pending={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data && !query.isError ? (
        <Card className="min-w-0">
          {visible.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              {items.length === 0
                ? 'Todavía no hay personas en el equipo.'
                : 'No hay personas activas. Activa «Mostrar revocados» para ver las que ya no entran.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Alta</TableHead>
                  <TableHead>Quién dio el alta</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((member) => (
                  <MemberRow
                    key={member.userId}
                    member={member}
                    self={member.userId === currentUserId}
                    rolePending={rolePendingId === member.userId}
                    onRole={(role) =>
                      updateRole.mutate({
                        path: { userId: member.userId },
                        body: { role },
                      })
                    }
                    onRevoke={() => {
                      setRevokeError(null);
                      setRevokeTarget(member);
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      ) : null}

      <GrantDialog
        open={grantOpen}
        onOpenChange={setGrantOpen}
        onGranted={() => setGrantOpen(false)}
      />
      <AlertDialog
        open={revokeTarget != null}
        onOpenChange={(open) => {
          if (revoke.isPending) return;
          if (!open) {
            setRevokeTarget(null);
            setRevokeError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar acceso</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget?.email ?? 'Esta persona'} dejará de entrar a este panel. Su cuenta
              de Lattiz sigue existiendo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {revokeError ? <p className="text-sm text-destructive">{revokeError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revoke.isPending || revokeTarget == null}
              onClick={() => {
                if (!revokeTarget) return;
                revoke.mutate({ path: { userId: revokeTarget.userId } });
              }}
            >
              {revoke.isPending ? 'Revocando…' : 'Revocar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MemberRow({
  member,
  self,
  rolePending,
  onRole,
  onRevoke,
}: {
  member: AdminMemberDto;
  self: boolean;
  rolePending: boolean;
  onRole: (role: AdminRole) => void;
  onRevoke: () => void;
}) {
  const revoked = member.revokedAt != null;
  const locked = self || revoked;
  return (
    <TableRow>
      <TableCell>
        <span className="inline-flex items-center gap-2">
          {member.email}
          {self ? <Badge variant="outline">Tú</Badge> : null}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{ROLE_LABEL[member.role]}</Badge>
      </TableCell>
      <TableCell>{formatDateTime(member.createdAt)}</TableCell>
      <TableCell>{member.createdBy ?? '—'}</TableCell>
      <TableCell>
        {member.lastSignInAt ? formatDateTime(member.lastSignInAt) : 'Todavía no entra'}
      </TableCell>
      <TableCell>
        <Badge variant={revoked ? 'destructive' : 'secondary'}>
          {revoked ? 'Revocado' : 'Activo'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <RoleSelect
            label={`Rol de ${member.email}`}
            value={member.role}
            disabled={locked || rolePending}
            onChange={onRole}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locked}
            onClick={onRevoke}
          >
            Revocar
          </Button>
        </div>
        {self ? (
          <p className="mt-1 text-xs text-muted-foreground">
            No puedes cambiar tu propio acceso.
          </p>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

function RoleSelect({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: AdminRole;
  disabled: boolean;
  onChange: (role: AdminRole) => void;
}) {
  return (
    <Select
      items={ROLE_OPTIONS}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next == null || next === value || !isRole(next)) return;
        onChange(next);
      }}
    >
      <SelectTrigger aria-label={label} size="sm" className="min-w-36">
        <SelectValue>{ROLE_LABEL[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function GrantDialog({
  open,
  onOpenChange,
  onGranted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGranted: () => void;
}) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('viewer');
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setEmail('');
      setRole('viewer');
      setError(null);
    }
  }

  const grant = useMutation({
    ...adminMembersControllerGrantMutation(),
    onSuccess: async () => {
      toast.success('Ya puede entrar al panel.');
      await queryClient.invalidateQueries({
        queryKey: adminMembersControllerListQueryKey(),
      });
      onGranted();
    },
    onError: (error) => setError(readApiErrorMessage(error)),
  });

  const emailError = email.trim().length === 0 ? null : mailboxError(email);

  function submit() {
    const nextEmail = email.trim();
    const problem = mailboxError(nextEmail);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    grant.mutate({ body: { email: nextEmail, role } });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (grant.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar persona</DialogTitle>
          <DialogDescription>
            La persona debe tener ya una cuenta en Lattiz. La primera vez que entre se le
            pedirá configurar la verificación en dos pasos.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="member-email">Correo</Label>
            <Input
              id="member-email"
              type="email"
              autoComplete="off"
              value={email}
              aria-invalid={emailError != null}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError ? <p className="text-sm text-destructive">{emailError}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Rol</Label>
            <RoleSelect label="Rol de la persona nueva" value={role} disabled={grant.isPending} onChange={setRole} />
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {ROLES.map((item) => (
                <li key={item}>
                  <span className="text-foreground">{ROLE_LABEL[item]}:</span> {ROLE_HELP[item]}
                </li>
              ))}
            </ul>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={grant.isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={grant.isPending || mailboxError(email) != null}>
              {grant.isPending ? 'Agregando…' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function isRole(value: string): value is AdminRole {
  return ROLES.some((role) => role === value);
}

function mailboxError(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length === 0) return 'Escribe un correo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Escribe un correo válido.';
  return null;
}
