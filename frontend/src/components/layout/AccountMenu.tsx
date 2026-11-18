"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearAuthSession, useMockAuthSession } from "@/lib/mock-session";

// Header login slot: shows "Login" normally, or "My account" with a Logout
// item once a mock session exists (MOCK: real auth in backend phase).
export default function AccountMenu({
  size = "default",
  className,
  onNavigate,
}: {
  size?: "default" | "sm";
  className?: string;
  onNavigate?: () => void;
}) {
  const session = useMockAuthSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  if (!session) {
    return (
      <Button
        nativeButton={false}
        size={size}
        className={className}
        render={
          <Link href="/login" onClick={onNavigate}>
            Login
          </Link>
        }
      />
    );
  }

  function handleLogout() {
    clearAuthSession();
    setOpen(false);
    onNavigate?.();
    router.push("/");
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <Button
        size={size}
        variant="outline"
        className="gap-1"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        My account
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg bg-popover p-1 shadow-md ring-1 ring-foreground/10">
          <Link
            href="/dashboard"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
