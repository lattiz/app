import { createFileRoute } from '@tanstack/react-router';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignupPasswordForm } from '@/components/auth/signup-password-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const Route = createFileRoute('/signup/password')({
  component: PasswordPage,
});

function PasswordPage() {
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <AuthHeader
            title="Crea tu contraseña"
            subtitle="Elige una contraseña para terminar de configurar tu cuenta."
          />
        </CardHeader>
        <CardContent>
          <SignupPasswordForm />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
