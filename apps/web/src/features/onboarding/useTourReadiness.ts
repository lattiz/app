import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useDashboardStore } from '@/stores/dashboard.store';
import type { DashboardState } from '@/types/dashboard.types';

/** The route the tour auto-starts on; its first step is a centered welcome. */
export const TOUR_START_ROUTE = '/dashboard';

const TARGET_WAIT_MS = 8000;

export interface TourReadinessInput {
  hasSession: boolean;
  /** GET /tenants/me finished (success or error) — not pending. */
  tenantSettled: boolean;
  dashboardState: DashboardState;
  pathname: string;
  targetPresent: boolean;
}

export function isTourReady(input: TourReadinessInput): boolean {
  return (
    input.hasSession &&
    input.tenantSettled &&
    // 'loading' still renders the skeleton; 'no-tenant' replaces the whole outlet.
    input.dashboardState !== 'loading' &&
    input.dashboardState !== 'no-tenant' &&
    input.pathname === TOUR_START_ROUTE &&
    input.targetPresent
  );
}

// Resolves true once `selector` is in the DOM; gives up (stays false) after TARGET_WAIT_MS.
function useElementPresent(selector: string | null, enabled: boolean): boolean {
  const [present, setPresent] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (selector === null || document.querySelector(selector)) {
      setPresent(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (!document.querySelector(selector)) return;
      setPresent(true);
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(
      () => observer.disconnect(),
      TARGET_WAIT_MS,
    );

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [selector, enabled]);

  return present;
}

/**
 * True when the dashboard is settled enough for the tour to auto-start.
 * `firstTarget` is the first step's selector (null when it isn't a string selector).
 */
export function useTourReadiness(firstTarget: string | null): boolean {
  const hasSession = useAuthStore((s) => s.session !== null);
  const dashboardState = useDashboardStore((s) => s.state);
  const tenant = useQuery(tenantsControllerMeOptions());
  const pathname = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, '') || TOUR_START_ROUTE,
  });

  const base: TourReadinessInput = {
    hasSession,
    tenantSettled: !tenant.isPending,
    dashboardState,
    pathname,
    targetPresent: true,
  };
  const targetPresent = useElementPresent(firstTarget, isTourReady(base));

  return isTourReady({ ...base, targetPresent });
}
