import { useNavigate } from '@tanstack/react-router';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState, type FormEvent } from 'react';
import { AuthApiError } from '@supabase/supabase-js';
import { AuthCard } from '@/components/auth/auth-card';
import { FormError } from '@/components/auth/form-error';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { safeInternalPath } from '@/lib/auth-redirect';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

const FACTOR_NAME = 'Lattiz Admin';

type ReadyFactor =
  | { kind: 'challenge'; factorId: string }
  | { kind: 'enroll'; factorId: string; qr: string; secret: string };

export function MfaScreen({ redirectTo }: { redirectTo?: string }) {
  const navigate = useNavigate();
  const [factor, setFactor] = useState<ReadyFactor | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void loadFactor(controller.signal, setFactor, setLoadError);
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factor || code.length !== 6) return;
    setPending(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.factorId,
      code,
    });
    if (verifyError) {
      setError(verifyErrorMessage(verifyError));
      setCode('');
      setPending(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    useAuthStore.getState().applySession(data.session);
    await navigate({ href: safeInternalPath(redirectTo), replace: true });
  }

  async function copySecret(secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (loadError) {
    return (
      <AuthCard
        title="Verificación en dos pasos"
        subtitle="No se pudo continuar."
      >
        <div className="flex flex-col gap-4">
          <FormError message={loadError} />
          <SignOutButton />
        </div>
      </AuthCard>
    );
  }

  const copy = mfaCopy(factor !== null, factor?.kind === 'enroll');

  if (!factor) {
    return (
      <AuthCard title={copy.title} subtitle={copy.subtitle}>
        <div className="grid place-items-center py-8">
          <Spinner className="size-6" />
        </div>
      </AuthCard>
    );
  }

  const enrolling = factor.kind === 'enroll';

  return (
    <AuthCard title={copy.title} subtitle={copy.subtitle}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {enrolling && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={factor.qr}
                alt="Código QR para configurar el autenticador"
                className="size-48"
              />
              <div className="w-full space-y-2">
                <p className="text-muted-foreground text-sm">
                  Si no puedes escanear, copia esta clave:
                </p>
                <code className="bg-muted block rounded-2xl px-3 py-2 font-mono text-sm break-all">
                  {factor.secret}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void copySecret(factor.secret)}
                >
                  {copied ? 'Copiado' : 'Copiar clave'}
                </Button>
              </div>
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="mfa-code">Código de 6 dígitos</FieldLabel>
            <InputOTP
              id="mfa-code"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={setCode}
              disabled={pending}
              autoFocus
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </Field>
          <FormError message={error} />
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={pending || code.length !== 6}
          >
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? 'Comprobando…' : 'Confirmar'}
          </Button>
          <SignOutButton variant="ghost" />
        </FieldGroup>
      </form>
    </AuthCard>
  );
}

export function mfaCopy(
  factorReady: boolean,
  enrolling: boolean,
): {
  title: string;
  subtitle: string;
} {
  if (!factorReady) {
    return {
      title: 'Verificación en dos pasos',
      subtitle: 'Preparando el segundo factor…',
    };
  }
  if (enrolling) {
    return {
      title: 'Activa la verificación',
      subtitle:
        'Escanea el código con tu app de autenticación y escribe el código de 6 dígitos.',
    };
  }
  return {
    title: 'Verificación en dos pasos',
    subtitle: 'Escribe el código de 6 dígitos de tu app de autenticación.',
  };
}

async function loadFactor(
  signal: AbortSignal,
  setFactor: (factor: ReadyFactor) => void,
  setLoadError: (message: string) => void,
) {
  const listed = await supabase.auth.mfa.listFactors();
  if (signal.aborted) return;
  if (listed.error || !listed.data) {
    setLoadError(
      'No se pudo preparar la verificación. Cierra sesión e inténtalo otra vez.',
    );
    return;
  }

  const verified = listed.data.totp[0];
  if (verified) {
    setFactor({ kind: 'challenge', factorId: verified.id });
    return;
  }

  for (const factor of listed.data.all) {
    if (factor.factor_type !== 'totp' || factor.status !== 'unverified') {
      continue;
    }
    const removed = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (signal.aborted) return;
    if (removed.error) {
      setLoadError(
        'No se pudo preparar la verificación. Cierra sesión e inténtalo otra vez.',
      );
      return;
    }
  }

  const enrolled = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: FACTOR_NAME,
  });
  if (signal.aborted) {
    if (enrolled.data) {
      await supabase.auth.mfa.unenroll({ factorId: enrolled.data.id });
    }
    return;
  }
  if (enrolled.error || !enrolled.data) {
    setLoadError(
      'No se pudo preparar la verificación. Cierra sesión e inténtalo otra vez.',
    );
    return;
  }

  setFactor({
    kind: 'enroll',
    factorId: enrolled.data.id,
    qr: totpQrSrc(enrolled.data.totp.qr_code),
    secret: enrolled.data.totp.secret,
  });
}

function totpQrSrc(qrCode: string): string {
  if (qrCode.startsWith('data:')) return qrCode;
  return `data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`;
}

function verifyErrorMessage(error: unknown): string {
  const code = error instanceof AuthApiError ? error.code : undefined;
  const message = error instanceof Error ? error.message : '';
  if (code === 'mfa_verification_failed' || /invalid/i.test(message)) {
    return 'El código no coincide. Revísalo e inténtalo de nuevo.';
  }
  return 'No se pudo verificar el código. Inténtalo de nuevo.';
}
