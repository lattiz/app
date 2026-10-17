import { createFileRoute } from '@tanstack/react-router';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Badge } from '@/components/ui/badge';

const ROLE_LABEL = {
  owner: 'Propietario',
  operator: 'Operador',
  viewer: 'Lectura',
} as const;

export const Route = createFileRoute('/_admin/')({
  component: AdminHomePage,
});

function AdminHomePage() {
  const { me } = Route.useRouteContext();
  if (!me) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {me.email ? `Hola, ${me.email}` : 'Hola'}
        </h1>
        <Badge variant="secondary">{ROLE_LABEL[me.role]}</Badge>
      </div>
      <SignOutButton className="w-fit" />
    </div>
  );
}
