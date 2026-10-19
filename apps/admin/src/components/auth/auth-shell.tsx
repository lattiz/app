import type { ReactNode } from 'react';

/** Centered single-column shell for the auth screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh place-items-center p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
