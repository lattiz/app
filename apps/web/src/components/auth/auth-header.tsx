/** Brand logo mark — a rounded tile with a soft purple blob, matching the reference. */
function AuthLogo() {
  return (
    <div className="bg-card ring-border relative size-12 overflow-hidden rounded-2xl shadow-sm ring-1">
      <div className="bg-primary absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px]" />
    </div>
  );
}

/** Centered logo + title + subtitle used across every auth screen. */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <AuthLogo />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
    </div>
  );
}
