import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { authSearchSchema, safeInternalPath } from '@/lib/auth-redirect';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ search }) => {
    const { status, aal } = useAuthStore.getState();
    if (status !== 'authenticated') return;
    if (aal === 'aal2') {
      throw redirect({
        href: safeInternalPath(search.redirect),
        replace: true,
      });
    }
    throw redirect({ to: '/mfa', search, replace: true });
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell>
      <AuthCard
        title="Lattiz Admin"
        subtitle="Entra con la cuenta que ya tienes en Lattiz."
      >
        <LoginForm />
      </AuthCard>
    </AuthShell>
  );
}
