"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from "@/components/layout/Logo";
import TopBar from "@/components/layout/TopBar";
import MegaMenu, { ServiceGroupAccordion } from "@/components/layout/MegaMenu";
import { siteConfig } from "@/lib/site-config";

function buildWhatsAppHref() {
  const digits = siteConfig.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm font-medium transition-colors hover:text-primary-hover ${
        active ? "text-primary" : "text-foreground"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function PhoneLink({ className }: { className?: string }) {
  return (
    <a
      href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
      className={`flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary-hover ${className ?? ""}`}
      aria-label={`Call us at ${siteConfig.phone}`}
    >
      <Phone className="size-4" aria-hidden="true" />
      {siteConfig.phone}
    </a>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <TopBar />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo className="shrink-0" />

        <MegaMenu />

        <div className="flex shrink-0 items-center gap-2">
          <Button nativeButton={false} render={<Link href="/login">Login</Link>} />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4 pb-4" aria-label="Primary">
                <ServiceGroupAccordion onNavigate={() => setOpen(false)} />
                {siteConfig.headerNav.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    active={pathname === item.href}
                    onClick={() => setOpen(false)}
                  />
                ))}
                <PhoneLink />
                <a
                  href={buildWhatsAppHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="whatsapp_click"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary-hover"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
                <Button
                  nativeButton={false}
                  render={
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  }
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
