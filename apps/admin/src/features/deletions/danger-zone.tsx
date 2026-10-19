import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function DangerZone({ tenantId }: { tenantId: string }) {
  return (
    <Card className="min-w-0 border border-destructive/40">
      <CardHeader>
        <CardTitle>Peligro</CardTitle>
        <CardDescription>
          Borra a este cliente y su sitio de todos los proveedores. No se puede
          deshacer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          to="/clientes/$tenantId/borrar"
          params={{ tenantId }}
          className={buttonVariants({ variant: 'destructive' })}
        >
          Borrar cliente por completo…
        </Link>
      </CardContent>
    </Card>
  );
}
