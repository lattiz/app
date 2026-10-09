import type { DashboardState } from '@/types/dashboard.types';

// Reachable without an entitlement: home (which renders the "Acceso restringido"
// gate), and the two pages a lapsed tenant needs to resubscribe or leave.
const UNGATED_ROUTES = new Set([
  '/dashboard',
  '/dashboard/subscription',
  '/dashboard/account',
]);

/** Whether the dashboard layout bounces `pathname` back to `/dashboard` for this state. */
export function isDashboardRouteBlocked(
  state: DashboardState,
  pathname: string,
): boolean {
  return state === 'no-subscription' && !UNGATED_ROUTES.has(pathname);
}
