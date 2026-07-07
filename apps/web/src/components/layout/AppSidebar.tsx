import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  ChevronsUpDown,
  CreditCard,
  Globe,
  Home,
  LayoutGrid,
  LogOut,
  Network,
  Paintbrush,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { buildNavItems, type NavItem } from '@/config/nav.config';
import { logout } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useDashboardStore } from '@/stores/dashboard.store';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Globe,
  Paintbrush,
  LayoutGrid,
  Network,
  CreditCard,
  User,
};

function NavBadge({ badge }: { badge: NavItem['badge'] }) {
  if (badge === 'new') {
    return (
      <Badge variant="secondary" className="ml-auto text-[10px]">
        nuevo
      </Badge>
    );
  }
  if (badge === 'error') {
    return (
      <Badge variant="destructive" className="ml-auto text-[10px]">
        !
      </Badge>
    );
  }
  if (badge === 'warning') {
    return (
      <Badge className="ml-auto bg-yellow-500/20 text-[10px] text-yellow-700">
        !
      </Badge>
    );
  }
  return null;
}

function NavMenuItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = ICONS[item.icon];

  if (item.disabled) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger
            render={
              <SidebarMenuButton
                aria-disabled="true"
                className="pointer-events-none opacity-50 transition-colors duration-150"
              >
                {Icon ? <Icon /> : null}
                <span>{item.label}</span>
                <NavBadge badge={item.badge} />
              </SidebarMenuButton>
            }
          />
          <TooltipContent side="right">
            Disponible después de configurar tu sitio
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className="transition-colors duration-150"
        render={<Link to={item.to} />}
      >
        {Icon ? <Icon /> : null}
        <span>{item.label}</span>
        <NavBadge badge={item.badge} />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const state = useDashboardStore((s) => s.state);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems = buildNavItems(state);
  const email = user?.email ?? null;
  const name = email?.split('@')[0] ?? '—';
  const initials = (email?.slice(0, 2) ?? '—').toUpperCase();

  const isActive = (to: string) =>
    to === '/dashboard' ? pathname === to : pathname.startsWith(to);

  const handleLogout = async (): Promise<void> => {
    // supabase.auth.signOut() drives onAuthStateChange, which clears the auth
    // store. finally guarantees we leave the dashboard even if signOut throws.
    try {
      await logout();
    } finally {
      await navigate({ to: '/login' });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: '#1447e6' }}
            aria-hidden="true"
          >
            <span className="font-mono text-[11px] font-bold tracking-wider text-white">
              L
            </span>
          </div>
          <div>
            <p className="font-mono text-sm font-semibold tracking-widest text-sidebar-foreground">
              LATTIZ
            </p>
            <p className="text-[10px] text-sidebar-foreground/50">Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">Menú</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <NavMenuItem
                key={item.id}
                item={item}
                isActive={isActive(item.to)}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-open:bg-sidebar-accent"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-[#1447e6] text-xs text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col text-left text-sm">
                      <span className="truncate font-medium">{name}</span>
                      <span className="truncate text-[11px] text-sidebar-foreground/50">
                        {email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50" />
                  </SidebarMenuButton>
                }
              />

              <DropdownMenuContent
                side="top"
                align="start"
                className="min-w-56"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        {email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem render={<Link to="/dashboard/account" />}>
                  <User className="mr-2 size-4" />
                  Cuenta
                </DropdownMenuItem>

                <DropdownMenuItem render={<Link to="/dashboard/subscription" />}>
                  <CreditCard className="mr-2 size-4" />
                  Suscripción
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
