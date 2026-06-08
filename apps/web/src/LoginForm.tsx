import { useState, type FormEvent } from 'react';
import { supabase } from './supabase';

interface LoginFormProps {
  onSignedIn: () => void;
}

/** Email/password login via supabase-js. Auth lives in Supabase, not in the API. */
export function LoginForm({ onSignedIn }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setPending(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    onSignedIn();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
    >
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      {error && <p style={{ color: 'crimson', width: '100%' }}>{error}</p>}
    </form>
  );
}
