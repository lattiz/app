import { Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { sendPasswordReset } from '@/lib/auth';

/** First recovery step: request the OTP, then hand off to /forgot-password/verify. */
export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await sendPasswordReset(email);
    } catch (err) {
      // Only surface rate limiting. Every other error is swallowed and we still
      // advance, so the flow never reveals whether the email is registered.
      if ((err as { status?: number }).status === 429) {
        setError('Demasiados intentos. Espera un momento antes de intentar de nuevo.');
        setPending(false);
        return;
      }
    }
    await navigate({ to: '/forgot-password/verify', search: { email } });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="forgot-email">Correo electrónico</FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="Ingresa tu correo"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
          />
          <FieldDescription>Te enviaremos un código de verificación aquí.</FieldDescription>
        </Field>
        <FormError message={error} />
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? 'Enviando...' : 'Enviar código'}
        </Button>
        <Button
          type="button"
          variant="link"
          className="w-full text-muted-foreground text-sm"
          render={<Link to="/login" />}
        >
          ← Volver al inicio de sesión
        </Button>
      </FieldGroup>
    </form>
  );
}
