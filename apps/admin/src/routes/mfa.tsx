import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthShell } from '@/components/auth/auth-shell';
import { MfaScreen } from '@/components/auth/mfa-screen';
import { authSearchSchema, safeInternalPath } from '@/lib/auth-redirect';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/mfa')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ search }) => {
    const { status, aal } = useAuthStore.getState();
    if (status !== 'authenticated') {
      throw redirect({ to: '/login', search, replace: true });
    }
    if (aal === 'aal2') {
      throw redirect({
        href: safeInternalPath(search.redirect),
        replace: true,
      });
    }
  },
  component: MfaPage,
});

function MfaPage() {
  const { redirect: redirectTo } = Route.useSearch();

  return (
    <AuthShell>
      <MfaScreen redirectTo={redirectTo} />
    </AuthShell>
  );
}
