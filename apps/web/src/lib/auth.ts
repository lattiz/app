import { meControllerDeleteMe } from '@lattiz/api-client';
import { supabase } from './supabase';

/**
 * Auth actions run directly against Supabase from the browser (anon key) — the
 * API never proxies auth. The one exception is account deletion, which needs a
 * privileged admin call and therefore goes through the API's DELETE /me.
 * onAuthStateChange keeps the auth store in sync, so these return void on success.
 */

/** Sends a 8-digit signup OTP. Requires the Supabase email template to expose `{{ .Token }}`. */
export async function sendSignupOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

/** Verifies the signup OTP and establishes a session. */
export async function verifySignupOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}

/** Sets the password on the already-verified, signed-in user. */
export async function setPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function login(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Sends a password-recovery OTP. Like signup, relies on the email template exposing `{{ .Token }}`. */
export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/forgot-password/verify`,
  });
  if (error) throw error;
}

/** Verifies the recovery OTP. On success supabase establishes a short-lived recovery session. */
export async function verifyRecoveryOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) throw error;
}

/** Sets a new password with the recovery session, then drops that one-time session so login is fresh. */
export async function resetPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
}

/** Hard-deletes the account: API deletes the profile + auth user, then we clear the local session. */
export async function deleteAccount(): Promise<void> {
  const { error } = await meControllerDeleteMe();
  if (error) {
    throw new Error(
      (error as { error?: { code?: string } }).error?.code === 'SUBSCRIPTION_CANCELLATION_FAILED'
        ? 'No pudimos cancelar tu suscripción, así que no eliminamos tu cuenta para que no se te siga cobrando. Inténtalo de nuevo en unos minutos o contacta a soporte.'
        : 'No pudimos eliminar tu cuenta. Inténtalo de nuevo en unos minutos o contacta a soporte.',
    );
  }
  await supabase.auth.signOut();
}
