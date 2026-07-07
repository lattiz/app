import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const authed = useAuthStore.getState().status === 'authenticated';
    throw redirect({ to: authed ? '/dashboard' : '/login' });
  },
});
