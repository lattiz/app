import type { StatusBadge } from '@/features/tenants/labels';

export function templateTierBadge(tier: 'basic' | 'pro'): StatusBadge {
  if (tier === 'pro') return { label: 'Pro', tone: 'info' };
  return { label: 'Básico', tone: 'neutral' };
}

export function templateStatusBadge(
  status: 'pending' | 'active' | 'retired',
): StatusBadge {
  if (status === 'active') return { label: 'Activa', tone: 'good' };
  if (status === 'retired') return { label: 'Retirada', tone: 'neutral' };
  return { label: 'Pendiente', tone: 'warn' };
}
