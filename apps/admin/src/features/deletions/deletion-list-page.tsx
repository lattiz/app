import {
  adminDeletionsControllerListOptions,
  type DeletionJobDto,
} from '@lattiz/api-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { textLinkClass } from '@/components/external-anchor';
import { FilterSelect } from '@/components/filter-select';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import {
  DELETION_PAGE_SIZE,
  DELETION_STATUSES,
  type DeletionListSearch,
  type DeletionStatusFilter,
  toDeletionListQuery,
} from './list-search';
import { JOB_STATUS_LABEL } from './model';

const STATUS_CLASS: Record<DeletionJobDto['status'], string> = {
  pending: 'border-border bg-muted text-foreground',
  running: 'border-transparent bg-sky-500/15 text-sky-800 dark:text-sky-300',
  completed:
    'border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  completed_manual:
    'border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300',
  failed: 'border-transparent bg-destructive/10 text-destructive',
};

const STATUS_OPTIONS = DELETION_STATUSES.map((value) => ({
  value,
  label: JOB_STATUS_LABEL[value],
}));

export function DeletionListPage({ search }: { search: DeletionListSearch }) {
  const navigate = useNavigate({ from: '/borrados' });
  const query = useQuery({
    ...adminDeletionsControllerListOptions({
      query: toDeletionListQuery(search),
    }),
    placeholderData: keepPreviousData,
  });

  function updateSearch(patch: Partial<DeletionListSearch>, resetPage = true) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: resetPage ? undefined : patch.page,
      }),
    });
  }

  const page = query.data?.page ?? search.page ?? 1;
  const pageSize = query.data?.pageSize ?? DELETION_PAGE_SIZE;
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader
        title="Borrados"
        description="Clientes que se borraron, o que se están borrando, de todos los proveedores."
      />
      <FilterSelect<DeletionStatusFilter>
        label="Estado"
        allLabel="Todos los estados"
        value={search.status}
        options={STATUS_OPTIONS}
        onChange={(status) => updateSearch({ status })}
      />
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
              {search.status
                ? 'Ningún borrado coincide con este estado.'
                : 'Todavía no hay borrados.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Quién</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(STATUS_CLASS[item.status])}
                      >
                        {JOB_STATUS_LABEL[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Link
                        to="/borrados/$jobId"
                        params={{ jobId: item.id }}
                        className={textLinkClass}
                      >
                        {item.slug}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.actorEmail ?? item.actorUserId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              {rangeLabel(page, pageSize, total)}
            </p>
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

function rangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return '0 borrados';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${formatCount(start)}–${formatCount(end)} de ${formatCount(total)}`;
}
