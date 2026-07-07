import { useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { FormError } from '@/components/auth/form-error';
import { PasswordInput } from '@/components/auth/password-input';
import { PasswordStrength, scorePassword } from '@/components/auth/password-strength';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { setPassword as setAccountPassword } from '@/lib/auth';

/** Final signup step: set the password. Validation and navigation are unchanged. */
export function SignupPasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const needsLength = password.length > 0 && password.length < 8;

  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = scorePassword(password) === 3 && confirm === password;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await setAccountPassword(password);
      await navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contraseña demasiado débil');
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={needsLength || undefined}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Crea una contraseña"
            aria-invalid={needsLength || undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            required
          />
          <PasswordStrength password={password} />
          {needsLength && <FieldError>Usa al menos 8 caracteres.</FieldError>}
        </Field>
        <Field data-invalid={mismatch || undefined}>
          <FieldLabel htmlFor="confirm">Confirmar contraseña</FieldLabel>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            aria-invalid={mismatch || undefined}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={pending}
            required
          />
          {mismatch && <FieldError>Las contraseñas no coinciden.</FieldError>}
        </Field>
        <FormError message={error} />
        <Button type="submit" className="h-11 w-full" disabled={pending || !canSubmit}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </FieldGroup>
    </form>
  );
}
