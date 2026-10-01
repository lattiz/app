import type { DashboardState } from '@/types/dashboard.types';

export interface NavItem {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  to: string; // TanStack Router route path
  badge?: 'new' | 'error' | 'warning' | 'pro' | null;
  disabled?: boolean;
  visibleIn: DashboardState[]; // which states show this item
}

export function buildNavItems(
  state: DashboardState,
  plan: string | null = null,
): NavItem[] {
  const items: NavItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'Home',
      to: '/dashboard',
      visibleIn: ['active', 'no-template', 'no-subscription'],
    },
    {
      id: 'my-site',
      label: 'Mi sitio',
      icon: 'Globe',
      to: '/dashboard/site',
      visibleIn: ['active'], // only visible when site is active
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      icon: 'ChartArea',
      to: '/dashboard/analytics',
      badge: plan === 'pro' ? null : 'pro',
      visibleIn: ['active', 'no-template'],
    },
    {
      id: 'customization',
      label: 'Personalización',
      icon: 'Paintbrush',
      to: '/dashboard/customization',
      disabled: state !== 'active',
      visibleIn: ['active', 'no-template'],
    },
    {
      id: 'templates',
      label: 'Plantillas',
      icon: 'LayoutGrid',
      to: '/dashboard/templates',
      badge: state === 'no-template' ? 'new' : null,
      visibleIn: ['active', 'no-template'],
    },
    {
      id: 'domain',
      label: 'Dominio y DNS',
      icon: 'Network',
      to: '/dashboard/domain',
      disabled: state !== 'active',
      visibleIn: ['active', 'no-template'],
    },
    {
      id: 'subscription',
      label: 'Suscripción',
      icon: 'CreditCard',
      to: '/dashboard/subscription',
      badge: state === 'no-subscription' ? 'error' : null,
      visibleIn: ['active', 'no-template', 'no-subscription'],
    },
    {
      id: 'account',
      label: 'Cuenta',
      icon: 'User',
      to: '/dashboard/account',
      visibleIn: ['active', 'no-template', 'no-subscription'],
    },
  ];

  return items.filter((item) => item.visibleIn.includes(state));
}
