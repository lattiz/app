import { adminMeControllerMeOptions } from '@lattiz/api-client';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Spinner } from '@/components/ui/spinner';
import { classifyAdminError } from '@/lib/admin-errors';
import { useAuthStore } from '@/stores/auth.store';

// RootGate guarantees status is never 'loading' here.
export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ context, location }) => {
    const { status, aal } = useAuthStore.getState();
    if (status !== 'authenticated') {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
        replace: true,
      });
    }
    if (aal !== 'aal2') {
      throw redirect({
        to: '/mfa',
        search: { redirect: location.href },
        replace: true,
      });
    }

    try {
      const me = await context.queryClient.ensureQueryData(
        adminMeControllerMeOptions(),
      );
      return { me };
    } catch (error) {
      const kind = classifyAdminError(error);
      if (kind === 'mfa_required') {
        throw redirect({
          to: '/mfa',
          search: { redirect: location.href },
          replace: true,
        });
      }
      if (kind === 'unauthenticated') {
        throw redirect({
          to: '/login',
          search: { redirect: location.href },
          replace: true,
        });
      }
      if (kind === 'access_denied') return { me: null };
      throw error;
    }
  },
  pendingComponent: AdminPending,
  errorComponent: AdminError,
  component: AdminLayout,
});

function AdminLayout() {
  const { me } = Route.useRouteContext();
  if (!me) return <NoAccess />;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col p-6">
      <Outlet />
    </main>
  );
}

function NoAccess() {
  return (
    <AuthShell>
      <AuthCard title="Sin acceso" subtitle="Tu cuenta no es parte del equipo.">
        <SignOutButton className="w-full" />
      </AuthCard>
    </AuthShell>
  );
}

function AdminPending() {
  return (
    <div className="grid min-h-svh place-items-center">
      <Spinner className="size-6" />
    </div>
  );
}

function AdminError() {
  return (
    <AuthShell>
      <AuthCard
        title="No se pudo comprobar el acceso"
        subtitle="Inténtalo de nuevo. Si sigue fallando, cierra sesión."
      >
        <SignOutButton className="w-full" />
      </AuthCard>
    </AuthShell>
  );
}
