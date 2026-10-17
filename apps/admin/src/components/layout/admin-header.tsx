import { useState } from 'react';
import { getRouteApi, Link, useRouterState } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { usePageCrumb } from '@/components/layout/page-crumb';
import { ROLE_LABEL, sectionForPath } from '@/lib/navigation';
import { signOutAdmin } from '@/lib/sign-out';

const adminRoute = getRouteApi('/_admin');

export function AdminHeader() {
  const { me } = adminRoute.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const section = sectionForPath(pathname);
  const isHome = section?.to === '/';
  const currentLabel = section?.label ?? 'Panel';
  const crumb = usePageCrumb();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 h-4 data-vertical:self-auto"
      />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            {isHome ? (
              <BreadcrumbPage>Resumen</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link to="/" />}>Resumen</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isHome && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {crumb && section ? (
                  <BreadcrumbLink render={<Link to={section.to} />}>
                    {section.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {crumb ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{crumb}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : null}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {me ? (
        <UserMenu email={me.email} roleLabel={ROLE_LABEL[me.role]} />
      ) : null}
    </header>
  );
}

function UserMenu({
  email,
  roleLabel,
}: {
  email: string | null;
  roleLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const label = email ?? 'Sin correo';
  const local = email?.split('@')[0] ?? '';
  const initials = (local.slice(0, 2) || '—').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="ml-auto gap-2 px-2" />
        }
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-40 truncate sm:inline">{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1.5">
            <span className="truncate text-sm text-foreground">{label}</span>
            <Badge variant="secondary">{roleLabel}</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={() => {
            setPending(true);
            void signOutAdmin().catch(() => setPending(false));
          }}
        >
          {pending ? <Spinner /> : <LogOut />}
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
