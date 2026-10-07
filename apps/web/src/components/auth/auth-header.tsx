/** Brand logo mark — a rounded tile with a soft purple blob, matching the reference. */
function AuthLogo() {
  return (
    <div className="bg-card relative size-12 overflow-hidden rounded-2xl">
      <img src='https://www.lattiz.app/lattiz_logo_white.svg' alt='logo' className='size-full object-contain' />
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
