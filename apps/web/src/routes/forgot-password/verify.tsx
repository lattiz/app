import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordOtpForm } from '@/components/auth/forgot-password-otp-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const Route = createFileRoute('/forgot-password/verify')({
  validateSearch: z.object({ email: z.string().optional() }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email } = Route.useSearch();

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <AuthHeader
            title="Verifica tu correo"
            subtitle={`Ingresa el código de 8 dígitos que enviamos a ${email ?? ''}.`}
          />
        </CardHeader>
        <CardContent>
          <ForgotPasswordOtpForm email={email ?? ''} />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
