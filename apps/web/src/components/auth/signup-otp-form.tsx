import { useNavigate } from '@tanstack/react-router';
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
import { sendSignupOtp, verifySignupOtp } from '@/lib/auth';

const RESEND_SECONDS = 60;
const OTP_LENGTH = 8;

/** Second signup step: verify the 8-digit OTP. Validation and navigation are unchanged. */
export function SignupOtpForm({ email }: { email: string }) {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await verifySignupOtp(email, token);
      await navigate({ to: '/signup/password' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido o expirado');
      setPending(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await sendSignupOtp(email);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el código');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field className="items-center">
          <FieldLabel htmlFor="otp">Código de verificación</FieldLabel>
          <InputOTP
            id="otp"
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
