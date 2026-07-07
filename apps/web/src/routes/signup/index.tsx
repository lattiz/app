import { createFileRoute } from '@tanstack/react-router';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthShell } from '@/components/auth/auth-shell';

export const Route = createFileRoute('/signup/')({
  component: SignupPage,
});

function SignupPage() {
  return (
    <AuthShell>
      <AuthCard initialMode="signup" />
    </AuthShell>
  );
}
