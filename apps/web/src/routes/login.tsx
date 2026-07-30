import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthShell } from '@/components/auth/auth-shell';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
    deleted: z.boolean().optional(),
    reset: z.string().optional(),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { deleted, reset } = Route.useSearch();

  const banner =
    reset === 'true' ? (
      <Alert className="border-green-500/30 text-center bg-green-500/10 text-green-700 dark:text-green-400">
        <AlertDescription>
          Inicia sesión con tu nueva contraseña.
        </AlertDescription>
      </Alert>
    ) : deleted ? (
      <Alert>
        <AlertDescription>
          Tu cuenta fue eliminada. Puedes registrarte de nuevo.
        </AlertDescription>
      </Alert>
    ) : undefined;

  return (
    <AuthShell>
      <AuthCard initialMode="login" banner={banner} />
    </AuthShell>
  );
}
