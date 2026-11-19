"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession, type MockAuthSession } from "@/lib/mock-session";

// MOCK: real auth in backend phase. Client-only guard — no session means no
// dashboard access, redirecting back to login with a return path.
//
// Two earlier versions of this guard each had a real bug, both confirmed by
// hard-reloading /dashboard with a valid session already in localStorage:
//   1. A lazy useState initializer read localStorage directly during the
//      first client render. That render runs during hydration and must
//      match the server's (always null, since window is undefined during
//      SSR) — reading a real session there diverges from it, which is a
//      hydration mismatch (React error #418) on every reload.
//   2. Swapping to useMockAuthSession() (useSyncExternalStore, whose
//      getServerSnapshot is null so hydration itself can't mismatch)
//      fixed #1, but under this app's Cache-Components build its resync to
//      the real client snapshot did not reliably happen before this
//      guard's own redirect effect read `session` — a valid session was
//      bounced to /login anyway (reproduced with a direct localStorage
//      check immediately after the redirect: the key was present, but the
//      guard still redirected).
// This version starts state at null (matches SSR, no mismatch) and reads
// the real session in a useLayoutEffect, before paint — a one-time read of
// external browser storage on mount, not state derived from a reactive
// input, so the usual "don't setState in an effect" guidance doesn't apply.
export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<MockAuthSession | null>(null);
  const [checked, setChecked] = useState(false);

  useLayoutEffect(() => {
    const current = getAuthSession();
    if (current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of external localStorage on mount, see comment above; not state derived from a reactive input.
      setSession(current);
      setChecked(true);
    } else {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router]);

  if (!checked || !session) return null;
  return <>{children}</>;
}
