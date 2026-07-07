import { Link, useNavigate } from '@tanstack/react-router';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState, type FormEvent } from 'react';
import { FormError } from '@/components/auth/form-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { sendPasswordReset, verifyRecoveryOtp } from '@/lib/auth';

const RESEND_SECONDS = 60;
const OTP_LENGTH = 8;

/** Second recovery step: verify the recovery OTP, which establishes the reset session. */
export function ForgotPasswordOtpForm({ email }: { email: string }) {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  // Reached directly without an email param — nothing to verify against.
  useEffect(() => {
    if (!email) void navigate({ to: '/forgot-password' });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      setError('No se encontró el correo. Vuelve al paso anterior.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await verifyRecoveryOtp(email, token);
      await navigate({ to: '/forgot-password/reset' });
    } catch {
      setError('El código es inválido o ha expirado. Solicita uno nuevo.');
      setPending(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await sendPasswordReset(email);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      if ((err as { status?: number }).status === 429) {
        setError('Demasiados intentos. Espera un momento antes de intentar de nuevo.');
        return;
      }
      setError('No se pudo reenviar el código.');
    }
  }

  if (!email) {
    return (
      <div className="flex flex-col gap-4">
        <FormError message="No se encontró el correo. Vuelve al paso anterior." />
        <Button variant="link" className="w-full" render={<Link to="/forgot-password" />}>
          Volver a empezar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field className="items-center">
          <FieldLabel htmlFor="recovery-otp">Código de verificación</FieldLabel>
          <InputOTP
            id="recovery-otp"
            maxLength={OTP_LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={token}
            onChange={setToken}
            disabled={pending}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {[4, 5, 6, 7].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </Field>
        <FormError message={error} />
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={pending || token.length !== OTP_LENGTH}
        >
          {pending && <Spinner data-icon="inline-start" />}
          Verificar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={cooldown > 0}
          onClick={handleResend}
        >
          {cooldown > 0 ? `Reenviar código en ${cooldown}s` : 'Reenviar código'}
        </Button>
      </FieldGroup>
    </form>
  );
}
