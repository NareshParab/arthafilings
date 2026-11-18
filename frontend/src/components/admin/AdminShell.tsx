"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  Ticket,
  UserCog,
  History,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Logo from "@/components/layout/Logo";
import { RoleBadge } from "@/components/admin/StatusBadge";
import { useAdminSession, clearAdminSession, type AdminSession } from "@/lib/admin-session";
import type { AdminRole } from "@/types/admin";

const NAV_ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; roles: AdminRole[] }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "staff", "reviewer"] },
  { href: "/admin/leads", label: "Leads", icon: Users, roles: ["admin", "staff"] },
  { href: "/admin/orders", label: "Orders", icon: Package, roles: ["admin", "staff", "reviewer"] },
];

const PLACEHOLDER_ITEMS = [
  { label: "Services and prices", icon: Tags },
  { label: "Coupons", icon: Ticket },
  { label: "Staff", icon: UserCog },
  { label: "Activity log", icon: History },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageTitle(pathname: string) {
  const match = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  if (match) return match.label;
  if (pathname.startsWith("/admin/orders/")) return "Order detail";
  return "Admin";
}

function NavLinks({ role, pathname, onNavigate }: { role: AdminRole; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Admin">
      {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-blue-tint text-primary" : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}

      <p className="px-3 pt-4 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Coming up</p>
      {PLACEHOLDER_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.label}
            title="Coming in next step"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60"
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </span>
        );
      })}
    </nav>
  );
}

function UserMenu({ session }: { session: AdminSession }) {
  const router = useRouter();

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{session.name}</p>
        <RoleBadge role={session.role} className="mt-0.5" />
      </div>
      <Button variant="outline" size="icon-sm" onClick={handleLogout} aria-label="Logout" title="Logout">
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useAdminSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-card px-3 py-5 transition-[width] md:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="mb-6 flex items-center justify-between px-1">
          {!collapsed && <Logo className="h-6" />}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        </div>
        {collapsed ? (
          <nav className="space-y-1" aria-label="Admin">
            {NAV_ITEMS.filter((item) => item.roles.includes(session.role)).map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-center rounded-lg px-2 py-2",
                    active ? "bg-blue-tint text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
        ) : (
          <NavLinks role={session.role} pathname={pathname} />
        )}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64">
          <SheetTitle className="px-4 pt-4">
            <Logo className="h-6" />
          </SheetTitle>
          <div className="px-2 pt-2">
            <NavLinks role={session.role} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </Button>
            <h1 className="text-lg font-semibold text-navy">{getPageTitle(pathname)}</h1>
          </div>
          <UserMenu session={session} />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
