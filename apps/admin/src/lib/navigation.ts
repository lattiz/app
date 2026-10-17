import type { AdminMeResponseDto } from '@lattiz/api-client';
import {
  CreditCard,
  Gift,
  LayoutDashboard,
  LayoutTemplate,
  ScrollText,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AdminRole = AdminMeResponseDto['role'];

export const ADMIN_PATHS = [
  '/',
  '/plantillas',
  '/clientes',
  '/suscripciones',
  '/pruebas',
  '/configuracion',
  '/auditoria',
  '/equipo',
] as const;

export type AdminPath = (typeof ADMIN_PATHS)[number];

export type NavItem = {
  to: AdminPath;
  label: string;
  icon: LucideIcon;
  roles: readonly AdminRole[];
};

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: 'Propietario',
  operator: 'Operador',
  viewer: 'Lectura',
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    to: '/',
    label: 'Resumen',
    icon: LayoutDashboard,
    roles: ['owner', 'operator', 'viewer'],
  },
  {
    to: '/plantillas',
    label: 'Plantillas',
    icon: LayoutTemplate,
    roles: ['owner', 'operator'],
  },
  {
    to: '/clientes',
    label: 'Clientes',
    icon: Users,
    roles: ['owner', 'operator'],
  },
  {
    to: '/suscripciones',
    label: 'Suscripciones',
    icon: CreditCard,
    roles: ['owner', 'operator'],
  },
  {
    to: '/pruebas',
    label: 'Pruebas gratuitas',
    icon: Gift,
    roles: ['owner', 'operator'],
  },
  {
    to: '/configuracion',
    label: 'Configuración',
    icon: Settings,
    roles: ['owner', 'operator'],
  },
  {
    to: '/auditoria',
    label: 'Auditoría',
    icon: ScrollText,
    roles: ['owner'],
  },
  {
    to: '/equipo',
    label: 'Equipo',
    icon: UserCog,
    roles: ['owner'],
  },
];

export function navItemsFor(role: AdminRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** Longest matching section, so `/plantillas/123` follows Plantillas and `/` stays exact. */
export function sectionForPath(path: string): NavItem | undefined {
  const normalized = normalizePath(path);
  if (normalized === '/') {
    return NAV_ITEMS.find((item) => item.to === '/');
  }

  let match: NavItem | undefined;
  for (const item of NAV_ITEMS) {
    if (item.to === '/') continue;
    const hit = normalized === item.to || normalized.startsWith(`${item.to}/`);
    if (hit && (!match || item.to.length > match.to.length)) match = item;
  }
  return match;
}

export function canAccess(role: AdminRole, path: string): boolean {
  const section = sectionForPath(path);
  if (!section) return false;
  return section.roles.includes(role);
}

function normalizePath(path: string): string {
  const bare = path.split(/[?#]/, 1)[0] ?? '';
  if (bare.length > 1 && bare.endsWith('/')) return bare.slice(0, -1);
  return bare;
}
