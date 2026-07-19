import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Shown when GET /tenants/me settles into a persistent error (most often
 * TENANT_NOT_FOUND, after the one automatic retry in useDashboardHome also
 * fails) — normally this shouldn't happen since the tenants row is created
 * by a DB trigger in the same transaction as signup, but it's the fallback
 * instead of an infinite <DashboardSkeleton />.
 */
export function NoTenantState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <RefreshCwIcon className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Tu cuenta se está configurando</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Esto normalmente toma solo un instante. Si el problema persiste,
          recarga la página.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.location.reload()}
      >
        Recargar
      </Button>
    </div>
  );
}
