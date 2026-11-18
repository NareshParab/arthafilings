"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession, type MockAuthSession } from "@/lib/mock-session";

// MOCK: real auth in backend phase. Client-only guard — no session means no
// dashboard access, redirecting back to login with a return path.
//
// Reads the session with a lazy useState initializer rather than
// useMockAuthSession()'s useSyncExternalStore: on a hard navigation/reload,
// the sync-external-store resync raced with this effect and lost (the
// redirect fired before the real session was picked up), bouncing a
// logged-in user back to /login. A lazy initializer resolves the real value
// synchronously on the client's first render instead, with no race — this
// guard only needs a one-time check on mount, not live cross-tab updates.
export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session] = useState<MockAuthSession | null>(() =>
    typeof window === "undefined" ? null : getAuthSession()
  );

  useEffect(() => {
    if (!session) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [session, router]);

  if (!session) return null;
  return <>{children}</>;
}
