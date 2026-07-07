import { createFileRoute } from '@tanstack/react-router';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordResetForm } from '@/components/auth/forgot-password-reset-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const Route = createFileRoute('/forgot-password/reset')({
  component: ResetPage,
});

function ResetPage() {
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <AuthHeader
            title="Nueva contraseña"
            subtitle="Elige una contraseña segura para tu cuenta."
          />
        </CardHeader>
        <CardContent>
          <ForgotPasswordResetForm />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
