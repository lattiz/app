import { Link } from '@tanstack/react-router';
import { LockKeyholeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NoSubscriptionGate() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <LockKeyholeIcon className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Acceso restringido</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Necesitas una suscripción activa para editar tu sitio, conectar un
          dominio y acceder a las métricas.
        </p>
      </div>
      <Button variant="destructive" render={<Link to="/dashboard/subscription" />}>
        Ver planes
      </Button>
      <p className="text-sm text-muted-foreground">
        ¿Ya tienes un pago pendiente?{' '}
        <Link
          to="/dashboard/subscription"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Verificar estado
        </Link>
      </p>
    </div>
  );
}
