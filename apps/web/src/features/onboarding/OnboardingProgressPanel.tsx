import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CheckCircle2Icon, ChevronDownIcon, CircleIcon } from 'lucide-react';
import { SidebarGroup } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useOnboardingProgress } from './useOnboardingProgress';

const COLLAPSE_KEY = 'lattiz-onboarding-panel-collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === 'true';
  } catch {
    return false;
  }
}

// Placed below the main nav, above the account section — see AppSidebar.
// Collapses entirely once every step is done, so an established tenant
// never sees permanent onboarding clutter.
export function OnboardingProgressPanel() {
  const { steps, completedCount, isFullyOnboarded } = useOnboardingProgress();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  if (isFullyOnboarded) return null;

  const toggle = (): void => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, String(next));
    } catch {
      // Collapse state is a per-viewer convenience — losing it is harmless.
    }
  };

  return (
    <SidebarGroup>
      <div className="mx-2 rounded-lg border border-sidebar-border p-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          className="flex w-full items-center justify-between gap-2 text-xs font-medium text-sidebar-foreground"
        >
          <span>Configura tu sitio</span>
          <span className="flex items-center gap-1 text-sidebar-foreground/50">
            {completedCount}/{steps.length}
            <ChevronDownIcon
              className={cn(
                'size-3.5 transition-transform',
                collapsed && '-rotate-90',
              )}
            />
          </span>
        </button>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-accent">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        {!collapsed && (
          <ul className="mt-3 flex flex-col gap-0.5">
            {steps.map((step) => (
              <li key={step.id}>
                {step.complete ? (
                  <span className="flex items-center gap-2 rounded-md px-1 py-1 text-xs text-sidebar-foreground/70">
                    <CheckCircle2Icon className="size-4 shrink-0 text-green-600 dark:text-green-500" />
                    {step.label}
                  </span>
                ) : (
                  <Link
                    to={step.route}
                    className="flex items-center gap-2 rounded-md px-1 py-1 text-xs text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent"
                  >
                    <CircleIcon className="size-4 shrink-0 text-sidebar-foreground/40" />
                    {step.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SidebarGroup>
  );
}
