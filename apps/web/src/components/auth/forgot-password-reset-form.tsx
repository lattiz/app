import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { FormError } from '@/components/auth/form-error';
import { PasswordInput } from '@/components/auth/password-input';
import { PasswordStrength, scorePassword } from '@/components/auth/password-strength';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { resetPassword } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';

/** Final recovery step: set the new password using the recovery session, then send to login. */
export function ForgotPasswordResetForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Guard: this page is only reachable with the recovery session from step 2.
  // Read once on mount so the sign-out after a successful reset can't re-trigger it.
  useEffect(() => {
    if (!useAuthStore.getState().session) {
      void navigate({ to: '/forgot-password' });
    }
  }, [navigate]);

  const needsLength = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = scorePassword(password) === 3 && confirm === password;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await resetPassword(password);
      await navigate({ to: '/login', search: { reset: 'true' } });
    } catch {
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={needsLength || undefined}>
          <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
          <PasswordInput
            id="new-password"
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
          <FieldLabel htmlFor="confirm-password">Confirmar contraseña</FieldLabel>
          <PasswordInput
            id="confirm-password"
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
          {pending ? 'Guardando...' : 'Guardar contraseña'}
        </Button>
      </FieldGroup>
    </form>
  );
}
