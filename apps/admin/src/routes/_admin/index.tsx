import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROLE_LABEL } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/')({
  component: AdminHomePage,
});

function AdminHomePage() {
  const { me } = Route.useRouteContext();
  if (!me) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resumen"
        description="Vista general de la operación."
      />
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido</CardTitle>
          <CardDescription>
            {me.email ?? 'Tu cuenta no tiene correo en la sesión.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{ROLE_LABEL[me.role]}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
