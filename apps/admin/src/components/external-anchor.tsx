import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';

export const textLinkClass =
  'font-medium text-primary underline-offset-4 hover:underline';

export function ExternalAnchor({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}
