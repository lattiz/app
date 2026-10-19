import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadgeView } from '@/features/tenants/status-badge';
import { moveListItem } from './actions';
import { templateStatusBadge, templateTierBadge } from './labels';

export type OrderRow = {
  id: string;
  name: string;
  tier: 'basic' | 'pro';
  status: 'pending' | 'active' | 'retired';
  featured: boolean;
};

export function TemplateOrderList({
  rows,
  ids,
  pending,
  onIdsChange,
  onSave,
  onCancel,
}: {
  rows: readonly OrderRow[];
  ids: readonly string[];
  pending: boolean;
  onIdsChange: (ids: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const byId = new Map(rows.map((row) => [row.id, row]));

  return (
    <Card className="min-w-0">
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Estás ordenando todo el catálogo. Los filtros de arriba no aplican
          hasta que salgas.
        </p>
        <ol className="flex min-w-0 flex-col">
          {ids.map((id, index) => {
            const row = byId.get(id);
            if (!row) return null;
            return (
              <li
                key={id}
                className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b py-3 last:border-b-0"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-medium">{row.name}</span>
                  <span className="flex flex-wrap gap-1">
                    <StatusBadgeView badge={templateTierBadge(row.tier)} />
                    <StatusBadgeView badge={templateStatusBadge(row.status)} />
                    {row.featured ? (
                      <StatusBadgeView
                        badge={{ label: 'Destacada', tone: 'info' }}
                      />
                    ) : null}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label={`Subir ${row.name}`}
                    disabled={pending || index === 0}
                    onClick={() => onIdsChange(moveListItem(ids, index, -1))}
                  >
                    Subir
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label={`Bajar ${row.name}`}
                    disabled={pending || index === ids.length - 1}
                    onClick={() => onIdsChange(moveListItem(ids, index, 1))}
                  >
                    Bajar
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={pending} onClick={onSave}>
            {pending ? 'Guardando…' : 'Guardar orden'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
