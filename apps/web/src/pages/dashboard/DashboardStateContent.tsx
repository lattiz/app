import type { DashboardState } from '@/types/dashboard.types';

export function DashboardStateContent({ state }: { state: DashboardState }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Estado actual: <strong>{state}</strong>
      <br />
      Contenido del dashboard se construirá en la siguiente iteración.
    </div>
  );
}
