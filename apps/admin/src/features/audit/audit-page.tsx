import {
  adminAuditControllerListOptions,
  type AdminAuditEntryDto,
} from '@lattiz/api-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { textLinkClass } from '@/components/external-anchor';
import { FilterSelect } from '@/components/filter-select';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCount, formatDateTime } from '@/lib/format';
import { describeAction } from './actions';
import { diffChanges, formatDiffValue } from './diff';
import {
  AUDIT_ACTION_FILTERS,
  type AuditActionPrefix,
  type AuditListSearch,
  toAuditListQuery,
} from './list-search';

export function AuditPage({ search }: { search: AuditListSearch }) {
  const navigate = useNavigate({ from: '/auditoria' });
  const [actorDraft, setActorDraft] = useState(search.actor ?? '');
  const [targetDraft, setTargetDraft] = useState(search.target ?? '');
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set());
  const query = useQuery({
    ...adminAuditControllerListOptions({ query: toAuditListQuery(search) }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setActorDraft(search.actor ?? '');
    setTargetDraft(search.target ?? '');
  }, [search.actor, search.target]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const actor = actorDraft.trim();
      const target = targetDraft.trim();
      if (actor === (search.actor ?? '') && target === (search.target ?? '')) return;
      void navigate({
        replace: true,
        search: (prev) => ({
          ...prev,
          actor: actor || undefined,
          target: target || undefined,
          page: undefined,
        }),
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [actorDraft, targetDraft, navigate, search.actor, search.target]);

  function updateSearch(patch: Partial<AuditListSearch>, resetPage = true) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: resetPage ? undefined : patch.page,
      }),
    });
  }

  const page = query.data?.page ?? search.page ?? 1;
  const pageSize = query.data?.pageSize ?? 25;
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rangeInverted =
    search.from != null && search.to != null && search.from > search.to;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader
        title="Auditoría"
        description="Quién hizo qué en el panel, y por qué motivo."
      />
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
            <Label htmlFor="audit-actor">Persona</Label>
            <Input
              id="audit-actor"
              value={actorDraft}
              placeholder="Correo o identificador"
              onChange={(event) => setActorDraft(event.target.value)}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
            <Label htmlFor="audit-target">Objetivo</Label>
            <Input
              id="audit-target"
              value={targetDraft}
              placeholder="Identificador del registro"
              onChange={(event) => setTargetDraft(event.target.value)}
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-end gap-2">
          <FilterSelect<AuditActionPrefix>
            label="Tipo de acción"
            allLabel="Todas las acciones"
            value={search.action}
            options={AUDIT_ACTION_FILTERS}
            onChange={(action) => updateSearch({ action })}
          />
          <DateField
            id="audit-from"
            label="Desde"
            value={search.from}
            onChange={(from) => updateSearch({ from })}
          />
          <DateField
            id="audit-to"
            label="Hasta"
            value={search.to}
            onChange={(to) => updateSearch({ to })}
          />
        </div>
        {rangeInverted ? (
          <p className="text-sm text-destructive">
            La fecha inicial es posterior a la final.
          </p>
        ) : null}
      </div>

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
          {query.data.items.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              Ningún registro coincide con esta búsqueda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>
                    <span className="sr-only">Detalle</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((item) => (
                  <AuditRows
                    key={item.id}
                    item={item}
                    open={openIds.has(item.id)}
                    onToggle={() =>
                      setOpenIds((current) => {
                        const next = new Set(current);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      })
                    }
                  />
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

function AuditRows({
  item,
  open,
  onToggle,
}: {
  item: AdminAuditEntryDto;
  open: boolean;
  onToggle: () => void;
}) {
  const action = describeAction(item.action);
  return (
    <>
      <TableRow>
        <TableCell>{formatDateTime(item.createdAt)}</TableCell>
        <TableCell>{item.actorEmail ?? item.actorUserId}</TableCell>
        <TableCell>
          <span className="inline-flex items-center gap-2">
            {action.label}
            {action.failed ? <Badge variant="destructive">Falló</Badge> : null}
          </span>
        </TableCell>
        <TableCell>
          <TargetCell type={item.targetType} id={item.targetId} />
        </TableCell>
        <TableCell className="max-w-64 whitespace-normal">
          {item.reason ?? '—'}
        </TableCell>
        <TableCell>
          <Button type="button" variant="ghost" size="sm" onClick={onToggle}>
            {open ? 'Ocultar' : 'Detalle'}
          </Button>
        </TableCell>
      </TableRow>
      {open ? (
        <TableRow>
          <TableCell colSpan={6} className="whitespace-normal">
            <AuditDetail item={item} />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

function AuditDetail({ item }: { item: AdminAuditEntryDto }) {
  const changes = diffChanges(item.before, item.after);
  return (
    <div className="flex min-w-0 flex-col gap-3 py-1">
      <p className="text-sm text-muted-foreground">
        IP: {item.ip ?? 'no registrada'}
      </p>
      {changes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay detalle del cambio.</p>
      ) : (
        <ul className="flex min-w-0 flex-col gap-3">
          {changes.map((change) => (
            <li key={change.field} className="min-w-0">
              <p className="text-sm font-medium">{change.field}</p>
              <div className="mt-1 grid min-w-0 gap-2 sm:grid-cols-2">
                <DiffValue label="Antes" value={change.before} />
                <DiffValue label="Después" value={change.after} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiffValue({ label, value }: { label: string; value: unknown }) {
  const formatted = formatDiffValue(value);
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      {formatted.scroll ? (
        <pre className="mt-1 max-h-48 overflow-auto rounded-xl bg-muted p-3 text-xs whitespace-pre">
          {formatted.text}
        </pre>
      ) : (
        <p className="mt-1 text-sm break-all">{formatted.text}</p>
      )}
    </div>
  );
}

function TargetCell({ type, id }: { type: string | null; id: string | null }) {
  if (!id) return <span className="text-muted-foreground">—</span>;
  const noun = targetNoun(type);
  if (type === 'tenant') {
    return (
      <Link to="/clientes/$tenantId" params={{ tenantId: id }} className={textLinkClass}>
        {noun} {id}
      </Link>
    );
  }
  if (type === 'template') {
    return (
      <Link to="/plantillas/$id" params={{ id }} className={textLinkClass}>
        {noun} {id}
      </Link>
    );
  }
  if (type === 'subscription') {
    return (
      <Link to="/suscripciones/$id" params={{ id }} className={textLinkClass}>
        {noun} {id}
      </Link>
    );
  }
  return (
    <span>
      {noun} {id}
    </span>
  );
}

function targetNoun(type: string | null): string {
  if (type === 'tenant') return 'Cliente';
  if (type === 'template') return 'Plantilla';
  if (type === 'subscription') return 'Suscripción';
  if (type === 'setting') return 'Ajuste';
  if (type === 'member') return 'Persona';
  return type ?? 'Registro';
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={value ?? ''}
        className="w-40"
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    </div>
  );
}

function rangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return '0 registros';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${formatCount(start)}–${formatCount(end)} de ${formatCount(total)}`;
}
