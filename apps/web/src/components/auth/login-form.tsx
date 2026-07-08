import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { FormError } from '@/components/auth/form-error';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/lib/auth';

/** Email + password login. On success, honors the `?redirect=` search param. */
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
    try {
      await login(email, password);
      // Only follow internal paths ("/…", never "//…") to avoid open redirects.
      const target =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : '/dashboard';
      await navigate({ to: target });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas');
      setPending(false);
    }
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
            placeholder="Ingresa tu correo"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            required
          />
        </Field>

        <div className="flex items-center justify-end -mt-8">
          <Button
            variant="link"
            className="text-primary text-xs font-medium hover:underline"
            render={<Link to="/forgot-password" />}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>

        <FormError message={error} />

        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </FieldGroup>
    </form>
  );
}
