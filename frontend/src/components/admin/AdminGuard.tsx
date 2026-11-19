"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminSession, type AdminSession } from "@/lib/admin-session";

// MOCK: client-only guard, mirrors components/auth/DashboardGuard.tsx — see
// that file's comment for the two failed approaches tried before this one
// (a lazy useState initializer caused a hydration mismatch; the
// useSyncExternalStore hook didn't reliably resync before this guard's own
// redirect effect, bouncing a valid admin session to /admin/login anyway).
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checked, setChecked] = useState(false);

  useLayoutEffect(() => {
    const current = getAdminSession();
    if (current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of external localStorage on mount, see DashboardGuard.tsx; not state derived from a reactive input.
      setSession(current);
      setChecked(true);
    } else {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
    }
  }, [router]);

  if (!checked || !session) return null;
  return <>{children}</>;
}
