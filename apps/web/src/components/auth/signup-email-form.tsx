import { useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { sendSignupOtp } from '@/lib/auth';

/** First signup step: request the OTP, then hand off to the /signup/verify route (unchanged). */
export function SignupEmailForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await sendSignupOtp(email);
      await navigate({ to: '/signup/verify', search: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código');
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="signup-email">Correo electrónico</FieldLabel>
          <Input
            id="signup-email"
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
          {pending && <Spinner data-icon="inline-start" />  }
          {pending ? 'Enviando...' : 'Continuar'}
        </Button>
      </FieldGroup>
    </form>
  );
}
