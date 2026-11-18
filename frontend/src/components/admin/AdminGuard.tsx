"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminSession, type AdminSession } from "@/lib/admin-session";

// MOCK: client-only guard, mirrors components/auth/DashboardGuard.tsx. Uses
// a lazy useState initializer (not useAdminSession's useSyncExternalStore)
// so the real session resolves synchronously on first client render — the
// same reload race DashboardGuard fixes for the customer dashboard.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session] = useState<AdminSession | null>(() =>
    typeof window === "undefined" ? null : getAdminSession()
  );

  useEffect(() => {
    if (!session) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
    }
  }, [session, router]);

  if (!session) return null;
  return <>{children}</>;
}
