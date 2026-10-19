import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { AuthApiError } from '@supabase/supabase-js';
import { FormError } from '@/components/auth/form-error';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

const FORGOT_PASSWORD_URL = 'https://dashboard.lattiz.app/forgot-password';

export function LoginForm() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: '/login' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: email.trim(),
        password,
      },
    );
    if (signInError || !data.session) {
      setError(
        signInError
          ? loginErrorMessage(signInError)
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      );
      setPending(false);
      return;
    }
    useAuthStore.getState().applySession(data.session);
    await navigate({ to: '/mfa', search: { redirect }, replace: true });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">Correo electrónico</FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="ejemplo@correo.com"
            className="h-11"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="**************"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            required
          />
        </Field>
        <div className="flex justify-end">
          <a
            href={FORGOT_PASSWORD_URL}
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <FormError message={error} />
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>
      </FieldGroup>
    </form>
  );
}

function loginErrorMessage(error: unknown): string {
  const code = error instanceof AuthApiError ? error.code : undefined;
  const message = error instanceof Error ? error.message : '';
  if (
    code === 'invalid_credentials' ||
    message === 'Invalid login credentials'
  ) {
    return 'Correo o contraseña incorrectos.';
  }
  if (code === 'email_not_confirmed' || message === 'Email not confirmed') {
    return 'Confirma tu correo antes de entrar.';
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}
