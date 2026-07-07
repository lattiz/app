import { createFileRoute } from '@tanstack/react-router';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const Route = createFileRoute('/forgot-password/')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <AuthHeader
            title="Recupera tu contraseña"
            subtitle="Ingresa tu correo y te enviaremos un código de verificación."
          />
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
